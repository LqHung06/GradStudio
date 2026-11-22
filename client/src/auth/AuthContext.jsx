import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMe, login as apiLogin, logout as apiLogout } from '../api/auth.js';
import { ApiError, TOKEN_STORAGE_KEY, readStoredToken, registerAuthHandlers } from '../api/client.js';

const USER_STORAGE_KEY = 'gradstudio_user';

export const ROLE_HOME = {
  customer: '/my-bookings',
  admin: '/admin/conversations',
  staff: '/staff/jobs',
  superadmin: '/superadmin/admins',
};

const CUSTOMER_PREFIXES = ['/chat', '/my-bookings', '/test-gateway', '/payments', '/notifications'];

function matchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Checks whether a signed-in role may return to `pathname` after signing in.
 */
export function canRoleAccessPath(role, pathname) {
  if (!role || typeof pathname !== 'string' || !pathname.startsWith('/')) return false;
  if (matchesPrefix(pathname, '/sign-in')) return false;
  if (matchesPrefix(pathname, '/admin')) return role === 'admin';
  if (matchesPrefix(pathname, '/staff')) return role === 'staff';
  if (matchesPrefix(pathname, '/superadmin')) return role === 'superadmin';
  if (CUSTOMER_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return role === 'customer';
  }
  if (pathname === '/' || matchesPrefix(pathname, '/packages')) return true;
  return false;
}

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === 'string' && typeof parsed.role === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeSession(token, user) {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (user) window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in restricted contexts; keep session in memory.
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(() => (readStoredToken() ? readStoredUser() : null));
  const [ready, setReady] = useState(() => !readStoredToken());

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    writeSession(null, null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthHandlers({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        clearSession();
        navigate('/sign-in', { replace: true, state: { from: locationRef.current } });
      },
    });
  }, [clearSession, navigate]);

  useEffect(() => {
    const savedToken = readStoredToken();
    if (!savedToken) {
      setReady(true);
      return undefined;
    }

    const controller = new AbortController();
    fetchMe({ signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        const verifiedUser = res?.user || null;
        if (verifiedUser) {
          writeSession(savedToken, verifiedUser);
          setUser(verifiedUser);
        } else {
          clearSession();
        }
        setReady(true);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
        }
        // On transient 500 (e.g. MOCK_MODE=error on reload), keep cached session so
        // protected routes can mount and render their own error + Retry UI.
        setReady(true);
      });

    return () => controller.abort();
  }, [clearSession]);

  const signIn = useCallback(async ({ email, password }) => {
    const res = await apiLogin({ email: email.trim(), password });
    tokenRef.current = res.token;
    writeSession(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
    setReady(true);
    return res.user;
  }, []);

  const signOut = useCallback(async () => {
    if (tokenRef.current) {
      try {
        await apiLogout();
      } catch {
        // Always clear local session even if the server is unavailable.
      }
    }
    clearSession();
    navigate('/', { replace: true });
  }, [clearSession, navigate]);

  const value = useMemo(
    () => ({ user, token, ready, signIn, signOut }),
    [user, token, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return ctx;
}
