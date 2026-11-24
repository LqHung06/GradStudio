import { Link, useParams } from 'react-router-dom';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/customer-pages.css';

export function PackageDetailPage() {
  const { id } = useParams();
  const packageReq = useFetch(id ? `/api/packages/${encodeURIComponent(id)}` : null);
  const extrasReq = useFetch('/api/extras');

  const pkg = packageReq.data?.package || null;
  const extras = extrasReq.data?.extras || [];
  const isNotFound = packageReq.error?.status === 404;

  const depositAmount = pkg ? Math.round(pkg.price * 0.3) : 0;
  const remainingAmount = pkg ? pkg.price - depositAmount : 0;

  return (
    <Layout>
      <nav className="breadcrumb-nav" aria-label="Đường dẫn">
        <Link className="text-link" to="/">
          ← Quay lại trang chủ
        </Link>
      </nav>

      {isNotFound ? (
        <section className="not-found-shell" aria-labelledby="pkg-not-found-heading">
          <h1 id="pkg-not-found-heading">Không tìm thấy gói chụp</h1>
          <p>Gói chụp bạn đang tìm không tồn tại hoặc đã thay đổi.</p>
          <Link className="button button-dark" to="/">
            Xem tất cả gói chụp
          </Link>
        </section>
      ) : (
        <article className="package-detail-card" aria-labelledby="package-title">
          <header className="package-detail-header">
            <p className="section-eyebrow">{pkg?.service?.name || 'Gói chụp GradStudio'}</p>
            <h1 id="package-title">{pkg ? pkg.name : 'Chi tiết gói chụp'}</h1>
          </header>

          <AsyncState
            loading={packageReq.loading}
            error={packageReq.error}
            onRetry={packageReq.reload}
            isEmpty={!pkg}
            emptyMessage="Không có thông tin gói chụp."
          >
            {pkg && (
              <>
                <dl className="package-summary-grid">
                  <div className="package-summary-item">
                    <dt>Giá trọn gói</dt>
                    <dd>
                      <Money amount={pkg.price} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Đặt cọc 30% để giữ lịch</dt>
                    <dd>
                      <Money amount={depositAmount} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Phần còn lại 70%</dt>
                    <dd>
                      <Money amount={remainingAmount} />
                    </dd>
                  </div>
                  <div className="package-summary-item">
                    <dt>Thời lượng &amp; ảnh chỉnh</dt>
                    <dd>
                      {pkg.durationHours} giờ · {pkg.editedPhotos} ảnh chỉnh
                    </dd>
                  </div>
                </dl>

                <section aria-labelledby="package-includes-heading">
                  <h2 id="package-includes-heading">Gói chụp bao gồm</h2>
                  {Array.isArray(pkg.includes) && pkg.includes.length > 0 ? (
                    <ul className="catalog-meta-list">
                      {pkg.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Chưa có danh sách hạng mục chi tiết.</p>
                  )}
                </section>

                <section aria-labelledby="package-extras-heading">
                  <h2 id="package-extras-heading">Dịch vụ thêm đi kèm</h2>
                  <p className="extras-note">
                    Các tùy chọn đi kèm không tính giá riêng; bạn có thể chọn khi gửi yêu cầu đặt lịch trong phần chat.
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

                <div className="catalog-card-actions">
                  <Link className="button button-coral" to={`/chat?packageId=${pkg.id}`}>
                    Tư vấn và đặt gói này
                  </Link>
                  <Link className="button button-outline" to="/">
                    Xem các gói khác
                  </Link>
                </div>
              </>
            )}
          </AsyncState>
        </article>
      )}
    </Layout>
  );
}
