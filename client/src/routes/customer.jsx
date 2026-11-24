import { RequireRole } from '../auth/RequireRole.jsx';
import { BookingDetailPage } from '../pages/customer/BookingDetailPage.jsx';
import { CustomerChatPage } from '../pages/customer/CustomerChatPage.jsx';
import { MyBookingsPage } from '../pages/customer/MyBookingsPage.jsx';
import { PaymentResultPage } from '../pages/customer/PaymentResultPage.jsx';
import { TestGatewayPage } from '../pages/customer/TestGatewayPage.jsx';

export const customerRoutes = [
  { path: '/chat', Page: CustomerChatPage },
  { path: '/my-bookings', Page: MyBookingsPage },
  { path: '/my-bookings/:code', Page: BookingDetailPage },
  { path: '/test-gateway/:paymentId', Page: TestGatewayPage },
  { path: '/payments/:paymentId/result', Page: PaymentResultPage },
].map(({ path, Page }) => ({
  path,
  element: (
    <RequireRole roles={['customer']}>
      <Page />
    </RequireRole>
  ),
}));
