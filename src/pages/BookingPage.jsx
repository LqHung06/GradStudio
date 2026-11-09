import React, { useState } from "react";

import { bookings, bookingFilters, fmt } from "../data/fixtures.js";

import { Header, Footer } from "../components/Layout.jsx";

function AccountView({
  view,
  setView,
  booking
}) {
  if (view === 'schedule') return null;
  if (view === 'account') return <div className="account-view"><div className="account-view-head"><div><p className="eyebrow">Tài khoản demo</p><h2>Thông tin của Linh</h2></div><button type="button" className="icon-button" onClick={() => setView('schedule')} aria-label="Đóng thông tin tài khoản">×</button></div><p><strong>Nguyễn Hoàng Phương Linh</strong></p><p>linh.demo@example.com</p><p className="fixture-note">Thông tin minh họa, không có tài khoản đăng nhập thật.</p></div>;
  if (!booking) return null;
  return <div className="account-view"><div className="account-view-head"><div><p className="eyebrow">Gallery booking {booking.code}</p><h2>Ảnh đã chọn</h2></div><button type="button" className="icon-button" onClick={() => setView('schedule')} aria-label="Đóng ảnh đã chọn">×</button></div><p>{(booking.chosenPhotos || []).length} ảnh minh họa · {booking.package}.</p><div className="chosen-photo-grid">{(booking.chosenPhotos || []).map(id => <div className="chosen-photo" key={id}><span>Ảnh {id} · {booking.code}</span></div>)}</div><p className="fixture-note">Ảnh minh họa CSS, không phải ảnh khách hàng thật.</p></div>;
}
function WeekStrip({
  date
}) {
  const [d, m, y] = date.split('/').map(Number);
  const current = new Date(y, m - 1, d);
  const start = new Date(y, m - 1, d - (current.getDay() + 6) % 7);
  return <div className="week-strip" role="region" aria-label="Tuần của lịch đang chọn">{Array.from({
      length: 7
    }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return <span key={i} className={day.getDate() === d ? 'week-active' : ''}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}<b>{day.getDate()}</b></span>;
    })}</div>;
}
function BookingDetails({
  booking: b
}) {
  return <><section className="booking-timeline-card"><div className="booking-card-heading"><div><p className="eyebrow">{b.dateLong}</p><h2>Lịch trình của {b.short}</h2></div><span className={`status ${b.status === 'Chờ cọc 30%' ? 'status-pending' : b.status === 'Đã đặt lịch' ? 'status-booked' : 'status-complete'}`}>{b.status}</span></div><ol className="timeline">{b.conflict && <li className="timeline-item rejected"><time dateTime="09:00">09:00</time><div><strong>Giờ yêu cầu ban đầu</strong><p>Xung đột: Mai bận makeup 08:00–12:00.</p></div></li>}{b.makeup !== 'Không yêu cầu' && <li className="timeline-item"><span className="timeline-time">{b.makeup}</span><div><strong>Makeup · {b.makeupStaff}</strong><p>Chuẩn bị trước buổi chụp.</p></div></li>}<li className="timeline-item"><span className="timeline-time">{b.shoot}</span><div><strong>Chụp ảnh · {b.photographer}</strong><p>{b.room} · {b.type}</p></div></li></ol><WeekStrip date={b.date} /></section><aside className="invoice-card"><p className="eyebrow">Booking · {b.code}</p><h2>Thông tin lịch chụp</h2><dl className="booking-facts"><div><dt>Khách hàng</dt><dd>{b.customer}</dd></div><div><dt>Loại buổi chụp</dt><dd>{b.type}</dd></div><div><dt>Gói dịch vụ</dt><dd>{b.package}</dd></div><div><dt>Thời lượng</dt><dd>{b.duration} · {b.photos}</dd></div></dl><div className="payment-lines"><p><span>Tổng giá</span><strong>{fmt(b.total)}</strong></p><p><span>{b.status === 'Chờ cọc 30%' ? 'Cọc 30%' : 'Đã thanh toán cọc'}</span><strong>{fmt(b.deposit)}</strong></p><p><span>{b.status === 'Hoàn thành' ? 'Còn phải thanh toán' : 'Còn lại 70%'}</span><strong>{fmt(b.status === 'Hoàn thành' ? 0 : b.remaining)}</strong></p></div><button className="button payment-button" type="button" disabled>{b.status === 'Chờ cọc 30%' ? `Thanh toán cọc 30% · ${fmt(b.deposit)}` : b.status === 'Hoàn thành' ? 'Đã thanh toán đầy đủ' : 'Đã thanh toán cọc 30%'}</button><p className="payment-note">Thanh toán trực tuyến chưa khả dụng trong prototype. Lịch chỉ được giữ sau khi cọc thành công và kiểm tra lại tài nguyên.</p><p className="fixture-note">70% còn lại thanh toán sau buổi chụp và khi đã chọn ảnh. Dữ liệu booking minh họa cho PA#2.</p></aside></>;
}
function BookingPage() {
  const [filter, setFilter] = useState('Tất cả');
  const [selectedId, setSelectedId] = useState('GS-1024');
  const [accountView, setAccountView] = useState('schedule');
  const openChat = () => window.dispatchEvent(new Event('gradstudio:open-chat'));
  const visible = bookings.filter(b => filter === 'Tất cả' || b.status.startsWith(filter));
  const counts = Object.fromEntries(bookingFilters.map(s => [s, bookings.filter(b => s === 'Tất cả' || b.status.startsWith(s)).length]));
  const active = visible.find(b => b.id === selectedId) || visible[0];
  function change(s) {
    setFilter(s);
    const next = bookings.find(b => s === 'Tất cả' || b.status.startsWith(s));
    if (next) setSelectedId(next.id);
  }
  return <><Header onChat={openChat} accountMenu setAccountView={setAccountView} /><main className="booking-page"><div className="booking-art" aria-hidden="true"><div className="polaroid"><img src="art/graduation.svg" alt="" /><span>the days we remember.</span></div><div className="polaroid second"><img src="art/graduation-group.png" alt="" loading="lazy" /><span>Class of 2026 ✧</span></div></div><div className="page-intro booking-intro"><div><p className="eyebrow">03 / 03 · Customer booking</p><h1>Lịch chụp của tôi</h1><p className="lead">Theo dõi lịch trình và khoản cọc để giữ lịch chính thức.</p></div><span className="booking-deco" aria-hidden="true">good<br />memories</span></div><AccountView view={accountView} setView={setAccountView} booking={active} /><div className="booking-filters" role="group" aria-label="Lọc lịch chụp">{bookingFilters.map(s => <button key={s} type="button" className={filter === s ? 'active' : ''} aria-pressed={filter === s} onClick={() => change(s)}>{s} <span>{counts[s]}</span></button>)}</div><section className="booking-list" aria-label="Booking phù hợp bộ lọc">{visible.map(b => <button type="button" key={b.id} className={`booking-list-item ${active?.id === b.id ? 'selected' : ''}`} onClick={() => setSelectedId(b.id)} aria-pressed={active?.id === b.id}><span className="booking-list-date">{b.date.slice(0, 5)}</span><span className="booking-list-copy"><strong>{b.code} · {b.short}</strong><small>{b.package}</small></span><span className={`status ${b.status === 'Chờ cọc 30%' ? 'status-pending' : b.status === 'Đã đặt lịch' ? 'status-booked' : 'status-complete'}`}>{b.status}</span></button>)}{visible.length === 0 && <p className="empty-note">Chưa có lịch chụp ở trạng thái này.</p>}</section>{active ? <div className="booking-content"><BookingDetails booking={active} /></div> : <div className="empty-state" style={{marginBlock:'2rem'}}><p>Chưa có lịch chụp ở trạng thái "{filter}".</p></div>}<div className="role-handoff"><span>Đang xem với vai trò khách hàng</span><a href="studio.html">Mở góc nhìn Studio · Thảo ↗</a></div></main><Footer /></>;
}

export { AccountView, WeekStrip, BookingDetails, BookingPage };

