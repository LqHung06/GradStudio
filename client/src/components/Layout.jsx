import { Link, NavLink } from 'react-router-dom';

const NAV_BY_ROLE = {
  public: [
    { to: '/', label: 'Trang chủ', end: true },
  ],
  customer: [
    { to: '/', label: 'Trang chủ', end: true },
    { to: '/chat', label: 'Chat tư vấn' },
    { to: '/my-bookings', label: 'Lịch chụp của tôi' },
    { to: '/notifications', label: 'Nhắc lịch' },
  ],
  admin: [
    { to: '/admin/conversations', label: 'Hội thoại' },
    { to: '/admin/bookings', label: 'Booking' },
  ],
  staff: [
    { to: '/staff/jobs', label: 'Việc của tôi' },
  ],
  superadmin: [
    { to: '/superadmin/admins', label: 'Tài khoản Admin' },
    { to: '/superadmin/settings', label: 'Cài đặt' },
  ],
};

/**
 * Shared page shell with skip-link, role-based navigation, <main id="main"> and text-only footer.
 */
export function Layout({ user = null, onSignOut, mainClassName = 'section-shell page-main', children }) {
  const role = user?.role && NAV_BY_ROLE[user.role] ? user.role : 'public';
  const navItems = NAV_BY_ROLE[role];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Bỏ qua tới nội dung chính
      </a>

      <header className="site-header">
        <Link className="brand" to="/" aria-label="GradStudio — Trang chủ">
          <span className="brand-mark" aria-hidden="true">◎</span>
          <span>GradStudio</span>
        </Link>

        <nav className="main-nav" aria-label="Chính">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={Boolean(item.end)}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name}</span>
              <button
                type="button"
                className="button button-outline"
                onClick={onSignOut}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link className="button button-dark" to="/sign-in">
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      <main id="main" className={mainClassName}>
        {children}
      </main>

      <footer className="site-footer">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true">◉</span>
          <span>GradStudio</span>
        </span>
        <span>Studio portrait stories · Saigon</span>
      </footer>
    </div>
  );
}
