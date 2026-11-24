import { RequireRole } from '../auth/RequireRole.jsx';
import { AdminBookingsPage, ConversationsPage } from '../pages/admin/AdminLists.jsx';
import { ConversationPage } from '../pages/admin/ConversationPage.jsx';
import '../pages/admin/admin.css';

export const adminRoutes = [
  { path: '/admin/conversations', Page: ConversationsPage },
  { path: '/admin/conversations/:id', Page: ConversationPage },
  { path: '/admin/bookings', Page: AdminBookingsPage },
].map(({ path, Page }) => ({
  path,
  element: <RequireRole roles={['admin']}><Page /></RequireRole>,
}));
