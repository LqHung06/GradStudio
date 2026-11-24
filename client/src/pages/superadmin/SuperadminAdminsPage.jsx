import { useState } from 'react';
import { ApiError } from '../../api/client.js';
import { createAdmin, setAdminActive } from '../../api/superadmin.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Layout } from '../../components/Layout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import '../../styles/superadmin.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_CREATE_FORM = { name: '', email: '', password: '' };

function formatCreatedAt(iso) {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt);
}

function validateCreateAdmin(values) {
  const errors = {};
  const name = (values.name || '').trim();
  const email = (values.email || '').trim().toLowerCase();
  const password = values.password || '';

  if (name.length < 2 || name.length > 80) {
    errors.name = 'Tên từ 2 đến 80 ký tự';
  }

  if (!email) {
    errors.email = 'Vui lòng nhập email';
  } else if (email.length > 120) {
    errors.email = 'Email tối đa 120 ký tự';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Email không đúng định dạng';
  }

  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu ít nhất 8 ký tự';
  } else if (password.length > 100) {
    errors.password = 'Mật khẩu tối đa 100 ký tự';
  }

  return errors;
}

export function SuperadminAdminsPage() {
  const { data, error, loading, reload, setData } = useFetch('/api/admins');
  const admins = data?.admins || [];

  const [busyAdminId, setBusyAdminId] = useState(null);
  const [toggleError, setToggleError] = useState('');
  const [toggleMessage, setToggleMessage] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  const createForm = useForm({
    initial: INITIAL_CREATE_FORM,
    validate: validateCreateAdmin,
    onSubmit: async (values, { setServerErrors, reset }) => {
      setCreateMessage('');
      try {
        const res = await createAdmin({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        setData((prev) => ({
          ...prev,
          admins: [...(prev?.admins || []), res.admin],
        }));
        reset(INITIAL_CREATE_FORM);
        setCreateMessage('Đã tạo tài khoản Admin mới');
      } catch (err) {
        if (err instanceof ApiError && err.status === 409 && err.fields && Object.keys(err.fields).length > 0) {
          setServerErrors(err.fields);
          return;
        }
        throw err;
      }
    },
  });

  const handleFieldChange = (event) => {
    setCreateMessage('');
    createForm.handleChange(event);
  };

  const handleToggleActive = async (admin) => {
    if (busyAdminId) return;
    setBusyAdminId(admin.id);
    setToggleError('');
    setToggleMessage('');
    try {
      const nextActive = admin.active === false;
      const res = await setAdminActive(admin.id, nextActive);
      const updated = res.admin;
      setData((prev) => ({
        ...prev,
        admins: (prev?.admins || []).map((item) => (item.id === updated.id ? updated : item)),
      }));
      setToggleMessage(
        updated.active
          ? `Đã mở khóa tài khoản ${updated.name}.`
          : `Đã khóa tài khoản ${updated.name}.`,
      );
    } catch (err) {
      setToggleError(err?.message || 'Không thể cập nhật trạng thái Admin.');
    } finally {
      setBusyAdminId(null);
    }
  };

  return (
    <Layout>
      <section className="superadmin-page" aria-labelledby="superadmin-admins-heading">
        <header className="superadmin-header">
          <h1 id="superadmin-admins-heading">Tài khoản Admin</h1>
          <p className="superadmin-lead">
            Xem danh sách, tạo tài khoản Admin mới và khóa hoặc mở khóa quyền đăng nhập.
          </p>
        </header>

        <div className="superadmin-layout">
          <section className="superadmin-panel" aria-labelledby="admins-list-heading">
            <h2 id="admins-list-heading">Danh sách tài khoản</h2>

            {toggleError && (
              <p className="form-alert" role="alert">
                {toggleError}
              </p>
            )}

            {toggleMessage && (
              <p className="form-success" role="status">
                {toggleMessage}
              </p>
            )}

            <AsyncState
              loading={loading}
              error={error}
              onRetry={reload}
              isEmpty={admins.length === 0}
              emptyMessage="Chưa có tài khoản Admin nào."
            >
              <table className="admins-table">
                <caption>Danh sách tài khoản Admin</caption>
                <thead>
                  <tr>
                    <th scope="col">Họ tên</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Ngày tạo</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const isActive = admin.active !== false;
                    const isBusy = busyAdminId === admin.id;
                    return (
                      <tr key={admin.id}>
                        <td data-label="Họ tên">{admin.name}</td>
                        <td data-label="E-mail">{admin.email}</td>
                        <td data-label="Ngày tạo">{formatCreatedAt(admin.createdAt)}</td>
                        <td data-label="Trạng thái">
                          <StatusBadge
                            label={isActive ? 'Đang hoạt động' : 'Đã khóa'}
                            tone={isActive ? 'success' : 'danger'}
                          />
                        </td>
                        <td data-label="Thao tác">
                          <button
                            type="button"
                            className={`button ${isActive ? 'button-outline' : 'button-dark'}`}
                            disabled={isBusy}
                            onClick={() => handleToggleActive(admin)}
                          >
                            {isBusy ? 'Đang xử lý…' : isActive ? 'Khóa' : 'Mở khóa'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </AsyncState>
          </section>

          <section className="superadmin-panel" aria-labelledby="create-admin-heading">
            <h2 id="create-admin-heading">Tạo Admin</h2>

            <form onSubmit={createForm.handleSubmit} noValidate>
              <FormField
                name="name"
                label="Họ tên"
                required
                value={createForm.values.name}
                error={createForm.errors.name}
                onChange={handleFieldChange}
                hint="Từ 2 đến 80 ký tự."
                inputProps={{ maxLength: 80, autoComplete: 'name' }}
              />

              <FormField
                name="email"
                label="E-mail"
                type="email"
                required
                value={createForm.values.email}
                error={createForm.errors.email}
                onChange={handleFieldChange}
                inputProps={{ maxLength: 120, autoComplete: 'email' }}
              />

              <FormField
                name="password"
                label="Mật khẩu"
                type="password"
                required
                value={createForm.values.password}
                error={createForm.errors.password}
                onChange={handleFieldChange}
                hint="Ít nhất 8 ký tự, tối đa 100 ký tự."
                inputProps={{ maxLength: 100, autoComplete: 'new-password' }}
              />

              {createForm.submitError && (
                <p className="form-alert" role="alert">
                  {createForm.submitError}
                </p>
              )}

              {createMessage && (
                <p className="form-success" role="status">
                  {createMessage}
                </p>
              )}

              <div className="superadmin-form-actions">
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={createForm.submitting}
                >
                  {createForm.submitting ? 'Đang tạo…' : 'Tạo Admin'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </Layout>
  );
}
