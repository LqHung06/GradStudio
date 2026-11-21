// System settings: docs/api/13-settings.md (owner TV1).
// Other mocks read db.settings directly: openingHours (free-time suggestions, TV3)
// and reminderHoursBefore (reminders, TV2). Keep these field names.

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/; // 00:00 to 23:59
const BAD_TIME = 'Giờ không đúng định dạng HH:mm';

function validateSettings(body) {
  const fields = {};
  const hours = body.openingHours && typeof body.openingHours === 'object' ? body.openingHours : {};
  const { open, close } = hours;
  const openOk = typeof open === 'string' && HHMM_RE.test(open);
  const closeOk = typeof close === 'string' && HHMM_RE.test(close);

  if (!openOk) fields['openingHours.open'] = BAD_TIME;
  if (!closeOk) fields['openingHours.close'] = BAD_TIME;
  // "HH:mm" strings sort like times, so a string comparison is enough.
  else if (openOk && close <= open) fields['openingHours.close'] = 'Giờ đóng cửa phải sau giờ mở cửa';

  const hoursBefore = body.reminderHoursBefore;
  if (!Number.isInteger(hoursBefore) || hoursBefore < 1 || hoursBefore > 168) {
    fields.reminderHoursBefore = 'Chọn từ 1 đến 168 giờ';
  }

  return { fields, settings: { openingHours: { open, close }, reminderHoursBefore: hoursBefore } };
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
      // Only the three known fields are saved; anything else in the body is ignored.
      db.settings = settings;
      return { status: 200, body: { settings } };
    },
  },
];
