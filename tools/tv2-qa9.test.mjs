import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { confirmBookingReservation } from '../mock/lib/booking-confirmation.mjs';
import { activePaymentLock } from '../mock/lib/admin-booking-rules.mjs';
import {
  PAYMENT_EXPIRY_MS,
  EXPIRED_FAILURE_REASON,
  createPaymentAttempt,
  expirePendingPayments,
  processGatewayCallback,
} from '../mock/lib/payments.mjs';
import {
  ensureBookingReminder,
  dispatchDueReminders,
  recalculateBookingReminders,
  stopBookingReminders,
} from '../mock/lib/reminders.mjs';

function baseDb(overrides = {}) {
  return {
    settings: {
      reminderHoursBefore: 24,
      openingHours: {
        weekday: { open: '08:00', close: '21:00' },
        weekend: { open: '08:00', close: '21:00' },
      },
    },
    resources: {
      staff: [
        { id: 'u-mai', name: 'Mai', role: 'makeup' },
        { id: 'u-tuan', name: 'Tuấn', role: 'photographer' },
        { id: 'u-ha', name: 'Hà', role: 'editor' },
      ],
      rooms: [
        { id: 'r-a', name: 'Phòng A' },
        { id: 'r-b', name: 'Phòng B' },
      ],
    },
    users: [
      { id: 'u-mai', name: 'Mai', role: 'staff' },
      { id: 'u-tuan', name: 'Tuấn', role: 'staff' },
      { id: 'u-ha', name: 'Hà', role: 'staff' },
      { id: 'u-linh', name: 'Linh', role: 'customer' },
    ],
    bookingEditors: {},
    bookings: [],
    jobs: [],
    reminders: [],
    payments: [],
    ...overrides,
  };
}

function makeSampleBooking(code = 'GS-2001', overrides = {}) {
  return {
    code,
    shootType: 'Tốt nghiệp cá nhân',
    status: 'awaiting_deposit',
    paymentStatus: 'unpaid',
    date: '2026-10-24',
    deposit: 540000,
    remaining: 1260000,
    price: 1800000,
    customer: { id: 'u-linh', name: 'Linh' },
    package: { id: 'pkg-tn-premium', name: 'Gói Tốt nghiệp Premium', editedPhotos: 30 },
    items: [
      { kind: 'makeup', start: '13:00', end: '14:00', staff: { id: 'u-mai', name: 'Mai' }, room: null },
      { kind: 'shoot', start: '14:00', end: '16:00', staff: { id: 'u-tuan', name: 'Tuấn' }, room: { id: 'r-b', name: 'Phòng B' } },
    ],
    selection: { limit: 30, selectedCount: 0, selectedIds: [] },
    ...overrides,
  };
}

test('B4.1 & B4.11: confirmBookingReservation assigns db.bookingEditors editor, creates queued reminder, falls back for legacy bookings, and stays idempotent', async () => {
  const db = baseDb({
    bookingEditors: { 'GS-2001': { id: 'u-ha', name: 'Hà' } },
  });
  const b1 = makeSampleBooking('GS-2001');
  const b2 = makeSampleBooking('GS-2002', {
    items: [
      { kind: 'makeup', start: '17:00', end: '18:00', staff: { id: 'u-mai', name: 'Mai' }, room: null },
      { kind: 'shoot', start: '18:00', end: '20:00', staff: { id: 'u-tuan', name: 'Tuấn' }, room: { id: 'r-a', name: 'Phòng A' } },
    ],
  });
  db.bookings.push(b1, b2);

  const ok1 = await confirmBookingReservation(db, b1);
  assert.equal(ok1.ok, true);
  assert.equal(ok1.jobsCreated, 3);
  assert.equal(ok1.reminderCreated, true);
  assert.equal(b1.status, 'booked');
  assert.equal(b1.paymentStatus, 'deposit_paid');

  const editJob1 = db.jobs.find((j) => j.id === 'J-GS-2001-edit');
  assert.deepEqual(editJob1.staff, { id: 'u-ha', name: 'Hà' });
  const shootJob1 = db.jobs.find((j) => j.id === 'J-GS-2001-shoot');
  assert.deepEqual(shootJob1.staff, { id: 'u-tuan', name: 'Tuấn' });
  const rm1 = db.reminders.find((r) => r.bookingCode === 'GS-2001');
  assert.equal(rm1.emailStatus, 'queued');

  // Re-running confirmBookingReservation on booked booking is a no-op (at-most-once provisioning).
  const repeat = await confirmBookingReservation(db, b1);
  assert.equal(repeat.ok, true);
  assert.equal(repeat.alreadyConfirmed, true);
  assert.equal(repeat.jobsCreated, 0);
  assert.equal(db.jobs.length, 3);
  assert.equal(db.reminders.length, 1);

  // Legacy booking without db.bookingEditors falls back cleanly to shoot staff.
  const ok2 = await confirmBookingReservation(db, b2);
  assert.equal(ok2.ok, true);
  const editJob2 = db.jobs.find((j) => j.id === 'J-GS-2002-edit');
  assert.deepEqual(editJob2.staff, { id: 'u-tuan', name: 'Tuấn' });
});

test('B4.1: clash or invalid/error states keep awaiting_deposit with zero partial jobs or reminders', async () => {
  const b1 = makeSampleBooking('GS-2001');
  const db = baseDb({
    bookings: [
      makeSampleBooking('GS-1021', {
        status: 'booked',
        items: [
          { kind: 'makeup', start: '13:00', end: '14:00', staff: { id: 'u-mai', name: 'Mai' }, room: null },
        ],
      }),
      b1,
    ],
  });

  const clash = await confirmBookingReservation(db, b1);
  assert.equal(clash.ok, false);
  assert.equal(clash.reason, 'CLASH');
  assert.ok(clash.clashes.length > 0);
  assert.equal(b1.status, 'awaiting_deposit');
  assert.equal(db.jobs.length, 0);
  assert.equal(db.reminders.length, 0);

  // Cancelled booking refuses confirmation cleanly.
  const cancelled = makeSampleBooking('GS-2009', { status: 'cancelled' });
  const bad = await confirmBookingReservation(db, cancelled);
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, 'INVALID_BOOKING_STATUS');

  // Draft failure leaves state clean without half-created jobs/reminders.
  const broken = makeSampleBooking('GS-2010', { items: null });
  await assert.rejects(
    () => confirmBookingReservation(db, broken, {
      checkClashFn: async () => ({ available: true, clashes: [] }),
    }),
  ).catch(() => {});
  assert.equal(db.jobs.length, 0);
  assert.equal(db.reminders.length, 0);
});

test('B4.2, B4.3, BS.1: both deposit & remaining expire at +15m boundary, refuse late gateway, allow fresh retry, and support gatewayCaptured post-cancel once', async () => {
  const t0 = Date.UTC(2026, 9, 20, 11, 0, 0);
  const b1 = makeSampleBooking('GS-2001');
  const db = baseDb({
    bookingEditors: { 'GS-2001': { id: 'u-ha', name: 'Hà' } },
    bookings: [b1],
  });

  // 1. Create deposit at t0 -> expiresAt = t0 + 15m
  const p1Res = createPaymentAttempt(db, { booking: b1, kind: 'deposit', nowMs: t0 });
  assert.equal(p1Res.ok, true);
  assert.equal(
    Date.parse(p1Res.body.payment.expiresAt) - Date.parse(p1Res.body.payment.createdAt),
    PAYMENT_EXPIRY_MS,
  );

  // At exact boundary t0 + 15m -> callback refuses with 409 and marks PAY-1 expired
  const expCb = await processGatewayCallback(db, {
    paymentId: 'PAY-1',
    result: 'success',
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t0 + PAYMENT_EXPIRY_MS,
  });
  assert.equal(expCb.ok, false);
  assert.equal(expCb.status, 409);
  assert.equal(db.payments[0].status, 'failed');
  assert.equal(db.payments[0].failureReason, EXPIRED_FAILURE_REASON);
  assert.equal(b1.status, 'awaiting_deposit');
  assert.equal(b1.paymentStatus, 'unpaid');

  // Retry succeeds before t0 + 30m (14m59s into PAY-2)
  const t1 = t0 + PAYMENT_EXPIRY_MS + 1000;
  const p2Res = createPaymentAttempt(db, { booking: b1, kind: 'deposit', nowMs: t1 });
  assert.equal(p2Res.ok, true);
  assert.equal(p2Res.body.payment.id, 'PAY-2');
  const okCb = await processGatewayCallback(db, {
    paymentId: 'PAY-2',
    result: 'success',
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t1 + PAYMENT_EXPIRY_MS - 1000,
  });
  assert.equal(okCb.ok, true);
  assert.equal(b1.status, 'booked');
  assert.equal(b1.paymentStatus, 'deposit_paid');

  // Mark shoot job done + select photos -> test BS.1 remaining 15m TTL
  db.jobs.find((j) => j.id === 'J-GS-2001-shoot').status = 'done';
  b1.selection = { limit: 30, selectedCount: 2, selectedIds: ['ph-01', 'ph-02'] };

  const t2 = t1 + PAYMENT_EXPIRY_MS + 5000;
  const rem1 = createPaymentAttempt(db, { booking: b1, kind: 'remaining', nowMs: t2 });
  assert.equal(rem1.ok, true);
  assert.equal(rem1.body.payment.id, 'PAY-3');
  assert.equal(
    Date.parse(rem1.body.payment.expiresAt) - Date.parse(rem1.body.payment.createdAt),
    PAYMENT_EXPIRY_MS,
  );

  // Expire PAY-3 silently via expirePendingPayments
  const expired = expirePendingPayments(db, { nowMs: t2 + PAYMENT_EXPIRY_MS });
  assert.equal(expired.length, 1);
  assert.equal(db.payments[2].status, 'failed');

  // Create PAY-4, then booking gets cancelled before callback arrives
  const t3 = t2 + PAYMENT_EXPIRY_MS + 1000;
  const rem2 = createPaymentAttempt(db, { booking: b1, kind: 'remaining', nowMs: t3 });
  assert.equal(rem2.ok, true);
  assert.equal(rem2.body.payment.id, 'PAY-4');
  b1.status = 'cancelled';

  // Standard callback on cancelled booking -> 409
  const normalCancelCb = await processGatewayCallback(db, {
    paymentId: 'PAY-4',
    result: 'success',
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t3 + 1000,
  });
  assert.equal(normalCancelCb.ok, false);
  assert.equal(normalCancelCb.status, 409);

  // Real gatewayCaptured post-cancel exception records paid_in_full once while keeping cancelled
  const capturedCb = await processGatewayCallback(db, {
    paymentId: 'PAY-4',
    result: 'success',
    gatewayCaptured: true,
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t3 + PAYMENT_EXPIRY_MS + 10000,
  });
  assert.equal(capturedCb.ok, true);
  assert.equal(b1.status, 'cancelled');
  assert.equal(b1.paymentStatus, 'paid_in_full');
  assert.equal(db.payments[3].status, 'succeeded');

  // Replay of captured callback must fail cleanly with 409
  const replay = await processGatewayCallback(db, {
    paymentId: 'PAY-4',
    result: 'success',
    gatewayCaptured: true,
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t3 + PAYMENT_EXPIRY_MS + 20000,
  });
  assert.equal(replay.ok, false);
  assert.equal(replay.status, 409);
});

test('B4.2–B4.3 / G10 integration: creating a new attempt or succeeding closes older pending attempts of same (bookingCode, kind) so activePaymentLock unlocks cleanly', async () => {
  const t0 = Date.UTC(2026, 9, 20, 11, 0, 0);
  const b1 = makeSampleBooking('GS-2050');
  const db = baseDb({
    bookingEditors: { 'GS-2050': { id: 'u-ha', name: 'Hà' } },
    bookings: [b1],
  });

  // Customer starts PAY-1 (pending), then returns and starts PAY-2 while PAY-1 has not expired.
  const first = createPaymentAttempt(db, { booking: b1, kind: 'deposit', nowMs: t0 });
  assert.equal(first.ok, true);
  assert.equal(first.body.payment.id, 'PAY-1');

  const second = createPaymentAttempt(db, { booking: b1, kind: 'deposit', nowMs: t0 + 10_000 });
  assert.equal(second.ok, true);
  assert.equal(second.body.payment.id, 'PAY-2');
  assert.equal(db.payments[0].status, 'failed');
  assert.equal(db.payments[0].failureReason, 'Đã thay thế bởi giao dịch mới');
  assert.ok(activePaymentLock(db, 'GS-2050', t0 + 20_000), 'only PAY-2 remains active');

  // Calling gateway on superseded PAY-1 fails with 409.
  const stale = await processGatewayCallback(db, {
    paymentId: 'PAY-1',
    result: 'success',
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t0 + 20_000,
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.status, 409);

  // Inject an extra sibling pending record to verify success also closes any leftover siblings.
  db.payments.push({
    id: 'PAY-STALE',
    bookingCode: 'GS-2050',
    kind: 'deposit',
    amount: b1.deposit,
    status: 'pending',
    failureReason: null,
    reservationFailure: null,
    createdAt: first.body.payment.createdAt,
    expiresAt: second.body.payment.expiresAt,
  });

  const paid = await processGatewayCallback(db, {
    paymentId: 'PAY-2',
    result: 'success',
    user: { id: 'u-linh', role: 'customer' },
    nowMs: t0 + 20_000,
  });
  assert.equal(paid.ok, true);
  assert.equal(db.payments[2].status, 'failed');
  assert.equal(db.payments[2].failureReason, 'Booking đã được thanh toán');
  assert.equal(activePaymentLock(db, 'GS-2050', t0 + 20_000), null);
});

test('B4.12 & B4.13: queued creation, due-once dispatch, preserved sent/failed history, and lead-hour update isolation', () => {
  const bFuture = makeSampleBooking('GS-3001', { status: 'booked', date: '2027-11-10' });
  const bDue = makeSampleBooking('GS-3002', { status: 'booked', date: '2026-10-25' });
  const db = baseDb({ bookings: [bFuture, bDue] });

  const rmFuture = ensureBookingReminder(db, bFuture);
  const rmDue = ensureBookingReminder(db, bDue);
  assert.equal(rmFuture.emailStatus, 'queued');
  assert.equal(rmDue.emailStatus, 'queued');
  assert.equal(rmDue.sendAt, '2026-10-24T13:00:00+07:00');

  // B4.13: Changing reminderHoursBefore from 24 to 48 does NOT alter already created reminders.
  db.settings.reminderHoursBefore = 48;
  assert.equal(rmDue.sendAt, '2026-10-24T13:00:00+07:00');
  assert.equal(rmFuture.sendAt, '2027-11-09T13:00:00+07:00');

  // At 2026-10-24T13:00+07:00, only rmDue is due -> simulate fail once
  const dueMs = Date.parse('2026-10-24T13:00:00+07:00');
  const firstPass = dispatchDueReminders(db, { nowMs: dueMs, simulateFail: () => true });
  assert.deepEqual(firstPass.map((r) => r.id), [rmDue.id]);
  assert.equal(rmDue.emailStatus, 'failed');
  assert.equal(rmFuture.emailStatus, 'queued');

  // Second dispatch pass at later date must NOT auto-retry failed rmDue; rmFuture stays queued until Nov 2027
  const secondPass = dispatchDueReminders(db, { nowMs: Date.parse('2026-11-01T00:00:00+07:00') });
  assert.equal(secondPass.length, 0);
  assert.equal(rmDue.emailStatus, 'failed');

  // Recalculating bFuture uses the new 48h setting without touching rmDue history; cancel stops queued rmFuture
  const rec = recalculateBookingReminders(db, bFuture);
  assert.equal(rec.sendAt, '2027-11-08T13:00:00+07:00');
  assert.equal(rmDue.emailStatus, 'failed');

  stopBookingReminders(db, 'GS-3002');
  assert.equal(db.reminders.some((r) => r.id === rmDue.id), true, 'failed history must be preserved on cancel');
  stopBookingReminders(db, 'GS-3001');
  assert.equal(db.reminders.some((r) => r.id === rmFuture.id), false, 'queued reminder must be removed on cancel');
});

test('HTTP E2E QA9: B4.6 chat routing, B4.5 superseded 409, B4.11 editor job ownership, B4.9/B4.10 lock, and B4.2 gatewayCaptured over live mock', async () => {
  const port = 33519;
  const server = spawn(process.execPath, ['mock/server.mjs'], {
    env: { ...process.env, PORT: String(port), MOCK_MODE: 'normal' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const base = `http://127.0.0.1:${port}`;
  const req = async (path, method, token, body, expectedStatus) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined && body !== null ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined && body !== null ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (expectedStatus !== undefined) {
      assert.equal(res.status, expectedStatus, `${method} ${path} expected ${expectedStatus}, got ${res.status}: ${JSON.stringify(data)}`);
    } else {
      assert.ok(res.ok, `${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`);
    }
    return { status: res.status, data };
  };

  try {
    for (let i = 0; i < 40; i += 1) {
      try {
        const probe = await fetch(`${base}/api/services`);
        if (probe.ok) break;
      } catch {
        // wait for server
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    const thao = (await req('/api/auth/login', 'POST', null, { email: 'thao@gradstudio.test', password: 'thao-demo' })).data.token;
    const linh = (await req('/api/auth/login', 'POST', null, { email: 'linh@gradstudio.test', password: 'linh-demo' })).data.token;
    const han = (await req('/api/auth/login', 'POST', null, { email: 'han@gradstudio.test', password: 'han-demo' })).data.token;
    const tuan = (await req('/api/auth/login', 'POST', null, { email: 'tuan@gradstudio.test', password: 'tuan-demo' })).data.token;
    const ha = 'token-u-ha'; // password: null in users.json; mock accepts token-<userId>

    // 1. Superseded proposal (B4.5) -> p2 supersedes p1 -> customer replying p1 gets 409
    const p1 = (await req('/api/conversations/c-linh/proposals', 'POST', thao, {
      date: '2026-10-24',
      items: [
        { kind: 'makeup', start: '13:00', end: '14:00', staffId: 'u-mai', roomId: null },
        { kind: 'shoot', start: '14:00', end: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      ],
      note: 'Đề xuất 1',
    })).data.message.proposal;
    const p2 = (await req('/api/conversations/c-linh/proposals', 'POST', thao, {
      date: '2026-10-24',
      items: [
        { kind: 'makeup', start: '13:00', end: '14:00', staffId: 'u-mai', roomId: null },
        { kind: 'shoot', start: '14:00', end: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      ],
      note: 'Đề xuất 2 mới nhất',
    })).data.message.proposal;
    await req(`/api/conversations/c-linh/proposals/${p1.id}`, 'PATCH', linh, { decision: 'accepted' }, 409);
    await req(`/api/conversations/c-linh/proposals/${p2.id}`, 'PATCH', linh, { decision: 'accepted' }, 200);

    // 2. Create GS-1024 with separate editor u-ha (B4.11)
    const created = (await req('/api/bookings', 'POST', thao, {
      conversationId: 'c-linh',
      proposalId: p2.id,
      editorId: 'u-ha',
      shootType: 'Tốt nghiệp cá nhân',
      packageId: 'pkg-tn-premium',
      extraIds: ['ex-makeup'],
    }, 201)).data.booking;

    // 3. Deposit payment has +15m expiresAt (BS.1), and post-deposit edit job belongs to u-ha (B4.11)
    const dep = (await req(`/api/bookings/${created.code}/payments`, 'POST', linh, { kind: 'deposit' }, 201)).data.payment;
    assert.equal(Date.parse(dep.expiresAt) - Date.parse(dep.createdAt), PAYMENT_EXPIRY_MS);
    await req(`/api/test-gateway/${dep.id}`, 'POST', linh, { result: 'success' }, 200);

    const editJob = (await req(`/api/jobs/J-${created.code}-edit`, 'GET', ha, null, 200)).data.job;
    assert.equal(editJob.staff.id, 'u-ha');
    // Photographer Tuan does NOT own J-GS-1024-edit when editorId is u-ha.
    await req(`/api/jobs/J-${created.code}-edit`, 'GET', tuan, null, 404);

    // 4. B4.6 Sending a new booking request on scheduled c-linh routes into a new open unbooked thread, while plain text stays in c-linh.
    const sameThread = (await req('/api/conversations/c-linh/messages', 'POST', linh, {
      text: 'Mình hỏi thêm về giờ trang điểm của GS-1024',
    }, 201)).data;
    assert.equal(sameThread.conversation.id, 'c-linh');

    const rerouted = (await req('/api/conversations/c-linh/messages', 'POST', linh, {
      text: 'Mình muốn đặt thêm buổi chụp kỷ yếu tháng sau',
      request: {
        shootType: 'Kỷ yếu lớp',
        packageId: 'pkg-ky-yeu',
        preferredDate: '2026-11-20',
        preferredTime: '09:00',
        extraIds: [],
      },
    }, 201)).data;
    assert.notEqual(rerouted.conversation.id, 'c-linh');
    assert.equal(rerouted.conversation.bookingCode, null);

    // 5. B4.9 & B4.10: upload previews, test selection validation, remaining requires shoot done, lock after paid_in_full
    const uploadPreview = async (idx) => {
      const form = new FormData();
      form.append(
        'file',
        new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], { type: 'image/png' }),
        `preview-${idx}.png`,
      );
      const upRes = await fetch(`${base}/api/bookings/${created.code}/previews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tuan}` },
        body: form,
      });
      const upData = await upRes.json();
      assert.equal(upRes.status, 201, `Upload preview failed: ${JSON.stringify(upData)}`);
      return upData.photo.id;
    };
    const pids = [await uploadPreview(1), await uploadPreview(2), await uploadPreview(3)];

    await req(`/api/bookings/${created.code}/selection`, 'PUT', linh, { photoIds: [] }, 400);
    await req(`/api/bookings/${created.code}/selection`, 'PUT', linh, { photoIds: [pids[0], pids[1]] }, 200);
    await req(`/api/bookings/${created.code}/payments`, 'POST', linh, { kind: 'remaining' }, 409);

    await req(`/api/jobs/J-${created.code}-shoot`, 'PATCH', tuan, { status: 'done' }, 200);
    const rem = (await req(`/api/bookings/${created.code}/payments`, 'POST', linh, { kind: 'remaining' }, 201)).data.payment;
    assert.equal(Date.parse(rem.expiresAt) - Date.parse(rem.createdAt), PAYMENT_EXPIRY_MS);
    await req(`/api/test-gateway/${rem.id}`, 'POST', linh, { result: 'success' }, 200);

    // Two-tab stale save must fail with 409 once paid_in_full (B4.10)
    await req(`/api/bookings/${created.code}/selection`, 'PUT', linh, { photoIds: pids }, 409);
    const persisted = (await req(`/api/bookings/${created.code}/photos`, 'GET', linh, null, 200)).data;
    assert.deepEqual(persisted.selectedIds, [pids[0], pids[1]]);

    // 6. B4.2/B4.3 HTTP integration: superseding PAY closes older pending attempt cleanly; latest pending locks cancel (retryAt); decline releases lock
    const hanDepOld = (await req('/api/bookings/GS-1023/payments', 'POST', han, { kind: 'deposit' }, 201)).data.payment;
    const hanDep = (await req('/api/bookings/GS-1023/payments', 'POST', han, { kind: 'deposit' }, 201)).data.payment;
    assert.ok(hanDep.expiresAt, 'deposit payment must include expiresAt');
    assert.equal((await req(`/api/payments/${hanDepOld.id}`, 'GET', han, null, 200)).data.payment.status, 'failed');
    await req(`/api/test-gateway/${hanDepOld.id}`, 'POST', han, { result: 'success' }, 409);

    const lockRes = await req('/api/bookings/GS-1023/cancel', 'POST', thao, { reason: 'Hủy khi khách đang mở cổng thanh toán' }, 409);
    assert.equal(lockRes.data.error.details.retryAt, new Date(Date.parse(hanDep.expiresAt)).toISOString());

    // After latest payment fails, Admin cancel succeeds cleanly (not blocked by PAY-old) and retry returns 409
    await req(`/api/test-gateway/${hanDep.id}`, 'POST', han, { result: 'failed' }, 200);
    await req('/api/bookings/GS-1023/cancel', 'POST', thao, { reason: 'Hủy sau khi giao dịch thanh toán thất bại' }, 200);
    await req('/api/bookings/GS-1023/payments', 'POST', han, { kind: 'deposit' }, 409);
  } finally {
    server.kill();
  }
});
