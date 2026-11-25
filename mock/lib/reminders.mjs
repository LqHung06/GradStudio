// Shared reminder helpers for deposit, reschedule (R04) and cancel (R05) — owner TV2.

function formatOffsetIso(dateStr, timeStr, hoursBefore) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const utcMs = Date.UTC(y, m - 1, d, hh, mm, 0) - hoursBefore * 3600 * 1000;
  const dt = new Date(utcMs);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:00+07:00`;
}

function formatDateVi(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function buildReminderPayload(db, booking) {
  const items = [...(booking.items || [])]
    .filter((it) => typeof it?.start === 'string' && /^\d{2}:\d{2}$/.test(it.start))
    .sort((a, b) => a.start.localeCompare(b.start));
  const earliest = items[0];
  if (!earliest) return null;
  const leadHours = Number(db.settings?.reminderHoursBefore ?? 24);
  const kindLabel = earliest.kind === 'makeup' ? 'makeup' : 'chụp ảnh';
  const roomPart = earliest.room?.name ? ` (${earliest.room.name})` : '';
  return {
    sendAt: formatOffsetIso(booking.date, earliest.start, leadHours),
    channels: ['email', 'account'],
    text: `Nhắc lịch: ${kindLabel} ${earliest.start} ngày ${formatDateVi(booking.date)} với ${earliest.staff?.name || 'studio'}${roomPart} tại GradStudio`,
  };
}

function nextReminderId(reminders) {
  let maxId = 0;
  for (const r of reminders || []) {
    const match = typeof r?.id === 'string' && /^rm-(\d+)$/.exec(r.id);
    if (match) {
      const num = Number(match[1]);
      if (num > maxId) maxId = num;
    }
  }
  return `rm-${maxId + 1}`;
}

export function ensureBookingReminder(db, booking) {
  if (!Array.isArray(db.reminders)) db.reminders = [];
  if (db.reminders.some((r) => r.bookingCode === booking.code)) return null;
  const payload = buildReminderPayload(db, booking);
  if (!payload) return null;
  const reminder = {
    id: nextReminderId(db.reminders),
    bookingCode: booking.code,
    sendAt: payload.sendAt,
    channels: payload.channels,
    emailStatus: 'sent',
    text: payload.text,
  };
  db.reminders.push(reminder);
  return reminder;
}

// R04: Recalculate queued reminders on reschedule; keep sent history and avoid duplicate sends.
export function recalculateBookingReminders(db, booking) {
  if (!Array.isArray(db.reminders)) db.reminders = [];
  if (booking.status !== 'booked') return null;
  const payload = buildReminderPayload(db, booking);
  if (!payload) return null;

  const existingQueued = db.reminders.find(
    (r) => r.bookingCode === booking.code && r.emailStatus === 'queued',
  );
  if (existingQueued) {
    existingQueued.sendAt = payload.sendAt;
    existingQueued.text = payload.text;
    existingQueued.channels = payload.channels;
    return existingQueued;
  }

  // Already have a reminder for this exact schedule version (idempotent).
  const alreadyMatches = db.reminders.find(
    (r) => r.bookingCode === booking.code && r.sendAt === payload.sendAt && r.text === payload.text,
  );
  if (alreadyMatches) return alreadyMatches;

  // Sent history stays intact; create a fresh queued reminder for the new schedule version.
  const next = {
    id: nextReminderId(db.reminders),
    bookingCode: booking.code,
    sendAt: payload.sendAt,
    channels: payload.channels,
    emailStatus: 'queued',
    text: payload.text,
  };
  db.reminders.push(next);
  return next;
}

// R05: Stop unsent (queued) reminders on cancel while preserving sent history.
export function stopBookingReminders(db, bookingCode) {
  if (!Array.isArray(db.reminders)) return 0;
  const before = db.reminders.length;
  db.reminders = db.reminders.filter(
    (r) => !(r.bookingCode === bookingCode && r.emailStatus === 'queued'),
  );
  return before - db.reminders.length;
}
