import { RequireRole } from '../auth/RequireRole.jsx';
import { StaffJobDetailPage } from '../pages/staff/StaffJobDetailPage.jsx';
import { StaffJobsPage } from '../pages/staff/StaffJobsPage.jsx';

export const staffRoutes = [
  {
    path: '/staff/jobs',
    element: (
      <RequireRole roles={['staff']}>
        <StaffJobsPage />
      </RequireRole>
    ),
  },
  {
    path: '/staff/jobs/:id',
    element: (
      <RequireRole roles={['staff']}>
        <StaffJobDetailPage />
      </RequireRole>
    ),
  },
];
