import { Link } from 'react-router-dom';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { REMINDER_EMAIL_STATUS } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

const CHANNEL_LABELS = {
  email: 'E-mail',
  account: 'Tài khoản',
};

const momentFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

function formatChannels(channels) {
  if (!Array.isArray(channels) || channels.length === 0) return 'Tài khoản';
  return channels.map((ch) => CHANNEL_LABELS[ch] || ch).join(', ');
}

function formatSendAt(iso) {
  if (!iso) return 'Chưa xác định';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return momentFormatter.format(dt);
}

export function NotificationsPage() {
  const { data, error, loading, reload } = useFetch('/api/reminders');
  const reminders = Array.isArray(data?.reminders) ? data.reminders : [];

  return (
    <Layout>
      <div className="section-header-row">
        <div>
          <p className="section-eyebrow">Nhắc lịch tự động</p>
          <h1>Thông báo và nhắc lịch</h1>
        </div>
        <Link className="button button-outline" to="/my-bookings">
          Về Lịch chụp của tôi
        </Link>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={reminders.length === 0}
        emptyMessage="Chưa có nhắc lịch. Nhắc lịch được tạo sau khi bạn đặt cọc thành công."
      >
        <ul className="booking-list">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="catalog-card">
              <div className="booking-card-top">
                <p className="reminder-meta">
                  Gửi lúc{' '}
                  {reminder.sendAt ? (
                    <time dateTime={reminder.sendAt}>{formatSendAt(reminder.sendAt)}</time>
                  ) : (
                    <span>Chưa xác định</span>
                  )}{' '}
                  · Kênh: <strong>{formatChannels(reminder.channels)}</strong> · E-mail:{' '}
                  <StatusBadge map={REMINDER_EMAIL_STATUS} status={reminder.emailStatus} />
                </p>
              </div>
              <p>{reminder.text}</p>
              {reminder.bookingCode && (
                <div className="catalog-card-actions">
                  <Link
                    className="button button-outline"
                    to={`/my-bookings/${encodeURIComponent(reminder.bookingCode)}`}
                  >
                    Xem booking {reminder.bookingCode}
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      </AsyncState>
    </Layout>
  );
}
