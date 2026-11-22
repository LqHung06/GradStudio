import { Navigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { ForbiddenPage } from '../pages/ForbiddenPage.jsx';
import { useAuth } from './AuthContext.jsx';

/**
 * Protects a route by authentication and allowed role(s).
 */
export function RequireRole({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <Layout>
        <p className="async-loading" role="status">
          Đang tải…
        </p>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  if (Array.isArray(roles) && !roles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return children;
}
