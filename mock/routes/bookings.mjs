import { isId } from './resources.mjs';
import { checkClash } from '../lib/clash.mjs';
import { allProposals, validateCatalog, invalid, dependency, nowIso } from './conversations.mjs';

// Runtime bookkeeping stays outside the shared Booking/Proposal response shapes.
const appliedByDb = new WeakMap();
export function wasApplied(db, code, proposalId) {
  const records = appliedByDb.get(db);
  if (!records) return false;
  return code ? records.has(`${code}:${proposalId}`)
    : [...records].some((entry) => entry.endsWith(`:${proposalId}`));
}
export function recordApplied(db, code, proposalId) {
  if (!appliedByDb.has(db)) appliedByDb.set(db, new Set());
  appliedByDb.get(db).add(`${code}:${proposalId}`);
}
export const findBooking = (ctx) => ctx.db.bookings.find((booking) => booking.code === ctx.params.code);
export const bookingMissing = (ctx) => ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

export default [
  { method: 'POST', path: '/api/bookings', roles: ['admin'], handler: (ctx) => {
    const { db, body } = ctx;
    const fields = {};
    if (!isId(body.conversationId)) fields.conversationId = 'Vui lòng chọn hội thoại';
    if (!isId(body.proposalId)) fields.proposalId = 'Vui lòng chọn đề xuất';
    validateCatalog(db, body, fields);
    if (Object.keys(fields).length) return invalid(ctx, fields);
    const conversation = db.conversations.find((entry) => entry.id === body.conversationId);
    if (!conversation) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy hội thoại');
    const proposal = allProposals(db).find((entry) => entry.id === body.proposalId);
    if (!proposal) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy đề xuất');
    if (!conversation.messages.some((message) => message.proposal?.id === proposal.id)) {
      return ctx.fail(409, 'CONFLICT', 'Đề xuất không thuộc hội thoại này');
    }
    if (proposal.status !== 'accepted') return ctx.fail(409, 'CONFLICT', 'Khách chưa đồng ý giờ đề xuất này');
    const linked = db.bookings.find((entry) => entry.code === conversation.bookingCode);
    if (conversation.bookingCode && linked?.status !== 'cancelled') return ctx.fail(409, 'CONFLICT', 'Hội thoại đã có booking chưa hủy');
    if (wasApplied(db, null, proposal.id)) return ctx.fail(409, 'CONFLICT', 'Đề xuất đã dùng hoặc thuộc lịch trước khi hủy');
    if (!db.packages || !db.extras || !db.services) return dependency(ctx, 'Chưa có dữ liệu packages/extras/services của TV2');
    const pkg = db.packages.find((entry) => entry.id === body.packageId);
    const service = db.services.find((entry) => entry.id === pkg.serviceId);
    if (!service) return dependency(ctx, 'Gói chụp chưa có dịch vụ tương ứng trong catalog');
    const request = conversation.messages.findLast((message) => message.request)?.request;
    const changedTime = request && (request.preferredDate !== proposal.date || request.preferredTime !== proposal.items[0].start);
    let requestedTime = null;
    if (changedTime) {
      const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
      const shift = toMinutes(request.preferredTime) - toMinutes(proposal.items[0].start);
      const shifted = proposal.items.map((item) => {
        const shiftedTime = (time) => {
          const value = toMinutes(time) + shift;
          return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
        };
        return { ...item, start: shiftedTime(item.start), end: shiftedTime(item.end) };
      });
      const clash = checkClash(db, request.preferredDate, shifted).clashes[0];
      requestedTime = { start: request.preferredTime,
        note: clash ? `${clash.resource.name} bận ${clash.busyFrom}–${clash.busyTo}` : proposal.note };
    }
    // Price is the package price per 05, not caller money or a new extras rule.
    const price = pkg.price;
    const deposit = Math.round(price * 0.3);
    const number = Math.max(0, ...db.bookings.map(({ code }) => /^GS-\d+$/.test(code) ? Number(code.slice(3)) : 0)) + 1;
    const booking = {
      code: `GS-${number}`, customer: { ...conversation.customer }, conversationId: conversation.id,
      serviceName: service.name, shootType: body.shootType,
      package: { id: pkg.id, name: pkg.name, durationHours: pkg.durationHours, editedPhotos: pkg.editedPhotos },
      extras: body.extraIds.map((id) => { const extra = db.extras.find((entry) => entry.id === id); return { id: extra.id, name: extra.name }; }),
      date: proposal.date, requestedTime,
      items: structuredClone(proposal.items), price, deposit, remaining: price - deposit,
      status: 'awaiting_deposit', paymentStatus: 'unpaid', selection: { limit: pkg.editedPhotos, selectedCount: 0 },
      finalLink: null, createdAt: nowIso(),
    };
    db.bookings.push(booking);
    conversation.bookingCode = booking.code;
    recordApplied(db, booking.code, proposal.id);
    return { status: 201, body: { booking } };
  } },
  { method: 'GET', path: '/api/bookings', roles: ['customer', 'admin'], handler: (ctx) => {
    if (ctx.query.status !== undefined && !['awaiting_deposit', 'booked', 'completed', 'cancelled'].includes(ctx.query.status)) {
      return invalid(ctx, { status: 'Trạng thái không hợp lệ' });
    }
    return { status: 200, body: { bookings: ctx.db.bookings.filter((booking) => (ctx.user.role === 'admin' || booking.customer.id === ctx.user.id)
      && (ctx.query.status === undefined || booking.status === ctx.query.status)) } };
  } },
  { method: 'GET', path: '/api/bookings/:code', roles: ['customer', 'admin', 'staff'], handler: (ctx) => {
    const booking = findBooking(ctx);
    if (!booking || (ctx.user.role === 'customer' && booking.customer.id !== ctx.user.id)
      || (ctx.user.role === 'staff' && !(ctx.db.jobs || []).some((job) => job.bookingCode === booking.code && job.staff.id === ctx.user.id))) {
      return bookingMissing(ctx);
    }
    return { status: 200, body: { booking } };
  } },
];
