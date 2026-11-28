/**
 * Run from the repo root after npm run build in client:
 *   node tools/tv3-admin-build-check.mjs
 * Node 22, Chrome (CHROME_PATH overrides Windows default), ports 3001 and 4179.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const origin = 'http://127.0.0.1:4179';
const mockOrigin = 'http://localhost:3001';
const profile = await mkdtemp(join(tmpdir(), 'gradstudio-admin-check-'));
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const children = new Set();
const requests = [];
const errors = [];
const allowed = [
  /^(GET|POST) \/api\/auth\/(login|logout|me)$/,
  /^GET \/api\/(conversations(\/[^/]+)?|bookings|resources|schedule|services|packages|extras)$/,
  /^POST \/api\/(conversations(\/[^/]+\/(messages|proposals))?|availability\/check|bookings)$/,
  /^PATCH \/api\/conversations\/[^/]+\/proposals\/[^/]+$/,
  /^POST \/api\/bookings\/GS-\d+\/cancel$/,
  /^(GET|PATCH) \/api\/bookings\/GS-\d+$/,
  /^PUT \/api\/bookings\/GS-\d+\/(final-link|selection)$/,
  /^POST \/api\/bookings\/GS-\d+\/(payments|previews|receive)$/,
  /^GET \/api\/(jobs|reminders|bookings\/GS-\d+\/photos)$/,
  /^POST \/api\/test-gateway\/PAY-\d+$/,
  /^(GET|PATCH) \/api\/jobs\/J-GS-\d+-(shoot|edit)$/,
];

function start(command, args, options = {}) {
  const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], ...options });
  children.add(child);
  child.on('error', (error) => console.error(error.message));
  child.stderr.on('data', (data) => process.stderr.write(data));
  return child;
}

async function stop(child) {
  if (child.pid && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
  children.delete(child);
}

async function waitFor(check, label) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = await check();
    if (result) return result;
    await sleep(80);
  }
  throw new Error('Timed out: ' + label);
}

async function readUrl(url) {
  return fetch(url).catch(() => null);
}

let mock;
async function mode(name) {
  if (mock) await stop(mock);
  mock = start(process.execPath, ['mock/server.mjs'], {
    env: { ...process.env, PORT: '3001', MOCK_MODE: name },
  });
  await new Promise((resolve, reject) => {
    let output = '';
    mock.stdout.on('data', (data) => {
      output += String(data);
      if (output.includes('Mock server listening')) resolve();
    });
    mock.once('exit', (code) => reject(new Error('Mock exited: ' + code)));
    mock.once('error', reject);
  });
}

async function api(method, path, token, body, status) {
  const response = await fetch(origin + path, {
    method,
    headers: {
      ...(token && { Authorization: 'Bearer ' + token }),
      ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
    },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  });
  requests.push(method + ' ' + path.split('?')[0]);
  assert.equal(response.status, status, method + ' ' + path);
  return response.json();
}

const credentials = (name) => ({ email: name + '@gradstudio.test', password: name + '-demo' });
let ws;
try {
  assert.equal(await readUrl(mockOrigin), null, 'Port 3001 must be free');
  assert.equal(await readUrl(origin), null, 'Port 4179 must be free');
  await mode('normal');
  start(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1',
    '--port', '4179', '--strictPort'], { cwd: 'client' });
  await waitFor(() => readUrl(origin), 'Vite preview');
  start(chromePath, ['--headless', '--disable-gpu', '--disable-background-networking',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank']);
  const port = await waitFor(async () => {
    const raw = await readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
    return raw.split('\n')[0];
  }, 'Chrome debugging port');
  const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  ws = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let sequence = 0;
  const pending = new Map();
  ws.onmessage = ({ data }) => {
    const { id, result, error, method, params } = JSON.parse(data);
    if (id) {
      const { resolve, reject } = pending.get(id);
      pending.delete(id);
      if (error) reject(new Error(error.message));
      else resolve(result);
    } else if (method === 'Runtime.exceptionThrown') {
      errors.push(params.exceptionDetails.exception?.description || params.exceptionDetails.text);
    } else if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
      errors.push(params.args.map((arg) => arg.value || arg.description).join(' '));
    } else if (method === 'Network.requestWillBeSent') {
      const url = new URL(params.request.url);
      if (url.pathname.startsWith('/api/')) requests.push(params.request.method + ' ' + url.pathname);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.addEventListener('close', () => {
    for (const { reject } of pending.values()) reject(new Error('Chrome disconnected from the harness'));
    pending.clear();
  });
  const run = async (fn, ...args) => {
    const result = await send('Runtime.evaluate', {
      expression: '(' + fn.toString() + ')(...' + JSON.stringify(args) + ')',
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception.description);
    return result.result.value;
  };
  const see = (phrase) => waitFor(() => run((text) => document.body.innerText.includes(text), phrase), phrase);
  const navigate = (path) => send('Page.navigate', { url: origin + path });
  const click = (label) => waitFor(() => run((text) => {
    const item = [...document.querySelectorAll('button'), ...document.querySelectorAll('a')]
      .find((el) => el.textContent.trim() === text);
    if (!item || item.disabled) return false;
    item.click();
    return true;
  }, label), 'control ' + label);
  const fill = (name, value) => waitFor(() => run((id, text) => {
    const el = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
    if (!el) return false;
    const prototype = Object.getPrototypeOf(el);
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(el, text);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    return true;
  }, name, value), 'field ' + name);
  const buttonDisabled = () => run(() => {
    const button = [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === 'Tạo booking');
    return button?.disabled;
  });
  const login = async (name) => {
    const { email, password } = credentials(name);
    await see('Đăng nhập bằng tài khoản GradStudio');
    await fill('email', email);
    await fill('password', password);
    await click('Đăng nhập');
  };
  async function switchRole(path, name) {
    await click('Đăng xuất');
    await waitFor(() => run(() => !localStorage.getItem('gradstudio_token')), 'sign-out');
    await navigate(path);
    await login(name);
    await waitFor(() => run((expected) => location.pathname === expected, path), 'role route ' + path);
  }

  // Supply field errors on an otherwise valid form. Only these isolated requests
  // are intercepted, so the actual role flow and successful writes use the mock.
  async function checkFieldErrors(path, button, fields, verb = 'POST') {
    const before = await run((names) => names.map((name) => {
      const el = document.getElementById(name) || document.querySelector('[name="' + name + '"]');
      return el.value ?? [...el.querySelectorAll(':checked')].map((input) => input.parentElement.textContent);
    }), Object.keys(fields));
    let handled = false;
    let interceptionError;
    const onPause = async ({ data }) => {
      const { method, params } = JSON.parse(data);
      if (method !== 'Fetch.requestPaused') return;
      try {
        if (params.request.method !== verb || handled) {
          await send('Fetch.continueRequest', { requestId: params.requestId });
          return;
        }
        handled = true;
        const error = { code: 'VALIDATION', message: 'Dữ liệu chưa hợp lệ', fields, details: null };
        await send('Fetch.fulfillRequest', {
          requestId: params.requestId, responseCode: 400,
          responseHeaders: [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }],
          body: Buffer.from(JSON.stringify({ error })).toString('base64'),
        });
      } catch (error) {
        interceptionError = error;
      }
    };
    ws.addEventListener('message', onPause);
    try {
      await send('Fetch.enable', { patterns: [{ urlPattern: origin + path }] });
      await click(button);
      for (const message of Object.values(fields)) await see(message);
      assert.ifError(interceptionError);
      assert.equal(handled, true);
      const state = await run((expected) => Object.entries(expected).map(([name, message]) => {
        const el = document.getElementById(name) || document.querySelector('[name="' + name + '"]');
        const ids = el.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
        return {
          invalid: el.getAttribute('aria-invalid'),
          linked: ids.some((id) => document.getElementById(id)?.textContent === message),
          focused: el === document.activeElement,
          value: el.value ?? [...el.querySelectorAll(':checked')].map((input) => input.parentElement.textContent),
        };
      }), fields);
      assert.deepEqual(state, before.map((value, index) => ({
        invalid: 'true', linked: true, focused: index === 0, value,
      })));
    } finally {
      ws.removeEventListener('message', onPause);
      await send('Fetch.disable');
    }
  }
  const detail = '/admin/conversations/c-linh';
  const list = '/admin/conversations';
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const bookingList = '/admin/bookings';
  const firstDetail = bookingList + '/GS-1024';
  const firstApi = '/api/bookings/GS-1024';
  await navigate(firstDetail);
  await login('thao');
  await see('Không tìm thấy booking GS-1024');
  assert.equal(await run(() => location.pathname), firstDetail);
  for (const [path, content] of [
    [bookingList, 'Xem chi tiết GS-1023'],
    [bookingList + '/GS-1023', 'Lê Ngọc Hân'],
    [detail, 'Kiểm tra và đề xuất giờ'],
    [list, 'Trần Minh Khoa'],
  ]) {
    await navigate(path);
    await see(content);
    assert.equal(await run(() => location.pathname), path);
    const beforeReload = await run(() => performance.timeOrigin);
    await send('Page.reload');
    await waitFor(() => run((previous) => performance.timeOrigin !== previous, beforeReload), 'reload ' + path);
    await see(content);
    assert.equal(await run(() => location.pathname), path);
    console.log('PASS direct/F5 as thao:', path);
  }
  const filter = await run(() => [...document.querySelectorAll('button')].find(
    (button) => button.textContent.startsWith('Chưa trả lời'),
  ).textContent.trim());
  await click(filter);
  await see('Trần Minh Khoa');
  assert.equal(await run(() => document.querySelector('.admin-actions [aria-pressed=true]').textContent.trim()), filter);
  const idleCount = requests.length;
  await sleep(700);
  assert.equal(requests.length, idleCount, 'Unexpected requests while idle');
  console.log('PASS UI: direct/F5, returning from sign-in, filters and idle requests');

  await navigate(detail);
  await see('Kiểm tra và đề xuất giờ');
  await see('Tạo booking');
  await see('Chọn gói chụp');
  await see('Dịch vụ thêm');
  const waitForForms = () => waitFor(() => run(() => Boolean(document.getElementById('date'))
    && !document.querySelector('.async-loading')), 'detail requests settle');
  await waitForForms();
  await measureExtras('.admin-extras label', true);
  await checkWidths(detail);
  assert.equal(await buttonDisabled(), true);
  await fill('text', 'Tin nhắn kiểm tra Admin');
  await checkFieldErrors('/api/conversations/c-linh/messages', 'Gửi', { text: 'Kiểm tra 400: Tin nhắn' });
  await mode('error');
  await click('Gửi');
  await see('Máy chủ đang gặp sự cố');
  assert.equal(await run(() => document.querySelector('textarea[name=text]').value), 'Tin nhắn kiểm tra Admin');
  await mode('slow');
  const before = requests.filter((request) => request.endsWith('/messages')).length;
  await run(() => {
    const form = document.querySelector('.gs-chat form');
    const submit = form.querySelector('button');
    submit.click();
    submit.click();
  });
  await see('Đang gửi tin nhắn');
  await see('Tin nhắn kiểm tra Admin');
  assert.equal(requests.filter((request) => request.endsWith('/messages')).length, before + 1);
  assert.equal(await run(() => document.querySelector('textarea[name=text]').value), '');
  await mode('normal');
  console.log('PASS UI: send success, error preserves draft, slow request blocks duplicate send');

  await fill('date', '2026-10-24');
  await fill('items', '2');
  await fill('items.0.kind', 'makeup');
  await fill('items.0.start', '09:00');
  await fill('items.0.end', '10:00');
  await fill('items.0.staffId', 'u-mai');
  await fill('items.1.start', '10:00');
  await fill('items.1.end', '12:00');
  await fill('items.1.staffId', 'u-tuan');
  await fill('items.1.roomId', 'r-b');
  await see('GS-1021');
  await checkWidths(detail);
  await fill('note', 'Ghi chú nghiệm thu');
  const proposalFields = { date: 'Kiểm tra 400: Ngày', items: 'Kiểm tra 400: Số ca' };
  for (const index of [0, 1]) {
    for (const name of ['kind', 'start', 'end', 'staffId', 'roomId']) {
      proposalFields['items.' + index + '.' + name] = 'Kiểm tra 400: ca ' + index + ' ' + name;
    }
  }
  proposalFields.note = 'Kiểm tra 400: Ghi chú';
  await checkFieldErrors('/api/conversations/c-linh/proposals', 'Đề xuất giờ này cho khách', proposalFields);
  await click('Kiểm tra trùng lịch');
  await see('Mai bận 08:00–12:00');
  await click('Đề xuất giờ này cho khách');
  await waitFor(() => run(() => !document.querySelector('button[value=propose]').disabled), '409 finished');
  await see('Mai bận 08:00–12:00');
  assert.equal(await run(() => document.getElementById('items.0.start').value), '09:00');
  await click('Dùng giờ này');
  assert.equal(await run(() => document.getElementById('items.0.start').value), '13:00');
  await click('Đề xuất giờ này cho khách');
  await see('Chờ khách trả lời');
  assert.equal(await buttonDisabled(), true);
  console.log('PASS UI: day schedule, availability, 409 CLASH, suggestion and proposal');

  const { token: linh } = await api('POST', '/api/auth/login', null, credentials('linh'), 200);
  const { conversation } = await api('GET', '/api/conversations/c-linh', linh, null, 200);
  const proposalId = conversation.messages.at(-1).proposal.id;
  await switchRole('/chat', 'linh');
  await see('Chat với GradStudio');
  await measureExtras('.extras-fieldset label.checkbox-option', false);
  await click('Đồng ý giờ này');
  await see('Khách đã đồng ý');
  await switchRole(detail, 'thao');
  await see('Khách đã đồng ý');
  await click('Làm mới hội thoại');
  await waitFor(async () => (await buttonDisabled()) === false, 'create enabled after acceptance');
  const { token: thao } = await api('POST', '/api/auth/login', null, credentials('thao'), 200);
  await fill('date', '2026-10-24');
  await fill('items', '2');
  await fill('items.0.kind', 'makeup');
  await fill('items.0.start', '13:00');
  await fill('items.0.end', '14:00');
  await fill('items.0.staffId', 'u-mai');
  await fill('items.1.start', '14:00');
  await fill('items.1.end', '16:00');
  await fill('items.1.staffId', 'u-tuan');
  await fill('items.1.roomId', 'r-b');
  await click('Đề xuất giờ này cho khách');
  await see('Đã bị thay thế');
  assert.equal(await buttonDisabled(), true);
  await api('PATCH', '/api/conversations/c-linh/proposals/' + proposalId, linh, { decision: 'accepted' }, 409);
  await api('POST', '/api/bookings', thao, {
    conversationId: 'c-linh', proposalId, shootType: 'Tốt nghiệp cá nhân',
    packageId: 'pkg-tn-premium', extraIds: [], editorId: 'u-tuan',
  }, 409);
  const latest = (await api('GET', '/api/conversations/c-linh', linh, null, 200)).conversation.messages.at(-1).proposal;
  await api('PATCH', '/api/conversations/c-linh/proposals/' + latest.id, linh, { decision: 'accepted' }, 200);
  await click('Làm mới hội thoại');
  await waitFor(async () => (await buttonDisabled()) === false, 'latest accepted proposal enables booking');
  await fill('shootType', 'Tốt nghiệp cá nhân');
  await fill('packageId', 'pkg-tn-premium');
  await fill('editorId', 'u-tuan');
  await see('540.000đ');
  await waitForForms();
  await run(() => document.querySelector('#extraIds input[type=checkbox]').click());
  await checkFieldErrors('/api/bookings', 'Tạo booking', {
    shootType: 'Kiểm tra 400: Loại chụp', packageId: 'Kiểm tra 400: Gói chụp',
    editorId: 'Kiểm tra 400: Người chỉnh ảnh', extraIds: 'Kiểm tra 400: Dịch vụ thêm',
  });
  console.log('PASS UI: simulated API 400 messages, aria-describedby, focus and preserved form values');
  const beforeBooking = requests.filter((request) => request === 'POST /api/bookings').length;
  await run(() => {
    const submit = [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Tạo booking');
    submit.click();
    submit.click();
  });
  await see('GS-1024');
  assert.equal(requests.filter((request) => request === 'POST /api/bookings').length, beforeBooking + 1);
  await see('Chờ cọc 30%');
  for (const amount of ['1.800.000đ', '540.000đ', '1.260.000đ']) await see(amount);
  assert.equal(await buttonDisabled(), undefined);
  await click('Xem danh sách booking');
  await see('GS-1024');
  await send('Page.reload');
  await see('GS-1024');
  console.log('PASS UI: Customer accepts in chat, Admin signs in again, refreshes and creates once; amounts from API');

  const { token: tuan } = await api('POST', '/api/auth/login', null, credentials('tuan'), 200);
  async function pay(path, kind, token = linh) {
    const { redirectUrl } = await api('POST', path + '/payments', token, { kind }, 201);
    await api('POST', '/api' + redirectUrl, token, { result: 'success' }, 200);
  }
  const upload = () => {
    const body = new FormData();
    body.append('file', new Blob([Uint8Array.of(0xff, 0xd8, 0xff, 0xd9)], { type: 'image/jpeg' }), 'preview.jpg');
    return body;
  };
  const { token: han } = await api('POST', '/api/auth/login', null, credentials('han'), 200);
  const awaiting = (await api('GET', firstApi, thao, null, 200)).booking;
  const occupiedSchedule = { date: awaiting.date, items: awaiting.items.map(({ kind, start, end, staff, room }) => ({
    kind, start, end, staffId: staff.id, roomId: room?.id ?? null,
  })) };
  await api('PATCH', '/api/bookings/GS-1023', thao, occupiedSchedule, 200);
  await pay('/api/bookings/GS-1023', 'deposit', han);
  await pay(firstApi, 'deposit');
  await click('Xem chi tiết GS-1024');
  await see('Áp dụng lịch mới');
  await see('Người chỉnh ảnh đã chọn: Tuấn');
  await see('Studio đã nhận cọc nhưng chưa giữ được chỗ.');
  await send('Page.reload');
  await see('Áp dụng lịch mới');
  await checkWidths(firstDetail);
  const original = (await api('GET', firstApi, thao, null, 200)).booking;
  const remindersForFirst = async () => (await api('GET', '/api/reminders', linh, null, 200)).reminders
    .filter(({ bookingCode }) => bookingCode === 'GS-1024');
  assert.deepEqual(await remindersForFirst(), []);
  await checkFieldErrors(firstApi, 'Áp dụng lịch mới', { 'items.0.staffId': 'Kiểm tra 400: Nhân sự' }, 'PATCH');
  await fill('items.0.start', '09:00');
  await fill('items.0.end', '10:00');
  await click('Áp dụng lịch mới');
  await see('Mai bận 08:00–12:00');
  await see('Dùng giờ này');
  assert.deepEqual((await api('GET', firstApi, thao, null, 200)).booking, original);
  await click('Dùng giờ này');
  await fill('date', '2026-10-26');
  const beforeRecovery = requests.length;
  await click('Áp dụng lịch mới');
  await see('Đã áp dụng lịch mới.');
  await see('Đã đặt lịch');
  assert(!(await run(() => document.querySelector('main').innerText.includes('chưa giữ được chỗ'))));
  assert.deepEqual(requests.slice(beforeRecovery), ['PATCH ' + firstApi]);
  const booked = (await api('GET', firstApi, thao, null, 200)).booking;
  assert.equal(booked.code, original.code);
  assert.equal(booked.status, 'booked');
  assert.equal(booked.paymentStatus, 'deposit_paid');
  const sent = (await remindersForFirst()).find(({ emailStatus }) => emailStatus === 'sent');
  assert(sent);
  console.log('PASS B4.1 UI: real deposit clash, same booking confirmed from PATCH, no reload or new payment');
  await click('Làm mới booking');
  await see('Chờ khách thanh toán đủ trước khi lưu link.');
  await fill('date', '2027-11-01');
  const beforeMove = requests.filter((request) => request === 'PATCH ' + firstApi).length;
  await run(() => {
    const submit = [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === 'Áp dụng lịch mới');
    submit.click();
    submit.click();
  });
  await waitFor(() => run(() => document.querySelector('main time[datetime="2027-11-01"]') !== null),
    'booked schedule updated from PATCH');
  assert.equal(requests.filter((request) => request === 'PATCH ' + firstApi).length, beforeMove + 1);
  const rescheduled = (await api('GET', firstApi, thao, null, 200)).booking;
  assert.equal(rescheduled.date, '2027-11-01');
  assert.equal(rescheduled.paymentStatus, 'deposit_paid');
  const jobPath = '/api/jobs/J-GS-1024-shoot';
  const { job } = await api('GET', jobPath, tuan, null, 200);
  assert.equal(job.date, rescheduled.date);
  assert.equal(job.start, rescheduled.items.find(({ kind }) => kind === 'shoot').start);
  const reminders = await remindersForFirst();
  assert.deepEqual(reminders.find(({ id }) => id === sent.id), sent);
  assert.equal(reminders.find(({ emailStatus }) => emailStatus === 'queued').sendAt,
    '2027-10-31T' + rescheduled.items[0].start + ':00+07:00');
  await click('Hủy booking');
  await click('Xác nhận hủy');
  await see('Nhập lý do từ 5 đến 500 ký tự.');
  await click('Không hủy');
  await click('Hủy booking');
  await fill('reason', 'Khách xin hủy để gửi yêu cầu khác');
  await checkFieldErrors(firstApi + '/cancel', 'Xác nhận hủy', { reason: 'Kiểm tra 400: Lý do' });
  await click('Xác nhận hủy');
  await see('Đã hủy booking.');
  assert.deepEqual((await api('GET', firstApi, thao, null, 200)).booking, { ...rescheduled, status: 'cancelled' });
  assert.deepEqual(await remindersForFirst(), [sent]);
  const day = await api('GET', '/api/schedule?date=' + rescheduled.date, thao, null, 200);
  assert(!day.rows.some(({ busy }) => busy.some(({ bookingCode }) => bookingCode === 'GS-1024')));
  assert.deepEqual((await api('GET', jobPath, tuan, null, 200)).job, job);
  await api('PATCH', jobPath, tuan, { status: 'done' }, 409);
  await api('POST', firstApi + '/previews', tuan, upload(), 409);
  await send('Page.reload');
  await see('Đã hủy');
  assert.equal(await run(() => Boolean(document.getElementById('date'))), false);
  console.log('PASS G10: missing/direct/F5, reschedule 400/409 and success, jobs/reminders, cancel and Staff locks');
  await api('POST', '/api/bookings', thao, {
    conversationId: 'c-linh', proposalId, shootType: 'Tốt nghiệp cá nhân',
    packageId: 'pkg-tn-premium', extraIds: [], editorId: 'u-tuan',
  }, 409);
  await navigate(detail);
  await see('Khách cần gửi yêu cầu mới để đặt lại.');
  assert.equal(await buttonDisabled(), undefined);
  const { conversation: newThread } = await api('POST', '/api/conversations', linh, {
    text: 'Mình muốn đặt lịch mới',
    request: { shootType: 'Tốt nghiệp cá nhân', packageId: 'pkg-tn-premium',
      preferredDate: '2026-10-25', preferredTime: '14:00', extraIds: [] },
  }, 201);
  assert.notEqual(newThread.id, 'c-linh');
  await navigate('/admin/conversations/' + newThread.id);
  await fill('date', '2026-10-25');
  await fill('items.0.start', '14:00');
  await fill('items.0.end', '16:00');
  await fill('items.0.staffId', 'u-tuan');
  await fill('items.0.roomId', 'r-b');
  await click('Đề xuất giờ này cho khách');
  await see('Chờ khách trả lời');
  const nextThreadPath = '/api/conversations/' + newThread.id;
  const next = await api('GET', nextThreadPath, linh, null, 200);
  await api('PATCH', nextThreadPath + '/proposals/' + next.conversation.messages.at(-1).proposal.id,
    linh, { decision: 'accepted' }, 200);
  await click('Làm mới hội thoại');
  await waitFor(async () => (await buttonDisabled()) === false, 'replacement enabled');
  await fill('shootType', 'Tốt nghiệp cá nhân');
  await fill('packageId', 'pkg-tn-premium');
  await fill('editorId', 'u-tuan');
  await click('Tạo booking');
  await see('GS-1025');
  assert.equal((await api('GET', '/api/conversations/c-linh', linh, null, 200)).conversation.bookingCode, 'GS-1024');
  await click('Xem danh sách booking');
  await see('Xem chi tiết GS-1025');
  await click('Đã hủy');
  await see('Xem chi tiết GS-1024');
  assert.equal(await run(() => document.querySelector('main').innerText.includes('Xem chi tiết GS-1025')), false);
  await click('Tất cả');
  await see('Xem chi tiết GS-1025');
  console.log('PASS QA10: cancellation history, separate booking request and list filter');

  const replacementApi = '/api/bookings/GS-1025';
  const replacementDetail = bookingList + '/GS-1025';
  await pay(replacementApi, 'deposit');
  const { photo } = await api('POST', replacementApi + '/previews', tuan, upload(), 201);
  await api('PATCH', '/api/jobs/J-GS-1025-shoot', tuan, { status: 'done' }, 200);
  await api('PUT', replacementApi + '/selection', linh, { photoIds: [photo.id] }, 200);
  await pay(replacementApi, 'remaining');
  await click('Xem chi tiết GS-1025');
  await see('Đã thanh toán đủ');
  await see('Booking đã thanh toán đủ.');
  await see('Chờ việc chỉnh ảnh hoàn thành trước khi lưu link.');
  assert.equal(await run(() => Boolean(document.getElementById('url'))), false);
  await api('PATCH', '/api/jobs/J-GS-1025-edit', tuan, { status: 'done' }, 200);
  await click('Làm mới booking');
  await see('Lưu link ảnh');
  await fill('url', 'http://example.com/photos');
  await click('Lưu link ảnh');
  await see('Nhập link HTTPS hợp lệ');
  const finalLink = 'https://example.com/photos/gs-1025';
  await fill('url', finalLink);
  await checkFieldErrors(replacementApi + '/final-link', 'Lưu link ảnh', { url: 'Kiểm tra 400: Link' }, 'PUT');
  await click('Lưu link ảnh');
  await see('Đã lưu link ảnh hoàn chỉnh.');
  const saved = (await api('GET', replacementApi, thao, null, 200)).booking;
  assert.equal(saved.status, 'booked');
  assert.equal(saved.finalLink, finalLink);
  await checkWidths(replacementDetail);
  await switchRole('/my-bookings/GS-1025/gallery', 'linh');
  await click('Nhận ảnh');
  await see('Hoàn thành');
  assert.equal((await api('GET', replacementApi, linh, null, 200)).booking.status, 'completed');
  assert.equal((await api('GET', nextThreadPath, linh, null, 200)).conversation.status, 'done');
  await navigate(replacementDetail);
  await see('Không có quyền truy cập');
  await switchRole(replacementDetail, 'thao');

  async function measureExtras(selector, tapText) {
    await waitFor(() => run((query) => Boolean(document.querySelector(query)), selector), selector);
    for (const width of [360, 768, 1280]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      const measurements = await run((query) => [...document.querySelectorAll(query)].map((label) => {
        const input = label.querySelector('input[type="checkbox"]');
        const size = (el) => {
          const { width, height } = el.getBoundingClientRect();
          return [Number(width.toFixed(2)), Number(height.toFixed(2))];
        };
        return { name: label.innerText.trim(), label: size(label), input: size(input), associated: label.control === input };
      }), selector);
      assert(measurements.length);
      assert(measurements.every(({ associated }) => associated));
      if (tapText) {
        assert(measurements.every(({ label }) => label[1] >= 44));
        for (const [index, { name }] of measurements.entries()) {
          const target = await run((query, index) => {
            const label = document.querySelectorAll(query)[index];
            const input = label.control;
            label.scrollIntoView({ block: 'center', behavior: 'instant' });
            const text = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            const range = document.createRange();
            range.selectNodeContents(text);
            const rect = range.getClientRects()[0];
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            return { x, y, checked: input.checked, hitsLabel: document.elementFromPoint(x, y) === label };
          }, selector, index);
          assert(target.hitsLabel, name + ' at ' + width);
          for (const checked of [!target.checked, target.checked]) {
            await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: target.x, y: target.y, button: 'left', clickCount: 1 });
            await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: target.x, y: target.y, button: 'left', clickCount: 1 });
            await waitFor(() => run((query, index, expected) => document.querySelectorAll(query)[index].control.checked === expected,
              selector, index, checked), 'label text toggles ' + name);
          }
        }
      }
      console.log('MEASURE', selector, width, JSON.stringify(measurements));
    }
  }

  async function checkWidths(path) {
    for (const width of [360, 768, 1280]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      const metrics = await run(() => {
        const targets = [...document.querySelectorAll('main a, main button')];
        const height = (el) => el.getBoundingClientRect().height;
        return {
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          minMain: Math.min(...targets.map(height)),
          small: targets.filter((el) => height(el) < 44).map((el) => el.textContent.trim()),
          smallHeader: [...document.querySelectorAll('header a, header button')]
            .filter((el) => height(el) < 44).map((el) => [el.textContent.trim().replace(/\s+/g, ' '), height(el)]),
        };
      });
      assert(metrics.scrollWidth <= width, path + ' ' + JSON.stringify(metrics));
      assert.deepEqual(metrics.small, [], path + ' ' + width);
      if (path === detail) console.log('MEASURE controls', path, width, JSON.stringify(metrics));
    }
  }
  for (const path of [list, detail, '/admin/bookings']) {
    await navigate(path);
    await see(path === list ? 'Trần Minh Khoa' : path === detail ? 'GS-1024' : 'GS-1025');
    await checkWidths(path);
  }
  await navigate('/admin/conversations/c-absent');
  await see('Không tìm thấy hội thoại.');
  await click('Về danh sách hội thoại');
  await see('Trần Minh Khoa');
  await navigate(bookingList);
  await see('Xem chi tiết GS-1021');
  await mode('error');
  await click('Xem chi tiết GS-1021');
  await see('Thử lại');
  const pageEpoch = await run(() => performance.timeOrigin);
  await mode('normal');
  await click('Thử lại');
  await see('Áp dụng lịch mới');
  assert.equal(await run(() => performance.timeOrigin), pageEpoch);
  await mode('slow');
  await click('Về danh sách booking');
  await see('Đang tải…');
  await see('Xem chi tiết GS-1021');
  await click('Xem chi tiết GS-1021');
  await see('Đang tải…');
  await see('Áp dụng lịch mới');
  await mode('normal');
  console.log('PASS G10: Customer receive, role guard, slow list/detail and retry without reload');
  await navigate(list);
  await see('Trần Minh Khoa');
  await mode('error');
  await click('Linh');
  await see('Thử lại');
  await mode('normal');
  await click('Thử lại');
  await see('Kiểm tra và đề xuất giờ');
  await waitForForms();
  await mode('slow');
  await click('Về danh sách hội thoại');
  await see('Đang tải…');
  await see('Trần Minh Khoa');
  await mode('empty');
  await navigate(list);
  await see('Chưa có hội thoại nào.');
  await click('Booking');
  await see('Chưa có booking nào.');
  await navigate(bookingList + '/GS-1021');
  await see('Chưa có nhân sự để xếp lịch.');
  await navigate(detail);
  await see('Chưa có nhân sự để xếp lịch.');
  await see('Chưa có gói chụp.');
  await see('Không có dịch vụ thêm.');
  await mode('normal');
  await click('Đăng xuất');
  await navigate('/sign-in');
  await login('linh');
  await see('Lịch chụp của tôi');
  await navigate(detail);
  await see('Không có quyền truy cập');
  await click('Đăng xuất');
  await navigate('/sign-in');
  await login('tuan');
  await see('Việc của tôi');
  await navigate(firstDetail);
  await see('Không có quyền truy cập');
  assert.deepEqual(errors, []);
  assert.deepEqual(requests.filter((request) => !allowed.some((rule) => rule.test(request))), []);
  console.log('PASS UI: responsive 360/768/1280, main targets ≥44px, 404, retry, empty, cross-role guard');
  console.log('PASS: no JavaScript exceptions or console.error calls; all API requests matched allowed routes');
} finally {
  ws?.close();
  for (const child of children) await stop(child);
  await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 }).catch((err) => {
    console.warn('Chrome profile cleanup:', err.message);
  });
}
