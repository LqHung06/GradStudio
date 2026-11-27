// System settings: docs/api/13-settings.md (owner TV1).
// Other mocks read db.settings via mock/lib/opening-hours.mjs (G5/G10, TV3)
// and reminderHoursBefore (reminders, TV2). Keep these field names.

import { HHMM_RE } from '../lib/opening-hours.mjs';

const BAD_TIME = 'Giờ không đúng định dạng HH:mm';

function validateRange(raw, prefix, fields) {
  const range = raw && typeof raw === 'object' ? raw : {};
  const { open, close } = range;
  const openOk = typeof open === 'string' && HHMM_RE.test(open);
  const closeOk = typeof close === 'string' && HHMM_RE.test(close);

  if (!openOk) fields[`${prefix}.open`] = BAD_TIME;
  if (!closeOk) fields[`${prefix}.close`] = BAD_TIME;
  else if (openOk && close <= open) fields[`${prefix}.close`] = 'Giờ đóng cửa phải sau giờ mở cửa';

  return { open, close };
}

function validateSettings(body) {
  const fields = {};
  const hours = body.openingHours && typeof body.openingHours === 'object' ? body.openingHours : {};
  const weekday = validateRange(hours.weekday, 'openingHours.weekday', fields);
  const weekend = validateRange(hours.weekend, 'openingHours.weekend', fields);

  const hoursBefore = body.reminderHoursBefore;
  if (!Number.isInteger(hoursBefore) || hoursBefore < 1 || hoursBefore > 168) {
    fields.reminderHoursBefore = 'Chọn từ 1 đến 168 giờ';
  }

  return {
    fields,
    settings: {
      openingHours: { weekday, weekend },
      reminderHoursBefore: hoursBefore,
    },
  };
}

export default [
  {
    method: 'GET',
    path: '/api/settings',
    roles: ['superadmin'],
    handler: ({ db }) => ({ status: 200, body: { settings: db.settings } }),
  },
  {
    method: 'PUT',
    path: '/api/settings',
    roles: ['superadmin'],
    handler: ({ body, db, fail }) => {
      const { fields, settings } = validateSettings(body);
      if (Object.keys(fields).length > 0) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);
      db.settings = settings;
      return { status: 200, body: { settings } };
    },
  },
];
