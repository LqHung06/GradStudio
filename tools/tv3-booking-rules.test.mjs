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
import { checkClash } from '../mock/lib/clash.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const seeds = new URL('../mock/data/', import.meta.url);
function fresh() {
  return Object.fromEntries(fs.readdirSync(seeds).filter(f => f.endsWith('.json'))
    .map(f => [f.slice(0, -5), JSON.parse(fs.readFileSync(new URL(f, seeds), 'utf8'))]));
}
const routes = [...conversations, ...bookings, ...admin, ...jobs];
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
  conversationId:'c-linh',proposalId:proposal.id,shootType:'Tốt nghiệp cá nhân',packageId:'pkg-tn-premium',extraIds:['ex-makeup'],...extra,
});

test('R03: direct date/items, no customer action; unpaid gets no jobs/reminders', () => {
  const db=fresh(), before=structuredClone(db), b=getBooking(db,'GS-1023');
  const result=patch(db,b.code,input());
  assert.equal(result.status,200);
  const expected={...before.bookings.find(x=>x.code===b.code),date:input().date,items:b.items};
  assert.deepEqual(b,expected);
  assert.deepEqual(db.jobs,before.jobs); assert.deepEqual(db.reminders,before.reminders); assert.deepEqual(db.payments,before.payments);
});
test('R03: same booking does not clash with itself; staff/room/jobs follow new schedule and edit nulls', () => {
  const db=fresh(), b=getBooking(db,'GS-1022'), before=structuredClone(b);
  const oldJobs=structuredClone(db.jobs.filter(j=>j.bookingCode===b.code));
  assert.equal(patch(db,b.code,scheduleInput(b)).status,200);
  const body={date:'2026-10-26',items:[{kind:'shoot',start:'09:00',end:'10:30',staffId:'u-ha',roomId:'r-a'}]};
  assert.equal(patch(db,b.code,body).status,200);
  assert.deepEqual({...b,date:before.date,items:before.items},before);
  for(const old of oldJobs){const current=db.jobs.find(j=>j.id===old.id);assert.equal(current.status,old.status);assert.equal(current.note,old.note);assert.equal(current.staff.id,'u-ha');
    if(current.kind==='edit') for(const key of ['date','start','end','room']) assert.equal(current[key],null);
    else {assert.equal(current.date,body.date);assert.equal(current.start,'09:00');assert.equal(current.room.id,'r-a');}}
});
test('R03: clash returns complete details and preserves the entire db', () => {
  const db=fresh(), body=input('2026-10-24');
  db.reminders.push({id:'atomic-reminder',bookingCode:'GS-1023',emailStatus:'queued',sendAt:'2026-10-23T09:00:00+07:00'});
  db.payments.push({id:'atomic-payment',bookingCode:'GS-1023',status:'pending',amount:540000});
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
test('R07: fresh accepted replacement, new code and unpaid state, old money/history intact', () => {
  const db=fresh(), p=propose(db);assert.equal(accept(db,p).status,200);
  const first=create(db,p);assert.equal(first.status,201);assert.equal(first.body.booking.code,'GS-1024');
  const old=first.body.booking;old.status='booked';old.paymentStatus='deposit_paid';
  db.payments.push({id:'test-paid',bookingCode:old.code,kind:'deposit',amount:old.deposit,status:'succeeded',failureReason:null,createdAt:old.createdAt});
  const stale=propose(db);assert.equal(accept(db,stale).status,200);
  assert.equal(create(db,stale).status,409);assert.equal(cancel(db,old.code).status,200);
  const cancelled=structuredClone(old),money=structuredClone(db.payments);
  assert.equal(create(db,p).status,409);assert.equal(create(db,stale).status,409);
  const next=propose(db);assert.equal(create(db,next).status,409);assert.equal(accept(db,next).status,200);
  const replacement=create(db,next);assert.equal(replacement.status,201);const b=replacement.body.booking;
  assert.equal(b.code,'GS-1025');assert.equal(b.status,'awaiting_deposit');assert.equal(b.paymentStatus,'unpaid');
  assert.equal(db.conversations.find(c=>c.id==='c-linh').bookingCode,b.code);
  assert.deepEqual(old,cancelled);assert.deepEqual(db.payments,money);
  const list=call(db,'GET','/api/bookings',{}, {},'u-linh').body.bookings;
  assert.deepEqual(list.map(x=>x.code),['GS-1024','GS-1025']);
  for(const code of [old.code,b.code]){assert.equal(call(db,'GET','/api/bookings/:code',{}, {code},'u-linh').status,200);assert.equal(call(db,'GET','/api/bookings/:code',{}, {code},'u-han').status,404);}
  assert.equal(create(db,next).status,409);
});
test('R07: cross-conversation proposal is refused without mutation', () => {
  const db=fresh(),p=propose(db,'c-han');accept(db,p,'c-han','u-han');const before=structuredClone(db);
  assert.equal(create(db,p).status,409);assert.deepEqual(db,before);
});
test('R15: new IDs, ownership, timestamps, first reply, no single-thread restriction', () => {
  const db=fresh();for(const text of ['', '   ', 'x'.repeat(1001)]){const before=structuredClone(db);assert.equal(call(db,'POST','/api/conversations',{text},{},'u-linh').status,400);assert.deepEqual(db,before);}
  const first=call(db,'POST','/api/conversations',{text:'Xin tư vấn',customer:{id:'u-han'}},{},'u-linh');assert.equal(first.status,201);
  const c=first.body.conversation;assert.equal(c.id,'c-1');assert.equal(c.customer.id,'u-linh');assert.equal(c.status,'unanswered');assert.equal(c.bookingCode,null);assert.equal(c.acceptedProposalId,null);
  assert.equal(c.updatedAt,c.messages[0].at);assert.deepEqual(c.lastMessage,{text:c.messages[0].text,at:c.messages[0].at});
  assert.equal(call(db,'GET','/api/conversations/:id',{}, {id:c.id},'u-han').status,404);
  assert.equal(call(db,'POST','/api/conversations/:id/messages',{text:'Xin chào'}, {id:c.id},'u-han').status,404);
  assert.equal(call(db,'POST','/api/conversations/:id/messages',{text:'Studio trả lời'}, {id:c.id}).status,201);assert.equal(c.status,'consulting');
  db.conversations.push({...structuredClone(c),id:'c-9'});
  assert.equal(call(db,'POST','/api/conversations',{text:'x'.repeat(1000)},{},'u-linh').body.conversation.id,'c-10');
});
test('R3 price: package only, extras add no money, client amounts ignored; one-VND rounding', () => {
  const db=fresh();db.packages.find(p=>p.id==='pkg-tn-premium').price=1800005;
  const p=propose(db);accept(db,p);const b=create(db,p,{price:1,deposit:1,remaining:1,extraIds:db.extras.map(e=>e.id)}).body.booking;
  assert.equal(b.price,1800005);assert.equal(b.deposit,540002);assert.equal(b.remaining,1260003);
});

const reminderFixture = b => ({id:'test-reminder',bookingCode:b.code,sendAt:'2026-10-19T09:00:00+07:00',channels:['email','account'],emailStatus:'queued',text:'Lịch cũ'});
test('R04: queued reminder follows new earliest time/staff/room', () => {
  const db=fresh(),b=getBooking(db,'GS-1022');db.reminders.push(reminderFixture(b));
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

test('R04: paid deposit without a reservation still creates no reminder', () => {
  const db = fresh();
  const booking = getBooking(db, 'GS-1023');
  booking.paymentStatus = 'deposit_paid';
  const before = structuredClone(db);
  assert.equal(patch(db, booking.code, input()).status, 200);
  assert.equal(booking.status, 'awaiting_deposit');
  assert.equal(booking.paymentStatus, 'deposit_paid');
  assert.deepEqual(db.reminders, before.reminders);
  assert.deepEqual(db.jobs, before.jobs);
  assert.deepEqual(db.payments, before.payments);
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

test('HTTP: rescheduling and cancelling preserve reminder history on the real mock', async () => {
  const server = await startMock('normal');
  const code = 'GS-1023';
  const bookingPath = '/api/bookings/' + code;
  const send = async (method, path, body, user, expected = 200) => {
    const result = await request(server, method, path, body, user);
    assert.equal(result.status, expected, method + ' ' + path + ': ' + JSON.stringify(result.body));
    return result.body;
  };
  const readReminders = async () => (await send('GET', '/api/reminders', null, 'u-han')).reminders;
  try {
    const before = await readReminders();
    const moved = await send('PATCH', bookingPath, input(), 'u-thao');
    assert.equal(moved.booking.status, 'awaiting_deposit');
    assert.deepEqual(await readReminders(), before);

    const started = await send('POST', bookingPath + '/payments', { kind: 'deposit' }, 'u-han', 201);
    const paymentPath = '/api/payments/' + started.payment.id;
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
    const created=await req('POST','/api/conversations',{text:'HTTP conversation'});
    if(mode==='error'){assert.equal(created.status,500);assert.equal(created.body.error.code,'SERVER_ERROR');return;}
    assert.equal(created.status,201);assert.equal(created.body.conversation.id,'c-1');
    if(mode==='slow')assert.ok(created.elapsed>=1900);
    if(mode==='empty')assert.deepEqual(created.body.conversation.messages,[]);
    else assert.equal(created.body.conversation.messages[0].text,'HTTP conversation');
    const list=await req('GET','/api/conversations');assert.equal(list.status,200);
    if(mode==='empty')assert.deepEqual(list.body.conversations,[]);else assert.ok(list.body.conversations.some(c=>c.id==='c-1'));
    if(mode==='normal'){
      assert.equal((await req('POST','/api/conversations',{text:'Admin không tạo hội thoại'},'u-thao')).status,403);
      assert.equal((await req('POST','/api/bookings/GS-1021/cancel',{reason:'Không có quyền'})).status,403);
      assert.equal((await req('PATCH','/api/bookings/GS-1023',input())).status,403);
      assert.equal((await req('POST','/api/conversations/c-1/messages',{text:'Trả lời'},'u-thao')).status,201);
      assert.equal((await req('GET','/api/conversations/c-1')).body.conversation.status,'consulting');
      assert.equal((await req('GET','/api/conversations/c-1',null,'u-han')).status,404);
      assert.equal((await req('PATCH','/api/bookings/GS-1023',input(),'u-thao')).status,200);
      assert.equal((await req('POST','/api/bookings/GS-1021/cancel',{reason:'Hủy có việc'},'u-thao')).status,200);
      assert.equal((await req('POST','/api/bookings/GS-1021/cancel',{reason:'Hủy lần nữa'},'u-thao')).status,409);
    }
  } finally {await server.stop();}
});
