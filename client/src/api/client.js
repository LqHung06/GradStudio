export const TOKEN_STORAGE_KEY = 'gradstudio_token';

/**
 * Normalized API error thrown by `apiFetch` for non-2xx responses.
 */
export class ApiError extends Error {
  constructor({ status, code = 'ERROR', message = 'Đã có lỗi xảy ra', fields = {}, details = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields && typeof fields === 'object' ? fields : {};
    this.details = details ?? null;
  }
}

export function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

let getTokenHandler = readStoredToken;
let onUnauthorizedHandler = null;

/**
 * Registers token lookup and 401 handler (called by AuthContext on mount).
 */
export function registerAuthHandlers({ getToken, onUnauthorized } = {}) {
  if (typeof getToken === 'function') getTokenHandler = getToken;
  if (typeof onUnauthorized === 'function') onUnauthorizedHandler = onUnauthorized;
}

/**
 * Single HTTP client for the entire app. Accepts relative `/api/...` paths only.
 */
export async function apiFetch(path, options = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new Error(`apiFetch expects a relative /api/... path, received: ${String(path)}`);
  }

  const { method = 'GET', body, signal, skipUnauthorized = false } = options;
  const headers = {};
  const token = getTokenHandler();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payloadBody;
  if (body !== undefined) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // Leave Content-Type unset so the browser attaches the multipart boundary.
      payloadBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      payloadBody = JSON.stringify(body);
    }
  }

  const res = await fetch(path, {
    method,
    headers,
    body: payloadBody,
    signal,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = data?.error;
    if (res.status === 401 && !skipUnauthorized && typeof onUnauthorizedHandler === 'function') {
      onUnauthorizedHandler();
    }
    throw new ApiError({
      status: res.status,
      code: err?.code || 'ERROR',
      message: err?.message || `Yêu cầu thất bại (${res.status})`,
      fields: err?.fields || {},
      details: err?.details ?? null,
    });
  }

  return data;
}
