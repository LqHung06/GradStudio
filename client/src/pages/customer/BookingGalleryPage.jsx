import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { BOOKING_STATUS, PAYMENT_STATUS, formatMoney } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

export function BookingGalleryPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const bookingReq = useFetch(code ? `/api/bookings/${encodeURIComponent(code)}` : null);
  const photosReq = useFetch(code ? `/api/bookings/${encodeURIComponent(code)}/photos` : null);

  const booking = bookingReq.data?.booking || null;
  const photos = photosReq.data?.photos || [];
  const limit = photosReq.data?.limit ?? booking?.selection?.limit ?? booking?.package?.editedPhotos ?? 30;
  const savedIds = photosReq.data?.selectedIds || [];
  const isNotFound = bookingReq.error?.status === 404 || photosReq.error?.status === 404;

  const [selectedIds, setSelectedIds] = useState([]);
  const [limitNotice, setLimitNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

  const [receiving, setReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState(null);
  const [receiveSuccess, setReceiveSuccess] = useState(null);

  const savingRef = useRef(false);
  const payingRef = useRef(false);
  const receivingRef = useRef(false);

  useEffect(() => {
    if (Array.isArray(photosReq.data?.selectedIds)) {
      setSelectedIds(photosReq.data.selectedIds);
    }
  }, [photosReq.data?.selectedIds]);

  const isSelectionLocked =
    !booking ||
    booking.paymentStatus === 'paid_in_full' ||
    booking.status === 'completed' ||
    booking.status === 'cancelled' ||
    booking.status !== 'booked';

  const savedSet = new Set(savedIds);
  const hasUnsavedChanges =
    selectedIds.length !== savedIds.length ||
    selectedIds.some((id) => !savedSet.has(id));

  function handleTogglePhoto(photoId) {
    if (isSelectionLocked || saving) return;
    setSaveError(null);
    setSaveSuccess(null);
    setLimitNotice(null);

    setSelectedIds((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId);
      }
      if (prev.length >= limit) {
        setLimitNotice(`Gói cho phép tối đa ${limit} ảnh.`);
        return prev;
      }
      return [...prev, photoId];
    });
  }

  async function handleSaveSelection(event) {
    event.preventDefault();
    if (isSelectionLocked || savingRef.current) return;
    setSaveError(null);
    setSaveSuccess(null);

    if (selectedIds.length === 0) {
      setSaveError('Vui lòng chọn ít nhất 1 ảnh trước khi lưu.');
      return;
    }
    if (selectedIds.length > limit) {
      setSaveError(`Gói cho phép tối đa ${limit} ảnh.`);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(code)}/selection`, {
        method: 'PUT',
        body: { photoIds: selectedIds },
      });
      photosReq.setData((prev) =>
        prev ? { ...prev, selectedIds: res.selectedIds, limit: res.limit } : prev,
      );
      bookingReq.setData((prev) =>
        prev?.booking
          ? {
              booking: {
                ...prev.booking,
                selection: {
                  limit: res.limit,
                  selectedCount: res.selectedIds.length,
                },
              },
            }
          : prev,
      );
      setSaveSuccess(`Đã lưu lựa chọn ${res.selectedIds.length}/${res.limit} ảnh.`);
    } catch (err) {
      if (err instanceof ApiError && err.fields?.photoIds) {
        setSaveError(err.fields.photoIds);
      } else {
        setSaveError(err?.message || 'Không thể lưu lựa chọn ảnh, vui lòng thử lại.');
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function handlePayRemaining() {
    if (!booking || payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setPayError(null);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(booking.code)}/payments`, {
        method: 'POST',
        body: { kind: 'remaining' },
      });
      navigate(res.redirectUrl);
    } catch (err) {
      setPayError(err?.message || 'Không thể tạo giao dịch thanh toán 70%, vui lòng thử lại.');
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  }

  async function handleReceivePhotos() {
    if (!booking || receivingRef.current) return;
    receivingRef.current = true;
    setReceiving(true);
    setReceiveError(null);
    setReceiveSuccess(null);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(booking.code)}/receive`, {
        method: 'POST',
      });
      bookingReq.setData({ booking: res.booking });
      setReceiveSuccess('Đã xác nhận nhận ảnh hoàn chỉnh. Booking đã chuyển sang Hoàn thành.');
    } catch (err) {
      setReceiveError(err?.message || 'Không thể xác nhận nhận ảnh, vui lòng thử lại.');
    } finally {
      receivingRef.current = false;
      setReceiving(false);
    }
  }

  const savedCount = savedIds.length || booking?.selection?.selectedCount || 0;

  let payRemainingReason = '';
  if (booking) {
    if (booking.status !== 'booked') {
      payRemainingReason = 'Booking cần ở trạng thái Đã đặt lịch trước khi thanh toán phần còn lại.';
    } else if (savedCount === 0) {
      payRemainingReason = 'Lưu lựa chọn ảnh trước khi thanh toán phần còn lại.';
    } else if (hasUnsavedChanges) {
      payRemainingReason = 'Hãy bấm Lưu lựa chọn để cập nhật thay đổi trước khi thanh toán 70%.';
    }
  }

  let receiveReason = '';
  if (booking && booking.status !== 'completed') {
    if (booking.status !== 'booked') {
      receiveReason = 'Booking chưa ở trạng thái Đã đặt lịch.';
    } else if (booking.paymentStatus !== 'paid_in_full') {
      receiveReason = 'Cần thanh toán đủ 70% còn lại trước khi nhận ảnh.';
    } else if (!booking.finalLink) {
      receiveReason = 'Studio chưa gửi link ảnh hoàn chỉnh.';
    }
  }

  return (
    <Layout>
      <nav className="breadcrumb-nav" aria-label="Đường dẫn">
        <Link className="text-link" to={`/my-bookings/${encodeURIComponent(code || '')}`}>
          ← Quay lại chi tiết booking {code}
        </Link>
      </nav>

      {isNotFound ? (
        <section className="not-found-shell" aria-labelledby="gallery-missing-heading">
          <h1 id="gallery-missing-heading">Chọn ảnh để chỉnh · {code}</h1>
          <p>
            Chưa có lịch chụp {code} hoặc lịch này không thuộc tài khoản của bạn. Gallery ảnh sẽ có sau khi studio tạo booking và đăng ảnh xem trước.
          </p>
          <div className="catalog-card-actions">
            <Link className="button button-dark" to="/my-bookings">
              Về Lịch chụp của tôi
            </Link>
            <Link className="button button-outline" to="/chat">
              Chat với studio
            </Link>
          </div>
        </section>
      ) : (
        <article className="package-detail-card" aria-labelledby="gallery-heading">
          <header className="package-detail-header">
            <p className="section-eyebrow">Gallery khách hàng</p>
            <h1 id="gallery-heading">Chọn ảnh để chỉnh · {code}</h1>
            {booking && (
              <div className="booking-badge-row">
                <StatusBadge map={BOOKING_STATUS} status={booking.status} />
                <StatusBadge map={PAYMENT_STATUS} status={booking.paymentStatus} />
              </div>
            )}
          </header>

          <AsyncState
            loading={bookingReq.loading}
            error={bookingReq.error}
            onRetry={() => {
              bookingReq.reload();
              photosReq.reload();
            }}
            isEmpty={!booking}
            emptyMessage="Không có thông tin booking."
          >
            {booking && (
              <>
                <section aria-labelledby="gallery-selection-heading">
                  <h2 id="gallery-selection-heading">Ảnh xem trước và lựa chọn chỉnh sửa</h2>

                  <p className="gallery-counter" aria-live="polite">
                    Đã chọn <strong>{selectedIds.length}/{limit}</strong> ảnh
                    {savedCount > 0 ? ` (đã lưu ${savedCount} ảnh)` : ''}
                  </p>

                  {booking.paymentStatus === 'paid_in_full' && (
                    <p className="chat-hold-notice">
                      Đã thanh toán 70%, danh sách ảnh đã khóa và không thể chỉnh sửa thêm.
                    </p>
                  )}

                  {booking.status === 'cancelled' && (
                    <p className="booking-muted-note">
                      Booking đã hủy — danh sách ảnh chỉ hiển thị để xem lịch sử.
                    </p>
                  )}

                  {booking.status === 'awaiting_deposit' && (
                    <p className="booking-warning-note">
                      Booking đang Chờ cọc 30% nên chưa mở chọn ảnh.
                    </p>
                  )}

                  <AsyncState
                    loading={photosReq.loading}
                    error={photosReq.error}
                    onRetry={photosReq.reload}
                    isEmpty={photos.length === 0}
                    emptyMessage="Studio chưa đăng ảnh xem trước. Ảnh sẽ có sau buổi chụp."
                  >
                    <form onSubmit={handleSaveSelection} noValidate>
                      <fieldset className="gallery-fieldset">
                        <legend>
                          Chọn tối đa {limit} ảnh cho gói {booking.package.name}
                        </legend>
                        <div className="gallery-photo-grid">
                          {photos.map((photo) => {
                            const checked = selectedIds.includes(photo.id);
                            const disabled = isSelectionLocked || saving;
                            return (
                              <label
                                key={photo.id}
                                className={`gallery-photo-card${checked ? ' is-selected' : ''}`}
                              >
                                <img src={photo.url} alt={photo.alt} loading="lazy" />
                                <span className="gallery-photo-meta">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() => handleTogglePhoto(photo.id)}
                                  />
                                  <span>
                                    <strong>{photo.id}</strong> ·{' '}
                                    {checked ? '✓ Đã chọn' : 'Chưa chọn'}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      {limitNotice && (
                        <p className="form-alert" role="alert">
                          {limitNotice}
                        </p>
                      )}

                      {saveError && (
                        <p className="form-alert" role="alert">
                          {saveError}
                        </p>
                      )}

                      {saveSuccess && (
                        <p className="form-success-note" role="status">
                          {saveSuccess}
                        </p>
                      )}

                      <div className="catalog-card-actions">
                        <button
                          type="submit"
                          className="button button-dark"
                          disabled={isSelectionLocked || saving}
                        >
                          {saving ? 'Đang lưu lựa chọn…' : 'Lưu lựa chọn'}
                        </button>
                      </div>
                    </form>
                  </AsyncState>
                </section>

                <section aria-labelledby="gallery-remaining-heading">
                  <h2 id="gallery-remaining-heading">Thanh toán 70% còn lại</h2>
                  {booking.paymentStatus === 'paid_in_full' ? (
                    <p className="form-success-note">
                      Đã thanh toán đủ 100% (<Money amount={booking.price} />) cho booking {booking.code}.
                    </p>
                  ) : (
                    <div className="payment-action-box">
                      <p>
                        Số tiền 70% còn lại: <Money amount={booking.remaining} />.
                      </p>
                      {payRemainingReason && (
                        <p id="pay-remaining-reason" className="booking-muted-note">
                          {payRemainingReason}
                        </p>
                      )}
                      {payError && (
                        <p className="form-alert" role="alert">
                          {payError}
                        </p>
                      )}
                      <button
                        type="button"
                        className="button button-coral"
                        disabled={Boolean(payRemainingReason) || paying}
                        aria-describedby={payRemainingReason ? 'pay-remaining-reason' : undefined}
                        onClick={handlePayRemaining}
                      >
                        {paying
                          ? 'Đang chuyển tới cổng thanh toán…'
                          : `Thanh toán 70% còn lại (${formatMoney(booking.remaining)})`}
                      </button>
                    </div>
                  )}
                </section>

                <section aria-labelledby="gallery-receive-heading">
                  <h2 id="gallery-receive-heading">Nhận ảnh hoàn chỉnh</h2>
                  {booking.finalLink && (
                    <p>
                      Link ảnh hoàn chỉnh từ studio:{' '}
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

                  {booking.status === 'completed' ? (
                    <p className="form-success-note" role="status">
                      {receiveSuccess ||
                        'Bạn đã xác nhận nhận ảnh hoàn chỉnh. Booking và cuộc trò chuyện đã chuyển sang Hoàn thành.'}
                    </p>
                  ) : (
                    <div className="payment-action-box">
                      {receiveReason && (
                        <p id="receive-reason" className="booking-muted-note">
                          {receiveReason}
                        </p>
                      )}
                      {receiveError && (
                        <p className="form-alert" role="alert">
                          {receiveError}
                        </p>
                      )}
                      <button
                        type="button"
                        className="button button-dark"
                        disabled={Boolean(receiveReason) || receiving}
                        aria-describedby={receiveReason ? 'receive-reason' : undefined}
                        onClick={handleReceivePhotos}
                      >
                        {receiving ? 'Đang xác nhận…' : 'Nhận ảnh'}
                      </button>
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
