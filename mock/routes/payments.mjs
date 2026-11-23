// Payment routes: docs/api/06-payments.md (owner TV2).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { nowIso } from '../lib/time.mjs';
import { ensureBookingReminder } from '../lib/reminders.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const clashFile = path.resolve(here, '..', 'lib', 'clash.mjs');

async function recheckResources(db, booking) {
  if (!fs.existsSync(clashFile)) return { available: true, clashes: [] };
  const mod = await import(pathToFileURL(clashFile).href);
  if (typeof mod.checkClash !== 'function') return { available: true, clashes: [] };
  const items = (booking.items || []).map((it) => ({
    kind: it.kind,
    start: it.start,
    end: it.end,
    staffId: it.staff?.id || null,
    roomId: it.room?.id || null,
  }));
  return mod.checkClash(db, booking.date, items, { ignoreBooking: booking.code });
}

function areShootJobsDone(db, bookingCode) {
  const shootJobs = (db.jobs || []).filter(
    (j) => j.bookingCode === bookingCode && j.kind === 'shoot',
  );
  return shootJobs.length > 0 && shootJobs.every((j) => j.status === 'done');
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
        if (!areShootJobsDone(db, booking.code)) {
          return fail(409, 'CONFLICT', 'Chỉ có thể thanh toán 70% còn lại sau khi buổi chụp đã hoàn thành');
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
        reservationFailure: null,
        createdAt: nowIso(),
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

      // R09: Re-check booking and payment state at gateway callback time.
      if (booking.status === 'cancelled' || booking.status === 'completed') {
        return fail(409, 'CONFLICT', 'Booking đã bị hủy hoặc hoàn thành nên không thể áp dụng kết quả thanh toán');
      }

      if (result === 'failed') {
        payment.status = 'failed';
        payment.failureReason = 'Giao dịch bị từ chối (thử nghiệm)';
        payment.reservationFailure = null;
      } else if (payment.kind === 'deposit') {
        if (booking.paymentStatus !== 'unpaid' || booking.status !== 'awaiting_deposit') {
          return fail(409, 'CONFLICT', 'Khoản đặt cọc của booking này đã được ghi nhận trước đó');
        }
        const clashResult = await recheckResources(db, booking);
        if (!clashResult.available) {
          // PO #8 / R08: Payment succeeded and deposit is recorded, but slot is not held.
          payment.status = 'succeeded';
          payment.failureReason = null;
          payment.reservationFailure = {
            message: 'Khung giờ vừa có người đặt. Studio sẽ liên hệ bạn',
            clashes: clashResult.clashes || [],
          };
          booking.paymentStatus = 'deposit_paid';
        } else {
          payment.status = 'succeeded';
          payment.failureReason = null;
          payment.reservationFailure = null;
          booking.status = 'booked';
          booking.paymentStatus = 'deposit_paid';
          ensureBookingJobs(db, booking);
          ensureBookingReminder(db, booking);
        }
      } else {
        if (booking.status !== 'booked' || booking.paymentStatus !== 'deposit_paid') {
          return fail(409, 'CONFLICT', 'Booking không ở trạng thái hợp lệ để ghi nhận thanh toán 70% còn lại');
        }
        if (!areShootJobsDone(db, booking.code)) {
          return fail(409, 'CONFLICT', 'Chỉ có thể thanh toán 70% còn lại sau khi buổi chụp đã hoàn thành');
        }
        if (!booking.selection || booking.selection.selectedCount <= 0) {
          return fail(409, 'CONFLICT', 'Vui lòng chọn và lưu danh sách ảnh trước khi thanh toán 70% còn lại');
        }
        payment.status = 'succeeded';
        payment.failureReason = null;
        payment.reservationFailure = null;
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
