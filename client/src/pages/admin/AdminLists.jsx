import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { BOOKING_STATUS, CONVERSATION_STATUS } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import { BookingSummary } from './BookingSummary.jsx';

const formatMoment = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
});

export function ConversationsPage() {
  const { data, loading, error, reload } = useFetch('/api/conversations');
  const [filter, setFilter] = useState('');
  const conversations = data?.conversations ?? [];
  const visible = conversations.filter((entry) => !filter || entry.status === filter);

  return (
    <Layout mainClassName="section-shell page-main admin-workspace">
      <h1>Hội thoại khách hàng</h1>
      {data && <div className="admin-actions" role="group" aria-label="Lọc trạng thái hội thoại">
        {[['', 'Tất cả'], ...Object.entries(CONVERSATION_STATUS)].map(([status, label]) => (
          <button type="button" className="button button-outline" key={status}
            aria-pressed={filter === status} onClick={() => setFilter(status)}>
            {label} ({conversations.filter((entry) => !status || entry.status === status).length})
          </button>
        ))}
      </div>}
      <AsyncState loading={loading} error={error} onRetry={reload} isEmpty={!visible.length}
        emptyMessage={filter ? 'Không có hội thoại ở trạng thái này.' : 'Chưa có hội thoại nào.'}>
        <ul className="admin-cards">
          {visible.map(({ id, customer, topic, lastMessage, status }) => (
            <li key={id} className="admin-card">
              <h2><Link className="admin-link" to={encodeURIComponent(id)}>{customer.name}</Link></h2>
              <StatusBadge map={CONVERSATION_STATUS} status={status} />
              <p><strong>{topic}</strong></p>
              <p>{lastMessage.text || 'Tin nhắn không có nội dung văn bản.'}</p>
              <time dateTime={lastMessage.at}>{formatMoment.format(new Date(lastMessage.at))}</time>
            </li>
          ))}
        </ul>
      </AsyncState>
    </Layout>
  );
}

export function AdminBookingsPage() {
  const { data, loading, error, reload } = useFetch('/api/bookings');
  const [filter, setFilter] = useState('');
  const bookings = data?.bookings ?? [];
  const visible = bookings.filter((booking) => !filter || booking.status === filter);

  return (
    <Layout mainClassName="section-shell page-main admin-workspace">
      <h1>Booking</h1>
      {data && !loading && !error && (
        <div className="admin-actions" role="group" aria-label="Lọc trạng thái booking">
          {[['', 'Tất cả'], ...Object.entries(BOOKING_STATUS)].map(([status, label]) => (
            <button type="button" className="button button-outline" key={status}
              aria-pressed={filter === status} onClick={() => setFilter(status)}>{label}</button>
          ))}
        </div>
      )}
      <AsyncState loading={loading} error={error} onRetry={reload} isEmpty={!visible.length}
        emptyMessage={filter ? 'Không có booking ở trạng thái này.' : 'Chưa có booking nào.'}>
        <ul className="admin-cards">
          {visible.map((booking) => (
            <li key={booking.code} className="admin-card">
              <BookingSummary booking={booking} heading="h2" />
              <div className="admin-actions">
                <Link className="admin-link" to={encodeURIComponent(booking.code)}>Xem chi tiết {booking.code}</Link>
                {booking.conversationId && (
                  <Link className="admin-link" to={'/admin/conversations/' + encodeURIComponent(booking.conversationId)}>
                    Mở hội thoại của {booking.customer.name}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </AsyncState>
    </Layout>
  );
}
