import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';

export function NotFoundPage({ user = null, onSignOut }) {
  return (
    <Layout user={user} onSignOut={onSignOut}>
      <section className="not-found-shell" aria-labelledby="not-found-heading">
        <h1 id="not-found-heading">Không tìm thấy trang</h1>
        <p>Đường dẫn bạn mở không tồn tại hoặc đã được chuyển sang địa chỉ khác.</p>
        <Link className="button button-dark" to="/">
          Về trang chủ
        </Link>
      </section>
    </Layout>
  );
}
