import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { adminRoutes } from './routes/admin.jsx';
import { customerRoutes } from './routes/customer.jsx';
import { publicRoutes } from './routes/public.jsx';
import { staffRoutes } from './routes/staff.jsx';
import { superadminRoutes } from './routes/superadmin.jsx';

const allRoutes = [
  ...publicRoutes,
  ...customerRoutes,
  ...adminRoutes,
  ...staffRoutes,
  ...superadminRoutes,
];

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {allRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
