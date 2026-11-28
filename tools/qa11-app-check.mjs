/**
 * From the repository root after building client/dist:
 *   node tools/qa11-app-check.mjs [output-json]
 * Requires Node 22 and Chrome. CHROME_PATH overrides the Windows default.
 * Uses free ports 3001 and 4181. Stops only processes it starts.
 */
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const origin = 'http://127.0.0.1:4181';
const modes = ['normal', 'slow', 'error', 'empty'];
const children = [];
const rows = [];
const availability = {};
const ports = {};
const roles = { han: 'customer', linh: 'customer', thao: 'admin', mai: 'staff', tuan: 'staff', superadmin: 'superadmin' };
const credentials = (account) => ({
  email: account + '@gradstudio.test',
  password: account + '-demo',
});
const contract = await readFile('docs/api/README.md', 'utf8');
const endpoints = [...contract.matchAll(/^\| (GET|POST|PATCH|PUT|DELETE) \| `(\/api\/[^ `]+)`/gm)]
  .map(([, verb, path]) => new RegExp('^' + verb + ' ' + path.replace(/:[^/]+/g, '[^/]+') + '$'));
assert.ok(endpoints.length >= 40, 'endpoint table');

const homeResources = ['services', 'packages', 'extras', 'portfolio', 'reviews'].map((item) => '/api/' + item);
const chatResources = ['/api/conversations', ...homeResources.slice(0, 3), '/api/conversations/c-linh'];
const early = [
  ['/my-bookings/GS-1024', 'linh', 'Chưa có lịch chụp GS-1024', ['/api/bookings/GS-1024']],
  ['/my-bookings/GS-1024/gallery', 'linh', 'Chưa có lịch chụp GS-1024', ['/api/bookings/GS-1024', '/api/bookings/GS-1024/photos']],
  ['/admin/bookings/GS-1024', 'thao', 'Booking có thể chưa được tạo', ['/api/bookings/GS-1024']],
  ['/test-gateway/PAY-99999', 'han', 'Không tìm thấy giao dịch', ['/api/payments/PAY-99999']],
  ['/payments/PAY-99999/result', 'han', 'Không tìm thấy kết quả thanh toán', ['/api/payments/PAY-99999']],
  ['/staff/jobs/J-GS-1024-shoot', 'tuan', 'Không tìm thấy công việc', ['/api/jobs/J-GS-1024-shoot']],
];
const seeded = [
  ['/', '', ['Kỷ yếu lớp', 'Gói Tốt nghiệp Premium', 'Thuê áo cử nhân', 'Tốt nghiệp · sân trường', 'Hồ Gia Bảo'], [
    'Hiện chưa có dịch vụ chụp ảnh nào', 'Chưa có gói chụp nào', 'Hiện chưa có dịch vụ thêm nào',
    'Chưa có ảnh mẫu nào', 'Chưa có đánh giá nào',
  ], homeResources],
  ['/packages/pkg-tn-premium', '', 'Gói Tốt nghiệp Premium', [
    'Chưa có danh sách hạng mục chi tiết', 'Hiện chưa có dịch vụ thêm nào',
  ], ['/api/packages/pkg-tn-premium', '/api/extras']],
  ['/chat', 'linh', ['Chat với GradStudio', 'Mình muốn đặt lịch chụp tốt nghiệp'], [
    'Bạn chưa có cuộc trò chuyện nào', 'Chọn một cuộc trò chuyện bên trái',
  ], chatResources],
  ['/my-bookings', 'han', 'GS-1023', 'Bạn chưa có lịch chụp nào', ['/api/bookings']],
  ['/my-bookings/GS-1023', 'han', 'Thông tin gói chụp', 'Chưa có ca chụp chi tiết', ['/api/bookings/GS-1023']],
  ['/admin/conversations', 'thao', 'Linh', 'Chưa có hội thoại nào', ['/api/conversations']],
  ['/admin/conversations/c-linh', 'thao', ['Đề xuất giờ', 'Lịch sử booking'], [
    'Chưa có tin nhắn', 'Chưa có booking trong hội thoại này', 'Chưa có nhân sự để xếp lịch',
    'Chưa có gói chụp', 'Chưa có nhân viên chỉnh ảnh', 'Không có dịch vụ thêm',
  ], ['/api/conversations/c-linh', '/api/bookings', '/api/resources', '/api/schedule', '/api/packages', '/api/extras']],
  ['/admin/bookings', 'thao', 'GS-1023', 'Chưa có booking nào', ['/api/bookings']],
  ['/admin/bookings/GS-1023', 'thao', 'Áp dụng lịch mới', [
    'Chưa có ca trong lịch', 'Booking này chưa có dịch vụ thêm', 'Chưa có nhân sự để xếp lịch',
  ], ['/api/bookings/GS-1023', '/api/resources']],
  ['/staff/jobs', 'mai', 'GS-1021', 'chưa có việc', ['/api/jobs']],
  ['/staff/jobs/J-GS-1022-shoot', 'tuan', 'Thông tin công việc', 'Chưa có ảnh xem trước', [
    '/api/jobs/J-GS-1022-shoot', '/api/bookings/GS-1022', '/api/bookings/GS-1022/photos',
  ]],
  ['/superadmin/admins', 'superadmin', 'Thảo', 'Chưa có tài khoản Admin nào', ['/api/admins']],
  ['/superadmin/settings', 'superadmin', 'Giờ hoạt động & Nhắc lịch', 'Giờ hoạt động & Nhắc lịch', ['/api/settings']],
];

let activeMode = 'normal';
let maskedEndpoint;
let maskedMode;
let chrome;
let profile;
const proxy = createServer((incoming, outgoing) => {
  const path = new URL(incoming.url, origin).pathname;
  const mode = path === maskedEndpoint ? maskedMode : activeMode;
  const upstream = request({
    hostname: '127.0.0.1',
    port: ports[mode],
    path: incoming.url,
    method: incoming.method,
    headers: incoming.headers,
  }, (response) => {
    outgoing.writeHead(response.statusCode, response.headers);
    response.pipe(outgoing);
  });
  upstream.on('error', () => {
    outgoing.writeHead(502);
    outgoing.end('QA11 mock unavailable');
  });
  incoming.pipe(upstream);
});

async function waitFor(check, label, timeout = 8500) {
  const until = Date.now() + timeout;
  do {
    const result = await check();
    if (result) return result;
    await sleep(40);
  } while (Date.now() < until);
  throw new Error('Thiếu ' + label);
}

function start(command, args, options = {}) {
  const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], ...options });
  children.push(child);
  let output = '';
  const collect = (chunk) => { output = (output + chunk).slice(-10000); };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.on('error', collect);
  return { child, output: () => output };
}

async function startMock(mode) {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve) => reservation.close(resolve));
  const server = start(process.execPath, ['mock/server.mjs'], {
    env: { ...process.env, PORT: String(port), MOCK_MODE: mode },
  });
  await waitFor(() => {
    const output = server.output();
    if (server.child.exitCode !== null) throw new Error(output);
    return output.includes('Mock server listening');
  }, mode + ' mock');
  ports[mode] = port;
}

async function http(mode, verb, path, status, token, body) {
  const response = await fetch('http://127.0.0.1:' + ports[mode] + path, {
    method: verb,
    headers: {
      ...(token && { Authorization: 'Bearer ' + token }),
      ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
    },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  });
  const value = await response.json();
  assert.equal(response.status, status, mode + ' ' + verb + ' ' + path + ' ' + JSON.stringify(value));
  return value;
}

async function prepare(mode, sessions) {
  const call = (name, verb, path, status, body) => http(mode, verb, path, status, sessions[name].token, body);
  const { message } = await call('thao', 'POST', '/api/conversations/c-linh/proposals', 201, {
    date: '2026-10-24',
    items: [
      { kind: 'makeup', start: '13:00', end: '14:00', staffId: 'u-mai', roomId: null },
      { kind: 'shoot', start: '14:00', end: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
    ],
  });
  await call('linh', 'PATCH', '/api/conversations/c-linh/proposals/' + message.proposal.id, 200, { decision: 'accepted' });
  const { booking } = await call('thao', 'POST', '/api/bookings', 201, {
    conversationId: 'c-linh', proposalId: message.proposal.id, shootType: 'Tốt nghiệp cá nhân',
    packageId: 'pkg-tn-premium', extraIds: ['ex-makeup'], editorId: 'u-tuan',
  });
  const bookingApi = '/api/bookings/' + booking.code;
  const hanPayment = await call('han', 'POST', '/api/bookings/GS-1023/payments', 201, { kind: 'deposit' });
  const deposit = await call('linh', 'POST', bookingApi + '/payments', 201, { kind: 'deposit' });
  const { redirectUrl: result } = await call('linh', 'POST', '/api' + deposit.redirectUrl, 200, { result: 'success' });
  const { job } = await call('tuan', 'GET', '/api/jobs/J-' + booking.code + '-shoot', 200);
  const upload = new FormData();
  upload.append('file', new Blob([Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j19sAAAAASUVORK5CYII=',
    'base64',
  )], { type: 'image/png' }), 'qa11-preview.png');
  const { photo } = await call('tuan', 'POST', bookingApi + '/previews', 201, upload);
  return { code: booking.code, jobId: job.id, gateway: hanPayment.redirectUrl, result, photoId: photo.id };
}

async function browser() {
  profile = await mkdtemp(join(tmpdir(), 'gradstudio-qa11-'));
  const executable = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const server = start(executable, ['--headless', '--disable-gpu', '--disable-background-networking',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank']);
  const port = await waitFor(async () => {
    if (server.child.exitCode !== null) throw new Error(server.output());
    const file = await readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
    return file.split('\n')[0];
  }, 'Chrome CDP');
  const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const ws = new WebSocket(tabs.find(({ type }) => type === 'page').webSocketDebuggerUrl);
  await once(ws, 'open');
  const pending = new Map();
  let sequence = 0;
  let observed;
  ws.addEventListener('message', ({ data }) => {
    const { id, result, error, method, params } = JSON.parse(data);
    if (id && pending.has(id)) {
      const { resolve, reject } = pending.get(id);
      pending.delete(id);
      if (error) reject(new Error(error.message));
      else resolve(result);
    }
    if (!observed) return;
    if (method === 'Network.requestWillBeSent') {
      const url = new URL(params.request.url);
      if (url.pathname.startsWith('/api/')) {
        observed.requests.push({ id: params.requestId, verb: params.request.method, path: url.pathname, url: url.href });
      }
    }
    if (method === 'Network.responseReceived') {
      const item = observed.requests.find(({ id: key }) => key === params.requestId);
      if (item) item.status = params.response.status;
      if (!item && params.response.status >= 400 && params.response.url.startsWith(origin)) {
        observed.errors.push(params.response.status + ' ' + params.response.url);
      }
    }
    if (method === 'Runtime.exceptionThrown') {
      observed.errors.push(params.exceptionDetails.exception?.description || params.exceptionDetails.text);
    }
    if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
      observed.errors.push(params.args.map((arg) => arg.value || arg.description).join(' '));
    }
  });
  ws.addEventListener('close', () => {
    for (const { reject } of pending.values()) reject(new Error('Chrome disconnected'));
    pending.clear();
  });
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  const run = async (fn, ...args) => {
    const evaluation = await send('Runtime.evaluate', {
      expression: '(' + fn + ')(...' + JSON.stringify(args) + ')', returnByValue: true,
    });
    if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.text);
    return evaluation.result.value;
  };
  await Promise.all(['Page', 'Network', 'Runtime'].map((domain) => send(domain + '.enable')));
  let injection;
  async function open(path, session, entry) {
    if (injection) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injection });
    const data = JSON.stringify(session || null);
    ({ identifier: injection } = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `if (location.origin === ${JSON.stringify(origin)}) {
        const session = ${data};
        if (session) {
          localStorage.setItem('gradstudio_token', session.token);
          localStorage.setItem('gradstudio_user', JSON.stringify(session.user));
        } else {
          localStorage.removeItem('gradstudio_token');
          localStorage.removeItem('gradstudio_user');
        }
      }`,
    }));
    const previous = await run(() => performance.timeOrigin);
    observed = entry;
    const navigation = await send('Page.navigate', { url: origin + path });
    assert.ok(!navigation.errorText, navigation.errorText);
    await waitFor(async () => {
      try {
        const state = await snapshot();
        return state.time !== previous && state.path === path && state.heading;
      } catch {
        return false;
      }
    }, 'route trực tiếp ' + path);
  }
  const snapshot = () => run(() => {
    const region = (element) =>
      (element.closest('section, fieldset')?.querySelector('h2, legend')?.textContent || 'Trang').trim();
    return {
      text: document.querySelector('main')?.innerText || '',
      heading: document.querySelector('h1')?.innerText,
      path: location.pathname,
      time: performance.timeOrigin,
      token: localStorage.getItem('gradstudio_token'),
      loading: [...document.querySelectorAll('.async-loading')].map(region),
      retry: [...document.querySelectorAll('main button')].filter((button) =>
        button.innerText.trim() === 'Thử lại').map(region),
      enabledActions: [...document.querySelectorAll('main button:not(:disabled)')].map((button) =>
        button.innerText.trim()),
    };
  });
  const clickRetry = (index) => run((i) => {
    const targets = [...document.querySelectorAll('main button')]
      .filter((button) => button.innerText.trim() === 'Thử lại');
    targets[i].click();
  }, index);
  const login = () => run(({ email, password }) => {
    for (const [name, value] of Object.entries({ email, password })) {
      const field = document.querySelector('[name="' + name + '"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    document.querySelector('main button[type="submit"]').click();
  }, credentials('han'));
  return { open, snapshot, clickRetry, login, close: () => ws.close() };
}

const asList = (value) => Array.isArray(value) ? value : [value];
const has = (state, markers) => asList(markers).every((phrase) =>
  state.text.toLowerCase().includes(phrase.toLowerCase()));

async function quiet(entry) {
  await waitFor(async () => {
    const requestCount = entry.requests.length;
    await sleep(320);
    return requestCount === entry.requests.length && entry.requests.every(({ status }) => status);
  }, 'request ổn định khi đứng yên');
}

async function retry(entry, expected, initial, failed, release, firstButton) {
  release();
  let state = initial;
  for (let attempt = 0; state.retry.length && attempt < 12; attempt++) {
    const index = attempt === 0 ? firstButton : 0;
    assert.ok(index < state.retry.length, 'không có nút Thử lại thứ ' + (index + 1));
    const label = state.retry[index];
    const before = entry.requests.length;
    await chrome.clickRetry(index);
    await waitFor(() => entry.requests.slice(before).some(({ status }) => status === 200), 'phục hồi vùng ' + label);
    // An outer retry can reveal another failed region after its follow-up fetch.
    await quiet(entry);
    state = await chrome.snapshot();
    assert.equal(state.time, initial.time, 'document was reloaded');
    assert.equal(state.path, initial.path, 'route changed');
    assert.equal(state.token, initial.token, 'session changed');
    entry.retry.push({ label, requests: entry.requests.slice(before).map(({ path }) => path) });
  }
  assert.deepEqual(state.retry, [], 'vùng vẫn báo lỗi sau Thử lại');
  const recovered = new Set(entry.retry.flatMap(({ requests }) => requests));
  for (const path of failed) assert.ok(recovered.has(path), 'GET lỗi thiếu Thử lại ' + path);
  await waitFor(async () => has(await chrome.snapshot(), expected), 'dữ liệu sau Thử lại: ' + asList(expected).join(' / '));
}

async function verify(definition, mode, sessions, options = {}) {
  const [path, account, expected, empty, resources = []] = definition;
  const { early404 = [], target, setup = 'seed', firstButton = 0 } = options;
  activeMode = target ? 'normal' : mode;
  maskedEndpoint = target;
  maskedMode = mode;
  const entry = {
    path, account: account || (path === '/sign-in' ? 'han' : 'anonymous'),
    role: roles[account] || 'public', mode, setup, target, early404, requests: [], errors: [], retry: [],
  };
  rows.push(entry);
  try {
    entry.expected = [...asList(mode === 'empty' ? empty : expected)];
    if (mode === 'slow' && resources.length) entry.expected.push('Đang tải');
    if (mode === 'error' && resources.length) entry.expected.push('Thử lại và phục hồi cùng trang');
    await chrome.open(path, sessions[account], entry);
    let state;
    if (path === '/sign-in') {
      await chrome.login();
      await waitFor(async () => (await chrome.snapshot()).path === '/my-bookings', 'đăng nhập han');
      await quiet(entry);
      assert.ok(entry.requests.some(({ verb, path, status }) => verb === 'POST' && path === '/api/auth/login' && status === 200),
        'login HTTP 200');
    } else if (mode === 'error' && resources.length) {
      await waitFor(() => entry.requests.some((item) => item.status === 500 && resources.includes(item.path)), 'HTTP 500');
      await quiet(entry);
      const failed = entry.requests.filter(({ path, status }) => resources.includes(path) && status === 500).map(({ path }) => path);
      if (target) assert.ok(failed.includes(target), 'resource chưa được gọi: ' + target);
      state = await chrome.snapshot();
      assert.ok(state.retry.length, 'không có nút Thử lại cho ' + failed.join(', '));
      await retry(entry, expected, state, failed, () => {
        activeMode = 'normal';
        maskedEndpoint = undefined;
      }, firstButton);
    } else {
      if (mode === 'slow' && resources.length) {
        state = await waitFor(async () => {
          const value = await chrome.snapshot();
          return value.loading.length && value;
        }, 'Đang tải');
        entry.loading = state.loading;
        assert.ok(!has(state, expected), 'dữ liệu đích đã hiện trước loading đã đo');
      }
      const markers = mode === 'empty' ? empty : expected;
      await waitFor(async () => {
        const value = await chrome.snapshot();
        return !value.loading.length && has(value, markers);
      }, asList(markers).join(' / '));
      if (mode === 'empty') {
        const prohibited = await chrome.snapshot();
        assert.ok(!prohibited.text.includes('Dữ liệu booking minh họa cho PA#2'), 'fixtures PA#2');
        assert.ok(!entry.requests.some(({ verb }) => verb !== 'GET'), 'request ghi dữ liệu trong trạng thái rỗng');
        const blocked = {
          '/chat': ['Gửi yêu cầu đặt lịch'],
          '/admin/conversations/c-linh': ['Tạo booking', 'Kiểm tra trùng lịch', 'Đề xuất giờ này cho khách'],
          '/admin/bookings/GS-1023': ['Áp dụng lịch mới'],
        };
        const absent = !target || target === '/api/packages' ? blocked[path] || [] : [];
        for (const label of absent) {
          assert.ok(!prohibited.enabledActions.includes(label), 'Thiếu danh mục nhưng vẫn mở nút ' + label);
        }
      }
    }
    await quiet(entry);
    state = await chrome.snapshot();
    const network = entry.requests.map(({ verb, path, status }) => ({ verb, path, status }));
    assert.ok(entry.requests.every(({ url }) => url.startsWith(origin + '/api/')), 'API không cùng origin');
    assert.ok(network.every(({ verb, path }) => endpoints.some((endpoint) => endpoint.test(verb + ' ' + path))),
      'endpoint ngoài contract');
    assert.ok(network.every(({ path, status }) => status < 400 || (status === 500 && mode === 'error')
      || (status === 404 && early404.includes(path))), 'HTTP ngoài dự kiến');
    if (resources.length && !target && mode !== 'error' && mode !== 'empty') {
      for (const resource of resources) {
        assert.ok(network.some(({ path }) => path === resource), 'thiếu request ' + resource);
      }
    }
    if (target && mode === 'empty') assert.ok(network.some(({ path }) => path === target), 'không gọi ' + target);
    if (mode !== 'error') {
      const unique = new Set(entry.requests.map(({ verb, url }) => verb + ' ' + url));
      assert.equal(unique.size, network.length, 'request lặp khi mở trang');
    }
    assert.deepEqual(entry.errors, [], 'browser errors');
    entry.actual = state.heading;
    entry.result = 'PASS';
  } catch (error) {
    entry.result = 'FAIL';
    entry.actual = error.message;
    entry.visible = (await chrome.snapshot().catch(() => null))?.text.slice(0, 2600);
  }
  console.log(entry.result, mode, path, target || setup, entry.actual);
}

let fatal;
try {
  proxy.listen(3001);
  await once(proxy, 'listening');
  await Promise.all(modes.map(startMock));
  const preview = start(process.execPath, ['node_modules/vite/bin/vite.js', 'preview',
    '--host', '127.0.0.1', '--port', '4181', '--strictPort'], { cwd: 'client' });
  await waitFor(() => {
    if (preview.child.exitCode !== null) throw new Error(preview.output());
    return fetch(origin).catch(() => null);
  }, 'Vite production preview');
  chrome = await browser();
  const accounts = ['linh', 'han', 'thao', 'tuan', 'mai', 'superadmin'];
  const sessions = Object.fromEntries(await Promise.all(accounts.map(async (account) =>
    [account, await http('error', 'POST', '/api/auth/login', 200, undefined, credentials(account))])));

  // The same browser document survives each error-to-normal retry. Normal keeps
  // its own in-memory database while the error-mode mock handles failing calls.
  for (const [path, account, expected, early404] of early) {
    await verify([path, account, expected, expected, early404], 'normal', sessions, { early404, setup: 'before G6/G7' });
  }
  await Promise.all(['normal', 'slow', 'empty'].map((mode) => http(mode, 'POST',
    '/api/conversations/c-linh/messages', 201, sessions.linh.token, {
      text: 'Mình muốn đặt lịch chụp tốt nghiệp',
      request: {
        shootType: 'Tốt nghiệp cá nhân', packageId: 'pkg-tn-premium',
        preferredDate: '2026-10-24', preferredTime: '09:00', extraIds: ['ex-makeup'],
      },
    })));
  for (const mode of modes) {
    for (const definition of seeded) await verify(definition, mode, sessions);
    await verify(['/sign-in', '', 'Đăng nhập han', 'Đăng nhập han'], mode, sessions, { setup: 'UI sign-in' });
    await verify(['/qa11-missing', '', 'Không tìm thấy trang', 'Không tìm thấy trang'], mode, sessions, { setup: 'router catch-all' });
  }
  for (const definition of seeded) {
    if (definition[4].length < 2) continue;
    for (const target of definition[4]) {
      await verify(definition, 'error', sessions, { target, setup: 'isolated resource' });
    }
  }
  await verify(seeded.find(([path]) => path === '/admin/conversations/c-linh'), 'error', sessions, {
    target: '/api/resources', setup: 'isolated resource · editor form', firstButton: 1,
  });
  for (const [path, target, emptyMessage] of [
    ['/chat', '/api/conversations/c-linh', 'Chưa có tin nhắn'],
    ['/chat', '/api/packages', 'Chưa tải được danh sách gói chụp'],
    ['/chat', '/api/extras', 'Hiện không có dịch vụ thêm'],
    ['/admin/conversations/c-linh', '/api/schedule', 'Không có tài nguyên trong lịch ngày này'],
  ]) {
    const [url, account, expected, , resources] = seeded.find(([url]) => url === path);
    await verify([url, account, expected, emptyMessage, resources], 'empty', sessions, { target, setup: 'isolated empty resource' });
  }

  for (const mode of ['normal', 'slow', 'empty']) {
    try {
      availability[mode] = await prepare(mode, sessions);
    } catch (error) {
      availability[mode] = { error: error.message };
    }
  }
  for (const mode of modes) {
    const data = availability[mode === 'error' ? 'normal' : mode];
    if (data.error) {
      for (const feature of ['booking detail after G6', 'gallery after G8', 'gateway after G7',
        'result after G7', 'notifications', 'admin booking detail', 'staff job after G7']) {
        rows.push({ mode, feature, setup: 'HTTP G6–G8', result: 'NOT RUN', actual: data.error });
      }
      continue;
    }
    const { code, jobId, gateway, result } = data;
    const booking = '/my-bookings/' + code;
    const api = '/api/bookings/' + code;
    const job = '/staff/jobs/' + jobId;
    const paymentApi = (path) => '/api/payments/' + path.match(/PAY-\d+/)[0];
    const gallery = [booking + '/gallery', 'linh', 'Chọn tối đa 30 ảnh', 'Studio chưa đăng ảnh xem trước', [api, api + '/photos']];
    for (const definition of [
      [booking, 'linh', 'Thông tin gói chụp', 'Chưa có ca chụp chi tiết', [api]],
      gallery,
      [gateway, 'han', 'Thanh toán thành công (thử nghiệm)', 'Thanh toán thành công (thử nghiệm)', [paymentApi(gateway)]],
      [result, 'linh', 'Đặt cọc thành công', 'Đặt cọc thành công', [paymentApi(result)]],
      ['/notifications', 'linh', code, 'Chưa có nhắc lịch', ['/api/reminders']],
      ['/admin/bookings/' + code, 'thao', 'Người chỉnh ảnh đã chọn: Tuấn', 'Chưa có ca trong lịch', [api, '/api/resources']],
      [job, 'tuan', 'Thông tin công việc', 'Chưa có ảnh xem trước', [
        job.replace('/staff', '/api'), api, api + '/photos',
      ]],
    ]) {
      await verify(definition, mode, sessions, { setup: 'HTTP G6–G8' });
    }
    if (mode === 'error') {
      for (const target of gallery[4]) await verify(gallery, mode, sessions, { target, setup: 'isolated resource after G8' });
    }
  }
} catch (error) {
  fatal = error.stack;
  console.error(fatal);
} finally {
  chrome?.close();
  proxy.closeAllConnections();
  proxy.close();
  await Promise.all(children.map(async (child) => {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
    const done = once(child, 'exit');
    child.kill();
    await done;
  }));
  if (profile && /^gradstudio-qa11-[^\\/]+$/.test(relative(tmpdir(), profile))) {
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(console.error);
  }
  const report = {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version,
    availability,
    fatal,
    rows,
  };
  if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(report, null, 2) + '\n');
  console.log(Object.fromEntries(['PASS', 'FAIL', 'NOT RUN'].map((key) =>
    [key, rows.filter(({ result }) => result === key).length])));
  if (fatal || rows.some(({ result }) => result !== 'PASS')) process.exitCode = 1;
}
