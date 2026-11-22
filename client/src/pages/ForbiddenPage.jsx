import { Link } from 'react-router-dom';
import { ROLE_HOME, useAuth } from '../auth/AuthContext.jsx';
import { Layout } from '../components/Layout.jsx';

export function ForbiddenPage() {
  const { user } = useAuth();
  const homePath = (user && ROLE_HOME[user.role]) || '/';

  return (
    <Layout>
      <section className="not-found-shell" aria-labelledby="forbidden-heading">
        <h1 id="forbidden-heading">Không có quyền truy cập</h1>
        <p>Tài khoản hiện tại không có quyền mở trang này. Bạn có thể quay về trang chính của vai trò mình hoặc đăng xuất để đăng nhập bằng tài khoản khác.</p>
        <Link className="button button-dark" to={homePath}>
          Về trang chính của bạn
        </Link>
      </section>
    </Layout>
  );
}
