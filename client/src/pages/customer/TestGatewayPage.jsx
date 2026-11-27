import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { PAYMENT_ITEM_STATUS } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

function formatDateTimeVi(iso) {
  const m = typeof iso === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[4]} ngày ${m[3]}/${m[2]}/${m[1]}` : iso || '';
}

export function TestGatewayPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const paymentReq = useFetch(paymentId ? `/api/payments/${encodeURIComponent(paymentId)}` : null);
  const payment = paymentReq.data?.payment || null;
  const booking = paymentReq.data?.booking || null;
  const isNotFound = paymentReq.error?.status === 404;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const submittingRef = useRef(false);

  async function handleSubmitResult(result) {
    if (!payment || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetch(`/api/test-gateway/${encodeURIComponent(payment.id)}`, {
        method: 'POST',
        body: { result },
      });
      navigate(res.redirectUrl);
    } catch (err) {
      setSubmitError(err?.message || 'Không thể xử lý giao dịch thử nghiệm, vui lòng thử lại.');
      paymentReq.reload();
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <nav className="breadcrumb-nav" aria-label="Đường dẫn">
        <Link className="text-link" to="/my-bookings">
          ← Quay lại Lịch chụp của tôi
        </Link>
      </nav>

      {isNotFound ? (
        <section className="not-found-shell" aria-labelledby="gateway-missing-heading">
          <h1 id="gateway-missing-heading">Không tìm thấy giao dịch {paymentId}</h1>
          <p>
            Giao dịch {paymentId} chưa tồn tại hoặc không thuộc tài khoản của bạn. Hãy bắt đầu thanh toán từ màn chi tiết lịch chụp.
          </p>
          <Link className="button button-dark" to="/my-bookings">
            Về Lịch chụp của tôi
          </Link>
        </section>
      ) : (
        <article className="package-detail-card gateway-card" aria-labelledby="gateway-heading">
          <header className="package-detail-header">
            <p className="section-eyebrow">Mô phỏng thanh toán trực tuyến (PA#3)</p>
            <h1 id="gateway-heading">Cổng thanh toán thử nghiệm</h1>
          </header>

          <p className="chat-hold-notice">
            Đây là trang thanh toán thử nghiệm dùng cho PA#3, không phát sinh giao dịch thật. Chọn một kết quả bên dưới để kiểm tra luồng xác nhận lịch.
          </p>

          <AsyncState
            loading={paymentReq.loading}
            error={paymentReq.error}
            onRetry={paymentReq.reload}
            isEmpty={!payment}
            emptyMessage="Không có thông tin giao dịch."
          >
            {payment && (
              <>
                <dl className="package-summary-grid">
                  <div className="package-summary-item">
                    <dt>Mã giao dịch</dt>
                    <dd>{payment.id}</dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Mã booking</dt>
                    <dd>{payment.bookingCode}</dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Khoản thanh toán</dt>
                    <dd>
                      {payment.kind === 'deposit' ? 'Đặt cọc 30%' : 'Thanh toán 70% còn lại'}
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Số tiền</dt>
                    <dd>
                      <Money amount={payment.amount} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Trạng thái giao dịch</dt>
                    <dd>
                      <StatusBadge map={PAYMENT_ITEM_STATUS} status={payment.status} />
                    </dd>
                  </div>
                  {payment.expiresAt && (
                    <div className="package-summary-item">
                      <dt>Hết hạn giao dịch</dt>
                      <dd>{formatDateTimeVi(payment.expiresAt)}</dd>
                    </div>
                  )}
                </dl>

                {submitError && (
                  <p className="form-alert" role="alert">
                    {submitError}
                  </p>
                )}

                {payment.status === 'pending' ? (
                  <div className="catalog-card-actions">
                    <button
                      type="button"
                      className="button button-coral"
                      disabled={submitting}
                      onClick={() => handleSubmitResult('success')}
                    >
                      {submitting ? 'Đang xử lý…' : 'Thanh toán thành công (thử nghiệm)'}
                    </button>
                    <button
                      type="button"
                      className="button button-outline"
                      disabled={submitting}
                      onClick={() => handleSubmitResult('failed')}
                    >
                      Thanh toán thất bại (thử nghiệm)
                    </button>
                  </div>
                ) : (
                  <div className="payment-muted-box">
                    <p>
                      Giao dịch {payment.id} cho booking {booking?.code || payment.bookingCode} không còn ở trạng thái chờ thanh toán
                      {payment.failureReason ? `: ${payment.failureReason}.` : '.'}
                    </p>
                    <Link
                      className="button button-dark"
                      to={`/payments/${encodeURIComponent(payment.id)}/result`}
                    >
                      Xem kết quả thanh toán
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
