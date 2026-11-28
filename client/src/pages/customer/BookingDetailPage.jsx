import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
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

export function BookingDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const bookingReq = useFetch(code ? `/api/bookings/${encodeURIComponent(code)}` : null);
  const booking = bookingReq.data?.booking || null;
  const isNotFound = bookingReq.error?.status === 404;

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const payingRef = useRef(false);

  async function handleStartDeposit() {
    if (!booking || payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setPayError(null);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(booking.code)}/payments`, {
        method: 'POST',
        body: { kind: 'deposit' },
      });
      navigate(res.redirectUrl);
    } catch (err) {
      setPayError(err?.message || 'Không thể khởi tạo thanh toán cọc, vui lòng thử lại.');
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  }

  const canPayDeposit =
    booking && booking.status === 'awaiting_deposit' && booking.paymentStatus === 'unpaid';
  const paidButClashed =
    booking && booking.status === 'awaiting_deposit' && booking.paymentStatus === 'deposit_paid';

  return (
    <Layout>
      <nav className="breadcrumb-nav" aria-label="Đường dẫn">
        <Link className="text-link" to="/my-bookings">
          ← Quay lại Lịch chụp của tôi
        </Link>
      </nav>

      {isNotFound ? (
        <section className="not-found-shell" aria-labelledby="booking-missing-heading">
          <h1 id="booking-missing-heading">Chưa có lịch chụp {code}</h1>
          <p>
            Chưa có lịch chụp {code}. Lịch sẽ có sau khi studio tạo booking từ cuộc trò chuyện của bạn.
          </p>
          <div className="catalog-card-actions">
            <Link className="button button-dark" to="/my-bookings">
              Về Lịch chụp của tôi
            </Link>
            <Link className="button button-outline" to="/chat">
              Mở chat với studio
            </Link>
          </div>
        </section>
      ) : (
        <article className="package-detail-card" aria-labelledby="booking-detail-title">
          <header className="package-detail-header">
            <p className="section-eyebrow">
              {booking ? booking.serviceName : 'Chi tiết lịch chụp'}
            </p>
            <h1 id="booking-detail-title">
              {booking ? `Lịch chụp ${booking.code}` : `Chi tiết lịch chụp ${code}`}
            </h1>
            {booking && (
              <div className="booking-badge-row">
                {canPayDeposit ? (
                  <span className="status-badge status-badge-warning">
                    Đã thống nhất lịch · Chờ cọc 30%
                  </span>
                ) : (
                  <StatusBadge map={BOOKING_STATUS} status={booking.status} />
                )}
                <StatusBadge map={PAYMENT_STATUS} status={booking.paymentStatus} />
              </div>
            )}
          </header>

          <AsyncState
            loading={bookingReq.loading}
            error={bookingReq.error}
            onRetry={bookingReq.reload}
            isEmpty={!booking}
            emptyMessage="Không có thông tin lịch chụp."
          >
            {booking && (
              <>
                <section aria-labelledby="booking-info-heading">
                  <h2 id="booking-info-heading">Thông tin gói chụp</h2>
                  <dl className="package-summary-grid">
                    <div className="package-summary-item">
                      <dt>Gói dịch vụ</dt>
                      <dd>{booking.package.name}</dd>
                    </div>
                    <div className="package-summary-item">
                      <dt>Loại chụp</dt>
                      <dd>{booking.shootType}</dd>
                    </div>
                    <div className="package-summary-item">
                      <dt>Thời lượng &amp; ảnh chỉnh</dt>
                      <dd>
                        {booking.package.durationHours} giờ · {booking.package.editedPhotos} ảnh chỉnh
                      </dd>
                    </div>
                    <div className="package-summary-item">
                      <dt>Dịch vụ thêm</dt>
                      <dd>
                        {Array.isArray(booking.extras) && booking.extras.length > 0
                          ? booking.extras.map((ex) => ex.name).join(', ')
                          : 'Không có'}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section aria-labelledby="booking-schedule-heading">
                  <h2 id="booking-schedule-heading">Lịch trình đã thống nhất</h2>
                  <p>
                    <strong>Ngày chụp:</strong>{' '}
                    <time dateTime={booking.date}>{formatDate(booking.date)}</time>
                  </p>
                  {booking.requestedTime && (
                    <p className="booking-muted-note">
                      Giờ mong muốn ban đầu: <del>{booking.requestedTime.start}</del>
                      {booking.requestedTime.note ? ` (${booking.requestedTime.note})` : ''}
                    </p>
                  )}
                  {Array.isArray(booking.items) && booking.items.length > 0 ? (
                    <ul className="catalog-meta-list">
                      {booking.items.map((item, idx) => (
                        <li key={idx}>
                          <strong>{getStatusLabel(JOB_KIND, item.kind)}</strong>:{' '}
                          <time dateTime={`${booking.date}T${item.start}`}>{item.start}</time>–
                          <time dateTime={`${booking.date}T${item.end}`}>{item.end}</time> · Nhân sự:{' '}
                          {item.staff.name}
                          {item.room ? ` · ${item.room.name}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Chưa có ca chụp chi tiết.</p>
                  )}
                </section>

                <section aria-labelledby="booking-payment-heading">
                  <h2 id="booking-payment-heading">Chi phí và thanh toán</h2>
                  <dl className="package-summary-grid">
                    <div className="package-summary-item">
                      <dt>Giá trọn gói</dt>
                      <dd>
                        <Money amount={booking.price} />
                      </dd>
                    </div>
                    <div className="package-summary-item">
                      <dt>Đặt cọc 30%</dt>
                      <dd>
                        <Money amount={booking.deposit} />
                      </dd>
                    </div>
                    <div className="package-summary-item">
                      <dt>Phần còn lại 70%</dt>
                      <dd>
                        <Money amount={booking.remaining} />
                      </dd>
                    </div>
                  </dl>

                  {canPayDeposit && (
                    <div className="payment-action-box">
                      <p className="chat-hold-notice">
                        Lịch chụp chưa được giữ ở bước này. Lịch chỉ được giữ chính thức sau khi đặt cọc 30% thành công và tài nguyên được kiểm tra lại.
                      </p>
                      {payError && (
                        <p className="form-alert" role="alert">
                          {payError}
                        </p>
                      )}
                      <button
                        type="button"
                        className="button button-coral"
                        disabled={paying}
                        onClick={handleStartDeposit}
                      >
                        {paying ? 'Đang chuyển tới cổng thanh toán…' : 'Thanh toán cọc 30%'}
                      </button>
                    </div>
                  )}

                  {paidButClashed && (
                    <div className="payment-warning-box" role="alert">
                      <p>
                        <strong>Đã nhận tiền cọc 30% (<Money amount={booking.deposit} />) nhưng khung giờ đã có người đặt.</strong>
                      </p>
                      <p>
                        Booking vẫn ở trạng thái Chờ cọc 30% và chưa giữ được chỗ. Bạn không cần thanh toán cọc lại — studio sẽ dời lịch trực tiếp trên booking này sang khung giờ trống khác hoặc hỗ trợ tạo yêu cầu tư vấn mới qua chat.
                      </p>
                      <Link className="button button-coral" to="/chat">
                        Nhắn studio trong chat
                      </Link>
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="payment-muted-box">
                      <p>
                        <strong>Booking này đã bị hủy.</strong> Các khoản tiền đã thanh toán trước đó (nếu có) vẫn được ghi nhận trong lịch sử. Nếu muốn đặt lại, bạn có thể tạo yêu cầu tư vấn mới hoặc xem danh sách lịch chụp của mình.
                      </p>
                      <div className="catalog-card-actions">
                        <Link className="button button-outline" to="/chat">
                          Mở cuộc trò chuyện
                        </Link>
                        <Link className="button button-dark" to="/my-bookings">
                          Xem tất cả lịch chụp
                        </Link>
                      </div>
                    </div>
                  )}

                  {(booking.status === 'booked' || booking.status === 'completed') && (
                    <div className="payment-action-box">
                      <p>
                        Tiến độ chọn ảnh:{' '}
                        <strong>
                          {booking.selection?.selectedCount ?? 0}/{booking.selection?.limit ?? booking.package.editedPhotos}
                        </strong>{' '}
                        ảnh.
                      </p>
                      {booking.finalLink && (
                        <p>
                          Link ảnh hoàn chỉnh:{' '}
                          <a
                            className="text-link"
                            href={booking.finalLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {booking.finalLink}
                          </a>
                        </p>
                      )}
                      <div className="catalog-card-actions">
                        <Link
                          className="button button-dark"
                          to={`/my-bookings/${encodeURIComponent(booking.code)}/gallery`}
                        >
                          Mở gallery chọn ảnh &amp; thanh toán 70%
                        </Link>
                        <Link className="button button-outline" to="/notifications">
                          Xem nhắc lịch
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </AsyncState>
        </article>
      )}
    </Layout>
  );
}
