import { HomePage } from '../pages/public/HomePage.jsx';
import { PackageDetailPage } from '../pages/public/PackageDetailPage.jsx';
import { SignInPage } from '../pages/SignInPage.jsx';

export const publicRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/packages/:id', element: <PackageDetailPage /> },
  { path: '/sign-in', element: <SignInPage /> },
];
