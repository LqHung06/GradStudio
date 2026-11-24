import { apiFetch } from './client.js';

/**
 * Updates the status and optional note of a staff member's assigned job.
 * PATCH /api/jobs/:id (docs/api/08-jobs.md)
 */
export function updateJob(id, { status, note }) {
  return apiFetch(`/api/jobs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status, note },
  });
}

/**
 * Uploads one JPEG/PNG preview photo (<= 5 MiB) for an assigned booking.
 * POST /api/bookings/:code/previews (docs/api/08-jobs.md)
 */
export function uploadBookingPreview(bookingCode, file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch(`/api/bookings/${encodeURIComponent(bookingCode)}/previews`, {
    method: 'POST',
    body: formData,
  });
}
