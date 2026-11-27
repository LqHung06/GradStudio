import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  buildReminderPayload,
  ensureBookingReminder,
  recalculateBookingReminders,
  stopBookingReminders,
} from '../mock/lib/reminders.mjs';

function makeBooking(code, date = '2026-10-25', start = '13:00') {
  return {
    code,
    status: 'booked',
    date,
    items: [
      {
        kind: 'makeup',
        start,
        end: '14:00',
        staff: { id: 'u-mai', name: 'Mai' },
        room: null,
      },
    ],
  };
}

test('nextReminderId never collides after deleting an earlier queued reminder', () => {
  const db = {
    settings: { reminderHoursBefore: 24 },
    reminders: [
      {
        id: 'rm-1',
        bookingCode: 'GS-1021',
        sendAt: '2026-10-23T08:00:00+07:00',
        channels: ['email', 'account'],
        emailStatus: 'queued',
        text: 'Nhắc lịch cũ GS-1021',
      },
      {
        id: 'rm-2',
        bookingCode: 'GS-1022',
        sendAt: '2026-10-19T09:00:00+07:00',
        channels: ['email', 'account'],
        emailStatus: 'sent',
        text: 'Nhắc lịch đã gửi GS-1022',
      },
    ],
  };

  const removed = stopBookingReminders(db, 'GS-1021');
  assert.equal(removed, 1);
  assert.deepEqual(db.reminders.map((r) => r.id), ['rm-2']);

  const created = ensureBookingReminder(db, makeBooking('GS-1024', '2026-10-24', '13:00'));
  assert.equal(created.id, 'rm-3');

  const rescheduled = recalculateBookingReminders(db, makeBooking('GS-1022', '2026-10-28', '10:00'));
  assert.equal(rescheduled.id, 'rm-4');
  assert.equal(rescheduled.emailStatus, 'queued');

  const ids = db.reminders.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'all reminder IDs must be unique');
});

test('nextReminderId compares numeric suffixes (rm-10 > rm-2) and ignores malformed IDs', () => {
  const db = {
    settings: { reminderHoursBefore: 24 },
    reminders: [
      { id: 'rm-2', bookingCode: 'GS-1002', sendAt: '2026-10-10T09:00:00+07:00', channels: ['email', 'account'], emailStatus: 'sent', text: 'x' },
      { id: 'rm-10', bookingCode: 'GS-1010', sendAt: '2026-10-11T09:00:00+07:00', channels: ['email', 'account'], emailStatus: 'sent', text: 'y' },
      { id: 'custom-99', bookingCode: 'GS-1099', sendAt: '2026-10-12T09:00:00+07:00', channels: ['email', 'account'], emailStatus: 'sent', text: 'z' },
      { id: null, bookingCode: 'GS-1098', sendAt: '2026-10-12T09:00:00+07:00', channels: ['email', 'account'], emailStatus: 'sent', text: 'w' },
    ],
  };

  const next = ensureBookingReminder(db, makeBooking('GS-1024', '2026-10-24', '13:00'));
  assert.equal(next.id, 'rm-11');
});

test('buildReminderPayload handles unsorted items, null-start items, and month-boundary lead hours', () => {
  const db = { settings: { reminderHoursBefore: 48 } };
  const booking = {
    code: 'GS-1030',
    status: 'booked',
    date: '2026-11-01',
    items: [
      { kind: 'edit', start: null, end: null, staff: { id: 'u-tuan', name: 'Tuấn' }, room: null },
      { kind: 'shoot', start: '14:00', end: '16:00', staff: { id: 'u-tuan', name: 'Tuấn' }, room: { id: 'r-b', name: 'Phòng B' } },
      { kind: 'makeup', start: '09:30', end: '10:30', staff: { id: 'u-mai', name: 'Mai' }, room: null },
    ],
  };

  const payload = buildReminderPayload(db, booking);
  assert.equal(payload.sendAt, '2026-10-30T09:30:00+07:00');
  assert.deepEqual(payload.channels, ['email', 'account']);
  assert.match(payload.text, /makeup 09:30 ngày 01\/11\/2026 với Mai/);
});

test('recalculateBookingReminders stays idempotent and skips non-booked bookings', () => {
  const db = { settings: { reminderHoursBefore: 24 }, reminders: [] };
  const unpaid = { ...makeBooking('GS-1025'), status: 'awaiting_deposit' };
  assert.equal(recalculateBookingReminders(db, unpaid), null);
  assert.equal(db.reminders.length, 0);

  const booked = makeBooking('GS-1023', '2026-10-26', '09:00');
  const first = recalculateBookingReminders(db, booked);
  const second = recalculateBookingReminders(db, booked);
  assert.equal(first.id, 'rm-1');
  assert.equal(second.id, 'rm-1');
  assert.equal(db.reminders.length, 1);
});

test('HTTP E2E: deleting an earlier queued reminder via cancel never collides on subsequent reschedule/deposit', async () => {
  const port = 33509;
  const server = spawn(process.execPath, ['mock/server.mjs'], {
    env: { ...process.env, PORT: String(port), MOCK_MODE: 'normal' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const base = `http://127.0.0.1:${port}`;
  const api = async (path, method, token, body) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    assert.ok(res.ok, `${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`);
    return data;
  };

  try {
    for (let i = 0; i < 30; i += 1) {
      try {
        const probe = await fetch(`${base}/api/services`);
        if (probe.ok) break;
      } catch {
        // wait
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    const thao = (await api('/api/auth/login', 'POST', null, { email: 'thao@gradstudio.test', password: 'thao-demo' })).token;
    const han = (await api('/api/auth/login', 'POST', null, { email: 'han@gradstudio.test', password: 'han-demo' })).token;
    const linh = (await api('/api/auth/login', 'POST', null, { email: 'linh@gradstudio.test', password: 'linh-demo' })).token;

    // 1. Han deposits GS-1023 -> rm-1 (sent)
    const pay1 = (await api('/api/bookings/GS-1023/payments', 'POST', han, { kind: 'deposit' })).payment;
    await api(`/api/test-gateway/${pay1.id}`, 'POST', han, { result: 'success' });

    // 2. Admin reschedules GS-1023 -> rm-2 (queued)
    await api('/api/bookings/GS-1023', 'PATCH', thao, {
      date: '2026-10-27',
      items: [
        { kind: 'makeup', start: '13:00', end: '14:00', staffId: 'u-mai', roomId: null },
        { kind: 'shoot', start: '14:00', end: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      ],
    });

    // 3. Create & deposit GS-1024 for Linh -> rm-3 (sent)
    const p1 = (await api('/api/conversations/c-linh/proposals', 'POST', thao, {
      date: '2026-10-24',
      items: [
        { kind: 'makeup', start: '13:00', end: '14:00', staffId: 'u-mai', roomId: null },
        { kind: 'shoot', start: '14:00', end: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      ],
      note: 'Đề xuất chuẩn',
    })).message.proposal;
    await api(`/api/conversations/c-linh/proposals/${p1.id}`, 'PATCH', linh, { decision: 'accepted' });
    const b1024 = (await api('/api/bookings', 'POST', thao, {
      conversationId: 'c-linh',
      proposalId: p1.id,
      editorId: 'u-tuan',
      shootType: 'Tốt nghiệp cá nhân',
      packageId: 'pkg-tn-premium',
      extraIds: ['ex-makeup'],
    })).booking;
    const pay2 = (await api(`/api/bookings/${b1024.code}/payments`, 'POST', linh, { kind: 'deposit' })).payment;
    await api(`/api/test-gateway/${pay2.id}`, 'POST', linh, { result: 'success' });

    // 4. Cancel GS-1023 -> deletes rm-2 (queued), keeps rm-1 (sent) and rm-3 (sent). Array length is now 2!
    await api('/api/bookings/GS-1023/cancel', 'POST', thao, { reason: 'Hủy để kiểm tra không trùng ID nhắc' });

    // 5. Reschedule GS-1024 -> old length+1 bug would produce rm-3 (COLLISION with Linh's sent rm-3!). Must be rm-4!
    await api(`/api/bookings/${b1024.code}`, 'PATCH', thao, {
      date: '2026-10-28',
      items: [
        { kind: 'makeup', start: '10:00', end: '11:00', staffId: 'u-mai', roomId: null },
        { kind: 'shoot', start: '11:00', end: '13:00', staffId: 'u-tuan', roomId: 'r-b' },
      ],
    });

    const linhReminders = (await api('/api/reminders', 'GET', linh)).reminders;
    const hanReminders = (await api('/api/reminders', 'GET', han)).reminders;

    assert.deepEqual(hanReminders.map((r) => [r.id, r.emailStatus]), [['rm-1', 'sent']]);
    assert.deepEqual(linhReminders.map((r) => [r.id, r.emailStatus]), [
      ['rm-3', 'sent'],
      ['rm-4', 'queued'],
    ]);
    assert.equal(linhReminders[1].sendAt, '2026-10-27T10:00:00+07:00');
  } finally {
    server.kill();
  }
});
