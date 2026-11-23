// Admin accounts: docs/api/12-admins.md (owner TV1).
// Admins are the users with role "admin" in db.users, so a new Admin can sign in
// at once through POST /api/auth/login (mock/routes/auth.mjs).

import { nowIso } from '../lib/time.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // same rule as sign-in

// The Admin object: never the password. active reflects the real account state (default true).
const toAdmin = (u) => ({ id: u.id, name: u.name, email: u.email, active: u.active !== false, createdAt: u.createdAt });

function validateAdmin(body) {
  const fields = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 2 || name.length > 80) fields.name = 'Tên từ 2 đến 80 ký tự';

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email === '') fields.email = 'Vui lòng nhập email';
  else if (email.length > 120) fields.email = 'Email tối đa 120 ký tự';
  else if (!EMAIL_RE.test(email)) fields.email = 'Email không đúng định dạng';

  const password = typeof body.password === 'string' ? body.password : '';
  if (password === '') fields.password = 'Vui lòng nhập mật khẩu';
  else if (password.length < 8) fields.password = 'Mật khẩu ít nhất 8 ký tự';
  else if (password.length > 100) fields.password = 'Mật khẩu tối đa 100 ký tự';

  return { name, email, password, fields };
}

// u-admin-1, u-admin-2, ...: the highest number in use + 1.
function nextAdminId(users) {
  let max = 0;
  for (const u of users) {
    const m = /^u-admin-(\d+)$/.exec(u.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `u-admin-${max + 1}`;
}

export default [
  {
    method: 'GET',
    path: '/api/admins',
    roles: ['superadmin'],
    handler: ({ db }) => {
      const admins = db.users
        .filter((u) => u.role === 'admin')
        // Moments share the +07:00 offset, so comparing the strings sorts them in time order.
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
        .map(toAdmin);
      return { status: 200, body: { admins } };
    },
  },
  {
    method: 'POST',
    path: '/api/admins',
    roles: ['superadmin'],
    handler: ({ body, db, fail }) => {
      const { name, email, password, fields } = validateAdmin(body);
      if (Object.keys(fields).length > 0) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);

      // Checked against every user (customers and staff too), without case.
      if (db.users.some((u) => u.email.toLowerCase() === email)) {
        return fail(409, 'EMAIL_TAKEN', 'Email này đã được dùng', { email: 'Email này đã được dùng' });
      }

      const user = {
        id: nextAdminId(db.users),
        name,
        role: 'admin',
        email, // stored in lower case
        password,
        active: true,
        createdAt: nowIso(),
      };
      db.users.push(user);
      return { status: 201, body: { admin: toAdmin(user) } };
    },
  },
  {
    method: 'PATCH',
    path: '/api/admins/:id',
    roles: ['superadmin'],
    handler: ({ params, body, db, fail }) => {
      const admin = db.users.find((u) => u.id === params.id && u.role === 'admin');
      if (!admin) return fail(404, 'NOT_FOUND', 'Không tìm thấy tài khoản Admin này');

      const fields = {};
      if (typeof body.active !== 'boolean') {
        fields.active = 'Trạng thái khóa phải là true hoặc false';
      }
      for (const key of Object.keys(body)) {
        if (key !== 'active') {
          fields[key] = 'Chỉ được cập nhật trạng thái hoạt động (active)';
        }
      }
      if (Object.keys(fields).length > 0) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);
      }

      admin.active = body.active;
      return { status: 200, body: { admin: toAdmin(admin) } };
    },
  },
];
