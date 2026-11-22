import { RequireRole } from '../auth/RequireRole.jsx';
import { Layout } from '../components/Layout.jsx';

// Temporary role-home placeholder for G2 verification; TV2 replaces this with G7 MyBookingsPage
// and adds /chat, /my-bookings/:code, /test-gateway/:paymentId, /payments/:id/result,
// /notifications, /my-bookings/:code/gallery.
function CustomerHomePlaceholder() {
  return (
    <Layout>
      <section className="foundation-probe" aria-labelledby="customer-home-heading">
        <h1 id="customer-home-heading">Lịch chụp của tôi</h1>
        <p>Trang chính dành cho khách hàng (G7 sẽ được nối tiếp bởi TV2).</p>
      </section>
    </Layout>
  );
}

export const customerRoutes = [
  {
    path: '/my-bookings',
    element: (
      <RequireRole roles={['customer']}>
        <CustomerHomePlaceholder />
      </RequireRole>
    ),
  },
];
