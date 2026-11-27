import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  BOOKING_STATUS,
  PAYMENT_ITEM_STATUS,
  PAYMENT_STATUS,
} from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

function formatDateTimeVi(iso) {
  const m = typeof iso === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[4]} ngày ${m[3]}/${m[2]}/${m[1]}` : iso || '';
}

export function PaymentResultPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const paymentReq = useFetch(paymentId ? `/api/payments/${encodeURIComponent(paymentId)}` : null);
  const payment = paymentReq.data?.payment || null;
  const booking = paymentReq.data?.booking || null;
  const isNotFound = paymentReq.error?.status === 404;

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(null);
  const retryingRef = useRef(false);

  async function handleRetryPayment() {
    if (!payment || !booking || retryingRef.current) return;
    retryingRef.current = true;
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(booking.code)}/payments`, {
        method: 'POST',
        body: { kind: payment.kind },
      });
      navigate(res.redirectUrl);
    } catch (err) {
      setRetryError(err?.message || 'Không thể tạo giao dịch mới, vui lòng thử lại.');
    } finally {
      retryingRef.current = false;
      setRetrying(false);
    }
  }

  const isDepositSuccessBooked =
    payment?.status === 'succeeded' &&
    payment?.kind === 'deposit' &&
    booking?.status === 'booked';

  const isDepositSuccessCompleted =
    payment?.status === 'succeeded' &&
    payment?.kind === 'deposit' &&
    booking?.status === 'completed';

  const isDepositSuccessCancelled =
    payment?.status === 'succeeded' &&
    payment?.kind === 'deposit' &&
    booking?.status === 'cancelled';

  const isDepositPaidButClashed =
    payment?.status === 'succeeded' &&
    payment?.kind === 'deposit' &&
    booking?.status === 'awaiting_deposit';

  const isRemainingSuccess =
    payment?.status === 'succeeded' &&
    payment?.kind === 'remaining' &&
    booking?.status !== 'cancelled';

  const isRemainingSuccessCancelled =
    payment?.status === 'succeeded' &&
    payment?.kind === 'remaining' &&
    booking?.status === 'cancelled';

  const isFailed = payment?.status === 'failed';
  const isPending = payment?.status === 'pending';

  const canRetryFailed =
    isFailed &&
    booking &&
    booking.status !== 'cancelled' &&
    booking.status !== 'completed' &&
    ((payment.kind === 'deposit' && booking.paymentStatus === 'unpaid') ||
      (payment.kind === 'remaining' && booking.paymentStatus === 'deposit_paid'));

  return (
    <Layout>
      <nav className="breadcrumb-nav" aria-label="Đường dẫn">
        <Link className="text-link" to="/my-bookings">
          ← Quay lại Lịch chụp của tôi
        </Link>
      </nav>

      {isNotFound ? (
        <section className="not-found-shell" aria-labelledby="result-missing-heading">
          <h1 id="result-missing-heading">Không tìm thấy kết quả thanh toán</h1>
          <p>
            Không tìm thấy giao dịch {paymentId} hoặc giao dịch không thuộc tài khoản của bạn.
          </p>
          <Link className="button button-dark" to="/my-bookings">
            Về Lịch chụp của tôi
          </Link>
        </section>
      ) : (
        <article className="package-detail-card gateway-card" aria-labelledby="result-heading">
          <header className="package-detail-header">
            <p className="section-eyebrow">Trạng thái đọc trực tiếp từ máy chủ</p>
            <h1 id="result-heading">Kết quả thanh toán</h1>
          </header>

          <AsyncState
            loading={paymentReq.loading}
            error={paymentReq.error}
            onRetry={paymentReq.reload}
            isEmpty={!payment || !booking}
            emptyMessage="Không có thông tin kết quả thanh toán."
          >
            {payment && booking && (
              <>
                <dl className="package-summary-grid">
                  <div className="package-summary-item">
                    <dt>Mã giao dịch</dt>
                    <dd>{payment.id}</dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Mã booking</dt>
                    <dd>{booking.code}</dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Số tiền</dt>
                    <dd>
                      <Money amount={payment.amount} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Giao dịch</dt>
                    <dd>
                      <StatusBadge map={PAYMENT_ITEM_STATUS} status={payment.status} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Trạng thái booking</dt>
                    <dd>
                      <StatusBadge map={BOOKING_STATUS} status={booking.status} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Thanh toán booking</dt>
                    <dd>
                      <StatusBadge map={PAYMENT_STATUS} status={booking.paymentStatus} />
                    </dd>
                  </div>
                  {payment.expiresAt && (
                    <div className="package-summary-item">
                      <dt>Hết hạn giao dịch</dt>
                      <dd>{formatDateTimeVi(payment.expiresAt)}</dd>
                    </div>
                  )}
                </dl>

                {isDepositSuccessBooked && (
                  <div className="form-success-note" role="status">
                    <p>Đặt cọc thành công. Lịch chụp {booking.code} đã được giữ chính thức.</p>
                    <div className="catalog-card-actions">
                      <Link
                        className="button button-dark"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Xem lịch chụp
                      </Link>
                      <Link className="button button-outline" to="/notifications">
                        Xem nhắc lịch
                      </Link>
                    </div>
                  </div>
                )}

                {isDepositSuccessCompleted && (
                  <div className="form-success-note" role="status">
                    <p>
                      Khoản cọc cho booking {booking.code} đã thanh toán thành công. Lịch chụp này hiện đã hoàn thành.
                    </p>
                    <div className="catalog-card-actions">
                      <Link
                        className="button button-dark"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Xem lịch chụp
                      </Link>
                      <Link
                        className="button button-outline"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}/gallery`}
                      >
                        Xem gallery ảnh
                      </Link>
                    </div>
                  </div>
                )}

                {isDepositSuccessCancelled && (
                  <div className="payment-muted-box" role="status">
                    <p>
                      Khoản cọc (<Money amount={payment.amount} />) đã được ghi nhận để đối soát. Booking {booking.code} hiện đang ở trạng thái Đã hủy — vui lòng mở cuộc trò chuyện nếu cần đặt một lịch tư vấn mới.
                    </p>
                    <div className="catalog-card-actions">
                      <Link className="button button-coral" to="/chat">
                        Mở cuộc trò chuyện
                      </Link>
                      <Link
                        className="button button-outline"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Xem lịch sử booking
                      </Link>
                    </div>
                  </div>
                )}

                {isDepositPaidButClashed && (
                  <div className="payment-warning-box" role="alert">
                    <p>
                      <strong>
                        Đã nhận cọc (<Money amount={payment.amount} />) nhưng khung giờ đã bị chiếm. Booking vẫn Chờ cọc 30%. Vui lòng nhắn studio.
                      </strong>
                    </p>
                    {payment.reservationFailure?.message && (
                      <p>{payment.reservationFailure.message}</p>
                    )}
                    {Array.isArray(payment.reservationFailure?.clashes) &&
                      payment.reservationFailure.clashes.length > 0 && (
                        <ul className="catalog-meta-list">
                          {payment.reservationFailure.clashes.map((clash, idx) => (
                            <li key={idx}>{clash.reason}</li>
                          ))}
                        </ul>
                      )}
                    <div className="catalog-card-actions">
                      <Link className="button button-coral" to="/chat">
                        Nhắn studio trong chat
                      </Link>
                      <Link
                        className="button button-outline"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Xem chi tiết booking
                      </Link>
                    </div>
                  </div>
                )}

                {isRemainingSuccess && (
                  <div className="form-success-note" role="status">
                    <p>
                      Thanh toán 70% còn lại thành công. Booking {booking.code} đã thanh toán đủ.
                    </p>
                    <div className="catalog-card-actions">
                      <Link
                        className="button button-dark"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}/gallery`}
                      >
                        Về gallery để nhận ảnh
                      </Link>
                      <Link
                        className="button button-outline"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Xem lịch chụp
                      </Link>
                    </div>
                  </div>
                )}

                {isRemainingSuccessCancelled && (
                  <div className="payment-muted-box" role="status">
                    <p>
                      Khoản thanh toán 70% còn lại (<Money amount={payment.amount} />) đã được ghi nhận để đối soát. Booking {booking.code} hiện đang ở trạng thái Đã hủy — vui lòng mở cuộc trò chuyện hoặc xem lịch sử booking.
                    </p>
                    <div className="catalog-card-actions">
                      <Link className="button button-coral" to="/chat">
                        Mở cuộc trò chuyện
                      </Link>
                      <Link
                        className="button button-outline"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Xem lịch sử booking
                      </Link>
                    </div>
                  </div>
                )}

                {isFailed && (
                  <div className="payment-warning-box" role="alert">
                    <p>
                      <strong>
                        {payment.kind === 'deposit'
                          ? 'Thanh toán không thành công, booking vẫn chờ cọc 30%.'
                          : 'Thanh toán không thành công, booking vẫn chờ trả 70% còn lại.'}
                      </strong>
                    </p>
                    {payment.failureReason && <p>Lý do: {payment.failureReason}</p>}
                    {retryError && (
                      <p className="form-alert" role="alert">
                        {retryError}
                      </p>
                    )}
                    <div className="catalog-card-actions">
                      {canRetryFailed && (
                        <button
                          type="button"
                          className="button button-coral"
                          disabled={retrying}
                          onClick={handleRetryPayment}
                        >
                          {retrying ? 'Đang tạo giao dịch mới…' : 'Thử thanh toán lại'}
                        </button>
                      )}
                      <Link
                        className="button button-outline"
                        to={`/my-bookings/${encodeURIComponent(booking.code)}`}
                      >
                        Quay lại booking {booking.code}
                      </Link>
                    </div>
                  </div>
                )}

                {isPending && (
                  <div className="payment-muted-box">
                    <p>Giao dịch {payment.id} vẫn đang chờ xử lý tại cổng thanh toán thử nghiệm.</p>
                    <Link
                      className="button button-coral"
                      to={`/test-gateway/${encodeURIComponent(payment.id)}`}
                    >
                      Mở lại cổng thanh toán
                    </Link>
                  </div>
                )}
              </>
            )}
          </AsyncState>
        </article>
      )}
    </Layout>
  );
}
