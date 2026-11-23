import { useId } from 'react';
import { useForm } from '../../hooks/useForm.js';
import { FormField } from '../FormField.jsx';
import { formatDate } from '../../constants/status.js';
import { ProposalCard } from './ProposalCard.jsx';
import '../../styles/chat-components.css';

function validate({ text }) {
  if (!text.trim()) return { text: 'Vui lòng nhập tin nhắn.' };
  return text.length > 1000 ? { text: 'Tin nhắn phải có từ 1 đến 1000 ký tự.' } : {};
}

const momentFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
});

/** Pure props boundary: the parent sends messages and updates the API response. */
export function ChatThread({ messages = [], viewerRole, onSend, sending = false, renderProposal, sendError = null }) {
  const fieldId = `gs-chat-${useId()}`;
  const form = useForm({
    initial: { text: '' },
    validate,
    onSubmit: async ({ text }, { reset, setServerErrors }) => {
      try {
        await onSend(text);
        reset({ text: '' });
      } catch (error) {
        if (error?.fields?.text) setServerErrors({ text: error.fields.text });
        else throw error;
      }
    },
  });
  const busy = sending || form.submitting;
  const fieldError = form.errors.text || sendError?.fields?.text;
  const submitError = form.submitError || (!sendError?.fields?.text && sendError?.message);
  return (
    <div className="gs-chat">
      {messages.length ? <ol className="gs-chat__messages">
        {messages.map((message) => {
          const own = message.from === (viewerRole === 'customer' ? 'customer' : 'studio');
          return <li key={message.id} className={`gs-chat__message${own ? ' gs-chat__message--own' : ''}`}>
            <p><strong>{message.author.name}</strong> · {message.from === 'customer' ? 'Khách hàng' : 'Studio'}{own && ' · Phía bạn'}</p>
            <time dateTime={message.at}>{momentFormatter.format(new Date(message.at))}</time>
            <p className="gs-chat__text">{message.text}</p>
            {message.type === 'request' && <dl>
              <dt>Loại chụp</dt><dd>{message.request.shootType}</dd>
              <dt>Gói chụp</dt><dd>{message.request.packageName}</dd>
              <dt>Ngày giờ mong muốn</dt><dd><time dateTime={`${message.request.preferredDate}T${message.request.preferredTime}`}>{formatDate(message.request.preferredDate)} · {message.request.preferredTime}</time></dd>
              <dt>Dịch vụ thêm</dt><dd>{message.request.extraNames.length ? message.request.extraNames.join(', ') : 'Không có dịch vụ thêm.'}</dd>
            </dl>}
            {message.type === 'proposal' && (renderProposal ? renderProposal(message.proposal) : <ProposalCard proposal={message.proposal} />)}
          </li>;
        })}
      </ol> : <p>Chưa có tin nhắn nào.</p>}
      <form noValidate onSubmit={(event) => {
        if (busy) { event.preventDefault(); return; }
        return form.handleSubmit(event);
      }}>
        <FormField name={fieldId} label="Tin nhắn" error={fieldError}>
          {(controlProps) => <textarea {...controlProps} name="text" value={form.values.text}
            onChange={form.handleChange} readOnly={busy} required />}
        </FormField>
        {submitError && <p role="alert">{submitError}</p>}
        {busy && <p role="status">Đang gửi tin nhắn…</p>}
        <button type="submit" disabled={busy}>Gửi</button>
      </form>
    </div>
  );
}
