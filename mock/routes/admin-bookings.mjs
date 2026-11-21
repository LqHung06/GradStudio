import { checkClash } from '../lib/clash.mjs';
import { isId } from './resources.mjs';
import { allProposals, invalid, dependency } from './conversations.mjs';
import { findBooking, bookingMissing, wasApplied, recordApplied } from './bookings.mjs';

export default [
  { method: 'PATCH', path: '/api/bookings/:code', roles: ['admin'], handler: (ctx) => {
    const booking = findBooking(ctx);
    if (!booking) return bookingMissing(ctx);
    if (!isId(ctx.body.proposalId)) return invalid(ctx, { proposalId: 'Vui lòng chọn đề xuất' });
    const proposal = allProposals(ctx.db).find((entry) => entry.id === ctx.body.proposalId);
    if (!proposal) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy đề xuất');
    const conversation = ctx.db.conversations.find((entry) => entry.id === booking.conversationId);
    if (!conversation?.messages.some((message) => message.proposal?.id === proposal.id)) {
      return ctx.fail(409, 'CONFLICT', 'Đề xuất không thuộc hội thoại của booking');
    }
    if (proposal.status !== 'accepted') return ctx.fail(409, 'CONFLICT', 'Khách chưa đồng ý giờ mới');
    if (['completed', 'cancelled'].includes(booking.status)) return ctx.fail(409, 'CONFLICT', 'Booking đã hoàn thành hoặc đã hủy');
    if (wasApplied(ctx.db, booking.code, proposal.id)) return ctx.fail(409, 'CONFLICT', 'Đề xuất đã được áp dụng');
    const result = checkClash(ctx.db, proposal.date, proposal.items, { ignoreBooking: booking.code });
    if (!result.available) return ctx.fail(409, 'CLASH', result.clashes[0].reason, {}, { clashes: result.clashes, suggestions: result.suggestions });

    const related = (ctx.db.jobs || []).filter((job) => job.bookingCode === booking.code);
    // Build every replacement before mutating anything. Jobs with an absent
    // schedule kind cannot be remapped under the current shared specification.
    const updates = [];
    for (const job of related) {
      const matching = proposal.items.filter((entry) => entry.kind === (job.kind === 'edit' ? 'shoot' : job.kind));
      if (matching.length !== 1) return dependency(ctx, 'Chưa có quy tắc đổi lịch khi loại ca của job bị thiếu hoặc có nhiều ca tương ứng');
      const item = matching[0];
      updates.push({ job, changes: job.kind === 'edit'
        ? { date: null, start: null, end: null, room: null, staff: structuredClone(item.staff) }
        : { date: proposal.date, start: item.start, end: item.end, room: structuredClone(item.room), staff: structuredClone(item.staff) } });
    }
    const items = structuredClone(proposal.items);
    booking.date = proposal.date;
    booking.items = items;
    for (const { job, changes } of updates) Object.assign(job, changes);
    recordApplied(ctx.db, booking.code, proposal.id);
    return { status: 200, body: { booking } };
  } },
  { method: 'POST', path: '/api/bookings/:code/cancel', roles: ['admin'], handler: (ctx) => {
    const booking = findBooking(ctx);
    if (!booking) return bookingMissing(ctx);
    const reason = ctx.body.reason;
    if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 500) {
      return invalid(ctx, { reason: 'Lý do hủy từ 5 đến 500 ký tự' });
    }
    if (booking.status === 'completed') return ctx.fail(409, 'CONFLICT', 'Không thể hủy booking đã hoàn thành');
    // 10 explicitly defers cancellation of existing jobs to TV1. Leave both
    // records untouched until removal/archival is agreed; add no Job status.
    if ((ctx.db.jobs || []).some((job) => job.bookingCode === booking.code)
      || (!ctx.db.jobs && booking.status === 'booked')) {
      return dependency(ctx, 'Chưa chốt cách xử lý jobs khi hủy booking đã có việc');
    }
    booking.status = 'cancelled';
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
    if (booking.status !== 'booked') return ctx.fail(409, 'CONFLICT', 'Chỉ lưu link cho booking đã đặt lịch');
    booking.finalLink = ctx.body.url;
    return { status: 200, body: { booking } };
  } },
];
