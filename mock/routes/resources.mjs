import { checkClash, openingHoursErrors, scheduleRows } from '../lib/clash.mjs';

export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isId = (value) => typeof value === 'string' && value.trim().length > 0;
export const isTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateSchedule(db, body) {
  const fields = {};
  if (!isDate(body.date)) fields.date = 'Ngày không đúng định dạng YYYY-MM-DD hoặc không tồn tại';
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 4) {
    fields.items = 'Chọn từ 1 đến 4 ca';
  } else body.items.forEach((value, index) => {
    const item = isObject(value) ? value : {};
    const prefix = `items.${index}.`;
    if (!['makeup', 'shoot'].includes(item.kind)) fields[prefix + 'kind'] = 'Chọn makeup hoặc shoot';
    if (!isTime(item.start)) fields[prefix + 'start'] = 'Giờ không đúng định dạng HH:mm';
    if (!isTime(item.end)) fields[prefix + 'end'] = 'Giờ không đúng định dạng HH:mm';
    else if (isTime(item.start) && item.end <= item.start) fields[prefix + 'end'] = 'Giờ kết thúc phải sau giờ bắt đầu';
    if (!isId(item.staffId) || !db.resources.staff.some((staff) => staff.id === item.staffId)) {
      fields[prefix + 'staffId'] = 'Nhân sự không tồn tại';
    }
    if (!(item.kind === 'makeup' && item.roomId === null)
      && (!isId(item.roomId) || !db.resources.rooms.some((room) => room.id === item.roomId))) {
      fields[prefix + 'roomId'] = 'Vui lòng chọn phòng tồn tại';
    }
  });
  return Object.keys(fields).length ? fields : openingHoursErrors(db, body.date, body.items);
}

const ref = ({ id, name }) => ({ id, name });
export const toScheduleItems = (db, items) => items.map((item) => ({
  kind: item.kind, start: item.start, end: item.end,
  staff: ref(db.resources.staff.find((staff) => staff.id === item.staffId)),
  room: item.roomId === null ? null : ref(db.resources.rooms.find((room) => room.id === item.roomId)),
})).sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));

export default [
  { method: 'GET', path: '/api/resources', roles: ['admin'],
    handler: ({ db }) => ({ status: 200, body: db.resources }) },
  { method: 'GET', path: '/api/schedule', roles: ['admin'],
    handler: ({ query, db, fail }) => {
      if (!isDate(query.date)) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', { date: 'Ngày không đúng định dạng YYYY-MM-DD hoặc không tồn tại' });
      return { status: 200, body: { date: query.date, rows: scheduleRows(db, query.date) } };
    } },
  { method: 'POST', path: '/api/availability/check', roles: ['admin'],
    handler: ({ body, db, fail }) => {
      const fields = validateSchedule(db, body);
      if (Object.keys(fields).length) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);
      // Body has no ignoreBooking: callers cannot exclude somebody else's slot.
      return { status: 200, body: checkClash(db, body.date, body.items) };
    } },
];
