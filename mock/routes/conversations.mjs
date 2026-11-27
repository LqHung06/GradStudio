import { checkClash } from '../lib/clash.mjs';
import { isId, isObject, isDate, isTime, validateSchedule, toScheduleItems } from './resources.mjs';

export const nowIso = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19) + '+07:00';
const person = ({ id, name }) => ({ id, name });
export const summary = ({ messages, acceptedProposalId, ...conversation }) => conversation;
export const allMessages = (db) => db.conversations.flatMap((conversation) => conversation.messages);
export const allProposals = (db) => allMessages(db).flatMap((message) => message.proposal ? [message.proposal] : []);
export const latestProposal = (conversation) => conversation.messages.findLast((message) => message.proposal)?.proposal;
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

function readMessage(ctx) {
  const fields = {};
  const textError = validateText(ctx.body.text);
  if (textError) fields.text = textError;
  const input = ctx.body.request;
  if (input !== undefined) {
    if (!isObject(input) || ctx.user.role !== 'customer') fields.request = 'Yêu cầu đặt lịch phải do khách gửi';
    else {
      validateCatalog(ctx.db, input, fields, 'request.');
      if (!isDate(input.preferredDate)) fields['request.preferredDate'] = 'Ngày không hợp lệ';
      if (!isTime(input.preferredTime)) fields['request.preferredTime'] = 'Giờ không đúng định dạng HH:mm';
    }
  }
  if (Object.keys(fields).length) return { error: invalid(ctx, fields) };
  if (!input) return { request: null };
  const { packages, extras } = ctx.db;
  if (!packages || !extras) return { error: dependency(ctx, 'Chưa có dữ liệu packages/extras của TV2') };
  return { request: {
    shootType: input.shootType, packageId: input.packageId,
    packageName: packages.find((pkg) => pkg.id === input.packageId).name,
    preferredDate: input.preferredDate, preferredTime: input.preferredTime,
    extraIds: [...input.extraIds], extraNames: input.extraIds.map((id) => extras.find((extra) => extra.id === id).name),
  } };
}

function destination(ctx, requireUnbooked) {
  const eligible = ctx.db.conversations
    .filter((conversation) => conversation.customer.id === ctx.user.id && conversation.status !== 'done')
    .sort((a, b) => Date.parse(b.lastMessage.at) - Date.parse(a.lastMessage.at));
  return eligible.find((conversation) => !conversation.bookingCode) ?? (requireUnbooked ? null : eligible[0]);
}

function openConversation(ctx) {
  const conversation = {
    id: nextId(ctx.db.conversations, 'c-'), customer: person(ctx.user),
    topic: ctx.body.text, status: 'unanswered', bookingCode: null,
    acceptedProposalId: null, messages: [],
  };
  ctx.db.conversations.push(conversation);
  return conversation;
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
    const { request, error } = readMessage(ctx);
    if (error) return error;
    const existing = destination(ctx, Boolean(request));
    const conversation = existing ?? openConversation(ctx);
    append(ctx.db, conversation, ctx.user, ctx.body.text, request);
    return { status: existing ? 200 : 201, body: { conversation } };
  } },
  { method: 'GET', path: '/api/conversations/:id', roles: ['customer', 'admin'], handler: (ctx) => {
    const conversation = visible(ctx);
    return conversation ? { status: 200, body: { conversation } } : missing(ctx);
  } },
  { method: 'POST', path: '/api/conversations/:id/messages', roles: ['customer', 'admin'], handler: (ctx) => {
    const selected = visible(ctx);
    if (!selected) return missing(ctx);
    const { request, error } = readMessage(ctx);
    if (error) return error;
    const redirect = ctx.user.role === 'customer' && (selected.status === 'done' || (request && selected.bookingCode));
    const conversation = redirect ? destination(ctx, true) ?? openConversation(ctx) : selected;
    const message = append(ctx.db, conversation, ctx.user, ctx.body.text, request);
    return { status: 201, body: { message, conversation: summary(conversation) } };
  } },
  { method: 'POST', path: '/api/conversations/:id/proposals', roles: ['admin'], handler: (ctx) => {
    const conversation = visible(ctx);
    if (!conversation) return missing(ctx);
    const fields = validateSchedule(ctx.db, ctx.body);
    if (ctx.body.note !== undefined && typeof ctx.body.note !== 'string') fields.note = 'Ghi chú phải là chuỗi';
    if (Object.keys(fields).length) return invalid(ctx, fields);
    if (conversation.bookingCode || conversation.status === 'done') {
      return ctx.fail(409, 'CONFLICT', 'Hội thoại này đã có booking hoặc đã hoàn thành. Cần yêu cầu đặt lịch mới.');
    }
    const result = checkClash(ctx.db, ctx.body.date, ctx.body.items);
    if (!result.available) return ctx.fail(409, 'CLASH', result.clashes[0].reason, {}, { clashes: result.clashes, suggestions: result.suggestions });
    const proposal = { id: nextId(allProposals(ctx.db), 'p-'), status: 'pending', date: ctx.body.date,
      items: toScheduleItems(ctx.db, ctx.body.items), note: ctx.body.note ?? '' };
    for (const { proposal: previous } of conversation.messages) {
      if (previous && ['pending', 'accepted'].includes(previous.status)) previous.status = 'superseded';
    }
    conversation.acceptedProposalId = null;
    conversation.status = 'consulting';
    const message = append(ctx.db, conversation, ctx.user, proposal.note, null, proposal);
    return { status: 201, body: { proposal, message } };
  } },
  { method: 'PATCH', path: '/api/conversations/:id/proposals/:proposalId', roles: ['customer'], handler: (ctx) => {
    const conversation = visible(ctx);
    if (!conversation) return missing(ctx);
    const proposal = conversation.messages.find((message) => message.proposal?.id === ctx.params.proposalId)?.proposal;
    if (!proposal) return ctx.fail(404, 'NOT_FOUND', 'Không tìm thấy đề xuất');
    if (!['accepted', 'declined'].includes(ctx.body.decision)) return invalid(ctx, { decision: 'Chọn accepted hoặc declined' });
    if (conversation.bookingCode || conversation.status === 'done') {
      return ctx.fail(409, 'CONFLICT', 'Hội thoại này đã có booking hoặc đã hoàn thành.');
    }
    if (latestProposal(conversation) !== proposal || proposal.status === 'superseded') {
      return ctx.fail(409, 'CONFLICT', 'Đề xuất đã bị thay thế. Vui lòng xem đề xuất mới nhất.');
    }
    if (proposal.status !== 'pending') return ctx.fail(409, 'CONFLICT', 'Đề xuất đã được trả lời');
    proposal.status = ctx.body.decision;
    conversation.acceptedProposalId = proposal.status === 'accepted' ? proposal.id : null;
    conversation.status = proposal.status === 'accepted' ? 'scheduled' : 'consulting';
    return { status: 200, body: { proposal, conversation: summary(conversation) } };
  } },
];
