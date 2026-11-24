import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { ChatThread } from '../../components/chat/ChatThread.jsx';
import { CONVERSATION_STATUS } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import { BookingForm } from './BookingForm.jsx';
import { BookingSummary } from './BookingSummary.jsx';
import { ProposalForm } from './ProposalForm.jsx';

export function ConversationPage() {
  const { id } = useParams();
  return <ConversationDetail key={id} id={id} />;
}

function ConversationDetail({ id }) {
  const path = '/api/conversations/' + encodeURIComponent(id);
  const detail = useFetch(path);
  const conversation = detail.data?.conversation;

  return (
    <Layout mainClassName="section-shell page-main admin-workspace">
      <div>
        <Link className="admin-link" to="/admin/conversations">Về danh sách hội thoại</Link>
        <h1>{conversation ? conversation.topic : 'Chi tiết hội thoại'}</h1>
      </div>
      {(detail.loading || detail.error) && <AsyncState loading={detail.loading}
        error={detail.error?.status === 404 ? { message: 'Không tìm thấy hội thoại.' } : detail.error}
        onRetry={detail.error?.status === 404 ? undefined : detail.reload} />}
      {conversation && detail.error?.status !== 404 && <ConversationWorkspace
        path={path} conversation={conversation} detail={detail} />}
    </Layout>
  );
}

function ConversationWorkspace({ path, conversation, detail }) {
  const history = useFetch('/api/bookings');
  const [mutating, setMutating] = useState(false);
  const mutation = useRef(false);
  const busy = detail.loading || mutating || Boolean(detail.error);
  const bookings = (history.data?.bookings ?? []).filter(({ conversationId }) => conversationId === conversation.id);
  const linked = bookings.find(({ code }) => code === conversation.bookingCode);
  const canCreate = history.data
    && (!conversation.bookingCode || linked?.status === 'cancelled');
  const request = conversation.messages.findLast((message) => message.request)?.request;
  const proposal = conversation.messages.find(({ proposal }) => proposal?.id === conversation.acceptedProposalId)?.proposal;
  const accepted = proposal?.status === 'accepted' && proposal.items.length ? proposal : null;

  async function mutate(operation) {
    if (busy || mutation.current) throw new Error('Đang xử lý yêu cầu trong hội thoại. Vui lòng thử lại.');
    mutation.current = true;
    setMutating(true);
    try {
      return await operation();
    } finally {
      mutation.current = false;
      setMutating(false);
    }
  }

  function append(message, summary) {
    detail.setData(({ conversation: current }) => ({
      conversation: { ...current, ...summary, messages: [...current.messages, message] },
    }));
  }

  const sendMessage = (text) => mutate(async () => {
    const result = await apiFetch(path + '/messages', { method: 'POST', body: { text } });
    append(result.message, result.conversation);
  });

  const sendProposal = (body) => mutate(async () => {
    const { message } = await apiFetch(path + '/proposals', { method: 'POST', body });
    append(message);
    // The proposal endpoint returns the message but omits the conversation summary.
    detail.reload();
  });

  const createBooking = (create) => mutate(async () => {
    const { booking } = await create();
    history.setData(({ bookings }) => ({ bookings: [...bookings, booking] }));
    detail.setData(({ conversation: current }) => ({
      conversation: { ...current, bookingCode: booking.code },
    }));
  });

  function refresh() {
    if (mutating || mutation.current || detail.loading || history.loading) return;
    detail.reload();
    history.reload();
  }

  return (
    <>
      <div className="admin-actions">
        <strong>{conversation.customer.name}</strong>
        <span>Hội thoại</span>
        <StatusBadge map={CONVERSATION_STATUS} status={conversation.status} />
        <button type="button" className="button button-outline"
          disabled={mutating || detail.loading || history.loading} onClick={refresh}>Làm mới hội thoại</button>
      </div>
      <div className="admin-columns">
        <section className="admin-card">
          <h2>Tin nhắn</h2>
          <ChatThread messages={conversation.messages} viewerRole="admin" onSend={sendMessage} sending={busy} />
        </section>
        <div className="admin-columns-side">
          {linked?.status === 'cancelled' && (
            <p>Booking {linked.code} đã hủy. Gửi đề xuất mới và chờ khách đồng ý để tạo booking thay thế.</p>
          )}
          {canCreate && <ProposalForm preferredDate={request?.preferredDate ?? ''} busy={busy} onPropose={sendProposal} />}
          {canCreate && <BookingForm conversation={conversation} request={request} proposal={accepted}
            busy={busy || history.loading || Boolean(history.error)} onCreate={createBooking} />}
          {conversation.bookingCode && !linked && history.data && !history.loading && !history.error &&
            <p role="alert">Chưa tìm thấy booking {conversation.bookingCode} trong danh sách trả về.</p>}
          <section className="admin-card">
            <h2>Lịch sử booking</h2>
            <AsyncState loading={history.loading} error={history.error} onRetry={refresh}
              isEmpty={!bookings.length} emptyMessage="Chưa có booking trong hội thoại này.">
              <ul className="admin-cards">
                {bookings.map((booking) => <li className="admin-card" key={booking.code}>
                  <BookingSummary booking={booking} />
                </li>)}
              </ul>
              <Link className="admin-link" to="/admin/bookings">Xem danh sách booking</Link>
            </AsyncState>
          </section>
        </div>
      </div>
    </>
  );
}
