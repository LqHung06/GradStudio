import { useEffect, useState } from 'react';
import { ApiError } from '../../api/client.js';
import { saveSettings } from '../../api/superadmin.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Layout } from '../../components/Layout.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import '../../styles/superadmin.css';

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const INITIAL_SETTINGS_FORM = {
  open: '08:00',
  close: '20:00',
  reminderHoursBefore: '24',
};

function validateSettings(values) {
  const errors = {};
  const open = String(values.open || '').trim();
  const close = String(values.close || '').trim();
  const openOk = HHMM_RE.test(open);
  const closeOk = HHMM_RE.test(close);

  if (!openOk) {
    errors.open = 'Giờ không đúng định dạng HH:mm';
  }
  if (!closeOk) {
    errors.close = 'Giờ không đúng định dạng HH:mm';
  } else if (openOk && close <= open) {
    errors.close = 'Giờ đóng cửa phải sau giờ mở cửa';
  }

  const rawHours = String(values.reminderHoursBefore ?? '').trim();
  if (!/^\d+$/.test(rawHours)) {
    errors.reminderHoursBefore = 'Chọn từ 1 đến 168 giờ';
  } else {
    const num = Number(rawHours);
    if (!Number.isInteger(num) || num < 1 || num > 168) {
      errors.reminderHoursBefore = 'Chọn từ 1 đến 168 giờ';
    }
  }

  return errors;
}

function mapApiSettingsFields(apiFields = {}) {
  const mapped = {};
  if (apiFields['openingHours.open']) mapped.open = apiFields['openingHours.open'];
  if (apiFields['openingHours.close']) mapped.close = apiFields['openingHours.close'];
  if (apiFields.reminderHoursBefore) mapped.reminderHoursBefore = apiFields.reminderHoursBefore;
  return mapped;
}

export function SuperadminSettingsPage() {
  const { data, error, loading, reload, setData } = useFetch('/api/settings');
  const settings = data?.settings || null;
  const [savedMessage, setSavedMessage] = useState('');

  const form = useForm({
    initial: INITIAL_SETTINGS_FORM,
    validate: validateSettings,
    onSubmit: async (values, { setServerErrors }) => {
      setSavedMessage('');
      try {
        const res = await saveSettings({
          openingHours: {
            open: String(values.open).trim(),
            close: String(values.close).trim(),
          },
          reminderHoursBefore: Number(String(values.reminderHoursBefore).trim()),
        });
        setData({ settings: res.settings });
        form.setValues({
          open: res.settings.openingHours?.open || '08:00',
          close: res.settings.openingHours?.close || '20:00',
          reminderHoursBefore: String(res.settings.reminderHoursBefore ?? 24),
        });
        setSavedMessage('Đã lưu cài đặt');
      } catch (err) {
        if (err instanceof ApiError && err.status === 400 && err.fields && Object.keys(err.fields).length > 0) {
          const mapped = mapApiSettingsFields(err.fields);
          if (Object.keys(mapped).length > 0) {
            setServerErrors(mapped);
            return;
          }
        }
        throw err;
      }
    },
  });

  const { setValues } = form;
  useEffect(() => {
    if (!settings) return;
    setValues({
      open: settings.openingHours?.open || '08:00',
      close: settings.openingHours?.close || '20:00',
      reminderHoursBefore: String(settings.reminderHoursBefore ?? 24),
    });
  }, [settings, setValues]);

  const handleFieldChange = (event) => {
    setSavedMessage('');
    form.handleChange(event);
  };

  return (
    <Layout>
      <section className="superadmin-page" aria-labelledby="superadmin-settings-heading">
        <header className="superadmin-header">
          <h1 id="superadmin-settings-heading">Cài đặt hệ thống</h1>
          <p className="superadmin-lead">
            Thiết lập khung giờ mở cửa của studio và thời gian gửi nhắc lịch trước buổi chụp.
          </p>
        </header>

        <AsyncState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={!settings}
          emptyMessage="Chưa có dữ liệu cài đặt."
        >
          <section
            className="superadmin-panel superadmin-settings-panel"
            aria-labelledby="settings-form-heading"
          >
            <h2 id="settings-form-heading">Giờ hoạt động &amp; Nhắc lịch</h2>

            <form onSubmit={form.handleSubmit} noValidate>
              <div className="superadmin-time-grid">
                <FormField
                  name="open"
                  label="Giờ mở cửa"
                  type="time"
                  required
                  value={form.values.open}
                  error={form.errors.open}
                  onChange={handleFieldChange}
                />

                <FormField
                  name="close"
                  label="Giờ đóng cửa"
                  type="time"
                  required
                  value={form.values.close}
                  error={form.errors.close}
                  onChange={handleFieldChange}
                  hint="Phải sau giờ mở cửa."
                />
              </div>

              <FormField
                name="reminderHoursBefore"
                label="Gửi nhắc lịch trước (giờ)"
                type="number"
                required
                value={form.values.reminderHoursBefore}
                error={form.errors.reminderHoursBefore}
                onChange={handleFieldChange}
                hint="Số nguyên từ 1 đến 168 giờ (mặc định 24 giờ). Hệ thống luôn gửi nhắc qua cả e-mail và tài khoản."
                inputProps={{ min: 1, max: 168, step: 1 }}
              />

              {form.submitError && (
                <p className="form-alert" role="alert">
                  {form.submitError}
                </p>
              )}

              {savedMessage && (
                <p className="form-success" role="status">
                  {savedMessage}
                </p>
              )}

              <div className="superadmin-form-actions">
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={form.submitting}
                >
                  {form.submitting ? 'Đang lưu…' : 'Lưu cài đặt'}
                </button>
              </div>
            </form>
          </section>
        </AsyncState>
      </section>
    </Layout>
  );
}
