import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import conversations from '../mock/routes/conversations.mjs';
import bookings from '../mock/routes/bookings.mjs';
import admin from '../mock/routes/admin-bookings.mjs';
import jobs from '../mock/routes/jobs.mjs';
import resources from '../mock/routes/resources.mjs';
import { checkClash } from '../mock/lib/clash.mjs';
import { activePaymentLock } from '../mock/lib/admin-booking-rules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const seeds = new URL('../mock/data/', import.meta.url);
function fresh() {
  return Object.fromEntries(fs.readdirSync(seeds).filter(f => f.endsWith('.json'))
    .map(f => [f.slice(0, -5), JSON.parse(fs.readFileSync(new URL(f, seeds), 'utf8'))]));
}
const routes = [...conversations, ...bookings, ...admin, ...jobs, ...resources];
const fail = (status, code, message, fields = {}, details = null) => ({ status, body: { error: { code, message, fields, details } } });
function call(db, method, path, body = {}, params = {}, userId = 'u-thao', extras = {}) {
  const route = routes.find(r => r.method === method && r.path === path);
  assert.ok(route, path);
  const user = db.users.find(u => u.id === userId);
  // Handler tests use the same declared roles; HTTP tests below verify server enforcement.
  if (!route.roles.includes(user.role)) return fail(403, 'FORBIDDEN', 'Không có quyền');
  return route.handler({ db, body, params, user, query: {}, headers: {}, rawBody: Buffer.alloc(0), fail, ...extras });
}
const getBooking = (db, code) => db.bookings.find(b => b.code === code);
const input = (date = '2026-10-26') => ({ date, items: [
  { kind: 'makeup', start: '13:00', end: '14:00', staffId: 'u-mai', roomId: null },
  { kind: 'shoot', start: '14:00', end: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
] });
const scheduleInput = b => ({ date: b.date, items: b.items.map(i => ({kind:i.kind,start:i.start,end:i.end,staffId:i.staff.id,roomId:i.room?.id ?? null})) });
const patch = (db, code, body) => call(db, 'PATCH', '/api/bookings/:code', body, {code});
const cancel = (db, code) => call(db, 'POST', '/api/bookings/:code/cancel', {reason:'Khách đổi kế hoạch'}, {code});
function propose(db, id = 'c-linh', body = input()) {
  const result = call(db, 'POST', '/api/conversations/:id/proposals', body, {id});
  assert.equal(result.status, 201);
  return result.body.proposal;
}
function accept(db, proposal, id = 'c-linh', user = 'u-linh') {
  return call(db, 'PATCH', '/api/conversations/:id/proposals/:proposalId', {decision:'accepted'}, {id,proposalId:proposal.id}, user);
}
const create = (db, proposal, extra = {}) => call(db, 'POST', '/api/bookings', {
  conversationId:'c-linh',proposalId:proposal.id,shootType:'Tốt nghiệp cá nhân',packageId:'pkg-tn-premium',
  extraIds:['ex-makeup'],editorId:'u-tuan',...extra,
});

function allowSeededReschedule(db) {
  db.jobs.find(({ id }) => id === 'J-GS-1022-shoot').status = 'todo';
  return getBooking(db, 'GS-1022');
}

test('R03: direct date/items, no customer action; unpaid gets no jobs/reminders', () => {
  const db=fresh(), before=structuredClone(db), b=getBooking(db,'GS-1023');
  const result=patch(db,b.code,input());
  assert.equal(result.status,200);
  const expected={...before.bookings.find(x=>x.code===b.code),date:input().date,items:b.items};
  assert.deepEqual(b,expected);
  assert.deepEqual(db.jobs,before.jobs); assert.deepEqual(db.reminders,before.reminders); assert.deepEqual(db.payments,before.payments);
});
test('R03/B4.11: reschedule ignores itself and retains the assigned editor', () => {
  const db=fresh(), b=allowSeededReschedule(db), before=structuredClone(b);
  const oldJobs=structuredClone(db.jobs.filter(j=>j.bookingCode===b.code));
  assert.equal(patch(db,b.code,scheduleInput(b)).status,200);
  const body={date:'2026-10-26',items:[{kind:'shoot',start:'09:00',end:'10:30',staffId:'u-ha',roomId:'r-a'}]};
  assert.equal(patch(db,b.code,body).status,200);
  assert.deepEqual({...b,date:before.date,items:before.items},before);
  for (const old of oldJobs) {
    const current = db.jobs.find(({ id }) => id === old.id);
    if (old.kind === 'edit') assert.deepEqual(current, old);
    else assert.deepEqual(current, { ...old, date: body.date, start: '09:00', end: '10:30',
      room: { id: 'r-a', name: 'Phòng A' }, staff: { id: 'u-ha', name: 'Hà' } });
  }
});
test('R03: clash returns complete details and preserves the entire db', () => {
  const db=fresh(), body=input('2026-10-24');
  db.reminders.push({id:'atomic-reminder',bookingCode:'GS-1023',emailStatus:'queued',sendAt:'2026-10-23T09:00:00+07:00'});
  db.payments.push({id:'atomic-payment',bookingCode:'GS-1023',status:'failed',amount:540000});
  const before=structuredClone(db);
  body.items[0].start='09:00';body.items[0].end='10:00';
  body.items[1].start='10:00';body.items[1].end='12:00';
  const result=patch(db,'GS-1023',body);assert.equal(result.status,409);assert.equal(result.body.error.code,'CLASH');
  assert.ok(result.body.error.details.clashes[0].reason);assert.ok(result.body.error.details.suggestions.length);
  assert.deepEqual(db,before);
});
test('R03: invalid date/resource/range and old proposal-only body do not mutate db', () => {
  const db=fresh();for(const body of [{proposalId:'p-1'},input('2026-02-30'),{...input(),items:[{...input().items[0],staffId:'missing'}]},{...input(),items:[{...input().items[0],end:'12:00'}]}]){
    const before=structuredClone(db);assert.equal(patch(db,'GS-1023',body).status,400);assert.deepEqual(db,before);}
});
test('R03: unsupported existing job mapping reports 409 atomically, never first-slot or 500', () => {
  const db=fresh(), before=structuredClone(db);const body=input();body.items.push({...body.items[1],start:'16:00',end:'17:00'});
  assert.equal(patch(db,'GS-1021',body).status,409);assert.deepEqual(db,before);
  assert.equal(patch(db,'GS-1021',{date:body.date,items:[body.items[1]]}).status,409);assert.deepEqual(db,before);
});
test('R05: cancel booked GS-1021 retains jobs/payments/money/history and frees resources', () => {
  const db=fresh(), b=getBooking(db,'GS-1021'), old=structuredClone(b);
  db.payments.push({id:'paid-history',bookingCode:b.code,kind:'deposit',amount:b.deposit,status:'succeeded',failureReason:null,createdAt:b.createdAt});
  const before=structuredClone(db);
  assert.equal(cancel(db,b.code).status,200);assert.deepEqual(b,{...old,status:'cancelled'});
  assert.deepEqual(db.jobs,before.jobs);assert.deepEqual(db.payments,before.payments);
  assert.equal(db.conversations.find(c=>c.id===b.conversationId).status,'scheduled');
  for (const item of old.items) assert.equal(checkClash(db,old.date,[item]).available,true);
  const after=structuredClone(db);assert.equal(cancel(db,b.code).status,409);assert.deepEqual(db,after);
});
test('R05: completed/cancelled changes refused and customer cannot cancel or reschedule', () => {
  const db=fresh(),before=structuredClone(db);assert.equal(cancel(db,'GS-1020').status,409);
  assert.equal(patch(db,'GS-1020',input()).status,409);
  for(const [method,path] of [['POST','/api/bookings/:code/cancel'],['PATCH','/api/bookings/:code']])
    assert.equal(call(db,method,path,{...input(),reason:'Khách đổi lịch'},{code:'GS-1023'},'u-han').status,403);
  assert.deepEqual(db,before);
});
const requestInput = {
  shootType: 'Tốt nghiệp cá nhân', packageId: 'pkg-tn-premium', preferredDate: '2026-10-24',
  preferredTime: '07:00', extraIds: [],
};
const serviceMessage = (db, body, user = 'u-linh') =>
  call(db, 'POST', '/api/conversations', body, {}, user);
const selectedMessage = (db, id, body, user = 'u-linh') =>
  call(db, 'POST', '/api/conversations/:id/messages', body, { id }, user);

test('B2.2: cancelled booking remains in its thread and the new request gets its own booking', () => {
  const db = fresh();
  const proposal = propose(db);
  assert.equal(accept(db, proposal).status, 200);
  const old = create(db, proposal).body.booking;
  const thread = db.conversations.find(({ id }) => id === 'c-linh');
  const history = structuredClone(thread);
  assert.equal(cancel(db, old.code).status, 200);
  assert.deepEqual(thread, history);
  assert.equal(old.status, 'cancelled');
  assert.equal(call(db, 'POST', '/api/conversations/:id/proposals', input(), { id: thread.id }).status, 409);
  assert.equal(create(db, proposal).status, 409);

  const opened = selectedMessage(db, thread.id, { text: 'Đặt lịch mới', request: requestInput });
  const newId = opened.body.conversation.id;
  assert.notEqual(newId, thread.id);
  assert.equal(opened.body.message.type, 'request');
  const newProposal = propose(db, newId);
  assert.equal(accept(db, newProposal, newId).status, 200);
  const created = create(db, newProposal, { conversationId: newId });
  assert.equal(created.status, 201);
  assert.equal(created.body.booking.code, 'GS-1025');
  assert.deepEqual(thread, history);
  assert.deepEqual(call(db, 'GET', '/api/bookings', {}, {}, 'u-linh').body.bookings
    .map(({ code, status }) => [code, status]), [['GS-1024', 'cancelled'], ['GS-1025', 'awaiting_deposit']]);
});

test('B4.6: select by latest message among unbooked threads; keep explicitly selected chat', () => {
  const db = fresh();
  const [linh] = db.conversations;
  const newer = { ...structuredClone(linh), id: 'c-9', lastMessage: { text: 'newer', at: '2026-10-21T11:00:00+07:00' } };
  const booked = { ...structuredClone(linh), id: 'c-10', bookingCode: 'GS-other',
    lastMessage: { text: 'newest', at: '2026-10-22T11:00:00+07:00' } };
  db.conversations.push(newer, booked);
  const initial = structuredClone(db);
  assert.equal(serviceMessage(db, { text: '' }).status, 400);
  assert.deepEqual(db, initial);
  const chat = serviceMessage(db, { text: 'Tư vấn' });
  assert.equal(chat.status, 200);
  assert.equal(chat.body.conversation.id, newer.id);
  assert.equal(serviceMessage(db, { text: 'Đặt lịch', request: requestInput }).body.conversation.id, newer.id);
  assert.equal(selectedMessage(db, booked.id, { text: 'Hỏi về booking' }).body.conversation.id, booked.id);
  assert.equal(selectedMessage(db, booked.id, { text: 'Đặt lại', request: requestInput }).body.conversation.id, newer.id);
  assert.equal(selectedMessage(db, booked.id, { text: 'Không có quyền' }, 'u-han').status, 404);

  newer.status = 'done';
  linh.status = 'done';
  assert.equal(serviceMessage(db, { text: 'Hỏi booking' }).body.conversation.id, booked.id);
  const opened = serviceMessage(db, { text: 'Lịch mới', request: requestInput });
  assert.equal(opened.status, 201);
  assert.equal(opened.body.conversation.id, 'c-11');
  assert.equal(opened.body.conversation.messages[0].request.preferredTime, '07:00');
  assert.equal(selectedMessage(db, opened.body.conversation.id, { text: 'Studio trả lời' }, 'u-thao').status, 201);
  assert.equal(opened.body.conversation.status, 'consulting');
});

test('B3.3/B4.5: newest proposal invalidates pending and accepted slots, including stale tabs', () => {
  const db = fresh();
  const older = propose(db);
  const accepted = propose(db);
  assert.equal(older.status, 'superseded');
  assert.equal(accept(db, older).status, 409);
  assert.equal(accept(db, accepted).status, 200);
  const latest = propose(db);
  const thread = db.conversations.find(({ id }) => id === 'c-linh');
  assert.equal(accepted.status, 'superseded');
  assert.equal(thread.status, 'consulting');
  assert.equal(thread.acceptedProposalId, null);
  const before = structuredClone(db);
  assert.equal(accept(db, accepted).status, 409);
  assert.equal(create(db, accepted).status, 409);
  assert.equal(create(db, latest).status, 409);
  assert.deepEqual(db, before);
  const other = serviceMessage(db, { text: 'Lịch khác', request: requestInput }, 'u-han').body.conversation;
  const foreignProposal = propose(db, other.id);
  assert.equal(create(db, foreignProposal).status, 409);
  assert.equal(accept(db, latest).status, 200);
  assert.equal(create(db, latest).status, 201);
});

test('R3 price: package only, extras add no money, client amounts ignored; one-VND rounding', () => {
  const db=fresh();db.packages.find(p=>p.id==='pkg-tn-premium').price=1800005;
  const p=propose(db);accept(db,p);const b=create(db,p,{price:1,deposit:1,remaining:1,extraIds:db.extras.map(e=>e.id)}).body.booking;
  assert.equal(b.price,1800005);assert.equal(b.deposit,540002);assert.equal(b.remaining,1260003);
});

const reminderFixture = b => ({id:'test-reminder',bookingCode:b.code,sendAt:'2026-10-19T09:00:00+07:00',channels:['email','account'],emailStatus:'queued',text:'Lịch cũ'});
test('R04: queued reminder follows new earliest time/staff/room', () => {
  const db=fresh(),b=allowSeededReschedule(db);db.reminders.push(reminderFixture(b));
  assert.equal(patch(db,b.code,{date:'2026-10-26',items:[{kind:'shoot',start:'09:00',end:'10:30',staffId:'u-ha',roomId:'r-a'}]}).status,200);
  assert.ok(db.reminders.some(r=>r.sendAt==='2026-10-25T09:00:00+07:00'&&r.text.includes('Hà')&&r.text.includes('Phòng A')));
});
test('R04: lead hours and earliest item update queued, preserve sent and stay idempotent', () => {
  const db = fresh();
  const booking = getBooking(db, 'GS-1021');
  const queued = reminderFixture(booking);
  const sent = { ...queued, id: 'sent-history', emailStatus: 'sent' };
  db.reminders.push(queued, sent);
  db.settings.reminderHoursBefore = 6;
  const schedule = input();
  schedule.items.reverse();
  const history = structuredClone(sent);
  for (let attempt = 0; attempt < 2; attempt++) {
    assert.equal(patch(db, booking.code, schedule).status, 200);
    assert.deepEqual(db.reminders, [
      { ...queued, sendAt: '2026-10-26T07:00:00+07:00',
        text: 'Nhắc lịch: makeup 13:00 ngày 26/10/2026 với Mai tại GradStudio' },
      history,
    ]);
  }
});

test('B4.1: clash or unavailable confirmation leaves a paid-but-unreserved booking untouched', () => {
  const db = fresh();
  const booking = getBooking(db, 'GS-1023');
  booking.paymentStatus = 'deposit_paid';
  const before = structuredClone(db);
  const clash = input('2026-10-24');
  Object.assign(clash.items[0], { start: '09:00', end: '10:00' });
  assert.equal(patch(db, booking.code, clash).body.error.code, 'CLASH');
  assert.deepEqual(db, before);
  const result = patch(db, booking.code, input());
  assert.equal(result.status, 409);
  assert.match(result.body.error.message, /Chưa thể xác nhận/);
  assert.deepEqual(db, before);
});

test('B4.4: opening hours differ by day, accept adjacent slots, recheck accepted slot on create', () => {
  const db = fresh();
  db.settings.openingHours = { weekday: { open: '10:00', close: '17:00' }, weekend: { open: '08:00', close: '16:00' } };
  const check = (body) => call(db, 'POST', '/api/availability/check', body);
  const weekend = input('2026-10-24');
  const weekday = { date: '2026-10-26', items: [
    { ...weekend.items[1], start: '09:00', end: '10:00' },
    { ...weekend.items[1], start: '10:00', end: '11:00' },
  ] };
  assert.equal(check(weekend).body.available, true);
  assert.match(check(weekday).body.error.fields['items.0.start'], /10:00–17:00/);
  assert.equal(check({ ...weekday, date: '2026-10-25' }).body.available, true);
  const before = structuredClone(db);
  assert.equal(call(db, 'POST', '/api/conversations/:id/proposals', weekday, { id: 'c-linh' }).status, 400);
  assert.equal(patch(db, 'GS-1023', weekday).status, 400);
  assert.deepEqual(db, before);
  const proposal = propose(db, 'c-linh', weekend);
  assert.equal(accept(db, proposal).status, 200);
  db.settings.openingHours.weekend.close = '15:00';
  const accepted = structuredClone(db);
  assert.match(create(db, proposal).body.error.fields['items.1.end'], /08:00–15:00/);
  assert.deepEqual(db, accepted);
});

test('B4.2–3/BS.1 handler with injected deadlines: Admin reads expiry without mutating payments', () => {
  for (const kind of ['deposit', 'remaining']) {
    const db = fresh();
    const code = kind === 'deposit' ? 'GS-1023' : 'GS-1021';
    const payment = { bookingCode: code, status: 'pending', kind,
      expiresAt: new Date(Date.now() + 90_000).toISOString() };
    db.payments.push(payment);
    const cutoff = Date.parse(payment.expiresAt);
    assert.equal(activePaymentLock(db, code, cutoff - 1).retryAt, payment.expiresAt);
    assert.equal(activePaymentLock(db, code, cutoff), null);
    assert.equal(activePaymentLock(db, code, cutoff + 1), null);
    const before = structuredClone(db);
    for (const result of [patch(db, code, input()), cancel(db, code)]) {
      assert.equal(result.status, 409);
      assert.equal(result.body.error.details.retryAt, payment.expiresAt);
    }
    assert.deepEqual(db, before);
    payment.expiresAt = '2026-01-01T00:00:00Z';
    assert.equal(patch(db, code, input()).status, 200);
    assert.equal(cancel(db, code).status, 200);
    assert.equal(payment.status, 'pending');
  }
});

test('B4.7: shoot active/done and full payment independently block rescheduling', () => {
  for (const [jobStatus, paymentStatus] of [['in_progress', 'deposit_paid'], ['done', 'deposit_paid'], ['todo', 'paid_in_full']]) {
    const db = fresh();
    const booking = allowSeededReschedule(db);
    db.jobs.find(({ id }) => id === 'J-GS-1022-shoot').status = jobStatus;
    booking.paymentStatus = paymentStatus;
    const before = structuredClone(db);
    assert.equal(patch(db, booking.code, input()).status, 409);
    assert.deepEqual(db, before);
  }
});

test('B4.11: editor is explicit and delivery requires paid_in_full and a completed edit job', () => {
  const db = fresh();
  const proposal = propose(db);
  assert.equal(accept(db, proposal).status, 200);
  const before = structuredClone(db);
  for (const editorId of [null, 'u-mai', 'missing']) {
    assert.ok(create(db, proposal, { editorId }).body.error.fields.editorId);
  }
  assert.deepEqual(db, before);
  const booking = create(db, proposal, { editorId: 'u-ha' }).body.booking;
  const detail = () => call(db, 'GET', '/api/bookings/:code', {}, { code: booking.code }).body.adminActions;
  const link = (url = 'https://example.com/photos') => call(db, 'PUT', '/api/bookings/:code/final-link', { url }, { code: booking.code });
  assert.deepEqual(detail().editor, { id: 'u-ha', name: 'Hà' });
  booking.status = 'booked';
  booking.paymentStatus = 'deposit_paid';
  assert.match(link().body.error.message, /thanh toán đủ/);
  booking.paymentStatus = 'paid_in_full';
  assert.match(link().body.error.message, /chỉnh ảnh/);
  db.jobs.push({ bookingCode: booking.code, kind: 'edit', status: 'in_progress' });
  assert.equal(link().status, 409);
  assert.equal(booking.finalLink, null);
  db.jobs.at(-1).status = 'done';
  assert.equal(detail().finalLinkBlockedReason, null);
  assert.equal(link('http://example.com/photos').status, 400);
  assert.equal(link().status, 200);
  assert.equal(booking.status, 'booked');
  assert.equal(db.conversations.find(({ id }) => id === booking.conversationId).status, 'scheduled');
});

test('R05: cancellation stops queued reminders and preserves sent, other bookings, jobs and money', () => {
  const db = fresh();
  const b = getBooking(db, 'GS-1021');
  const queued = reminderFixture(b);
  const sent = { ...queued, id: 'sent-history', emailStatus: 'sent' };
  const other = { ...queued, id: 'other-booking', bookingCode: 'GS-1022' };
  db.reminders.push(queued, sent, other);
  db.payments.push({ id: 'paid-history', bookingCode: b.code, amount: b.deposit, status: 'succeeded' });
  const before = structuredClone(db);
  assert.equal(call(db, 'POST', '/api/bookings/:code/cancel', { reason: '' }, { code: b.code }).status, 400);
  assert.deepEqual(db, before);
  assert.equal(cancel(db, b.code).status, 200);
  assert.equal(db.reminders.some(r=>r.bookingCode===b.code&&r.emailStatus==='queued'),false);
  assert.deepEqual(db.reminders, before.reminders.slice(1));
  assert.deepEqual(db.jobs, before.jobs);
  assert.deepEqual(db.payments, before.payments);
  assert.equal(b.paymentStatus, before.bookings.find(({ code }) => code === b.code).paymentStatus);
});
test('R06 integrated: Staff cannot PATCH a cancelled booking job', () => {
  const db=fresh();cancel(db,'GS-1021');const before=structuredClone(db);
  assert.equal(call(db,'GET','/api/jobs/:id',{}, {id:'J-GS-1021-makeup'},'u-mai').status,200);
  assert.equal(call(db,'PATCH','/api/jobs/:id',{status:'done',note:'Không được ghi'}, {id:'J-GS-1021-makeup'},'u-mai').status,409);assert.deepEqual(db,before);
});
test('R06 integrated: Staff cannot upload after cancellation', () => {
  const db=fresh();cancel(db,'GS-1021');const before=structuredClone(db);
  const rawBody=Buffer.from('--test\r\nContent-Disposition: form-data; name="file"; filename="x.png"\r\nContent-Type: image/png\r\n\r\nx\r\n--test--\r\n');
  assert.equal(call(db,'POST','/api/bookings/:code/previews',{}, {code:'GS-1021'},'u-ha',{headers:{'content-type':'multipart/form-data; boundary=test'},rawBody}).status,409);assert.deepEqual(db,before);
});

async function startMock(mode) {
  const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
  const child=spawn(process.execPath,['mock/server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),MOCK_MODE:mode},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const ready=new Promise((resolve,reject)=>{let log='';child.stdout.on('data',chunk=>{log+=chunk;if(log.includes('Loaded '))resolve();});child.on('error',reject);child.on('exit',code=>reject(Error('Mock exited '+code)));});
  await ready;
  return {base:`http://127.0.0.1:${port}`,stop:async()=>{child.kill();await once(child,'exit');}};
}

async function request(server, method, path, body, user = 'u-linh') {
  const before = Date.now();
  const response = await fetch(server.base + path, {
    method,
    headers: { 'content-type': 'application/json', Authorization: 'Bearer token-' + user },
    body: body && JSON.stringify(body),
  });
  return { status: response.status, body: await response.json(), elapsed: Date.now() - before };
}

function expectHttp(server) {
  return async (method, path, body, user, expected = 200) => {
    const result = await request(server, method, path, body, user);
    assert.equal(result.status, expected, method + ' ' + path + ': ' + JSON.stringify(result.body));
    return result.body;
  };
}

async function createLinhBooking(send, schedule, editorId, beforeCreate = async () => {}) {
  const { proposal } = await send('POST', '/api/conversations/c-linh/proposals', schedule, 'u-thao', 201);
  await send('PATCH', '/api/conversations/c-linh/proposals/' + proposal.id, { decision: 'accepted' }, 'u-linh');
  const body = { conversationId: 'c-linh', proposalId: proposal.id, shootType: 'Tốt nghiệp cá nhân',
    packageId: 'pkg-tn-premium', extraIds: ['ex-makeup'], editorId };
  await beforeCreate(body);
  return (await send('POST', '/api/bookings', body, 'u-thao', 201)).booking;
}

test('HTTP B4.4: Superadmin settings govern all four Admin scheduling routes; deposits only recheck resources', async (t) => {
  const server = await startMock('normal');
  t.after(() => server.stop());
  const send = expectHttp(server);
  const { settings: initial } = await send('GET', '/api/settings', null, 'u-superadmin');
  const setHours = (weekday, weekend) => send('PUT', '/api/settings', {
    ...initial, openingHours: { weekday, weekend },
  }, 'u-superadmin');
  const weekday = { open: '10:00', close: '18:00' };
  const weekend = { open: '08:00', close: '16:00' };
  await setHours(weekday, weekend);
  const invalidWeekday = { date: '2026-10-26', items: [{ ...input().items[1], start: '09:00', end: '10:00' }] };
  for (const [method, route] of [
    ['POST', '/api/availability/check'],
    ['POST', '/api/conversations/c-linh/proposals'],
    ['PATCH', '/api/bookings/GS-1023'],
  ]) {
    const { error } = await send(method, route, invalidWeekday, 'u-thao', 400);
    assert.match(error.fields['items.0.start'], /10:00–18:00/);
  }

  const saturday = input('2026-10-24');
  const adjacent = { date: saturday.date, items: [
    { ...saturday.items[1], start: '13:00', end: '14:00' }, saturday.items[1],
  ] };
  assert.equal((await send('POST', '/api/availability/check', adjacent, 'u-thao')).available, true);
  const booking = await createLinhBooking(send, saturday, 'u-tuan', async (body) => {
    await setHours(weekday, { ...weekend, close: '15:00' });
    const { error } = await send('POST', '/api/bookings', body, 'u-thao', 400);
    assert.match(error.fields['items.1.end'], /08:00–15:00/);
    await setHours(weekday, weekend);
  });
  assert.equal(booking.code, 'GS-1024');
  assert.equal(booking.date, saturday.date);
  const path = '/api/bookings/' + booking.code;
  await setHours(weekday, { ...weekend, close: '15:00' });
  assert.deepEqual((await send('GET', path, null, 'u-linh')).booking, booking);
  const deposit = await send('POST', path + '/payments', { kind: 'deposit' }, 'u-linh', 201);
  await send('POST', '/api/test-gateway/' + deposit.payment.id, { result: 'success' }, 'u-linh');
  assert.deepEqual((await send('GET', path, null, 'u-linh')).booking,
    { ...booking, status: 'booked', paymentStatus: 'deposit_paid' });
  const editPath = '/api/jobs/J-' + booking.code + '-edit';
  assert.equal((await send('GET', editPath, null, 'u-tuan')).job.staff.id, 'u-tuan');
  await send('PATCH', editPath, { status: 'done' }, 'u-mai', 404);
});

test('HTTP B4.1: a real paid deposit clash leaves the booking unreserved and rejects another clashing time', async (t) => {
  const server = await startMock('normal');
  t.after(() => server.stop());
  const send = expectHttp(server);
  const schedule = input('2026-10-24');
  const hanPath = '/api/bookings/GS-1023';
  await send('PATCH', hanPath, schedule, 'u-thao');
  const { code } = await createLinhBooking(send, schedule, 'u-ha');
  const path = '/api/bookings/' + code;
  const han = await send('POST', hanPath + '/payments', { kind: 'deposit' }, 'u-han', 201);
  await send('POST', '/api/test-gateway/' + han.payment.id, { result: 'success' }, 'u-han');
  const linh = await send('POST', path + '/payments', { kind: 'deposit' }, 'u-linh', 201);
  await send('POST', '/api/test-gateway/' + linh.payment.id, { result: 'success' }, 'u-linh');

  const paymentPath = '/api/payments/' + linh.payment.id;
  const paid = await send('GET', paymentPath, null, 'u-linh');
  assert.equal(paid.payment.status, 'succeeded');
  assert.equal(paid.booking.status, 'awaiting_deposit');
  assert.equal(paid.booking.paymentStatus, 'deposit_paid');
  assert.ok(paid.payment.reservationFailure.clashes.length);
  const before = await send('GET', path, null, 'u-thao');
  assert.equal(before.adminActions.editor.id, 'u-ha');
  assert.equal(before.booking.deposit, paid.payment.amount);
  assert.equal((await send('PATCH', path, schedule, 'u-thao', 409)).error.code, 'CLASH');
  await send('PATCH', path, input('2026-02-30'), 'u-thao', 400);
  assert.deepEqual(await send('GET', path, null, 'u-thao'), before);
  assert.deepEqual(await send('GET', paymentPath, null, 'u-linh'), paid);
  assert.ok(!(await send('GET', '/api/reminders', null, 'u-linh')).reminders.some((reminder) => reminder.bookingCode === code));
  for (const [kind, staff] of [['makeup', 'u-mai'], ['shoot', 'u-tuan'], ['edit', 'u-tuan'], ['edit', 'u-ha']]) {
    await send('GET', '/api/jobs/J-' + code + '-' + kind, null, staff, 404);
  }
  await send('POST', path + '/payments', { kind: 'deposit' }, 'u-linh', 409);
});

test('HTTP: rescheduling and cancelling preserve reminder history on the real mock', async () => {
  const server = await startMock('normal');
  const code = 'GS-1023';
  const bookingPath = '/api/bookings/' + code;
  const send = expectHttp(server);
  const readReminders = async () => (await send('GET', '/api/reminders', null, 'u-han')).reminders;
  try {
    const before = await readReminders();
    const moved = await send('PATCH', bookingPath, input(), 'u-thao');
    assert.equal(moved.booking.status, 'awaiting_deposit');
    assert.deepEqual(await readReminders(), before);

    const started = await send('POST', bookingPath + '/payments', { kind: 'deposit' }, 'u-han', 201);
    const paymentPath = '/api/payments/' + started.payment.id;
    const pendingMove = await send('PATCH', bookingPath, input('2026-10-27'), 'u-thao', 409);
    const pendingCancel = await send('POST', bookingPath + '/cancel', { reason: 'Khách đổi kế hoạch' }, 'u-thao', 409);
    assert.match(pendingMove.error.message, /Khách đang thanh toán/);
    assert.deepEqual(pendingCancel.error, pendingMove.error);
    assert.deepEqual(await send('GET', bookingPath, null, 'u-han'), moved);
    await send('POST', '/api/test-gateway/' + started.payment.id, { result: 'success' }, 'u-han');
    const paid = await send('GET', paymentPath, null, 'u-han');
    const sent = (await readReminders()).find((entry) => entry.bookingCode === code);
    assert.equal(sent.emailStatus, 'sent');

    const schedule = input('2026-10-27');
    const rescheduled = await send('PATCH', bookingPath, schedule, 'u-thao');
    assert.equal(rescheduled.booking.date, schedule.date);
    assert.equal(rescheduled.booking.paymentStatus, 'deposit_paid');
    const reminders = await readReminders();
    assert.deepEqual(reminders.find(({ id }) => id === sent.id), sent);
    const queued = reminders.find((entry) => entry.bookingCode === code && entry.emailStatus === 'queued');
    assert.equal(queued.sendAt, '2026-10-26T13:00:00+07:00');
    assert.match(queued.text, /13:00.*27\/10\/2026.*Mai/);

    await send('PATCH', bookingPath, schedule, 'u-thao');
    await send('PATCH', bookingPath, input('2026-02-30'), 'u-thao', 400);
    const clash = input('2026-10-24');
    clash.items[0].start = '09:00';
    clash.items[0].end = '10:00';
    assert.equal((await send('PATCH', bookingPath, clash, 'u-thao', 409)).error.code, 'CLASH');
    assert.deepEqual(await readReminders(), reminders);
    assert.deepEqual(await send('GET', bookingPath, null, 'u-han'), rescheduled);
    assert.deepEqual(await send('GET', paymentPath, null, 'u-han'), paid);

    const cancelled = await send('POST', bookingPath + '/cancel', { reason: 'Khách đổi kế hoạch' }, 'u-thao');
    assert.deepEqual(cancelled.booking, { ...rescheduled.booking, status: 'cancelled' });
    assert.deepEqual(await readReminders(), reminders.filter(({ id }) => id !== queued.id));
    assert.deepEqual(await send('GET', paymentPath, null, 'u-han'), {
      ...paid, booking: { ...paid.booking, status: 'cancelled' },
    });
    assert.equal((await send('GET', '/api/conversations/c-han', null, 'u-han')).conversation.status, 'scheduled');
  } finally {
    await server.stop();
  }
});

for(const mode of ['normal','slow','error','empty']) test(`HTTP ${mode}: fresh real server, role enforcement, new conversation and list`, async()=>{
  const server=await startMock(mode);
  try {
    const req = (method, path, body, user) => request(server, method, path, body, user);
    const created=await req('POST','/api/conversations',{text:'HTTP conversation',request:requestInput},'u-han');
    if(mode==='error'){assert.equal(created.status,500);assert.equal(created.body.error.code,'SERVER_ERROR');return;}
    assert.equal(created.status,201);assert.equal(created.body.conversation.id,'c-1');
    if(mode==='slow')assert.ok(created.elapsed>=1900);
    if(mode==='empty')assert.deepEqual(created.body.conversation.messages,[]);
    else assert.equal(created.body.conversation.messages[0].text,'HTTP conversation');
    const list=await req('GET','/api/conversations',null,'u-han');assert.equal(list.status,200);
    if(mode==='empty')assert.deepEqual(list.body.conversations,[]);else assert.ok(list.body.conversations.some(c=>c.id==='c-1'));
    if(mode==='normal'){
      assert.equal((await req('POST','/api/conversations',{text:'Admin không tạo hội thoại'},'u-thao')).status,403);
      assert.equal((await req('POST','/api/bookings/GS-1021/cancel',{reason:'Không có quyền'})).status,403);
      assert.equal((await req('PATCH','/api/bookings/GS-1023',input())).status,403);
      assert.equal((await req('POST','/api/conversations/c-1/messages',{text:'Trả lời'},'u-thao')).status,201);
      assert.equal((await req('GET','/api/conversations/c-1',null,'u-han')).body.conversation.status,'consulting');
      assert.equal((await req('GET','/api/conversations/c-1')).status,404);
      assert.equal((await req('POST','/api/conversations',{text:'Nối đúng hội thoại'},'u-han')).body.conversation.id,'c-1');
      assert.equal((await req('POST','/api/conversations/c-han/messages',{text:'Hỏi booking cũ'},'u-han')).body.conversation.id,'c-han');
      assert.equal((await req('PATCH','/api/bookings/GS-1023',input(),'u-thao')).status,200);
      assert.equal((await req('POST','/api/bookings/GS-1021/cancel',{reason:'Hủy có việc'},'u-thao')).status,200);
      assert.equal((await req('POST','/api/bookings/GS-1021/cancel',{reason:'Hủy lần nữa'},'u-thao')).status,409);
    }
  } finally {await server.stop();}
});
