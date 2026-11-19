import React, { useRef, useState } from "react";

function ChatPanel({
  open,
  onClose
}) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('gradstudio-chat'));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [{
      sender: 'customer',
      text: 'Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?',
      time: '17:20'
    }, {
      sender: 'admin',
      text: 'Để mình kiểm tra lịch cho bạn nhé',
      time: '17:21'
    }];
  });
  React.useEffect(() => {
    try { sessionStorage.setItem('gradstudio-chat', JSON.stringify(messages)); } catch {}
  }, [messages]);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);
  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  function submit(e) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) {
      setNotice('Hãy nhập tin nhắn trước khi gửi.');
      inputRef.current?.focus();
      return;
    }
    const now = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setMessages(current => [...current, {
      sender: 'customer',
      text: clean,
      time: now
    }, {
      sender: 'admin',
      text: 'GradStudio đã nhận lời nhắn của bạn. Studio sẽ phản hồi bạn sớm nhé.',
      time: now
    }]);
    setText('');
    setNotice('');
  }
  if (!open) return null;
  return <section className="chat-panel" id="chat-panel" aria-labelledby="chat-heading">
    <div className="chat-panel-head">
      <div className="chat-brand-info">
        <img className="chat-avatar" src="art/graduation-portrait.png" alt="" />
        <div>
          <h2 id="chat-heading" className="chat-brand-name">GradStudio</h2>
          <span className="chat-active-status"><span className="active-dot" aria-hidden="true" />Đang hoạt động</span>
        </div>
      </div>
      <button className="chat-close-button" type="button" onClick={onClose} aria-label="Đóng khung chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <div className="chat-transcript" aria-live="polite">
      <div className="chat-topic-badge" aria-hidden="true">
        <span>Đang hỏi về: Gói Tốt nghiệp</span>
      </div>
      {messages.map((m, i) => <div className={`chat-message-group ${m.sender}`} key={`${i}-${m.time}`}>
        <div className={`chat-bubble ${m.sender}`}>
          <p>{m.text}</p>
        </div>
        <time className="chat-time">{m.time}</time>
      </div>)}
      <div className="chat-typing-indicator" aria-hidden="true">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
    <form className="chat-compose" onSubmit={submit}>
      <label className="sr-only" htmlFor="home-message">Tin nhắn của bạn</label>
      <input
        id="home-message"
        ref={inputRef}
        value={text}
        onChange={e => {
          setText(e.target.value);
          setNotice('');
        }}
        placeholder="Nhập tin nhắn..."
      />
      <button className="chat-send-btn" type="submit" aria-label="Gửi tin">
        <span className="sr-only">Gửi tin</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
    {notice && <p className="chat-feedback" aria-live="polite">{notice}</p>}
  </section>;
}

function FloatingChat() {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const panelRef = useRef(null);
  React.useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 767px)').matches) return;
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, [open]);
  React.useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('gradstudio:open-chat', show);
    return () => window.removeEventListener('gradstudio:open-chat', show);
  }, []);
  React.useEffect(() => {
    if (!open) return;
    const key = e => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);
  function close() { setOpen(false); trigger.current?.focus(); }
  return <div className={`floating-chat ${open ? 'chat-is-open' : ''}`}><div ref={panelRef}><ChatPanel open={open} onClose={close} /></div><button ref={trigger} className="chat-launcher" type="button" aria-label={open ? 'Thu gọn chat với studio' : 'Mở chat với studio'} aria-expanded={open} aria-controls={open ? 'chat-panel' : undefined} onClick={() => open ? close() : setOpen(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8 8.5 8.5 0 0 1-3.4-.7L4 20l1.2-4.2a8 8 0 1 1 14.8-4.3Z"/><path d="M8 11.5h8M8 14.5h5" strokeLinecap="round"/></svg></button></div>;
}

export { ChatPanel, FloatingChat };

