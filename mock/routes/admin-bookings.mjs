import { isDeepStrictEqual } from 'node:util';
import { confirmBookingReservation } from '../lib/booking-confirmation.mjs';
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

function clashConflict(ctx, { clashes, suggestions }) {
  return ctx.fail(409, 'CLASH', clashes[0]?.reason ?? 'Lịch mới bị trùng.', {}, { clashes, suggestions });
}

async function recoverPaidBooking(ctx, booking, schedule) {
  const { db } = ctx;
  const original = structuredClone(booking);
  const settings = db.settings;
  const jobCount = db.jobs?.length ?? 0;
  const reminderCount = db.reminders?.length ?? 0;
  const draft = { ...db, jobs: structuredClone(db.jobs ?? []), reminders: structuredClone(db.reminders ?? []) };
  const candidate = { ...original, ...schedule };
  const confirmation = await confirmBookingReservation(draft, candidate);
  if (!confirmation.ok) {
    if (confirmation.reason === 'CLASH') {
      return clashConflict(ctx, { clashes: confirmation.clashes, suggestions: [] });
    }
    return ctx.fail(409, 'CONFLICT', 'Không thể xác nhận lịch mới cho booking này.');
  }

  // The helper awaits its resource check. Publish only if its draft is still current.
  const locked = paymentConflict(ctx, booking);
  if (locked) return locked;
  const available = checkClash(db, schedule.date, schedule.items, { ignoreBooking: booking.code });
  if (!available.available) return clashConflict(ctx, available);
  if (db.settings !== settings || !isDeepStrictEqual(booking, original)
    || !isDeepStrictEqual(db.jobs ?? [], draft.jobs.slice(0, jobCount))
    || !isDeepStrictEqual(db.reminders ?? [], draft.reminders.slice(0, reminderCount))) {
    return ctx.fail(409, 'CONFLICT', 'Dữ liệu lịch vừa thay đổi. Vui lòng tải lại và thử lại.');
  }

  Object.assign(booking, schedule, { status: candidate.status });
  db.jobs = draft.jobs;
  db.reminders = draft.reminders;
  return { status: 200, body: { booking } };
}

export default [
  { method: 'PATCH', path: '/api/bookings/:code', roles: ['admin'], handler: async (ctx) => {
    const booking = findBooking(ctx);
    if (!booking) return bookingMissing(ctx);
    const blocked = rescheduleBlockedReason(ctx.db, booking);
    if (blocked) return ctx.fail(409, 'CONFLICT', blocked);
    const locked = paymentConflict(ctx, booking);
    if (locked) return locked;
    const fields = validateSchedule(ctx.db, ctx.body);
    if (Object.keys(fields).length) return invalid(ctx, fields);
    const items = toScheduleItems(ctx.db, ctx.body.items);
    const schedule = { date: ctx.body.date, items };
    const result = checkClash(ctx.db, schedule.date, items, { ignoreBooking: booking.code });
    if (!result.available) return clashConflict(ctx, result);

    const related = (ctx.db.jobs || []).filter((job) => job.bookingCode === booking.code);
    const recovering = booking.status === 'awaiting_deposit' && booking.paymentStatus === 'deposit_paid';
    // Build every replacement before mutating anything. Jobs with an absent
    // schedule kind cannot be remapped under the current shared specification.
    const updates = [];
    const kinds = (list) => [...new Set(list.map((item) => item.kind))].sort().join(',');
    const duplicateKinds = new Set(items.map(({ kind }) => kind)).size !== items.length;
    if ((related.length && kinds(booking.items) !== kinds(items)) || ((related.length || recovering) && duplicateKinds)) {
      return ctx.fail(409, 'CONFLICT', 'Chưa có quy tắc ánh xạ việc khi thêm, bớt hoặc lặp loại ca; cần TV1 thống nhất');
    }
    if (recovering) return recoverPaidBooking(ctx, booking, schedule);
    for (const job of related) {
      if (job.kind === 'edit') continue;
      const matching = items.filter((entry) => entry.kind === job.kind);
      if (matching.length !== 1) return ctx.fail(409, 'CONFLICT', 'Chưa có quy tắc ánh xạ việc với lịch mới; cần TV1 thống nhất');
      const item = matching[0];
      updates.push({ job, changes: {
        date: ctx.body.date, start: item.start, end: item.end, room: structuredClone(item.room), staff: structuredClone(item.staff),
      } });
    }
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
