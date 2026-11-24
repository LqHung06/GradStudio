import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  BOOKING_STATUS,
  JOB_KIND,
  PAYMENT_STATUS,
  formatDate,
  getStatusLabel,
} from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

export function MyBookingsPage() {
  const { data, error, loading, reload } = useFetch('/api/bookings');
  const [statusFilter, setStatusFilter] = useState('');

  const bookings = data?.bookings || [];
  const visibleBookings = statusFilter
    ? bookings.filter((b) => b.status === statusFilter)
    : bookings;

  return (
    <Layout>
      <div className="section-header-row">
        <div>
          <p className="section-eyebrow">Tài khoản khách hàng</p>
          <h1>Lịch chụp của tôi</h1>
        </div>
        <Link className="button button-outline" to="/chat">
          Chat với studio
        </Link>
      </div>

      {data && bookings.length > 0 && (
        <div className="catalog-filters" role="group" aria-label="Lọc lịch chụp theo trạng thái">
          <button
            type="button"
            className="catalog-filter-btn"
            aria-pressed={statusFilter === ''}
            onClick={() => setStatusFilter('')}
          >
            Tất cả ({bookings.length})
          </button>
          {Object.entries(BOOKING_STATUS).map(([code, label]) => (
            <button
              key={code}
              type="button"
              className="catalog-filter-btn"
              aria-pressed={statusFilter === code}
              onClick={() => setStatusFilter(code)}
            >
              {label} ({bookings.filter((b) => b.status === code).length})
            </button>
          ))}
        </div>
      )}

      <AsyncState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={visibleBookings.length === 0}
        emptyMessage={
          statusFilter
            ? 'Không có lịch chụp nào ở trạng thái này.'
            : 'Bạn chưa có lịch chụp nào. Hãy nhắn tin với studio để tư vấn và chốt lịch.'
        }
      >
        <ul className="booking-list">
          {visibleBookings.map((booking) => {
            const paidButClashed =
              booking.status === 'awaiting_deposit' && booking.paymentStatus === 'deposit_paid';

            return (
              <li key={booking.code} className="catalog-card">
                <div className="booking-card-top">
                  <div>
                    <p className="section-eyebrow">{booking.serviceName}</p>
                    <h2>
                      <Link
                        className="booking-code-link"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        {booking.code} · {booking.package.name}
                      </Link>
                    </h2>
                  </div>
                  <div className="booking-badge-row">
                    <StatusBadge map={BOOKING_STATUS} status={booking.status} />
                    <StatusBadge map={PAYMENT_STATUS} status={booking.paymentStatus} />
                  </div>
                </div>

                <p>
                  <strong>Loại chụp:</strong> {booking.shootType} ·{' '}
                  <strong>Ngày chụp:</strong>{' '}
                  <time dateTime={booking.date}>{formatDate(booking.date)}</time>
                </p>

                {Array.isArray(booking.items) && booking.items.length > 0 && (
                  <ul className="catalog-meta-list">
                    {booking.items.map((item, idx) => (
                      <li key={idx}>
                        <strong>{getStatusLabel(JOB_KIND, item.kind)}</strong>: {item.start}–{item.end} ·{' '}
                        {item.staff.name}
                        {item.room ? ` · ${item.room.name}` : ''}
                      </li>
                    ))}
                  </ul>
                )}

                <dl className="booking-amounts-row">
                  <div>
                    <dt>Giá trọn gói</dt>
                    <dd>
                      <Money amount={booking.price} />
                    </dd>
                  </div>
                  <div>
                    <dt>Cọc 30%</dt>
                    <dd>
                      <Money amount={booking.deposit} />
                    </dd>
                  </div>
                  <div>
                    <dt>Còn lại 70%</dt>
                    <dd>
                      <Money amount={booking.remaining} />
                    </dd>
                  </div>
                </dl>

                {paidButClashed && (
                  <p className="booking-warning-note">
                    Đã nhận cọc 30% nhưng khung giờ bị trùng nên lịch chưa được giữ. Vui lòng nhắn studio để xử lý.
                  </p>
                )}

                {booking.status === 'cancelled' && (
                  <p className="booking-muted-note">
                    Booking đã hủy. Lịch sử và số tiền đã thu (nếu có) vẫn được giữ nguyên.
                  </p>
                )}

                <div className="catalog-card-actions">
                  <Link
                    className="button button-dark"
                    to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                  >
                    Xem chi tiết
                  </Link>
                  {(booking.status === 'booked' || booking.status === 'completed') && (
                    <Link
                      className="button button-outline"
                      to={`/my-bookings/${encodeURIComponent(booking.code)}/gallery`}
                    >
                      Gallery &amp; chọn ảnh
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </AsyncState>
    </Layout>
  );
}
