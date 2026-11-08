import React, { useRef, useState } from "react";

import { packages, galleryItems, categories, heroPhotos } from "../data/fixtures.js";

import { Header, Footer } from "../components/Layout.jsx";

function HeroArt({ photo }) {
  const art = useRef(null);
  React.useEffect(() => {
    const node = art.current;
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let x = 0, y = 0;
    const paint = () => {
      frame = 0;
      node.style.setProperty('--hero-x', x.toFixed(3));
      node.style.setProperty('--hero-y', y.toFixed(3));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const move = event => {
      const rect = node.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      schedule();
    };
    const reset = () => { x = 0; y = 0; schedule(); };
    const update = () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', reset);
      if (motion.matches) {
        node.addEventListener('pointermove', move);
        node.addEventListener('pointerleave', reset);
      } else reset();
    };
    update();
    motion.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', reset);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="hero-art" ref={art}>
    <img className="hero-frame-main" src={photo.src} alt={photo.alt} style={{ objectPosition: photo.position }} />
    <div className="hero-depth hero-depth-group"><div className="hero-polaroid"><img src="art/graduation-group.png" alt="" /><span>A new chapter, beautifully told.</span></div></div>
    <div className="hero-depth hero-depth-detail" aria-hidden="true"><div className="hero-frame hero-frame-detail"><img src="art/graduation-diploma.png" alt="" /></div></div>
    <span className="hero-depth hero-depth-script"><span className="art-script">Your next<br />chapter ✧</span></span>
  </div>;
}

function HomePage() {
  const [hoveredService, setHoveredService] = useState(null);
  const [focusedService, setFocusedService] = useState(null);
  const [category, setCategory] = useState('Tất cả');
  const [selected, setSelected] = useState(null);
  const filtered = galleryItems.filter(i => category === 'Tất cả' || i.category === category);
  const galleryTrigger = useRef(null);
  const viewer = useRef(null);
  React.useEffect(() => {
    if (selected) viewer.current?.focus();
  }, [selected]);
  function closeImage() {
    setSelected(null);
    requestAnimationFrame(() => galleryTrigger.current?.focus());
  }
  function openImage(item, event) {
    galleryTrigger.current = event.currentTarget;
    setSelected(item);
  }
  function openChat() { window.dispatchEvent(new Event('gradstudio:open-chat')); }
  return <><Header onChat={openChat} accountMenu /><main className="home-main"><section className="hero section-shell"><div className="hero-copy"><div className="hero-editorial-marker"><span>01 / 03</span><span className="hero-marker-line" aria-hidden="true" /><span>GradStudio — Portrait stories</span></div><h1><span className="hero-headline-line">Lưu giữ những</span>{' '}<span className="hero-headline-line hero-headline-accent"><em>khoảnh khắc</em><svg className="hero-underline" viewBox="0 0 230 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12C57 4 138 2 226 5" /></svg></span>{' '}<span className="hero-headline-line">của bạn.</span></h1><p className="lead">Từ buổi chụp tốt nghiệp đến những kỷ niệm thanh xuân đáng nhớ — mỗi câu chuyện đều xứng đáng có một khung hình riêng.</p><div className="hero-actions"><a className="button button-coral" href="#dich-vu">Xem dịch vụ <span aria-hidden="true">↗</span></a><button className="button button-outline" type="button" onClick={openChat}>Chat với studio <span aria-hidden="true">↗</span></button></div><p className="hero-caption"><span className="hero-caption-rule" aria-hidden="true" />Một dấu mốc đáng nhớ. Một câu chuyện thật riêng.</p><span className="hero-editorial-note" aria-hidden="true">Every frame tells a story.</span></div><HeroArt photo={heroPhotos[hoveredService ?? focusedService ?? 1]} /><aside className="hero-services"><p className="eyebrow">Dành cho khoảnh khắc của bạn</p><h2>Gói dịch vụ nổi bật</h2>{packages.map((item, i) => <a href="#dich-vu" className={'featured-service ' + (i === 1 ? 'featured' : '')} key={item.title} onPointerEnter={e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setHoveredService(i); }} onPointerLeave={e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setHoveredService(null); }} onFocus={() => setFocusedService(i)} onBlur={() => setFocusedService(null)}><img src={i === 0 ? "art/graduation-group.png" : i === 1 ? "art/graduation-portrait.png" : "art/portrait-window.png"} alt="" /><span><strong>{item.title}</strong><small>{item.price}</small></span><span aria-hidden="true">↗</span></a>)}</aside></section>
 <section className="service-section section-shell" id="dich-vu"><div className="section-heading"><div><p className="eyebrow">01 — Chọn câu chuyện</p><h2>Dịch vụ được tạo<br />để dành cho bạn.</h2></div><p className="section-aside">Ba khởi đầu khác nhau.<br />Một cách lưu giữ thật riêng.</p></div><div className="service-grid">{packages.map((item, index) => <article className={`service-card service-card-${index + 1}`} key={item.title}><span className="service-number">0{index + 1}</span><div className={`service-art service-art-${index + 1}`} aria-hidden="true"><img className="service-photo" src={index === 0 ? "art/graduation-group.png" : index === 1 ? "art/graduation-portrait.png" : "art/portrait-window.png"} alt="" loading="lazy" /><span>{['KỶ YẾU', 'TỐT NGHIỆP', 'PORTRAIT'][index]}</span><i /></div><div className="service-card-copy"><h3>{item.title}</h3><p className="service-price">{item.price}</p><details><summary>Xem gói dịch vụ</summary><p>{item.detail}</p></details>{index === 1 && <a className="text-link" href="studio.html">Tiếp tục tư vấn gói này <span aria-hidden="true">↗</span></a>}{index === 1 && <p className="fixture-note">Studio tiếp tục xử lý câu hỏi của Linh.</p>}</div></article>)}</div></section>
 <section className="gallery-section section-shell"><div className="section-heading"><div><p className="eyebrow">02 — Contact sheet</p><h2>Một chút ánh sáng,<br /><em className="gallery-heading-accent">một đời kỷ niệm.</em></h2><p className="gallery-archive">GradStudio Photography Archive</p></div><p className="section-aside">Chọn một khung hình để<br />xem câu chuyện lớn hơn.</p></div><div className="filter-row" role="group" aria-label="Lọc ảnh theo thể loại">{categories.map(c => <button type="button" key={c} className={`filter-pill ${category === c ? 'active' : ''}`} aria-label={c} aria-pressed={category === c} onClick={() => {
            setCategory(c);
            setSelected(null);
          }}>{c}<span className="filter-count" aria-hidden="true">{c === 'Tất cả' ? galleryItems.length : galleryItems.filter(item => item.category === c).length}</span></button>)}</div><p className="gallery-count" aria-live="polite">{filtered.length} khung hình · {category}</p><div className="gallery-grid" key={category}>{filtered.map((item, index) => <button key={item.id} className={`gallery-card ${item.tone} ${item.image ? 'has-photo' : ''} ${index % 2 ? 'gallery-tall' : ''}`} type="button" draggable="true" onDragStart={e => e.dataTransfer.setData('text/plain', String(item.id))} onClick={e => openImage(item, e)} aria-label={`Mở ảnh: ${item.label}`}>{item.image && <img className="gallery-photo" src={item.image} alt="" loading="lazy" />}<span className="gallery-mark">{item.mark}</span><span className="gallery-caption"><span className="gallery-editorial">{item.editorial}</span><span className="gallery-label">{item.label}</span><span className="gallery-subtitle">{item.subtitle}</span></span><span className="gallery-open" aria-hidden="true">↗</span></button>)}</div><div className="gallery-drop" onDragEnter={e => e.preventDefault()} onDragOver={e => {e.preventDefault();e.dataTransfer.dropEffect='copy'}} onDrop={e => {
          e.preventDefault();
          const item = galleryItems.find(image => image.id === Number(e.dataTransfer.getData('text/plain')));
          if (item && filtered.some(image => image.id === item.id)) setSelected(item);
        }}><span>Kéo một khung hình vào đây</span><span>hoặc chọn ảnh để xem lớn</span></div>{selected && <div className="lightbox" ref={viewer} tabIndex={-1} onKeyDown={e => {
          if (e.key === 'Escape') closeImage();
        }} role="region" aria-labelledby="lightbox-title"><div className={`lightbox-art ${selected.tone} ${selected.image ? 'has-photo' : ''}`}>{selected.image && <img className="gallery-photo" src={selected.image} alt={`Ảnh minh họa ${selected.category.toLocaleLowerCase('vi')} tạo bằng AI`} />}<span>{selected.mark}</span></div><div className="lightbox-copy"><p className="eyebrow">{selected.category} · GradStudio</p><h3 id="lightbox-title">{selected.label}</h3><p>Ảnh minh họa cho prototype; hình người được tạo bằng AI.</p><button className="button button-outline" type="button" onClick={closeImage}>Đóng khung hình</button></div><button className="lightbox-close" type="button" onClick={closeImage} aria-label="Đóng ảnh">×</button></div>}</section>
 <section className="process-section section-shell" id="quy-trinh" aria-labelledby="process-heading">
  <div className="journey-intro">
    <div><p className="eyebrow">03 — Một lịch hẹn, từ đầu đến cuối</p><h2 id="process-heading"><span className="journey-heading-line">Rõ ràng từ</span>{' '}<em className="journey-heading-line journey-heading-accent">lời chào đầu tiên.</em></h2></div>
    <p>Một quy trình đơn giản, để bạn chỉ cần tận hưởng những khoảnh khắc đẹp.</p>
  </div>
  <ol className="journey-steps">
    <li className="journey-step"><div className="journey-top"><span className="journey-number" aria-hidden="true">01</span><svg className="journey-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M25 14.5a9 9 0 0 1-9 9 9.3 9.3 0 0 1-3.8-.8L7 24l1.4-4.8A9 9 0 1 1 25 14.5Z"/><path d="M12 14h8m-8 4h5"/></svg></div><p className="journey-label">Tư vấn</p><h3>Chọn gói, hỏi điều bạn cần.</h3><p className="journey-detail">Bắt đầu bằng một cuộc trò chuyện với GradStudio.</p></li>
    <li className="journey-step"><div className="journey-top"><span className="journey-number" aria-hidden="true">02</span><svg className="journey-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="8" width="20" height="18" rx="2"/><path d="M11 5v6m10-6v6M6 13h20m-13 7 2 2 4-5"/></svg></div><p className="journey-label">Kiểm tra</p><h3>Studio kiểm tra người và tài nguyên.</h3><p className="journey-detail">Kiểm tra lịch nhân viên và tài nguyên trước khi đề xuất giờ phù hợp.</p></li>
    <li className="journey-step"><div className="journey-top"><span className="journey-number" aria-hidden="true">03</span><svg className="journey-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="10"/><path d="M16 10v6l4 3"/></svg></div><p className="journey-label">Thống nhất</p><h3>Thống nhất giờ trong cuộc trò chuyện.</h3><p className="journey-detail">Bạn và studio cùng xác nhận thời gian thuận tiện.</p></li>
    <li className="journey-step journey-step-final"><div className="journey-top"><span className="journey-number" aria-hidden="true">04</span><svg className="journey-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 4 25 8v7c0 6-4 10-9 13-5-3-9-7-9-13V8l9-4Z"/><path d="m12 16 3 3 5-6"/></svg></div><p className="journey-label">Xác nhận</p><h3>Cọc thành công và kiểm tra lại — lúc đó lịch mới được giữ.</h3><p className="journey-detail">Lịch chỉ được giữ chính thức sau khi giao dịch cọc thành công và tài nguyên được kiểm tra lại.</p></li>
  </ol>
</section><section className="handoff section-shell" aria-labelledby="consultation-heading"><div className="consultation-copy"><p className="eyebrow">Cùng GradStudio lưu giữ kỷ niệm</p><h2 id="consultation-heading">Mỗi khoảnh khắc<br /><em>đều có <span className="consultation-emphasis">câu chuyện riêng.</span></em></h2><p className="consultation-description">Chia sẻ ý tưởng của bạn, GradStudio sẽ giúp bạn tìm gói chụp và thời gian phù hợp.</p></div><div className="consultation-action"><button className="button button-dark" type="button" onClick={openChat}>Bắt đầu tư vấn <span aria-hidden="true">↗</span></button><span>Gói chụp · Lịch hẹn · Dịch vụ thêm</span></div></section></main><Footer /></>;
}

export { HeroArt, HomePage };

