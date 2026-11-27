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
import settingsRoutes from '../mock/routes/settings.mjs';
import adminBookingRoutes from '../mock/routes/admin-bookings.mjs';
import { getOpeningHoursForDate, isWeekendDate } from '../mock/lib/opening-hours.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const seeds = new URL('../mock/data/', import.meta.url);

function freshDb() {
  return Object.fromEntries(
    fs.readdirSync(seeds)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f.slice(0, -5), JSON.parse(fs.readFileSync(new URL(f, seeds), 'utf8'))]),
  );
}

const allRoutes = [...authRoutes, ...adminRoutes, ...jobRoutes, ...settingsRoutes, ...adminBookingRoutes];
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


test('B4.4 (QA8): settings split weekday/weekend opening hours with strict validation and date helper', () => {
  const db = freshDb();

  const initial = call(db, 'GET', '/api/settings', { userId: 'u-superadmin' });
  assert.equal(initial.status, 200);
  assert.deepEqual(initial.body.settings.openingHours, {
    weekday: { open: '08:00', close: '20:00' },
    weekend: { open: '08:00', close: '20:00' },
  });

  // Saturday 2026-10-24 must be weekend and cover GS-1024 (09:00-16:00).
  assert.equal(isWeekendDate('2026-10-23'), false);
  assert.equal(isWeekendDate('2026-10-24'), true);
  assert.equal(isWeekendDate('2026-10-25'), true);

  const updated = call(db, 'PUT', '/api/settings', {
    userId: 'u-superadmin',
    body: {
      openingHours: {
        weekday: { open: '07:30', close: '20:30' },
        weekend: { open: '08:00', close: '21:00' },
      },
      reminderHoursBefore: 48,
    },
  });
  assert.equal(updated.status, 200);
  assert.deepEqual(getOpeningHoursForDate(db.settings, '2026-10-23'), { open: '07:30', close: '20:30' });
  assert.deepEqual(getOpeningHoursForDate(db.settings, '2026-10-24'), { open: '08:00', close: '21:00' });
  assert.deepEqual(getOpeningHoursForDate(db.settings, '2026-10-25'), { open: '08:00', close: '21:00' });

  // Legacy { open, close } fallback remains safe.
  assert.deepEqual(
    getOpeningHoursForDate({ openingHours: { open: '09:00', close: '18:00' } }, '2026-10-24'),
    { open: '09:00', close: '18:00' },
  );

  // Invalid ranges must return 400 with exact field keys and not mutate db.
  const before = structuredClone(db.settings);
  const bad = call(db, 'PUT', '/api/settings', {
    userId: 'u-superadmin',
    body: {
      openingHours: {
        weekday: { open: '20:00', close: '08:00' },
        weekend: { open: '18:00', close: '18:00' },
      },
      reminderHoursBefore: 0,
    },
  });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.fields['openingHours.weekday.close']);
  assert.ok(bad.body.error.fields['openingHours.weekend.close']);
  assert.ok(bad.body.error.fields.reminderHoursBefore);
  assert.deepEqual(db.settings, before);

  const forbidden = call(db, 'PUT', '/api/settings', {
    userId: 'u-thao',
    body: {
      openingHours: {
        weekday: { open: '08:00', close: '20:00' },
        weekend: { open: '08:00', close: '20:00' },
      },
      reminderHoursBefore: 24,
    },
  });
  assert.equal(forbidden.status, 403);
});

test('B4.8 & B4.11 (QA8): Staff job status transitions and lock rules across deposit_paid, paid_in_full and finalLink', () => {
  const db = freshDb();
  const gs1022 = db.bookings.find((b) => b.code === 'GS-1022');
  assert.equal(gs1022.paymentStatus, 'deposit_paid');
  assert.equal(gs1022.selection.selectedCount, 0);

  // 1. Before paid_in_full: shoot may step backward (done -> todo -> done).
  const stepBack = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-shoot' },
    body: { status: 'todo', note: 'Chụp bổ sung thêm góc' },
  });
  assert.equal(stepBack.status, 200);
  assert.equal(stepBack.body.job.status, 'todo');

  const stepForward = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-shoot' },
    body: { status: 'done', note: '' },
  });
  assert.equal(stepForward.status, 200);
  assert.equal(stepForward.body.job.status, 'done');

  // 2. Edit is locked before photo selection + paid_in_full.
  const editLockedNoSel = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'in_progress' },
  });
  assert.equal(editLockedNoSel.status, 409);

  // Even after saving selection, edit stays locked until paid_in_full.
  gs1022.selection.selectedCount = 12;
  const editLockedUnpaid70 = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'in_progress' },
  });
  assert.equal(editLockedUnpaid70.status, 409);

  // 3. After selection saved + paid_in_full: shoot/makeup locked (409), edit unlocked (including backward).
  gs1022.paymentStatus = 'paid_in_full';
  const shootLockedAfter70 = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-shoot' },
    body: { status: 'in_progress' },
  });
  assert.equal(shootLockedAfter70.status, 409);
  assert.equal(db.jobs.find((j) => j.id === 'J-GS-1022-shoot').status, 'done');

  const gs1021 = db.bookings.find((b) => b.code === 'GS-1021');
  gs1021.paymentStatus = 'paid_in_full';
  const makeupLockedAfter70 = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-mai',
    params: { id: 'J-GS-1021-makeup' },
    body: { status: 'done' },
  });
  assert.equal(makeupLockedAfter70.status, 409);
  assert.equal(db.jobs.find((j) => j.id === 'J-GS-1021-makeup').status, 'todo');

  const editStart = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'done', note: 'Hoàn tất chỉnh 12 ảnh' },
  });
  assert.equal(editStart.status, 200);
  assert.equal(editStart.body.job.status, 'done');

  const editStepBack = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'in_progress' },
  });
  assert.equal(editStepBack.status, 200);
  assert.equal(editStepBack.body.job.status, 'in_progress');

  const editDoneAgain = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'done' },
  });
  assert.equal(editDoneAgain.status, 200);

  // 4. Once finalLink is set, edit is locked (409) without mutating status.
  gs1022.finalLink = 'https://drive.example.com/gs-1022';
  const editLockedAfterLink = call(db, 'PATCH', '/api/jobs/:id', {
    userId: 'u-tuan',
    params: { id: 'J-GS-1022-edit' },
    body: { status: 'in_progress' },
  });
  assert.equal(editLockedAfterLink.status, 409);
  assert.equal(db.jobs.find((j) => j.id === 'J-GS-1022-edit').status, 'done');
});
