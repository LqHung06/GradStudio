import { apiFetch } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Money } from '../../components/Money.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { ScheduleSummary } from './BookingSummary.jsx';

export function BookingForm({ conversation, request, proposal, resources, busy, onCreate }) {
  const packages = useFetch('/api/packages');
  const extras = useFetch('/api/extras');
  const packageList = packages.data?.packages ?? [];
  const extraList = extras.data?.extras ?? [];
  const editors = (resources.data?.staff ?? []).filter(({ skill }) => skill === 'photo');

  const form = useForm({
    initial: {
      shootType: request?.shootType ?? '',
      packageId: request?.packageId ?? '',
      extraIds: request?.extraIds ?? [],
      editorId: '',
    },
    validate(values) {
      const errors = {};
      if (!values.shootType.trim()) errors.shootType = 'Vui lòng nhập loại chụp.';
      if (!packageList.some(({ id }) => id === values.packageId)) errors.packageId = 'Vui lòng chọn gói chụp.';
      if (!editors.some(({ id }) => id === values.editorId)) errors.editorId = 'Vui lòng chọn nhân viên chỉnh ảnh.';
      return errors;
    },
    onSubmit: (values) => onCreate(() => apiFetch('/api/bookings', {
      method: 'POST',
      body: {
        conversationId: conversation.id,
        proposalId: proposal.id,
        shootType: values.shootType.trim(),
        packageId: values.packageId,
        extraIds: values.extraIds.filter((id) => extraList.some((extra) => extra.id === id)),
        editorId: values.editorId,
      },
    })),
  });

  const selected = packageList.find(({ id }) => id === form.values.packageId);
  const deposit = selected && Math.round(selected.price * 0.3);
  const locked = busy || form.submitting;
  const unavailable = !proposal ? 'Cần đề xuất mới nhất được khách đồng ý trước khi tạo booking.'
    : !packageList.length || !extras.data || extras.error ? 'Cần tải danh mục gói chụp và dịch vụ thêm.'
    : !editors.length || resources.loading || resources.error ? 'Cần có danh sách nhân viên chỉnh ảnh.'
    : busy ? 'Đang xử lý yêu cầu trong hội thoại.' : '';

  function change(event) {
    if (!locked) form.handleChange(event);
  }

  function toggleExtra(id, checked) {
    if (locked) return;
    const ids = form.values.extraIds;
    form.setFieldValue('extraIds', checked ? [...ids, id] : ids.filter((entry) => entry !== id));
  }

  return (
    <section className="admin-card">
      <h2>Booking mới</h2>
      <p>Khách hàng · <strong>{conversation.customer.name}</strong></p>
      {proposal && <ScheduleSummary date={proposal.date} items={proposal.items} />}
      <form noValidate onSubmit={(event) => {
        if (unavailable || locked) { event.preventDefault(); return; }
        return form.handleSubmit(event);
      }}>
        <FormField name="shootType" label="Loại chụp" required value={form.values.shootType}
          error={form.errors.shootType} onChange={change} inputProps={{ maxLength: 120 }} />
        <AsyncState loading={packages.loading} error={packages.error} onRetry={packages.reload}
          isEmpty={!packageList.length} emptyMessage="Chưa có gói chụp.">
          <FormField name="packageId" label="Gói chụp" required error={form.errors.packageId}>
            {(props) => <select {...props} value={selected?.id ?? ''} onChange={change}>
              <option value="">Chọn gói chụp</option>
              {packageList.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>}
          </FormField>
        </AsyncState>
        <AsyncState loading={resources.loading} error={resources.error} onRetry={resources.reload}
          isEmpty={!editors.length} emptyMessage="Chưa có nhân viên chỉnh ảnh.">
          <FormField name="editorId" label="Người chỉnh ảnh" required error={form.errors.editorId}>
            {(props) => <select {...props} value={form.values.editorId} onChange={change}>
              <option value="">Chọn người chỉnh ảnh</option>
              {editors.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>}
          </FormField>
        </AsyncState>
        <fieldset id="extraIds" tabIndex={-1} className="admin-extras"
          aria-invalid={form.errors.extraIds ? true : undefined}
          aria-describedby={form.errors.extraIds ? 'booking-extras-error' : undefined}>
          <legend>Dịch vụ thêm</legend>
          <AsyncState loading={extras.loading} error={extras.error} onRetry={extras.reload}
            isEmpty={!extraList.length} emptyMessage="Không có dịch vụ thêm.">
            {extraList.map(({ id, name }) => (
              <label key={id}><input type="checkbox" checked={form.values.extraIds.includes(id)}
                onChange={(event) => toggleExtra(id, event.target.checked)} />{name}</label>
            ))}
          </AsyncState>
          {form.errors.extraIds && <p className="field-error" id="booking-extras-error">{form.errors.extraIds}</p>}
        </fieldset>
        {selected && <dl className="admin-amounts">
          <div><dt>Giá gói dự kiến</dt><dd><Money amount={selected.price} /></dd></div>
          <div><dt>Cọc 30% dự kiến</dt><dd><Money amount={deposit} /></dd></div>
          <div><dt>Còn lại dự kiến</dt><dd><Money amount={selected.price - deposit} /></dd></div>
        </dl>}
        {unavailable && <p id="booking-unavailable">{unavailable}</p>}
        {(form.submitError || form.errors.conversationId || form.errors.proposalId) &&
          <p role="alert">{form.submitError || form.errors.conversationId || form.errors.proposalId}</p>}
        {Object.entries(form.errors).filter(([field]) => field === 'date' || field.startsWith('items.'))
          .map(([field, message]) => <p key={field} role="alert">{message}</p>)}
        {form.submitting && <p role="status">Đang tạo booking…</p>}
        <button type="submit" className="button button-dark" disabled={Boolean(unavailable) || locked}
          aria-describedby={unavailable ? 'booking-unavailable' : undefined}>
          Tạo booking
        </button>
      </form>
    </section>
  );
}
