import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROLE_HOME, canRoleAccessPath, useAuth } from '../auth/AuthContext.jsx';
import { FormField } from '../components/FormField.jsx';
import { Layout } from '../components/Layout.jsx';
import { useForm } from '../hooks/useForm.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignIn(values) {
  const errors = {};
  const email = (values.email || '').trim();
  const password = values.password || '';

  if (!email) {
    errors.email = 'Vui lòng nhập email';
  } else if (email.length > 120) {
    errors.email = 'Email tối đa 120 ký tự';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Email không đúng định dạng';
  }

  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (password.length > 100) {
    errors.password = 'Mật khẩu tối đa 100 ký tự';
  }

  return errors;
}

export function SignInPage() {
  const { user, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const form = useForm({
    initial: { email: '', password: '' },
    validate: validateSignIn,
    onSubmit: async (values) => {
      const signedInUser = await signIn({
        email: values.email,
        password: values.password,
      });

      const fromPath = from?.pathname;
      if (fromPath && canRoleAccessPath(signedInUser.role, fromPath)) {
        navigate(`${fromPath}${from.search || ''}${from.hash || ''}`, { replace: true });
      } else {
        navigate(ROLE_HOME[signedInUser.role] || '/', { replace: true });
      }
    },
  });

  return (
    <Layout>
      <section className="auth-card" aria-labelledby="signin-heading">
        <h1 id="signin-heading">Đăng nhập</h1>
        <p className="auth-lead">Đăng nhập bằng tài khoản GradStudio để tiếp tục.</p>

        {ready && user && (
          <p className="auth-session-note" role="status">
            Bạn đang đăng nhập với tài khoản <strong>{user.name}</strong>.{' '}
            <Link className="text-link" to={ROLE_HOME[user.role] || '/'}>
              Về trang chính
            </Link>
          </p>
        )}

        <form onSubmit={form.handleSubmit} noValidate>
          <FormField
            name="email"
            label="E-mail"
            type="email"
            required
            value={form.values.email}
            error={form.errors.email}
            onChange={form.handleChange}
            inputProps={{ autoComplete: 'email', maxLength: 120, onFocus: form.clearSubmitError }}
          />

          <FormField
            name="password"
            label="Mật khẩu"
            type="password"
            required
            value={form.values.password}
            error={form.errors.password}
            onChange={form.handleChange}
            inputProps={{ autoComplete: 'current-password', maxLength: 100, onFocus: form.clearSubmitError }}
          />

          {form.submitError && (
            <p className="form-alert" role="alert">
              {form.submitError}
            </p>
          )}

          <button
            type="submit"
            className="button button-dark auth-submit"
            disabled={form.submitting}
          >
            {form.submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </Layout>
  );
}
