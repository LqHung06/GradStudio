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
  /^GET \/api\/(conversations(\/[^/]+)?|bookings|resources|schedule|packages|extras)$/,
  /^POST \/api\/(conversations\/[^/]+\/(messages|proposals)|availability\/check|bookings)$/,
  /^PATCH \/api\/conversations\/[^/]+\/proposals\/[^/]+$/,
  /^POST \/api\/bookings\/GS-\d+\/cancel$/,
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
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
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
  const detail = '/admin/conversations/c-linh';
  const list = '/admin/conversations';
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  await navigate(detail);
  await login('thao');
  await see('Kiểm tra và đề xuất giờ');
  assert.equal(await run(() => location.pathname), detail);
  await send('Page.reload');
  await see('Kiểm tra và đề xuất giờ');
  await navigate(list);
  await see('Trần Minh Khoa');
  await send('Page.reload');
  await see('Trần Minh Khoa');
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
  assert.equal(await buttonDisabled(), true);
  await mode('error');
  await fill('text', 'Tin nhắn kiểm tra Admin');
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
  await api('PATCH', '/api/conversations/c-linh/proposals/' + proposalId, linh, { decision: 'accepted' }, 200);
  await click('Làm mới hội thoại');
  await waitFor(async () => (await buttonDisabled()) === false, 'create enabled after acceptance');
  await fill('shootType', 'Tốt nghiệp cá nhân');
  await fill('packageId', 'pkg-tn-premium');
  await see('540.000đ');
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
  console.log('PASS HTTP + UI: customer accepts via HTTP, Admin refreshes/creates and sees API amounts');

  const { token: thao } = await api('POST', '/api/auth/login', null, credentials('thao'), 200);
  await api('POST', '/api/bookings/GS-1024/cancel', thao, { reason: 'Kiểm tra booking thay thế' }, 200);
  await api('POST', '/api/bookings', thao, {
    conversationId: 'c-linh', proposalId, shootType: 'Tốt nghiệp cá nhân',
    packageId: 'pkg-tn-premium', extraIds: [],
  }, 409);
  await navigate(detail);
  await see('booking thay thế.');
  assert.equal(await buttonDisabled(), true);
  await fill('date', '2026-10-25');
  await fill('items.0.start', '14:00');
  await fill('items.0.end', '16:00');
  await fill('items.0.staffId', 'u-tuan');
  await fill('items.0.roomId', 'r-b');
  await click('Đề xuất giờ này cho khách');
  await see('Chờ khách trả lời');
  const replacement = await api('GET', '/api/conversations/c-linh', linh, null, 200);
  await api('PATCH', '/api/conversations/c-linh/proposals/' + replacement.conversation.messages.at(-1).proposal.id,
    linh, { decision: 'accepted' }, 200);
  await click('Làm mới hội thoại');
  await waitFor(async () => (await buttonDisabled()) === false, 'replacement enabled');
  await fill('shootType', 'Tốt nghiệp cá nhân');
  await fill('packageId', 'pkg-tn-premium');
  await click('Tạo booking');
  await see('GS-1025');
  await see('GS-1024');
  await see('Đã hủy');
  console.log('PASS HTTP + UI: cancel via HTTP, fresh proposal and booking replace while preserving history');

  async function checkWidths(path) {
    for (const width of [360, 768, 1280]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      const metrics = await run(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        small: [...document.querySelectorAll('main a, main button')]
          .filter((el) => el.getBoundingClientRect().height < 44).map((el) => el.textContent.trim()),
      }));
      assert(metrics.scrollWidth <= width, path + ' ' + JSON.stringify(metrics));
      assert.deepEqual(metrics.small, [], path + ' ' + width);
    }
  }
  for (const path of [list, detail, '/admin/bookings']) {
    await navigate(path);
    await see(path === list ? 'Trần Minh Khoa' : 'GS-1025');
    await checkWidths(path);
  }
  await navigate('/admin/conversations/c-absent');
  await see('Không tìm thấy hội thoại.');
  await click('Về danh sách hội thoại');
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
