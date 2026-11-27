// Payment business rules (B4.1, B4.2, B4.3, BS.1, R08, R09, R19) — owner TV2.

import { isoFromMs } from './time.mjs';
import { confirmBookingReservation } from './booking-confirmation.mjs';

export const PAYMENT_EXPIRY_MINUTES = 15;
export const PAYMENT_EXPIRY_MS = PAYMENT_EXPIRY_MINUTES * 60 * 1000;
export const EXPIRED_FAILURE_REASON = 'Giao dịch đã hết hạn (quá 15 phút)';

function failResult(status, code, message, fields = {}, details = null) {
  return { ok: false, status, code, message, fields, details };
}

export function areShootJobsDone(db, bookingCode) {
  const shootJobs = (db.jobs || []).filter(
    (j) => j.bookingCode === bookingCode && j.kind === 'shoot',
  );
  return shootJobs.length > 0 && shootJobs.every((j) => j.status === 'done');
}

export function isPaymentExpired(payment, nowMs = Date.now()) {
  if (!payment || payment.status !== 'pending' || !payment.expiresAt) return false;
  const expiresMs = Date.parse(payment.expiresAt);
  return Number.isFinite(expiresMs) && nowMs >= expiresMs;
}

/**
 * Transitions overdue pending payments (now >= expiresAt) to failed so expired attempts
 * cannot be completed through the normal gateway flow and retries can start cleanly.
 */
export function expirePendingPayments(db, { nowMs = Date.now(), bookingCode = null } = {}) {
  const expired = [];
  for (const payment of db.payments || []) {
    if (bookingCode && payment.bookingCode !== bookingCode) continue;
    if (isPaymentExpired(payment, nowMs)) {
      payment.status = 'failed';
      payment.failureReason = EXPIRED_FAILURE_REASON;
      payment.reservationFailure = null;
      expired.push(payment);
    }
  }
  return expired;
}

export function createPaymentAttempt(db, { booking, kind, nowMs = Date.now() }) {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return failResult(409, 'CONFLICT', 'Trạng thái booking hiện tại không thể thanh toán');
  }

  // Expire overdue pending attempts on this booking before deciding eligibility.
  expirePendingPayments(db, { nowMs, bookingCode: booking.code });

  let amount;
  if (kind === 'deposit') {
    if (booking.paymentStatus !== 'unpaid' || booking.status !== 'awaiting_deposit') {
      return failResult(409, 'CONFLICT', 'Booking này đã đặt cọc rồi');
    }
    amount = booking.deposit;
  } else {
    if (booking.paymentStatus === 'paid_in_full') {
      return failResult(409, 'CONFLICT', 'Booking này đã thanh toán đủ');
    }
    if (booking.status !== 'booked' || booking.paymentStatus !== 'deposit_paid') {
      return failResult(409, 'CONFLICT', 'Booking chưa đặt cọc nên chưa thể thanh toán phần còn lại');
    }
    if (!areShootJobsDone(db, booking.code)) {
      return failResult(409, 'CONFLICT', 'Chỉ có thể thanh toán 70% còn lại sau khi buổi chụp đã hoàn thành');
    }
    if (!booking.selection || booking.selection.selectedCount <= 0) {
      return failResult(409, 'CONFLICT', 'Vui lòng chọn và lưu danh sách ảnh trước khi thanh toán 70% còn lại');
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
    createdAt: isoFromMs(nowMs),
    expiresAt: isoFromMs(nowMs + PAYMENT_EXPIRY_MS),
  };
  db.payments.push(payment);

  return {
    ok: true,
    status: 201,
    body: {
      payment,
      redirectUrl: `/test-gateway/${payment.id}`,
    },
  };
}

export function getPaymentDetails(db, { paymentId, user, nowMs = Date.now() }) {
  const payment = (db.payments || []).find((p) => p.id === paymentId);
  if (!payment) return failResult(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');

  const booking = (db.bookings || []).find((b) => b.code === payment.bookingCode);
  if (!booking) return failResult(404, 'NOT_FOUND', 'Không tìm thấy booking');
  if (user.role === 'customer' && booking.customer?.id !== user.id) {
    return failResult(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');
  }

  expirePendingPayments(db, { nowMs, bookingCode: booking.code });

  return {
    ok: true,
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
}

export async function processGatewayCallback(
  db,
  { paymentId, result, gatewayCaptured = false, user, nowMs = Date.now(), checkClashFn },
) {
  const payment = (db.payments || []).find((p) => p.id === paymentId);
  if (!payment) return failResult(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');

  const booking = (db.bookings || []).find((b) => b.code === payment.bookingCode);
  if (!booking || booking.customer?.id !== user.id) {
    return failResult(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');
  }

  const expiredNow = expirePendingPayments(db, { nowMs, bookingCode: booking.code });
  const wasJustExpired = expiredNow.includes(payment);
  const wasPreviouslyExpired =
    payment.status === 'failed' && payment.failureReason === EXPIRED_FAILURE_REASON;

  // B4.2 late real-gateway capture reconciliation exception on cancelled bookings:
  // If the gateway really captured money right around/after cancel, record paid amount once
  // for reconciliation while keeping booking.status === 'cancelled' and creating no jobs/reminders.
  const isEligibleLateCapture =
    result === 'success' &&
    gatewayCaptured === true &&
    booking.status === 'cancelled' &&
    (payment.status === 'pending' || wasJustExpired || wasPreviouslyExpired);

  if (isEligibleLateCapture) {
    if (payment.kind === 'deposit' && booking.paymentStatus !== 'unpaid') {
      return failResult(409, 'CONFLICT', 'Khoản đặt cọc của booking này đã được ghi nhận trước đó');
    }
    if (payment.kind === 'remaining' && booking.paymentStatus !== 'deposit_paid') {
      return failResult(409, 'CONFLICT', 'Khoản thanh toán còn lại của booking này đã được ghi nhận hoặc không hợp lệ');
    }
    payment.status = 'succeeded';
    payment.failureReason = null;
    payment.reservationFailure = null;
    booking.paymentStatus = payment.kind === 'deposit' ? 'deposit_paid' : 'paid_in_full';

    return {
      ok: true,
      status: 200,
      body: {
        redirectUrl: `/payments/${payment.id}/result`,
      },
    };
  }

  if (wasJustExpired || wasPreviouslyExpired) {
    return failResult(
      409,
      'CONFLICT',
      'Giao dịch đã hết hạn (quá 15 phút), vui lòng tạo giao dịch thanh toán mới',
    );
  }

  if (payment.status !== 'pending') {
    return failResult(409, 'CONFLICT', 'Giao dịch này đã được xử lý');
  }

  // R09 / B4.2: Standard callbacks must never resurrect a cancelled or completed booking.
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return failResult(
      409,
      'CONFLICT',
      'Booking đã bị hủy hoặc hoàn thành nên không thể áp dụng kết quả thanh toán',
    );
  }

  if (result === 'failed') {
    payment.status = 'failed';
    payment.failureReason = 'Giao dịch bị từ chối (thử nghiệm)';
    payment.reservationFailure = null;
  } else if (payment.kind === 'deposit') {
    if (booking.paymentStatus !== 'unpaid' || booking.status !== 'awaiting_deposit') {
      return failResult(409, 'CONFLICT', 'Khoản đặt cọc của booking này đã được ghi nhận trước đó');
    }
    const confirmation = await confirmBookingReservation(db, booking, { checkClashFn });
    if (!confirmation.ok) {
      // PO #8 / R08 / B2.2: Deposit is recorded, but slot is not held until admin reschedules or cancels.
      payment.status = 'succeeded';
      payment.failureReason = null;
      payment.reservationFailure = {
        message: 'Khung giờ vừa có người đặt. Studio sẽ liên hệ bạn',
        clashes: confirmation.clashes || [],
      };
      booking.paymentStatus = 'deposit_paid';
    } else {
      payment.status = 'succeeded';
      payment.failureReason = null;
      payment.reservationFailure = null;
    }
  } else {
    if (booking.status !== 'booked' || booking.paymentStatus !== 'deposit_paid') {
      return failResult(
        409,
        'CONFLICT',
        'Booking không ở trạng thái hợp lệ để ghi nhận thanh toán 70% còn lại',
      );
    }
    if (!areShootJobsDone(db, booking.code)) {
      return failResult(
        409,
        'CONFLICT',
        'Chỉ có thể thanh toán 70% còn lại sau khi buổi chụp đã hoàn thành',
      );
    }
    if (!booking.selection || booking.selection.selectedCount <= 0) {
      return failResult(
        409,
        'CONFLICT',
        'Vui lòng chọn và lưu danh sách ảnh trước khi thanh toán 70% còn lại',
      );
    }
    payment.status = 'succeeded';
    payment.failureReason = null;
    payment.reservationFailure = null;
    booking.paymentStatus = 'paid_in_full';
  }

  return {
    ok: true,
    status: 200,
    body: {
      redirectUrl: `/payments/${payment.id}/result`,
    },
  };
}
