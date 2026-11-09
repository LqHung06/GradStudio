import React, { useRef, useState } from "react";

import { scrollColorStops } from "../data/fixtures.js";

function Header({
  role = 'customer',
  onChat,
  accountMenu = false,
  setAccountView
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef(null);
  const menu = useRef(null);
  const isStudio = role === 'studio';
  React.useEffect(() => {
    if (!menuOpen) return;
    const outside = e => {
      if (!menu.current?.contains(e.target) && !trigger.current?.contains(e.target)) setMenuOpen(false);
    };
    const key = e => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', key);
    };
  }, [menuOpen]);
  function choose(view) {
    if (setAccountView) {
      setAccountView(view);
    } else {
      window.location.href = view === 'photos' ? 'booking.html#photos' : 'booking.html';
    }
    setMenuOpen(false);
    trigger.current?.focus();
  }
  return <header className="site-header"><a className="brand" href="index.html" aria-label="GradStudio — Trang dịch vụ"><span className="brand-mark" aria-hidden="true">◎</span>GradStudio{isStudio && <span className="brand-badge-studio">Studio</span>}</a><nav className="main-nav" aria-label="Điều hướng chính">{isStudio ? <><a href="studio.html" className="active">Hội thoại <span className="nav-badge-count">3</span></a><a href="booking.html">Booking</a><a href="index.html">Trang dịch vụ</a></> : <><a href="index.html#dich-vu">Dịch vụ</a><a href="booking.html">Lịch của tôi</a></>}</nav><div className="header-actions">{onChat && <button className="button button-dark" type="button" onClick={onChat}>Chat với studio</button>}{accountMenu ? <div className="account-wrap"><button ref={trigger} className="account-trigger" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}><span className="avatar">L</span>Linh <span aria-hidden="true">⌄</span></button>{menuOpen && <div className="account-menu" ref={menu}><button type="button" onClick={() => choose('account')}>Tài khoản của tôi</button><button type="button" onClick={() => choose('schedule')}>Lịch chụp của tôi</button><button type="button" onClick={() => choose('photos')}>Ảnh đã chọn</button><p>Đăng xuất chưa khả dụng trong prototype.</p></div>}</div> : isStudio ? <div className="studio-admin-profile"><span className="avatar">T</span><span className="admin-name">Thảo · Quản lý studio</span></div> : <a className="account-trigger" href="booking.html"><span className="avatar">L</span>Linh</a>}</div></header>;
}

function Footer() {
  return <footer className="site-footer"><a className="brand" href="index.html"><span className="brand-mark" aria-hidden="true">◉</span><span>Grad<span className="brand-italic">Studio</span></span></a><span>Studio portrait stories · Saigon</span></footer>;
}

function ScrollBackground() {
  const layer = useRef(null);
  React.useEffect(() => {
    const element = layer.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let maxScroll = 0;
    let frame = 0;
    let lastColor = '';
    function render() {
      frame = 0;
      const progress = motion.matches || maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const nextIndex = scrollColorStops.findIndex(stop => progress <= stop.at);
      const upper = scrollColorStops[nextIndex < 0 ? scrollColorStops.length - 1 : nextIndex];
      const lower = scrollColorStops[Math.max(0, (nextIndex < 0 ? scrollColorStops.length - 1 : nextIndex) - 1)];
      const amount = upper.at === lower.at ? 0 : (progress - lower.at) / (upper.at - lower.at);
      const color = `rgb(${lower.color.map((value, index) => Math.round(value + (upper.color[index] - value) * amount)).join(', ')})`;
      if (color !== lastColor) { element.style.setProperty('--scroll-background', color); lastColor = color; }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(render); }
    function measure() { maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); schedule(); }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(document.documentElement);
    observer?.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    motion.addEventListener('change', schedule);
    measure();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      motion.removeEventListener('change', schedule);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="scroll-background" ref={layer} aria-hidden="true" />;
}

export { Header, Footer, ScrollBackground };

