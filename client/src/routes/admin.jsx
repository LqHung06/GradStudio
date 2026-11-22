import { RequireRole } from '../auth/RequireRole.jsx';
import { Layout } from '../components/Layout.jsx';

// Temporary role-home placeholder for G2 verification; TV3 replaces this with G4 ConversationsPage
// and adds /admin/conversations/:id, /admin/bookings, /admin/bookings/:code.
function AdminHomePlaceholder() {
  return (
    <Layout>
      <section className="foundation-probe" aria-labelledby="admin-home-heading">
        <h1 id="admin-home-heading">Hội thoại khách hàng</h1>
        <p>Trang chính dành cho Admin (G4 sẽ được nối tiếp bởi TV3).</p>
      </section>
    </Layout>
  );
}

export const adminRoutes = [
  {
    path: '/admin/conversations',
    element: (
      <RequireRole roles={['admin']}>
        <AdminHomePlaceholder />
      </RequireRole>
    ),
  },
];
