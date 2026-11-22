import { RequireRole } from '../auth/RequireRole.jsx';
import { Layout } from '../components/Layout.jsx';

// Temporary role-home placeholder for G2 verification; TV1 replaces this in G11 (/superadmin/admins, /superadmin/settings).
function SuperadminHomePlaceholder() {
  return (
    <Layout>
      <section className="foundation-probe" aria-labelledby="superadmin-home-heading">
        <h1 id="superadmin-home-heading">Tài khoản Admin</h1>
        <p>Trang chính dành cho Superadmin (G11 sẽ được nối tiếp ở bước sau).</p>
      </section>
    </Layout>
  );
}

export const superadminRoutes = [
  {
    path: '/superadmin/admins',
    element: (
      <RequireRole roles={['superadmin']}>
        <SuperadminHomePlaceholder />
      </RequireRole>
    ),
  },
];
