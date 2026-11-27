import { isId } from './resources.mjs';
import { checkClash, openingHoursErrors } from '../lib/clash.mjs';
import { finalLinkBlockedReason, rescheduleBlockedReason } from '../lib/admin-booking-rules.mjs';
import { allProposals, latestProposal, validateCatalog, invalid, dependency, nowIso } from './conversations.mjs';

export const findBooking = (ctx) => ctx.db.bookings.find((booking) => booking.code === ctx.params.code);
export const bookingMissing = (ctx) => ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

export default [
  { method: 'POST', path: '/api/bookings', roles: ['admin'], handler: (ctx) => {
    const { db, body } = ctx;
    const fields = {};
    if (!isId(body.conversationId)) fields.conversationId = 'Vui lòng chọn hội thoại';
    if (!isId(body.proposalId)) fields.proposalId = 'Vui lòng chọn đề xuất';
    validateCatalog(db, body, fields);
    const editor = db.resources.staff.find(({ id, skill }) => id === body.editorId && skill === 'photo');
    if (!editor) fields.editorId = 'Vui lòng chọn nhân viên chỉnh ảnh.';
    if (Object.keys(fields).length) return invalid(ctx, fields);
    const conversation = db.conversations.find((entry) => entry.id === body.conversationId);
    if (!conversation) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy hội thoại');
    if (conversation.bookingCode || db.bookings.some(({ conversationId }) => conversationId === conversation.id)
      || conversation.status === 'done') {
      return ctx.fail(409, 'CONFLICT', 'Hội thoại này đã có booking hoặc đã hoàn thành. Cần yêu cầu đặt lịch mới.');
    }
    const proposal = allProposals(db).find((entry) => entry.id === body.proposalId);
    if (!proposal) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy đề xuất');
    if (!conversation.messages.some((message) => message.proposal?.id === proposal.id)) {
      return ctx.fail(409, 'CONFLICT', 'Đề xuất không thuộc hội thoại này');
    }
    if (proposal.status === 'superseded') return ctx.fail(409, 'CONFLICT', 'Đề xuất đã bị thay thế. Vui lòng xem đề xuất mới nhất.');
    if (proposal.status !== 'accepted') return ctx.fail(409, 'CONFLICT', 'Khách chưa đồng ý giờ đề xuất này');
    if (latestProposal(conversation) !== proposal || conversation.acceptedProposalId !== proposal.id) {
      return ctx.fail(409, 'CONFLICT', 'Cần đề xuất mới nhất được khách đồng ý để tạo booking.');
    }
    const hours = openingHoursErrors(db, proposal.date, proposal.items);
    if (Object.keys(hours).length) return invalid(ctx, hours);
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
    db.bookingEditors ??= {};
    db.bookingEditors[booking.code] = { id: editor.id, name: editor.name };
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
    const adminActions = ctx.user.role === 'admin' ? {
      rescheduleBlockedReason: rescheduleBlockedReason(ctx.db, booking),
      finalLinkBlockedReason: finalLinkBlockedReason(ctx.db, booking),
      editor: ctx.db.bookingEditors?.[booking.code] ?? null,
    } : null;
    return { status: 200, body: { booking, ...(adminActions && { adminActions }) } };
  } },
];
