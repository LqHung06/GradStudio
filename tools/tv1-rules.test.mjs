import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import authRoutes from '../mock/routes/auth.mjs';
import adminRoutes from '../mock/routes/admins.mjs';
import jobRoutes from '../mock/routes/jobs.mjs';
import adminBookingRoutes from '../mock/routes/admin-bookings.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const seeds = new URL('../mock/data/', import.meta.url);

function freshDb() {
  return Object.fromEntries(
    fs.readdirSync(seeds)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f.slice(0, -5), JSON.parse(fs.readFileSync(new URL(f, seeds), 'utf8'))]),
  );
}

const allRoutes = [...authRoutes, ...adminRoutes, ...jobRoutes, ...adminBookingRoutes];
const fail = (status, code, message, fields = {}, details = null) => ({
  status,
  body: { error: { code, message, fields, details } },
});

function call(db, method, path, { body = {}, params = {}, userId = null, headers = {}, rawBody = Buffer.alloc(0), query = {} } = {}) {
  const route = allRoutes.find((r) => r.method === method && r.path === path);
  assert.ok(route, `Missing route ${method} ${path}`);
  const user = userId ? db.users.find((u) => u.id === userId) : null;
  if (route.roles !== null) {
    if (!user) return fail(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập để tiếp tục');
    if (user.active === false) return fail(401, 'UNAUTHENTICATED', 'Tài khoản đã bị khóa hoặc phiên không còn hợp lệ');
    if (Array.isArray(route.roles) && !route.roles.includes(user.role)) {
      return fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập chức năng này');
    }
  }
  return route.handler({ db, body, params, query, headers, rawBody, user, fail });
}

function makeMultipart(boundary, filename, size, contentType = 'image/png') {
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
    'latin1',
  );
  const payload = Buffer.alloc(size, 0x41);
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'latin1');
  return Buffer.concat([head, payload, tail]);
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function startMock(mode = 'normal') {
  const port = await freePort();
  const proc = spawn(process.execPath, ['mock/server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), MOCK_MODE: mode },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Mock timeout on port ${port}: ${out}`)), 8000);
    proc.stdout.on('data', (d) => {
      out += d.toString();
      if (out.includes(`port ${port}`)) {
        clearTimeout(timer);
        resolve();
      }
    });
    proc.stderr.on('data', (d) => { out += d.toString(); });
    proc.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Mock exited early (${code}): ${out}`));
    });
  });
  await ready;
  return {
    base: `http://127.0.0.1:${port}`,
    stop: async () => {
      if (proc.exitCode === null) {
        proc.kill('SIGTERM');
        await once(proc, 'exit').catch(() => {});
      }
    },
  };
}

test('R01: PATCH /api/admins/:id locks/unlocks, validates strictly, refuses locked login and non-admin callers', () => {
  const db = freshDb();

  const created = call(db, 'POST', '/api/admins', {
    userId: 'u-superadmin',
    body: { name: 'Ngô Minh Quân', email: 'quan@gradstudio.test', password: 'quan-demo-123' },
  });
  assert.equal(created.status, 201);
  const id = created.body.admin.id;
  assert.equal(created.body.admin.active, true);

  const locked = call(db, 'PATCH', '/api/admins/:id', {
    userId: 'u-superadmin',
    params: { id },
    body: { active: false },
  });
  assert.equal(locked.status, 200);
  assert.equal(locked.body.admin.active, false);

  const refusedLogin = call(db, 'POST', '/api/auth/login', {
    body: { email: 'quan@gradstudio.test', password: 'quan-demo-123' },
  });
  assert.equal(refusedLogin.status, 403);
  assert.equal(refusedLogin.body.error.code, 'FORBIDDEN');

  const refusedToken = call(db, 'GET', '/api/auth/me', { userId: id });
  assert.equal(refusedToken.status, 401);
  assert.equal(refusedToken.body.error.code, 'UNAUTHENTICATED');

  const before = structuredClone(db);
  const disallowed = call(db, 'PATCH', '/api/admins/:id', {
    userId: 'u-superadmin',
    params: { id },
    body: { active: true, name: 'Sửa tên' },
  });
  assert.equal(disallowed.status, 400);
  assert.ok(disallowed.body.error.fields.name);
  assert.deepEqual(db, before);

  const nonAdminTarget = call(db, 'PATCH', '/api/admins/:id', {
    userId: 'u-superadmin',
    params: { id: 'u-linh' },
    body: { active: false },
  });
  assert.equal(nonAdminTarget.status, 404);

  const adminCaller = call(db, 'PATCH', '/api/admins/:id', {
    userId: 'u-thao',
    params: { id },
    body: { active: true },
  });
  assert.equal(adminCaller.status, 403);

  const unlocked = call(db, 'PATCH', '/api/admins/:id', {
    userId: 'u-superadmin',
    params: { id },
    body: { active: true },
  });
  assert.equal(unlocked.status, 200);
  assert.equal(unlocked.body.admin.active, true);

  const okLogin = call(db, 'POST', '/api/auth/login', {
    body: { email: 'quan@gradstudio.test', password: 'quan-demo-123' },
  });
  assert.equal(okLogin.status, 200);
});

test('R06: cancelled booking keeps Staff GET history and refuses PATCH/upload with 409 without mutating db', () => {
  const db = freshDb();

  const cancelRes = call(db, 'POST', '/api/bookings/:code/cancel', {
    userId: 'u-thao',
    params: { code: 'GS-1022' },
    body: { reason: 'Lớp hoãn lịch chụp cuối kỳ' },
  });
  assert.equal(cancelRes.status, 200);
  assert.equal(cancelRes.body.booking.status, 'cancelled');

  const list = call(db, 'GET', '/api/jobs', { userId: 'u-tuan' });
  assert.equal(list.status, 200);
  assert.ok(list.body.jobs.some((j) => j.id === 'J-GS-1022-shoot'));
  assert.equal(list.body.jobs.find((j) => j.id === 'J-GS-1022-shoot').status, 'done');

  const detail = call(db, 'GET', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-shoot' },
  });
  assert.equal(detail.status, 200);

  const before = structuredClone(db);

  const patchRefused = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'in_progress', note: 'Thử sửa sau hủy' },
  });
  assert.equal(patchRefused.status, 409);
  assert.equal(patchRefused.body.error.code, 'CONFLICT');

  const boundary = '----R06Boundary';
  const rawBody = makeMultipart(boundary, 'ok.png', 256);
  const uploadRefused = call(db, 'POST', '/api/bookings/:code/previews', {
    userId: 'u-tuan',
    params: { code: 'GS-1022' },
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    rawBody,
  });
  assert.equal(uploadRefused.status, 409);
  assert.equal(uploadRefused.body.error.code, 'CONFLICT');

  // Another staff member still receives 404 (not 409) to avoid leaking foreign jobs.
  const otherStaff = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-mai',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'in_progress' },
  });
  assert.equal(otherStaff.status, 404);
  assert.deepEqual(db, before);
});

test('R11: preview upload measures exact file part bytes (5,242,880 B accepted, 5,242,881 B rejected)', () => {
  const MAX_BYTES = 5 * 1024 * 1024;
  for (const [label, boundary, filename] of [
    ['short', 'b1', 'a.png'],
    ['long', '----VeryLongMultipartBoundaryString123456789012345678901234567890', `${'x'.repeat(200)}.png`],
  ]) {
    const db = freshDb();
    const beforeCount = db.photos.filter((p) => p.bookingCode === 'GS-1022').length;

    const exactRaw = makeMultipart(boundary, filename, MAX_BYTES);
    assert.ok(exactRaw.length > MAX_BYTES, 'multipart envelope must exceed 5 MiB to verify part measurement');
    const okRes = call(db, 'POST', '/api/bookings/:code/previews', {
      userId: 'u-tuan',
      params: { code: 'GS-1022' },
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': String(exactRaw.length),
      },
      rawBody: exactRaw,
    });
    assert.equal(okRes.status, 201, `${label}: 5,242,880 B must return 201`);
    assert.equal(okRes.body.totalPhotos, beforeCount + 1);

    const dbAfterOk = structuredClone(db);
    const overRaw = makeMultipart(boundary, filename, MAX_BYTES + 1);
    const overRes = call(db, 'POST', '/api/bookings/:code/previews', {
      userId: 'u-tuan',
      params: { code: 'GS-1022' },
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': String(overRaw.length),
      },
      rawBody: overRaw,
    });
    assert.equal(overRes.status, 400, `${label}: 5,242,881 B must return 400`);
    assert.equal(overRes.body.error.fields.file, 'Ảnh tối đa 5 MiB');
    assert.deepEqual(db, dbAfterOk);
  }
});

test('HTTP server enforcement: R01 locked existing token (401) + locked login (403) + R11 boundary over HTTP', async () => {
  const srv = await startMock('normal');
  try {
    const createRes = await fetch(`${srv.base}/api/admins`, {
      method: 'POST',
      headers: { Authorization: 'Bearer token-u-superadmin', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'HTTP Test Admin', email: 'httptest@gradstudio.test', password: 'password-123' }),
    });
    assert.equal(createRes.status, 201);
    const { admin } = await createRes.json();

    const loginRes = await fetch(`${srv.base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'httptest@gradstudio.test', password: 'password-123' }),
    });
    assert.equal(loginRes.status, 200);
    const { token } = await loginRes.json();

    const meBefore = await fetch(`${srv.base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meBefore.status, 200);

    const lockRes = await fetch(`${srv.base}/api/admins/${admin.id}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer token-u-superadmin', 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false }),
    });
    assert.equal(lockRes.status, 200);

    const meLocked = await fetch(`${srv.base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meLocked.status, 401);

    const loginLocked = await fetch(`${srv.base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'httptest@gradstudio.test', password: 'password-123' }),
    });
    assert.equal(loginLocked.status, 403);

    const fdExact = new FormData();
    fdExact.append('file', new Blob([new Uint8Array(5 * 1024 * 1024)], { type: 'image/png' }), 'exact.png');
    const upExact = await fetch(`${srv.base}/api/bookings/GS-1022/previews`, {
      method: 'POST',
      headers: { Authorization: 'Bearer token-u-tuan' },
      body: fdExact,
    });
    assert.equal(upExact.status, 201);

    const fdOver = new FormData();
    fdOver.append('file', new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/png' }), 'over.png');
    const upOver = await fetch(`${srv.base}/api/bookings/GS-1022/previews`, {
      method: 'POST',
      headers: { Authorization: 'Bearer token-u-tuan' },
      body: fdOver,
    });
    assert.equal(upOver.status, 400);
    const upOverJson = await upOver.json();
    assert.equal(upOverJson.error.fields.file, 'Ảnh tối đa 5 MiB');
  } finally {
    await srv.stop();
  }
});
