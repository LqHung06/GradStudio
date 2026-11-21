// Payment routes: docs/api/06-payments.md (owner TV2).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const clashFile = path.resolve(here, '..', 'lib', 'clash.mjs');

async function recheckResources(db, booking) {
  if (!fs.existsSync(clashFile)) return { available: true };
  const mod = await import(pathToFileURL(clashFile).href);
  if (typeof mod.checkClash !== 'function') return { available: true };
  const items = (booking.items || []).map((it) => ({
    kind: it.kind,
    start: it.start,
    end: it.end,
    staffId: it.staff?.id || null,
    roomId: it.room?.id || null,
  }));
  return mod.checkClash(db, booking.date, items, { ignoreBooking: booking.code });
}

function formatOffsetIso(dateStr, timeStr, hoursBefore) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  // Compute in UTC+7 by shifting 7 hours, subtracting hoursBefore, then formatting back with +07:00.
  const utcMs = Date.UTC(y, m - 1, d, hh, mm, 0) - hoursBefore * 3600 * 1000;
  const dt = new Date(utcMs);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:00+07:00`;
}

function formatDateVi(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function ensureBookingJobs(db, booking) {
  if (!Array.isArray(db.jobs)) db.jobs = [];
  const items = booking.items || [];
  for (const it of items) {
    const id = `J-${booking.code}-${it.kind}`;
    if (!db.jobs.some((j) => j.id === id)) {
      db.jobs.push({
        id,
        bookingCode: booking.code,
        kind: it.kind,
        date: booking.date,
        start: it.start,
        end: it.end,
        room: it.room || null,
        staff: it.staff,
        customer: booking.customer,
        packageName: booking.package?.name || '',
        status: 'todo',
        note: '',
        previewCount: 0,
      });
    }
  }
  const shootItem = items.find((it) => it.kind === 'shoot') || items[0];
  const editId = `J-${booking.code}-edit`;
  if (shootItem && !db.jobs.some((j) => j.id === editId)) {
    db.jobs.push({
      id: editId,
      bookingCode: booking.code,
      kind: 'edit',
      date: null,
      start: null,
      end: null,
      room: null,
      staff: shootItem.staff,
      customer: booking.customer,
      packageName: booking.package?.name || '',
      status: 'todo',
      note: '',
      previewCount: 0,
    });
  }
}

function ensureBookingReminder(db, booking) {
  if (!Array.isArray(db.reminders)) db.reminders = [];
  if (db.reminders.some((r) => r.bookingCode === booking.code)) return;
  const items = [...(booking.items || [])].sort((a, b) => a.start.localeCompare(b.start));
  const earliest = items[0];
  if (!earliest) return;
  const leadHours = Number(db.settings?.reminderHoursBefore ?? 24);
  const kindLabel = earliest.kind === 'makeup' ? 'makeup' : 'chụp ảnh';
  db.reminders.push({
    id: `rm-${db.reminders.length + 1}`,
    bookingCode: booking.code,
    sendAt: formatOffsetIso(booking.date, earliest.start, leadHours),
    channels: ['email', 'account'],
    emailStatus: 'sent',
    text: `Nhắc lịch: ${kindLabel} ${earliest.start} ngày ${formatDateVi(booking.date)} với ${earliest.staff?.name || 'studio'} tại GradStudio`,
  });
}

export default [
  {
    method: 'POST',
    path: '/api/bookings/:code/payments',
    roles: ['customer'],
    handler: ({ params, body, user, db, fail }) => {
      const kind = typeof body.kind === 'string' ? body.kind.trim() : '';
      if (kind !== 'deposit' && kind !== 'remaining') {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          kind: 'Loại thanh toán phải là deposit hoặc remaining',
        });
      }

      const booking = (db.bookings || []).find(
        (b) => b.code === params.code && b.customer?.id === user.id,
      );
      if (!booking) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

      if (booking.status === 'cancelled' || booking.status === 'completed') {
        return fail(409, 'CONFLICT', 'Trạng thái booking hiện tại không thể thanh toán');
      }

      let amount;
      if (kind === 'deposit') {
        if (booking.paymentStatus !== 'unpaid' || booking.status !== 'awaiting_deposit') {
          return fail(409, 'CONFLICT', 'Booking này đã đặt cọc rồi');
        }
        amount = booking.deposit;
      } else {
        if (booking.paymentStatus === 'paid_in_full') {
          return fail(409, 'CONFLICT', 'Booking này đã thanh toán đủ');
        }
        if (booking.status !== 'booked' || booking.paymentStatus !== 'deposit_paid') {
          return fail(409, 'CONFLICT', 'Booking chưa đặt cọc nên chưa thể thanh toán phần còn lại');
        }
        if (!booking.selection || booking.selection.selectedCount <= 0) {
          return fail(409, 'CONFLICT', 'Vui lòng chọn và lưu danh sách ảnh trước khi thanh toán 70% còn lại');
        }
        amount = booking.remaining;
      }

      if (!Array.isArray(db.payments)) db.payments = [];
      const payment = {
        id: `PAY-${db.payments.length + 1}`,
        bookingCode: booking.code,
        kind,
        amount,
        status: 'pending',
        failureReason: null,
        createdAt: new Date().toISOString(),
      };
      db.payments.push(payment);

      return {
        status: 201,
        body: {
          payment,
          redirectUrl: `/test-gateway/${payment.id}`,
        },
      };
    },
  },
  {
    method: 'GET',
    path: '/api/payments/:id',
    roles: ['customer', 'admin'],
    handler: ({ params, user, db, fail }) => {
      const payment = (db.payments || []).find((p) => p.id === params.id);
      if (!payment) return fail(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');

      const booking = (db.bookings || []).find((b) => b.code === payment.bookingCode);
      if (!booking) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');
      if (user.role === 'customer' && booking.customer?.id !== user.id) {
        return fail(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');
      }

      return {
        status: 200,
        body: {
          payment,
          booking: {
            code: booking.code,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
          },
        },
      };
    },
  },
  {
    method: 'POST',
    path: '/api/test-gateway/:paymentId',
    roles: ['customer'],
    handler: async ({ params, body, user, db, fail }) => {
      const result = typeof body.result === 'string' ? body.result.trim() : '';
      if (result !== 'success' && result !== 'failed') {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          result: 'Kết quả phải là success hoặc failed',
        });
      }

      const payment = (db.payments || []).find((p) => p.id === params.paymentId);
      if (!payment) return fail(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');

      const booking = (db.bookings || []).find((b) => b.code === payment.bookingCode);
      if (!booking || booking.customer?.id !== user.id) {
        return fail(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');
      }

      if (payment.status !== 'pending') {
        return fail(409, 'CONFLICT', 'Giao dịch này đã được xử lý');
      }

      if (result === 'failed') {
        payment.status = 'failed';
        payment.failureReason = 'Giao dịch bị từ chối (thử nghiệm)';
      } else if (payment.kind === 'deposit') {
        const clashResult = await recheckResources(db, booking);
        if (!clashResult.available) {
          payment.status = 'failed';
          payment.failureReason = 'Khung giờ vừa có người đặt. Studio sẽ liên hệ bạn';
        } else {
          payment.status = 'succeeded';
          booking.status = 'booked';
          booking.paymentStatus = 'deposit_paid';
          ensureBookingJobs(db, booking);
          ensureBookingReminder(db, booking);
        }
      } else {
        payment.status = 'succeeded';
        booking.paymentStatus = 'paid_in_full';
      }

      return {
        status: 200,
        body: {
          redirectUrl: `/payments/${payment.id}/result`,
        },
      };
    },
  },
];
