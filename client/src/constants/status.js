// Single source of truth for mapping API status codes and formatting VND money / dates.

export const CONVERSATION_STATUS = {
  unanswered: 'Chưa trả lời',
  consulting: 'Đang tư vấn',
  scheduled: 'Đã chốt lịch',
  done: 'Hoàn thành',
};

export const BOOKING_STATUS = {
  awaiting_deposit: 'Chờ cọc 30%',
  booked: 'Đã đặt lịch',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const PAYMENT_STATUS = {
  unpaid: 'Chưa cọc',
  deposit_paid: 'Đã cọc 30%',
  paid_in_full: 'Đã thanh toán đủ',
};

export const PAYMENT_ITEM_STATUS = {
  pending: 'Đang chờ thanh toán',
  succeeded: 'Thành công',
  failed: 'Thất bại',
};

export const PROPOSAL_STATUS = {
  pending: 'Chờ khách trả lời',
  accepted: 'Khách đã đồng ý',
  declined: 'Khách đã từ chối',
};

export const JOB_STATUS = {
  todo: 'Sắp tới',
  in_progress: 'Đang làm',
  done: 'Đã xong',
};

export const JOB_KIND = {
  makeup: 'Makeup',
  shoot: 'Chụp ảnh',
  edit: 'Chỉnh ảnh',
};

export const REMINDER_EMAIL_STATUS = {
  queued: 'Chờ gửi',
  sent: 'Đã gửi',
  failed: 'Gửi lỗi',
};

const WEEKDAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function getStatusLabel(map, code) {
  if (!code) return '';
  return (map && map[code]) || code;
}

/**
 * Formats integer VND amounts like 1800000 -> "1.800.000đ".
 */
export function formatMoney(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '0đ';
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(num))}đ`;
}

/**
 * Formats YYYY-MM-DD dates like "2026-10-24" -> "Thứ Bảy, 24/10/2026".
 */
export function formatDate(isoDate) {
  if (typeof isoDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || '';
  }
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = WEEKDAYS_VI[dt.getUTCDay()];
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${weekday}, ${dd}/${mm}/${y}`;
}
