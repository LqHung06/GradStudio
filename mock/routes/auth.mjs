// Auth routes: docs/api/01-auth.md (owner TV1).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The User shared object (docs/api/README.md): never email or password.
const publicUser = (u) => ({ id: u.id, name: u.name, role: u.role });

function validateLogin(body) {
  const fields = {};

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (email === '') fields.email = 'Vui lòng nhập email';
  else if (email.length > 120) fields.email = 'Email tối đa 120 ký tự';
  else if (!EMAIL_RE.test(email)) fields.email = 'Email không đúng định dạng';

  const password = typeof body.password === 'string' ? body.password : '';
  if (password === '') fields.password = 'Vui lòng nhập mật khẩu';
  else if (password.length > 100) fields.password = 'Mật khẩu tối đa 100 ký tự';

  return { email, password, fields };
}

export default [
  {
    method: 'POST',
    path: '/api/auth/login',
    roles: null,
    handler: ({ body, db, fail }) => {
      const { email, password, fields } = validateLogin(body);
      if (Object.keys(fields).length > 0) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);

      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      // Users with password null are people of the story only: they cannot sign in.
      if (!user || user.password === null || user.password !== password) {
        return fail(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
      }
      if (user.active === false) {
        return fail(403, 'FORBIDDEN', 'Tài khoản đã bị khóa');
      }
      return { status: 200, body: { token: `token-${user.id}`, user: publicUser(user) } };
    },
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    roles: 'signed-in',
    handler: ({ user }) => ({ status: 200, body: { user: publicUser(user) } }),
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    roles: 'signed-in',
    // Mock tokens are not stored, so the same token keeps working (contract-check reuses it).
    handler: () => ({ status: 204 }),
  },
];
