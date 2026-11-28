import { useRef, useState } from 'react';
import { apiFetch } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { JOB_KIND, formatDate } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';

export const kinds = ['shoot', 'makeup'];
const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const isDate = (value) => {
  const date = new Date(value + 'T00:00:00Z');
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(date.getTime())
    && date.toISOString().slice(0, 10) === value;
};

export function makeItems(values) {
  return Array.from({ length: Number(values.items) }, (_, index) => {
    const prefix = 'items.' + index + '.';
    return {
      kind: values[prefix + 'kind'] ?? 'shoot',
      start: values[prefix + 'start'] ?? '',
      end: values[prefix + 'end'] ?? '',
      staffId: values[prefix + 'staffId'] ?? '',
      roomId: values[prefix + 'roomId'] || null,
    };
  });
}

export function validateSchedule(values, staff, rooms) {
  const errors = {};
  if (!isDate(values.date)) errors.date = 'Vui lòng nhập ngày hợp lệ.';
  if (!['1', '2', '3', '4'].includes(values.items)) {
    errors.items = 'Chọn từ 1 đến 4 ca.';
    return errors;
  }
  makeItems(values).forEach((item, index) => {
    const prefix = 'items.' + index + '.';
    if (!isTime(item.start)) errors[prefix + 'start'] = 'Vui lòng nhập giờ bắt đầu.';
    if (!isTime(item.end) || item.end <= item.start) {
      errors[prefix + 'end'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
    }
    if (!staff.some(({ id }) => id === item.staffId)) errors[prefix + 'staffId'] = 'Vui lòng chọn nhân sự.';
    if ((item.kind === 'shoot' || item.roomId) && !rooms.some(({ id }) => id === item.roomId)) {
      errors[prefix + 'roomId'] = 'Vui lòng chọn phòng.';
    }
  });
  return errors;
}

function DaySchedule({ date }) {
  const { data, error, loading, reload } = useFetch('/api/schedule?date=' + encodeURIComponent(date));

  return <>
    <p>Lịch tài nguyên · {formatDate(date)}</p>
    <AsyncState loading={loading} error={error} onRetry={reload}
      isEmpty={!data?.rows.length} emptyMessage="Không có tài nguyên trong lịch ngày này.">
      <ul>
        {data?.rows.map(({ resource, busy }) => (
          <li key={resource.id}>
            <strong>{resource.name}</strong> · {resource.type === 'room' ? 'Phòng' : 'Nhân sự'}
            {busy.length ? <ul>
              {busy.map((slot, index) => (
                <li key={index}>{slot.start}–{slot.end} · {slot.label} · {slot.bookingCode}</li>
              ))}
            </ul> : <p>Chưa có lịch bận.</p>}
          </li>
        ))}
      </ul>
    </AsyncState>
  </>;
}

export function AvailabilityResult({ result, onApply, busy }) {
  if (!result) return null;
  return (
    <div className="admin-card" aria-live="polite">
      <p>{result.available ? 'Không phát hiện trùng lịch.' : 'Lịch bị trùng.'}</p>
      {result.clashes.length > 0 && <ul>{result.clashes.map((clash, index) => (
        <li key={index}>{clash.reason}</li>
      ))}</ul>}
      {result.suggestions.length > 0 ? <ul className="admin-cards">
        {result.suggestions.map((suggestion, index) => (
          <li key={index}>
            <p>{suggestion.label}</p>
            <button className="button button-outline" type="button" disabled={busy}
              onClick={() => onApply(suggestion)}>Dùng giờ này</button>
          </li>
        ))}
      </ul> : !result.available && <p>Chưa có giờ thay thế được đề xuất.</p>}
    </div>
  );
}

export function ProposalForm({ preferredDate, resources, busy, onPropose }) {
  const staff = resources.data?.staff ?? [];
  const rooms = resources.data?.rooms ?? [];
  const action = useRef('check');
  const [result, setResult] = useState(null);
  const [sent, setSent] = useState(false);
  const form = useForm({
    initial: { date: preferredDate, items: '1', note: '' },
    validate(values) {
      return validateSchedule(values, staff, rooms);
    },
    async onSubmit(values) {
      setResult(null);
      setSent(false);
      const schedule = { date: values.date, items: makeItems(values) };
      if (action.current === 'check') {
        setResult(await apiFetch('/api/availability/check', { method: 'POST', body: schedule }));
        return;
      }
      try {
        await onPropose({ ...schedule, note: values.note });
        setSent(true);
      } catch (error) {
        if (error.code !== 'CLASH' || !error.details) throw error;
        setResult({ available: false, ...error.details });
      }
    },
  });
  const locked = busy || form.submitting;

  function change(event) {
    if (locked) return;
    setResult(null);
    setSent(false);
    form.handleChange(event);
  }

  function field(name, label, type, options) {
    return <FormField name={name} label={label} type={type} error={form.errors[name]}
      value={form.values[name]} onChange={change} inputProps={type === 'textarea' ? { maxLength: 1000 } : {}}>
      {options && ((props) => (
        <select {...props} value={form.values[name] ?? options[0][0]} onChange={change}>
          {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
      ))}
    </FormField>;
  }

  function apply({ date, items }) {
    const next = { date, note: form.values.note, items: String(items.length) };
    items.forEach((item, index) => {
      for (const [key, value] of Object.entries(item)) next['items.' + index + '.' + key] = value ?? '';
    });
    form.reset(next);
    setResult(null);
  }

  return (
    <section className="admin-card">
      <h2>Kiểm tra và đề xuất giờ</h2>
      <AsyncState loading={resources.loading} error={resources.error} onRetry={resources.reload}
        isEmpty={!staff.length} emptyMessage="Chưa có nhân sự để xếp lịch.">
        <form noValidate onSubmit={(event) => {
          if (locked) { event.preventDefault(); return; }
          action.current = event.nativeEvent.submitter?.value === 'propose' ? 'propose' : 'check';
          return form.handleSubmit(event);
        }}>
          <div className="admin-fields">
            {field('date', 'Ngày chụp', 'date')}
            {field('items', 'Số ca', undefined, ['1', '2', '3', '4'].map((n) => [n, n]))}
          </div>
          {makeItems(form.values).map((item, index) => {
            const name = 'items.' + index + '.';
            return <fieldset key={index}>
              <legend>Ca {index + 1}</legend>
              <div className="admin-fields">
                {field(name + 'kind', 'Loại ca', undefined, kinds.map((kind) => [kind, JOB_KIND[kind]]))}
                {field(name + 'start', 'Bắt đầu', 'time')}
                {field(name + 'end', 'Kết thúc', 'time')}
                {field(name + 'staffId', 'Nhân sự', undefined, [['', 'Chọn nhân sự'], ...staff.map(({ id, name }) => [id, name])])}
                {field(name + 'roomId', 'Phòng', undefined,
                  [['', item.kind === 'makeup' ? 'Không dùng phòng' : 'Chọn phòng'], ...rooms.map(({ id, name }) => [id, name])])}
              </div>
              {!rooms.length && <p>Chưa có phòng trong danh mục.</p>}
            </fieldset>;
          })}
          {field('note', 'Ghi chú', 'textarea')}
          {form.submitError && <p role="alert">{form.submitError}</p>}
          {form.submitting && <p role="status">Đang gửi yêu cầu…</p>}
          {sent && <p role="status">Đã gửi đề xuất. Xem đề xuất trong tin nhắn.</p>}
          <div className="admin-actions">
            <button className="button button-outline" type="submit" value="check" disabled={locked}>
              Kiểm tra trùng lịch
            </button>
            <button className="button button-dark" type="submit" value="propose" disabled={locked}>
              Đề xuất giờ này cho khách
            </button>
          </div>
        </form>
        <AvailabilityResult result={result} onApply={apply} busy={locked} />
      </AsyncState>
      {isDate(form.values.date) ? <DaySchedule key={form.values.date} date={form.values.date} />
        : <p>Chọn ngày để xem lịch tài nguyên.</p>}
    </section>
  );
}
