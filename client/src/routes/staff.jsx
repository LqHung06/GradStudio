import { RequireRole } from '../auth/RequireRole.jsx';
import { Layout } from '../components/Layout.jsx';

// Temporary role-home placeholder for G2 verification; TV1 replaces this in G8 (/staff/jobs, /staff/jobs/:id).
function StaffHomePlaceholder() {
  return (
    <Layout>
      <section className="foundation-probe" aria-labelledby="staff-home-heading">
        <h1 id="staff-home-heading">Việc của tôi</h1>
        <p>Trang chính dành cho nhân viên studio (G8 sẽ được nối tiếp ở bước sau).</p>
      </section>
    </Layout>
  );
}

export const staffRoutes = [
  {
    path: '/staff/jobs',
    element: (
      <RequireRole roles={['staff']}>
        <StaffHomePlaceholder />
      </RequireRole>
    ),
  },
];
