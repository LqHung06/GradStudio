export function activePaymentLock(db, bookingCode, now = Date.now()) {
  const pending = (db.payments ?? []).filter((payment) =>
    payment.bookingCode === bookingCode && payment.status === 'pending');
  const deadlines = pending.map(({ expiresAt }) => Date.parse(expiresAt));
  if (deadlines.some(Number.isNaN)) {
    return { reason: 'Khách đang thanh toán. Chưa có thời điểm hết hạn giao dịch.' };
  }
  const latest = Math.max(...deadlines);
  if (latest <= now) return null;
  return { reason: 'Khách đang thanh toán. Vui lòng thử lại sau khi giao dịch hết hạn.',
    retryAt: new Date(latest).toISOString() };
}

export function rescheduleBlockedReason(db, booking) {
  if (!['awaiting_deposit', 'booked'].includes(booking.status)) return 'Booking đã hoàn thành hoặc đã hủy';
  if (booking.paymentStatus === 'paid_in_full') return 'Booking đã thanh toán đủ.';
  if ((db.jobs ?? []).some((job) => job.bookingCode === booking.code && job.kind === 'shoot'
    && ['in_progress', 'done'].includes(job.status))) return 'Việc chụp ảnh đã bắt đầu hoặc đã hoàn thành.';
  return null;
}

export function finalLinkBlockedReason(db, booking) {
  if (booking.status !== 'booked') return 'Chỉ lưu link cho booking đã đặt lịch';
  if (booking.paymentStatus !== 'paid_in_full') return 'Chờ khách thanh toán đủ trước khi lưu link.';
  const editJobs = (db.jobs ?? []).filter((job) => job.bookingCode === booking.code && job.kind === 'edit');
  if (!editJobs.length || editJobs.some((job) => job.status !== 'done')) {
    return 'Chờ việc chỉnh ảnh hoàn thành trước khi lưu link.';
  }
  return null;
}
