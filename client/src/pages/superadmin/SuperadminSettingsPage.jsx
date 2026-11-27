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
  weekdayOpen: '08:00',
  weekdayClose: '20:00',
  weekendOpen: '08:00',
  weekendClose: '20:00',
  reminderHoursBefore: '24',
};

function settingsToFormValues(settings) {
  const weekday = settings?.openingHours?.weekday || settings?.openingHours || {};
  const weekend = settings?.openingHours?.weekend || settings?.openingHours || {};
  return {
    weekdayOpen: weekday.open || '08:00',
    weekdayClose: weekday.close || '20:00',
    weekendOpen: weekend.open || '08:00',
    weekendClose: weekend.close || '20:00',
    reminderHoursBefore: String(settings?.reminderHoursBefore ?? 24),
  };
}

function validateTimePair(openVal, closeVal, openKey, closeKey, errors) {
  const open = String(openVal || '').trim();
  const close = String(closeVal || '').trim();
  const openOk = HHMM_RE.test(open);
  const closeOk = HHMM_RE.test(close);

  if (!openOk) {
    errors[openKey] = 'Giờ không đúng định dạng HH:mm';
  }
  if (!closeOk) {
    errors[closeKey] = 'Giờ không đúng định dạng HH:mm';
  } else if (openOk && close <= open) {
    errors[closeKey] = 'Giờ đóng cửa phải sau giờ mở cửa';
  }
}

function validateSettings(values) {
  const errors = {};
  validateTimePair(values.weekdayOpen, values.weekdayClose, 'weekdayOpen', 'weekdayClose', errors);
  validateTimePair(values.weekendOpen, values.weekendClose, 'weekendOpen', 'weekendClose', errors);

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
  if (apiFields['openingHours.weekday.open']) mapped.weekdayOpen = apiFields['openingHours.weekday.open'];
  if (apiFields['openingHours.weekday.close']) mapped.weekdayClose = apiFields['openingHours.weekday.close'];
  if (apiFields['openingHours.weekend.open']) mapped.weekendOpen = apiFields['openingHours.weekend.open'];
  if (apiFields['openingHours.weekend.close']) mapped.weekendClose = apiFields['openingHours.weekend.close'];
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
            weekday: {
              open: String(values.weekdayOpen).trim(),
              close: String(values.weekdayClose).trim(),
            },
            weekend: {
              open: String(values.weekendOpen).trim(),
              close: String(values.weekendClose).trim(),
            },
          },
          reminderHoursBefore: Number(String(values.reminderHoursBefore).trim()),
        });
        setData({ settings: res.settings });
        form.setValues(settingsToFormValues(res.settings));
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
    setValues(settingsToFormValues(settings));
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
            Thiết lập khung giờ mở cửa ngày thường, cuối tuần của studio và thời gian gửi nhắc lịch trước buổi chụp.
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
              <fieldset className="superadmin-hours-group">
                <legend>Ngày thường (T2–T6)</legend>
                <div className="superadmin-time-grid">
                  <FormField
                    name="weekdayOpen"
                    label="Giờ mở cửa (T2–T6)"
                    type="time"
                    required
                    value={form.values.weekdayOpen}
                    error={form.errors.weekdayOpen}
                    onChange={handleFieldChange}
                  />

                  <FormField
                    name="weekdayClose"
                    label="Giờ đóng cửa (T2–T6)"
                    type="time"
                    required
                    value={form.values.weekdayClose}
                    error={form.errors.weekdayClose}
                    onChange={handleFieldChange}
                    hint="Phải sau giờ mở cửa."
                  />
                </div>
              </fieldset>

              <fieldset className="superadmin-hours-group">
                <legend>Cuối tuần (T7–CN)</legend>
                <div className="superadmin-time-grid">
                  <FormField
                    name="weekendOpen"
                    label="Giờ mở cửa (T7–CN)"
                    type="time"
                    required
                    value={form.values.weekendOpen}
                    error={form.errors.weekendOpen}
                    onChange={handleFieldChange}
                  />

                  <FormField
                    name="weekendClose"
                    label="Giờ đóng cửa (T7–CN)"
                    type="time"
                    required
                    value={form.values.weekendClose}
                    error={form.errors.weekendClose}
                    onChange={handleFieldChange}
                    hint="Phải sau giờ mở cửa."
                  />
                </div>
              </fieldset>

              <FormField
                name="reminderHoursBefore"
                label="Gửi nhắc lịch trước (giờ)"
                type="number"
                required
                value={form.values.reminderHoursBefore}
                error={form.errors.reminderHoursBefore}
                onChange={handleFieldChange}
                hint="Số nguyên từ 1 đến 168 giờ (mặc định 24 giờ). Áp dụng cho nhắc lịch tạo mới hoặc tính lại khi đổi lịch."
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
