import { checkClash } from '../lib/clash.mjs';
import { recalculateBookingReminders, stopBookingReminders } from '../lib/reminders.mjs';
import { activePaymentLock, finalLinkBlockedReason, rescheduleBlockedReason } from '../lib/admin-booking-rules.mjs';
import { validateSchedule, toScheduleItems } from './resources.mjs';
import { invalid } from './conversations.mjs';
import { findBooking, bookingMissing } from './bookings.mjs';

function paymentConflict(ctx, booking) {
  const lock = activePaymentLock(ctx.db, booking.code);
  if (!lock) return null;
  return ctx.fail(409, 'CONFLICT', lock.reason, {}, lock.retryAt ? { retryAt: lock.retryAt } : null);
}

export default [
  { method: 'PATCH', path: '/api/bookings/:code', roles: ['admin'], handler: (ctx) => {
    const booking = findBooking(ctx);
    if (!booking) return bookingMissing(ctx);
    const blocked = rescheduleBlockedReason(ctx.db, booking);
    if (blocked) return ctx.fail(409, 'CONFLICT', blocked);
    const locked = paymentConflict(ctx, booking);
    if (locked) return locked;
    const fields = validateSchedule(ctx.db, ctx.body);
    if (Object.keys(fields).length) return invalid(ctx, fields);
    const items = toScheduleItems(ctx.db, ctx.body.items);
    const result = checkClash(ctx.db, ctx.body.date, items, { ignoreBooking: booking.code });
    if (!result.available) return ctx.fail(409, 'CLASH', result.clashes[0].reason, {}, { clashes: result.clashes, suggestions: result.suggestions });
    if (booking.status === 'awaiting_deposit' && booking.paymentStatus === 'deposit_paid') {
      return ctx.fail(409, 'CONFLICT', 'Chưa thể xác nhận lịch mới cho khoản cọc đã nhận.');
    }

    const related = (ctx.db.jobs || []).filter((job) => job.bookingCode === booking.code);
    // Build every replacement before mutating anything. Jobs with an absent
    // schedule kind cannot be remapped under the current shared specification.
    const updates = [];
    const kinds = (list) => [...new Set(list.map((item) => item.kind))].sort().join(',');
    if (related.length && (kinds(booking.items) !== kinds(items)
      || items.some((item) => items.filter((other) => other.kind === item.kind).length !== 1))) {
      return ctx.fail(409, 'CONFLICT', 'Chưa có quy tắc ánh xạ việc khi thêm, bớt hoặc lặp loại ca; cần TV1 thống nhất');
    }
    for (const job of related) {
      if (job.kind === 'edit') continue;
      const matching = items.filter((entry) => entry.kind === job.kind);
      if (matching.length !== 1) return ctx.fail(409, 'CONFLICT', 'Chưa có quy tắc ánh xạ việc với lịch mới; cần TV1 thống nhất');
      const item = matching[0];
      updates.push({ job, changes: {
        date: ctx.body.date, start: item.start, end: item.end, room: structuredClone(item.room), staff: structuredClone(item.staff),
      } });
    }
    const schedule = { date: ctx.body.date, items };
    const reminderDraft = booking.status === 'booked' ? {
      settings: ctx.db.settings,
      reminders: structuredClone(ctx.db.reminders),
    } : null;
    if (reminderDraft) {
      recalculateBookingReminders(reminderDraft, { ...booking, ...schedule });
    }

    Object.assign(booking, schedule);
    for (const { job, changes } of updates) Object.assign(job, changes);
    if (reminderDraft) ctx.db.reminders = reminderDraft.reminders;
    return { status: 200, body: { booking } };
  } },
  { method: 'POST', path: '/api/bookings/:code/cancel', roles: ['admin'], handler: (ctx) => {
    const booking = findBooking(ctx);
    if (!booking) return bookingMissing(ctx);
    const reason = ctx.body.reason;
    if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 500) {
      return invalid(ctx, { reason: 'Lý do hủy từ 5 đến 500 ký tự' });
    }
    if (!['awaiting_deposit', 'booked'].includes(booking.status)) return ctx.fail(409, 'CONFLICT', 'Booking đã hoàn thành hoặc đã hủy');
    const locked = paymentConflict(ctx, booking);
    if (locked) return locked;
    const conversation = ctx.db.conversations.find((entry) => entry.id === booking.conversationId);
    const reminderDraft = { reminders: structuredClone(ctx.db.reminders) };
    stopBookingReminders(reminderDraft, booking.code);
    if (conversation) conversation.status = 'scheduled';
    booking.status = 'cancelled';
    ctx.db.reminders = reminderDraft.reminders;
    return { status: 200, body: { booking } };
  } },
  { method: 'PUT', path: '/api/bookings/:code/final-link', roles: ['admin'], handler: (ctx) => {
    const booking = findBooking(ctx);
    if (!booking) return bookingMissing(ctx);
    let url;
    try { url = typeof ctx.body.url === 'string' ? new URL(ctx.body.url) : null; } catch { url = null; }
    if (!url || !ctx.body.url.startsWith('https://') || url.protocol !== 'https:' || !url.hostname) {
      return invalid(ctx, { url: 'Link phải bắt đầu bằng https://' });
    }
    if (ctx.body.url.length > 500) return invalid(ctx, { url: 'Link tối đa 500 ký tự' });
    const blocked = finalLinkBlockedReason(ctx.db, booking);
    if (blocked) return ctx.fail(409, 'CONFLICT', blocked);
    booking.finalLink = ctx.body.url;
    return { status: 200, body: { booking } };
  } },
];
