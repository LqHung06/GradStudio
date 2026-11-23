import { checkClash } from '../lib/clash.mjs';
import { isId, isObject, isDate, isTime, validateSchedule, toScheduleItems } from './resources.mjs';

export const nowIso = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19) + '+07:00';
const person = ({ id, name }) => ({ id, name });
export const summary = ({ messages, acceptedProposalId, ...conversation }) => conversation;
export const allMessages = (db) => db.conversations.flatMap((conversation) => conversation.messages);
export const allProposals = (db) => allMessages(db).flatMap((message) => message.proposal ? [message.proposal] : []);
const nextId = (items, prefix) => `${prefix}${1 + Math.max(0, ...items.map(({ id }) => {
  const suffix = id.startsWith(prefix) ? id.slice(prefix.length) : '';
  return /^\d+$/.test(suffix) ? Number(suffix) : 0;
}))}`;
const visible = (ctx) => ctx.db.conversations.find((conversation) => conversation.id === ctx.params.id
  && (ctx.user.role === 'admin' || conversation.customer.id === ctx.user.id));
const missing = (ctx) => ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy hội thoại');
export const invalid = (ctx, fields) => ctx.fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);
export const dependency = (ctx, message) => ctx.fail(500, 'SERVER_ERROR', message);
const validateText = (text) => typeof text !== 'string' || !text.trim() ? 'Vui lòng nhập tin nhắn'
  : text.length > 1000 ? 'Tin nhắn tối đa 1000 ký tự' : null;

// The proposed maximum lengths and extra-ID count/uniqueness are unconfirmed.
export function validateCatalog(db, body, fields, prefix = '') {
  if (!isId(body.shootType)) fields[prefix + 'shootType'] = 'Vui lòng nhập loại chụp';
  if (!isId(body.packageId)) fields[prefix + 'packageId'] = 'Vui lòng chọn gói chụp';
  else if (db.packages && !db.packages.some((pkg) => pkg.id === body.packageId)) fields[prefix + 'packageId'] = 'Gói chụp không tồn tại';
  if (!Array.isArray(body.extraIds)) fields[prefix + 'extraIds'] = 'Danh sách dịch vụ bổ sung chưa hợp lệ';
  else if (body.extraIds.some((id) => !isId(id) || (db.extras && !db.extras.some((extra) => extra.id === id)))) {
    fields[prefix + 'extraIds'] = 'Dịch vụ bổ sung không tồn tại';
  }
}

function append(db, conversation, user, text, request = null, proposal = null) {
  const message = { id: nextId(allMessages(db), 'm-'), from: user.role === 'admin' ? 'studio' : 'customer',
    author: person(user), type: proposal ? 'proposal' : request ? 'request' : 'text',
    text, request, proposal, at: nowIso() };
  conversation.messages.push(message);
  conversation.lastMessage = { text, at: message.at };
  conversation.updatedAt = message.at;
  if (user.role === 'admin' && conversation.status === 'unanswered') conversation.status = 'consulting';
  return message;
}

export default [
  { method: 'GET', path: '/api/conversations', roles: ['customer', 'admin'], handler: (ctx) => {
    if (ctx.query.status !== undefined && !['unanswered', 'consulting', 'scheduled', 'done'].includes(ctx.query.status)) {
      return invalid(ctx, { status: 'Trạng thái không hợp lệ' });
    }
    const conversations = ctx.db.conversations.filter((conversation) => (ctx.user.role === 'admin' || conversation.customer.id === ctx.user.id)
      && (ctx.query.status === undefined || conversation.status === ctx.query.status)).map(summary);
    return { status: 200, body: { conversations } };
  } },
  { method: 'POST', path: '/api/conversations', roles: ['customer'], handler: (ctx) => {
    const textError = validateText(ctx.body.text);
    if (textError) return invalid(ctx, { text: textError });
    const conversation = {
      id: nextId(ctx.db.conversations, 'c-'), customer: person(ctx.user),
      topic: ctx.body.text, status: 'unanswered', bookingCode: null,
      acceptedProposalId: null, messages: [],
    };
    // append sees the new conversation so the first message uses the same
    // global message counter and timestamp rules as every later message.
    ctx.db.conversations.push(conversation);
    append(ctx.db, conversation, ctx.user, ctx.body.text);
    return { status: 201, body: { conversation } };
  } },
  { method: 'GET', path: '/api/conversations/:id', roles: ['customer', 'admin'], handler: (ctx) => {
    const conversation = visible(ctx);
    return conversation ? { status: 200, body: { conversation } } : missing(ctx);
  } },
  { method: 'POST', path: '/api/conversations/:id/messages', roles: ['customer', 'admin'], handler: (ctx) => {
    const conversation = visible(ctx);
    if (!conversation) return missing(ctx);
    const fields = {};
    const textError = validateText(ctx.body.text);
    if (textError) fields.text = textError;
    let request = null;
    if (ctx.body.request !== undefined) {
      if (!isObject(ctx.body.request)) fields.request = 'Yêu cầu đặt lịch phải là một đối tượng';
      else {
        const input = ctx.body.request;
        validateCatalog(ctx.db, input, fields, 'request.');
        if (!isDate(input.preferredDate)) fields['request.preferredDate'] = 'Ngày không hợp lệ';
        if (!isTime(input.preferredTime)) fields['request.preferredTime'] = 'Giờ không đúng định dạng HH:mm';
      }
    }
    if (Object.keys(fields).length) return invalid(ctx, fields);
    if (ctx.body.request !== undefined) {
      if (!ctx.db.packages || !ctx.db.extras) return dependency(ctx, 'Chưa có dữ liệu packages/extras của TV2');
      const input = ctx.body.request;
      request = { shootType: input.shootType, packageId: input.packageId,
        packageName: ctx.db.packages.find((pkg) => pkg.id === input.packageId).name,
        preferredDate: input.preferredDate, preferredTime: input.preferredTime,
        extraIds: [...input.extraIds], extraNames: input.extraIds.map((id) => ctx.db.extras.find((extra) => extra.id === id).name) };
    }
    const message = append(ctx.db, conversation, ctx.user, ctx.body.text, request);
    return { status: 201, body: { message, conversation: summary(conversation) } };
  } },
  { method: 'POST', path: '/api/conversations/:id/proposals', roles: ['admin'], handler: (ctx) => {
    const conversation = visible(ctx);
    if (!conversation) return missing(ctx);
    const fields = validateSchedule(ctx.db, ctx.body);
    if (ctx.body.note !== undefined && typeof ctx.body.note !== 'string') fields.note = 'Ghi chú phải là chuỗi';
    if (Object.keys(fields).length) return invalid(ctx, fields);
    const linked = ctx.db.bookings?.find((booking) => booking.code === conversation.bookingCode);
    if (linked?.status === 'completed') return ctx.fail(409, 'CONFLICT', 'Booking đã hoàn thành');
    const result = checkClash(ctx.db, ctx.body.date, ctx.body.items, { ignoreBooking: linked?.code });
    if (!result.available) return ctx.fail(409, 'CLASH', result.clashes[0].reason, {}, { clashes: result.clashes, suggestions: result.suggestions });
    const proposal = { id: nextId(allProposals(ctx.db), 'p-'), status: 'pending', date: ctx.body.date,
      items: toScheduleItems(ctx.db, ctx.body.items), note: ctx.body.note ?? '' };
    const message = append(ctx.db, conversation, ctx.user, proposal.note, null, proposal);
    return { status: 201, body: { proposal, message } };
  } },
  { method: 'PATCH', path: '/api/conversations/:id/proposals/:proposalId', roles: ['customer'], handler: (ctx) => {
    const conversation = visible(ctx);
    if (!conversation) return missing(ctx);
    const proposal = conversation.messages.find((message) => message.proposal?.id === ctx.params.proposalId)?.proposal;
    if (!proposal) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy đề xuất');
    if (!['accepted', 'declined'].includes(ctx.body.decision)) return invalid(ctx, { decision: 'Chọn accepted hoặc declined' });
    if (proposal.status !== 'pending') return ctx.fail(409, 'CONFLICT', 'Đề xuất đã được trả lời');
    proposal.status = ctx.body.decision;
    if (proposal.status === 'accepted') {
      conversation.acceptedProposalId = proposal.id;
      if (!conversation.bookingCode) conversation.status = 'scheduled';
    }
    return { status: 200, body: { proposal, conversation: summary(conversation) } };
  } },
];
