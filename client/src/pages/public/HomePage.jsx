import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { formatDate } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Tư vấn và gửi yêu cầu',
    detail: 'Chọn gói chụp phù hợp, nhắn tin với studio hoặc gửi yêu cầu ngày giờ mong muốn.',
  },
  {
    number: '02',
    title: 'Studio kiểm tra tài nguyên',
    detail: 'Admin kiểm tra lịch thợ makeup, thợ chụp và phòng studio trước khi đề xuất khung giờ trống.',
  },
  {
    number: '03',
    title: 'Thống nhất giờ trong chat',
    detail: 'Hai bên xác nhận khung giờ thuận tiện trong cuộc trò chuyện. Bước này chưa giữ lịch.',
  },
  {
    number: '04',
    title: 'Đặt cọc 30% để giữ lịch',
    detail: 'Lịch chỉ được giữ chính thức sau khi đặt cọc 30% thành công và hệ thống kiểm tra lại tài nguyên.',
  },
];

export function HomePage() {
  const servicesReq = useFetch('/api/services');
  const packagesReq = useFetch('/api/packages');
  const extrasReq = useFetch('/api/extras');
  const portfolioReq = useFetch('/api/portfolio');
  const reviewsReq = useFetch('/api/reviews');

  const services = servicesReq.data?.services || [];
  const packages = packagesReq.data?.packages || [];
  const extras = extrasReq.data?.extras || [];
  const photos = portfolioReq.data?.photos || [];
  const reviews = reviewsReq.data?.reviews || [];

  const [selectedServiceId, setSelectedServiceId] = useState('all');
  const [selectedPortfolioServiceId, setSelectedPortfolioServiceId] = useState('all');
  const [activePhoto, setActivePhoto] = useState(null);
  const photoTriggerRef = useRef(null);
  const previewPanelRef = useRef(null);

  useEffect(() => {
    if (activePhoto) {
      previewPanelRef.current?.focus();
    }
  }, [activePhoto]);

  const filteredPackages =
    selectedServiceId === 'all'
      ? packages
      : packages.filter((pkg) => pkg.serviceId === selectedServiceId);

  const filteredPhotos =
    selectedPortfolioServiceId === 'all'
      ? photos
      : photos.filter((photo) => photo.serviceId === selectedPortfolioServiceId);

  const serviceNameById = Object.fromEntries(services.map((s) => [s.id, s.name]));

  function handleOpenPhoto(photo, event) {
    photoTriggerRef.current = event.currentTarget;
    setActivePhoto(photo);
  }

  function handleClosePhoto() {
    setActivePhoto(null);
    requestAnimationFrame(() => photoTriggerRef.current?.focus());
  }

  return (
    <Layout mainClassName="section-shell page-main">
      <section className="public-hero" aria-labelledby="hero-heading">
        <div className="public-hero-copy">
          <p className="section-eyebrow">GradStudio · Studio chụp ảnh tốt nghiệp &amp; chân dung</p>
          <h1 id="hero-heading">
            Lưu giữ những <em>khoảnh khắc</em> đáng nhớ của bạn.
          </h1>
          <p className="public-hero-lead">
            Từ kỷ yếu lớp, tốt nghiệp cá nhân đến chân dung CV — đặt lịch rõ ràng, minh bạch giá gói và chọn ảnh trực tiếp trên tài khoản của bạn.
          </p>
          <div className="public-hero-actions">
            <a className="button button-coral" href="#dich-vu">
              Xem dịch vụ
            </a>
            <Link className="button button-outline" to="/chat">
              Chat với studio
            </Link>
          </div>
        </div>

        <figure className="public-hero-media">
          <img
            src="/art/graduation-portrait.png"
            alt="Minh họa tân cử nhân trong trang phục tốt nghiệp tại GradStudio"
          />
          <figcaption className="public-hero-caption">
            Ảnh minh họa được tạo bằng AI cho GradStudio · Lịch chụp giữ chính thức sau khi cọc 30%.
          </figcaption>
        </figure>
      </section>

      <section className="public-page-section" id="dich-vu" aria-labelledby="services-heading">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">01 — Dịch vụ</p>
            <h2 id="services-heading">Các dịch vụ chụp ảnh</h2>
          </div>
          <p className="section-subtitle">
            Chọn nhóm dịch vụ để lọc bảng giá gói chụp và tham khảo các loại buổi chụp tương ứng.
          </p>
        </div>

        <AsyncState
          loading={servicesReq.loading}
          error={servicesReq.error}
          onRetry={servicesReq.reload}
          isEmpty={services.length === 0}
          emptyMessage="Hiện chưa có dịch vụ chụp ảnh nào."
        >
          <div className="catalog-grid">
            {services.map((service) => (
              <article key={service.id} className="catalog-card">
                {service.image && (
                  <img
                    className="catalog-card-media"
                    src={service.image}
                    alt={`Minh họa dịch vụ ${service.name}`}
                    loading="lazy"
                  />
                )}
                <h3>{service.name}</h3>
                <p className="catalog-price-line">
                  Giá từ <Money amount={service.fromPrice} />
                  {service.priceUnit ? ` / ${service.priceUnit}` : ''}
                </p>
                <p>{service.description}</p>
                {Array.isArray(service.shootTypes) && service.shootTypes.length > 0 && (
                  <ul className="catalog-tag-list" aria-label={`Loại chụp của ${service.name}`}>
                    {service.shootTypes.map((type) => (
                      <li key={type} className="catalog-tag">
                        {type}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="catalog-card-actions">
                  <a
                    className="button button-outline"
                    href="#bang-gia"
                    onClick={() => setSelectedServiceId(service.id)}
                  >
                    Xem gói {service.name}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </AsyncState>
      </section>

      <section className="public-page-section" id="bang-gia" aria-labelledby="packages-heading">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">02 — Bảng giá</p>
            <h2 id="packages-heading">Gói chụp và chi tiết</h2>
          </div>
          <p className="section-subtitle">
            Giá trọn gói được tính theo gói đã chọn; cọc trước 30% và thanh toán 70% sau khi chọn ảnh.
          </p>
        </div>

        {services.length > 0 && (
          <div className="catalog-filters" role="group" aria-label="Lọc gói chụp theo dịch vụ">
            <button
              type="button"
              className="catalog-filter-btn"
              aria-pressed={selectedServiceId === 'all'}
              onClick={() => setSelectedServiceId('all')}
            >
              Tất cả gói
            </button>
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className="catalog-filter-btn"
                aria-pressed={selectedServiceId === service.id}
                onClick={() => setSelectedServiceId(service.id)}
              >
                {service.name}
              </button>
            ))}
          </div>
        )}

        <AsyncState
          loading={packagesReq.loading}
          error={packagesReq.error}
          onRetry={packagesReq.reload}
          isEmpty={filteredPackages.length === 0}
          emptyMessage="Chưa có gói chụp nào phù hợp với bộ lọc hiện tại."
        >
          <div className="catalog-grid">
            {filteredPackages.map((pkg) => (
              <article key={pkg.id} className="catalog-card">
                <p className="section-eyebrow">{serviceNameById[pkg.serviceId] || 'Gói chụp'}</p>
                <h3>{pkg.name}</h3>
                <p className="catalog-price-line">
                  <Money amount={pkg.price} />
                </p>
                <p>
                  Thời lượng: <strong>{pkg.durationHours} giờ</strong> ·{' '}
                  <strong>{pkg.editedPhotos} ảnh chỉnh</strong>
                </p>
                {Array.isArray(pkg.includes) && pkg.includes.length > 0 && (
                  <ul className="catalog-meta-list">
                    {pkg.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                <div className="catalog-card-actions">
                  <Link className="button button-outline" to={`/packages/${pkg.id}`}>
                    Xem chi tiết gói
                  </Link>
                  <Link className="button button-dark" to={`/chat?packageId=${pkg.id}`}>
                    Tư vấn gói này
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </AsyncState>
      </section>

      <section className="public-page-section" id="dich-vu-them" aria-labelledby="extras-heading">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">03 — Dịch vụ thêm</p>
            <h2 id="extras-heading">Tùy chọn đi kèm buổi chụp</h2>
          </div>
        </div>
        <p className="extras-note">
          Các tùy chọn đi kèm không tính giá riêng trên bảng giá; tổng chi phí buổi chụp áp dụng theo gói chụp bạn chọn.
        </p>

        <AsyncState
          loading={extrasReq.loading}
          error={extrasReq.error}
          onRetry={extrasReq.reload}
          isEmpty={extras.length === 0}
          emptyMessage="Hiện chưa có dịch vụ thêm nào."
        >
          <ul className="extras-list">
            {extras.map((extra) => (
              <li key={extra.id} className="extra-card">
                <h3>{extra.name}</h3>
                <p>{extra.note}</p>
              </li>
            ))}
          </ul>
        </AsyncState>
      </section>

      <section className="public-page-section" id="anh-mau" aria-labelledby="portfolio-heading">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">04 — Ảnh mẫu</p>
            <h2 id="portfolio-heading">Bộ sưu tập minh họa</h2>
          </div>
          <p className="section-subtitle">
            Chọn từng khung hình để xem kích thước lớn. Hình minh họa nhân vật hư cấu tạo bằng AI.
          </p>
        </div>

        {services.length > 0 && (
          <div className="catalog-filters" role="group" aria-label="Lọc ảnh mẫu theo dịch vụ">
            <button
              type="button"
              className="catalog-filter-btn"
              aria-pressed={selectedPortfolioServiceId === 'all'}
              onClick={() => {
                setSelectedPortfolioServiceId('all');
                setActivePhoto(null);
              }}
            >
              Tất cả ảnh
            </button>
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className="catalog-filter-btn"
                aria-pressed={selectedPortfolioServiceId === service.id}
                onClick={() => {
                  setSelectedPortfolioServiceId(service.id);
                  setActivePhoto(null);
                }}
              >
                {service.name}
              </button>
            ))}
          </div>
        )}

        <AsyncState
          loading={portfolioReq.loading}
          error={portfolioReq.error}
          onRetry={portfolioReq.reload}
          isEmpty={filteredPhotos.length === 0}
          emptyMessage="Chưa có ảnh mẫu nào trong mục này."
        >
          <div className="portfolio-grid">
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="portfolio-card"
                onClick={(event) => handleOpenPhoto(photo, event)}
              >
                <img src={photo.url} alt={photo.alt} loading="lazy" />
                <span className="portfolio-card-caption">{photo.title}</span>
              </button>
            ))}
          </div>
        </AsyncState>

        {activePhoto && (
          <div
            className="portfolio-preview-panel"
            ref={previewPanelRef}
            tabIndex={-1}
            role="region"
            aria-labelledby="portfolio-preview-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') handleClosePhoto();
            }}
          >
            <img src={activePhoto.url} alt={activePhoto.alt} />
            <div className="portfolio-preview-copy">
              <p className="section-eyebrow">
                {serviceNameById[activePhoto.serviceId] || 'GradStudio'}
              </p>
              <h3 id="portfolio-preview-title">{activePhoto.title}</h3>
              <p>{activePhoto.alt}</p>
              <button type="button" className="button button-outline" onClick={handleClosePhoto}>
                Đóng khung xem lớn
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="public-page-section" id="danh-gia" aria-labelledby="reviews-heading">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">05 — Đánh giá</p>
            <h2 id="reviews-heading">Cảm nhận từ khách hàng</h2>
          </div>
        </div>

        <AsyncState
          loading={reviewsReq.loading}
          error={reviewsReq.error}
          onRetry={reviewsReq.reload}
          isEmpty={reviews.length === 0}
          emptyMessage="Chưa có đánh giá nào từ khách hàng."
        >
          <div className="catalog-grid">
            {reviews.map((review) => (
              <article key={review.id} className="catalog-card">
                <div className="review-header">
                  <span className="review-avatar" aria-hidden="true">
                    {review.initials}
                  </span>
                  <div className="review-meta">
                    <strong>{review.author}</strong>
                    <span className="review-date">{formatDate(review.date)}</span>
                  </div>
                </div>
                <p className="review-rating">
                  <span aria-hidden="true">{'★'.repeat(Math.max(1, Math.min(5, review.rating || 5)))}</span>{' '}
                  <span>{review.rating}/5 sao</span>
                </p>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        </AsyncState>
      </section>

      <section className="public-page-section" id="quy-trinh" aria-labelledby="process-heading">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">06 — Quy trình</p>
            <h2 id="process-heading">Bốn bước đặt lịch rõ ràng</h2>
          </div>
        </div>

        <ol className="journey-steps-grid">
          {PROCESS_STEPS.map((step) => (
            <li key={step.number} className="journey-step-card">
              <span className="process-step-num">Bước {step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </li>
          ))}
        </ol>

        <div className="home-cta-banner">
          <div>
            <h2>Sẵn sàng lên lịch chụp cùng GradStudio?</h2>
            <p>
              Nhắn tin với studio để kiểm tra giờ trống và nhận đề xuất lịch chụp phù hợp cho bạn.
            </p>
          </div>
          <Link className="button button-coral" to="/chat">
            Bắt đầu tư vấn
          </Link>
        </div>
      </section>
    </Layout>
  );
}
