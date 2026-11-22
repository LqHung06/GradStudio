import { apiFetch } from './client.js';

/**
 * Auth endpoints from docs/api/01-auth.md.
 */
export function login({ email, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    skipUnauthorized: true,
  });
}

export function fetchMe({ signal } = {}) {
  return apiFetch('/api/auth/me', {
    signal,
    skipUnauthorized: true,
  });
}

export function logout() {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
    skipUnauthorized: true,
  });
}
