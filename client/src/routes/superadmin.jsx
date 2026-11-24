import { RequireRole } from '../auth/RequireRole.jsx';
import { SuperadminAdminsPage } from '../pages/superadmin/SuperadminAdminsPage.jsx';
import { SuperadminSettingsPage } from '../pages/superadmin/SuperadminSettingsPage.jsx';

export const superadminRoutes = [
  {
    path: '/superadmin/admins',
    element: (
      <RequireRole roles={['superadmin']}>
        <SuperadminAdminsPage />
      </RequireRole>
    ),
  },
  {
    path: '/superadmin/settings',
    element: (
      <RequireRole roles={['superadmin']}>
        <SuperadminSettingsPage />
      </RequireRole>
    ),
  },
];
