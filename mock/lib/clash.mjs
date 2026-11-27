// Shared by proposals, rescheduling and deposit payment (docs/api/04, 06, 10).
// Accepts ScheduleItemInput as well as the enriched ScheduleItem on a Booking.
const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const timeAt = (value) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '');

export function openingHoursFor(db, date) {
  const configured = db.settings?.openingHours;
  const day = new Date(date + 'T00:00:00Z').getUTCDay();
  const period = day === 0 || day === 6 ? 'weekend' : 'weekday';
  const hours = configured?.weekday || configured?.weekend ? configured[period] : configured;
  return isTime(hours?.open) && isTime(hours?.close) && hours.open < hours.close ? hours : null;
}

export function openingHoursErrors(db, date, items) {
  const hours = openingHoursFor(db, date);
  if (!hours) return { date: 'Chưa có cấu hình giờ mở cửa cho ngày đã chọn.' };
  const day = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(date + 'T00:00:00Z'));
  const message = `${day} studio mở ${hours.open}–${hours.close}.`;
  const fields = {};
  items.forEach(({ start, end }, index) => {
    if (start < hours.open) fields[`items.${index}.start`] = message;
    if (end > hours.close) fields[`items.${index}.end`] = message;
  });
  return fields;
}
const inputItem = (item) => ({
  kind: item.kind, start: item.start, end: item.end,
  staffId: item.staffId ?? item.staff?.id,
  roomId: item.roomId ?? item.room?.id ?? null,
});

export function scheduleRows(db, date, { ignoreBooking } = {}) {
  return ['staff', 'rooms'].flatMap((key) => (db.resources?.[key] || []).map((entry) => {
    const type = key === 'staff' ? 'staff' : 'room';
    const busy = (db.bookings || [])
      .filter((booking) => booking.status === 'booked' && booking.date === date && booking.code !== ignoreBooking)
      .flatMap((booking) => (type === 'room' ? [...booking.items].sort((a, b) => Number(b.kind === 'shoot') - Number(a.kind === 'shoot')) : booking.items)
        .filter((item) => inputItem(item)[`${type}Id`] === entry.id)
        .map((item) => ({ start: item.start, end: item.end,
          label: `${item.kind === 'makeup' ? 'Makeup' : 'Chụp'} ${booking.shootType.charAt(0).toLowerCase()}${booking.shootType.slice(1)}`,
          bookingCode: booking.code })))
      .filter((interval, index, intervals) => intervals.findIndex((other) => other.bookingCode === interval.bookingCode
        && other.start === interval.start && other.end === interval.end) === index)
      .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
    // resources in 04 define no fixed-busy field. Booking GS-1021 supplies Mai's block.
    return { resource: { id: entry.id, name: entry.name, type }, busy };
  }));
}

function findClashes(db, date, items, options) {
  const rows = scheduleRows(db, date, options);
  return items.flatMap((item, itemIndex) => rows.flatMap(({ resource, busy }) => {
    if (item[`${resource.type}Id`] !== resource.id) return [];
    // Also reject two requested items assigning the same resource at once.
    const earlier = items.slice(0, itemIndex).filter((other) => other[`${resource.type}Id`] === resource.id);
    return [...busy, ...earlier].filter((interval) => overlaps(item, interval)).map((interval) => ({
      itemIndex, resource: { ...resource }, busyFrom: interval.start, busyTo: interval.end,
      reason: `${resource.name} bận ${interval.start}–${interval.end} nên ${item.kind === 'makeup' ? 'makeup' : 'chụp'} ${item.start}–${item.end} bị trùng`,
    }));
  }));
}

function describe(db, date, originalDate, items) {
  const parts = items.map((item) => {
    const staff = db.resources.staff.find((entry) => entry.id === item.staffId);
    const room = db.resources.rooms.find((entry) => entry.id === item.roomId);
    return `${item.kind === 'makeup' ? 'Makeup' : 'Chụp'} ${item.start}–${item.end} với ${staff.name}${room ? ` · ${room.name}` : ''}`;
  });
  return `${date === originalDate ? '' : `${date.slice(8)}/${date.slice(5, 7)} · `}${parts.join(' · ')}`;
}

export function checkClash(db, date, items, { ignoreBooking } = {}) {
  const inputs = items.map(inputItem);
  const options = { ignoreBooking };
  const clashes = findClashes(db, date, inputs, options);
  if (!clashes.length) return { available: true, clashes: [], suggestions: [] };

  const suggestions = [];
  const hours = openingHoursFor(db, date);
  const first = minutes(inputs[0].start);
  const add = (candidateDate, start) => {
    const candidateHours = openingHoursFor(db, candidateDate);
    if (!candidateHours) return false;
    const shift = start - first;
    if (inputs.some((item) => minutes(item.start) + shift < minutes(candidateHours.open)
      || minutes(item.end) + shift > minutes(candidateHours.close))) return false;
    const shifted = inputs.map((item) => ({ ...item,
      start: timeAt(minutes(item.start) + shift),
      end: timeAt(minutes(item.end) + shift) }));
    if (findClashes(db, candidateDate, shifted, options).length) return false;
    suggestions.push({ date: candidateDate, label: describe(db, candidateDate, date, shifted), items: shifted });
    return true;
  };
  // Prefer the two alternatives shown in the contract, then scan hourly slots.
  // Shifting the entire sequence preserves duration, order and any gaps.
  const starts = hours ? [...new Set([13 * 60, 14 * 60,
    ...Array.from({ length: Math.ceil((minutes(hours.close) - minutes(hours.open)) / 60) }, (_, i) => minutes(hours.open) + i * 60)])] : [];
  for (const start of starts) {
    add(date, start);
    if (suggestions.length === 2) break;
  }
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);
  const nextHours = openingHoursFor(db, nextDate);
  if (nextHours && !add(nextDate, 9 * 60)) add(nextDate, minutes(nextHours.open));
  return { available: false, clashes, suggestions };
}
