import { apiFetch } from './client.js';

/**
 * Creates a new Admin account.
 * POST /api/admins (docs/api/12-admins.md)
 */
export function createAdmin({ name, email, password }) {
  return apiFetch('/api/admins', {
    method: 'POST',
    body: { name, email, password },
  });
}

/**
 * Locks (active: false) or unlocks (active: true) an Admin account.
 * PATCH /api/admins/:id (docs/api/12-admins.md)
 */
export function setAdminActive(id, active) {
  return apiFetch(`/api/admins/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { active },
  });
}

/**
 * Saves studio opening hours and reminder lead time.
 * PUT /api/settings (docs/api/13-settings.md)
 */
export function saveSettings(settings) {
  return apiFetch('/api/settings', {
    method: 'PUT',
    body: settings,
  });
}
