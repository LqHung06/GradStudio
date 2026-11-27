import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Layout } from '../../components/Layout.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { BookingSummary } from './BookingSummary.jsx';
import { RescheduleForm } from './RescheduleForm.jsx';

function isHttps(url) {
  try {
    return url.startsWith('https://') && new URL(url).protocol === 'https:' && !/\s/.test(url);
  } catch {
    return false;
  }
}

function FinalLinkForm({ finalLink, busy, update }) {
  const form = useForm({
    initial: { url: finalLink ?? '' },
    validate({ url }) {
      if (url.length > 500) return { url: 'Link tối đa 500 ký tự.' };
      return isHttps(url) ? {} : { url: 'Nhập link HTTPS hợp lệ, bắt đầu bằng https://.' };
    },
    async onSubmit({ url }, { reset }) {
      const booking = await update('PUT', '/final-link', { url }, 'Đã lưu link ảnh hoàn chỉnh.');
      reset({ url: booking.finalLink });
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <FormField name="url" label="Link ảnh hoàn chỉnh" type="url" required
        value={form.values.url} error={form.errors.url} onChange={form.handleChange} />
      {form.submitError && <p role="alert">{form.submitError}</p>}
      <button className="button button-dark" type="submit" disabled={busy || form.submitting}>Lưu link ảnh</button>
    </form>
  );
}

function CancelBooking({ busy, update }) {
  const [confirming, setConfirming] = useState(false);
  const form = useForm({
    initial: { reason: '' },
    validate({ reason }) {
      return reason.trim().length >= 5 && reason.length <= 500 ? {} : { reason: 'Nhập lý do từ 5 đến 500 ký tự.' };
    },
    async onSubmit({ reason }) {
      await update('POST', '/cancel', { reason: reason.trim() }, 'Đã hủy booking.');
    },
  });

  return (
    <section className="admin-card">
      <h2>Hủy booking</h2>
      <p>Booking đã hủy vẫn giữ thông tin thanh toán và lịch sử việc. Studio xử lý hoàn tiền ngoài hệ thống.</p>
      {confirming ? (
        <form noValidate onSubmit={form.handleSubmit}>
          <FormField name="reason" type="textarea" label="Lý do hủy" required
            value={form.values.reason} error={form.errors.reason} onChange={form.handleChange} />
          {form.submitError && <p role="alert">{form.submitError}</p>}
          <div className="admin-actions">
            <button className="button button-dark" type="submit" disabled={busy || form.submitting}>Xác nhận hủy</button>
            <button className="button button-outline" type="button" disabled={busy || form.submitting}
              onClick={() => { setConfirming(false); form.reset(); }}>Không hủy</button>
          </div>
        </form>
      ) : <button className="button button-outline" type="button" disabled={busy}
        onClick={() => setConfirming(true)}>Hủy booking</button>}
    </section>
  );
}

function BookingDetail({ code }) {
  const path = '/api/bookings/' + encodeURIComponent(code);
  const { data, error, loading, reload, setData } = useFetch(path);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const booking = data?.booking;
  const actions = data?.adminActions;
  const editable = ['awaiting_deposit', 'booked'].includes(booking?.status);

  async function update(method, suffix, body, message) {
    if (lock.current) throw new Error('Đang lưu thay đổi cho booking này.');
    lock.current = true;
    setBusy(true);
    setNotice('');
    try {
      const result = await apiFetch(path + suffix, { method, body });
      setData((current) => ({ ...current, ...result }));
      setNotice(message);
      return result.booking;
    } catch (error) {
      const retryAt = new Date(error.details?.retryAt);
      if (error.status === 409 && Number.isFinite(retryAt.getTime())) {
        const formatted = new Intl.DateTimeFormat('vi-VN', {
          dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh',
        }).format(retryAt);
        throw new Error(`${error.message} Có thể thử lại lúc ${formatted} (giờ Việt Nam).`);
      }
      throw error;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <Layout mainClassName="section-shell page-main admin-workspace">
      <h1>Chi tiết booking {code}</h1>
      <div className="admin-actions">
        <Link className="admin-link" to="/admin/bookings">Về danh sách booking</Link>
        {booking?.conversationId && (
          <Link className="admin-link" to={'/admin/conversations/' + encodeURIComponent(booking.conversationId)}>
            Mở hội thoại của {booking.customer.name}
          </Link>
        )}
        {booking && <button type="button" className="button button-outline" disabled={busy || loading}
          onClick={reload}>Làm mới booking</button>}
      </div>
      <AsyncState loading={loading} error={error?.status === 404 ? null : error} onRetry={reload}
        isEmpty={!booking} emptyMessage={'Không tìm thấy booking ' + code + '. Booking có thể chưa được tạo.'}>
        {booking && <>
          <section className="admin-card">
            <BookingSummary booking={booking} heading="h2" />
            {booking.status === 'awaiting_deposit' && booking.paymentStatus === 'deposit_paid' && (
              <p>Studio đã nhận cọc nhưng chưa giữ được chỗ. Khoản cọc vẫn gắn với booking này.</p>
            )}
            {actions?.editor && <p>Người chỉnh ảnh: {actions.editor.name}</p>}
            <h3>Dịch vụ thêm</h3>
            {booking.extras.length
              ? <ul>{booking.extras.map(({ id, name }) => <li key={id}>{name}</li>)}</ul>
              : <p>Booking này chưa có dịch vụ thêm.</p>}
          </section>
          {(busy || notice) && <p role="status">{busy ? 'Đang lưu thay đổi…' : notice}</p>}
          {editable && actions && (actions.rescheduleBlockedReason
            ? <section className="admin-card"><h2>Đổi lịch</h2><p>{actions.rescheduleBlockedReason}</p></section>
            : <RescheduleForm booking={booking} busy={busy} update={update} />)}
          <section className="admin-card">
            <h2>Ảnh hoàn chỉnh</h2>
            {booking.finalLink
              ? <a className="admin-link" href={booking.finalLink} target="_blank" rel="noreferrer">Mở link ảnh hoàn chỉnh</a>
              : <p>Chưa có link ảnh hoàn chỉnh.</p>}
            {editable && actions && (actions.finalLinkBlockedReason
              ? <p>{actions.finalLinkBlockedReason}</p>
              : <FinalLinkForm finalLink={booking.finalLink} busy={busy} update={update} />)}
          </section>
          {editable && <CancelBooking busy={busy} update={update} />}
        </>}
      </AsyncState>
    </Layout>
  );
}

export function AdminBookingDetailPage() {
  const { code } = useParams();
  return <BookingDetail key={code} code={code} />;
}
