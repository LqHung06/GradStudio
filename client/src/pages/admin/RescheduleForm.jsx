import { useState } from 'react';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { JOB_KIND } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { AvailabilityResult, kinds, makeItems, validateSchedule } from './ProposalForm.jsx';

function scheduleValues(date, items) {
  const values = { date, items: String(items.length) };
  items.forEach((item, index) => {
    const prefix = 'items.' + index + '.';
    for (const key of ['kind', 'start', 'end', 'staffId', 'roomId']) {
      values[prefix + key] = item[key] ?? '';
    }
  });
  return values;
}

function bookingSchedule(booking) {
  return scheduleValues(booking.date, booking.items.map(({ staff, room, ...item }) => ({
    ...item, staffId: staff.id, roomId: room?.id,
  })));
}

export function RescheduleForm({ booking, busy, update }) {
  const resources = useFetch('/api/resources');
  const staff = resources.data?.staff ?? [];
  const rooms = resources.data?.rooms ?? [];
  const [clash, setClash] = useState(null);
  const form = useForm({
    initial: bookingSchedule(booking),
    validate: (values) => validateSchedule(values, staff, rooms),
    async onSubmit(values, { reset }) {
      setClash(null);
      try {
        const saved = await update('PATCH', '', { date: values.date, items: makeItems(values) }, 'Đã áp dụng lịch mới.');
        reset(bookingSchedule(saved));
      } catch (error) {
        if (error.code !== 'CLASH' || !error.details) throw error;
        setClash({ available: false, ...error.details });
      }
    },
  });

  function change(event) {
    setClash(null);
    form.handleChange(event);
  }

  function field(name, label, type, options) {
    const value = form.values[name] ?? (name.endsWith('.kind') ? 'shoot' : '');
    return (
      <FormField name={name} label={label} type={type} value={value}
        onChange={change} error={form.errors[name]}>
        {options && ((props) => (
          <select {...props} value={value} onChange={change}>
            {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
          </select>
        ))}
      </FormField>
    );
  }

  return (
    <section className="admin-card">
      <h2>Đổi lịch</h2>
      <AsyncState loading={resources.loading} error={resources.error} onRetry={resources.reload}
        isEmpty={!staff.length} emptyMessage="Chưa có nhân sự để xếp lịch.">
        <form noValidate onSubmit={form.handleSubmit}>
          <div className="admin-fields">
            {field('date', 'Ngày chụp', 'date')}
            {field('items', 'Số ca', undefined, ['1', '2', '3', '4'].map((count) => [count, count]))}
          </div>
          {makeItems(form.values).map(({ kind }, index) => {
            const name = 'items.' + index + '.';
            return (
              <fieldset key={index}>
                <legend>Ca {index + 1}</legend>
                <div className="admin-fields">
                  {field(name + 'kind', 'Loại ca', undefined, kinds.map((value) => [value, JOB_KIND[value]]))}
                  {field(name + 'start', 'Bắt đầu', 'time')}
                  {field(name + 'end', 'Kết thúc', 'time')}
                  {field(name + 'staffId', 'Nhân sự', undefined,
                    [['', 'Chọn nhân sự'], ...staff.map(({ id, name }) => [id, name])])}
                  {field(name + 'roomId', 'Phòng', undefined,
                    [['', kind === 'makeup' ? 'Không dùng phòng' : 'Chọn phòng'], ...rooms.map(({ id, name }) => [id, name])])}
                </div>
                {!rooms.length && <p>Chưa có phòng trong danh mục.</p>}
              </fieldset>
            );
          })}
          {form.submitError && <p role="alert">{form.submitError}</p>}
          <button className="button button-dark" type="submit" disabled={busy || form.submitting}>
            Áp dụng lịch mới
          </button>
        </form>
        <AvailabilityResult result={clash} busy={busy || form.submitting}
          onApply={({ date, items }) => {
            form.reset(scheduleValues(date, items));
            setClash(null);
          }} />
      </AsyncState>
    </section>
  );
}
