import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { updateJob, uploadBookingPreview } from '../../api/jobs.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Layout } from '../../components/Layout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  BOOKING_STATUS,
  formatDate,
  getStatusLabel,
  JOB_KIND,
  JOB_STATUS,
} from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import '../../styles/staff-jobs.css';

const ALLOWED_JOB_STATUSES = ['todo', 'in_progress', 'done'];
const MAX_PREVIEW_BYTES = 5 * 1024 * 1024; // 5 MiB = 5,242,880 bytes
const ALLOWED_PREVIEW_TYPES = ['image/jpeg', 'image/png'];
const INITIAL_STATUS_FORM = { status: 'todo', note: '' };
const INITIAL_UPLOAD_FORM = { file: null };

function validateJobStatus(values) {
  const errors = {};
  if (!ALLOWED_JOB_STATUSES.includes(values.status)) {
    errors.status = 'Vui lòng chọn trạng thái hợp lệ';
  }
  if (typeof values.note === 'string' && values.note.length > 500) {
    errors.note = 'Ghi chú tối đa 500 ký tự';
  }
  return errors;
}

function validatePreviewUpload(values) {
  const errors = {};
  const file = values.file;
  if (!file) {
    errors.file = 'Vui lòng chọn ảnh';
  } else if (!ALLOWED_PREVIEW_TYPES.includes(file.type)) {
    errors.file = 'Chỉ nhận ảnh JPEG hoặc PNG';
  } else if (file.size > MAX_PREVIEW_BYTES) {
    errors.file = 'Ảnh tối đa 5 MiB';
  }
  return errors;
}

export function StaffJobDetailPage() {
  const { id } = useParams();
  const jobPath = id ? `/api/jobs/${encodeURIComponent(id)}` : null;
  const {
    data: jobData,
    error: jobError,
    loading: jobLoading,
    reload: reloadJob,
    setData: setJobData,
  } = useFetch(jobPath);

  const job = jobData?.job || null;
  const canUploadPreviews = Boolean(job && (job.kind === 'shoot' || job.kind === 'edit'));

  const bookingPath = job ? `/api/bookings/${encodeURIComponent(job.bookingCode)}` : null;
  const {
    data: bookingData,
    error: bookingError,
    loading: bookingLoading,
    reload: reloadBooking,
  } = useFetch(bookingPath);

  const photosPath = canUploadPreviews
    ? `/api/bookings/${encodeURIComponent(job.bookingCode)}/photos`
    : null;
  const {
    data: photosData,
    error: photosError,
    loading: photosLoading,
    reload: reloadPhotos,
  } = useFetch(photosPath);

  const booking = bookingData?.booking || null;
  const isCancelled = booking?.status === 'cancelled';
  const photos = photosData?.photos || [];

  const [statusMessage, setStatusMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const syncedJobIdRef = useRef(null);
  const fileInputRef = useRef(null);

  const statusForm = useForm({
    initial: INITIAL_STATUS_FORM,
    validate: validateJobStatus,
    onSubmit: async (values) => {
      if (!job || isCancelled) return;
      setStatusMessage('');
      const result = await updateJob(job.id, {
        status: values.status,
        note: values.note,
      });
      setJobData({ job: result.job });
      statusForm.setValues({
        status: result.job.status,
        note: result.job.note || '',
      });
      setStatusMessage('Đã cập nhật công việc');
    },
  });

  const uploadForm = useForm({
    initial: INITIAL_UPLOAD_FORM,
    validate: validatePreviewUpload,
    onSubmit: async (values, { reset }) => {
      if (!job || isCancelled) return;
      setUploadMessage('');
      const result = await uploadBookingPreview(job.bookingCode, values.file);
      setJobData((prev) =>
        prev?.job
          ? { job: { ...prev.job, previewCount: result.totalPhotos } }
          : prev,
      );
      setUploadMessage(`Đã có ${result.totalPhotos} ảnh trong booking`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      reset({ file: null });
      reloadPhotos();
    },
  });

  const { reset: resetStatusForm } = statusForm;
  const { reset: resetUploadForm } = uploadForm;

  useEffect(() => {
    if (job && syncedJobIdRef.current !== job.id) {
      syncedJobIdRef.current = job.id;
      resetStatusForm({ status: job.status, note: job.note || '' });
      resetUploadForm({ file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setStatusMessage('');
      setUploadMessage('');
    }
  }, [job, resetStatusForm, resetUploadForm]);

  const handleStatusChange = (event) => {
    setStatusMessage('');
    statusForm.handleChange(event);
  };

  const handleFileChange = (event) => {
    setUploadMessage('');
    uploadForm.handleChange(event);
  };

  if (!jobLoading && jobError?.status === 404) {
    return (
      <Layout>
        <section className="not-found-shell" aria-labelledby="job-not-found-heading">
          <h1 id="job-not-found-heading">Không tìm thấy công việc</h1>
          <p>Không tìm thấy việc này, hoặc việc không được giao cho bạn.</p>
          <Link className="button button-dark" to="/staff/jobs">
            Quay lại Việc của tôi
          </Link>
        </section>
      </Layout>
    );
  }

  if (jobLoading || jobError || !job) {
    return (
      <Layout>
        <section className="staff-page" aria-labelledby="job-loading-heading">
          <Link className="staff-back-link" to="/staff/jobs">
            ← Quay lại Việc của tôi
          </Link>
          <h1 id="job-loading-heading">Chi tiết công việc</h1>
          <AsyncState loading={jobLoading} error={jobError} onRetry={reloadJob} />
        </section>
      </Layout>
    );
  }

  const kindLabel = getStatusLabel(JOB_KIND, job.kind);
  const whenText = job.date
    ? `${formatDate(job.date)} · ${job.start}–${job.end}`
    : 'Không cố định giờ (chỉnh ảnh sau khi khách chọn ảnh)';
  const whereText = job.room
    ? job.room.name
    : job.kind === 'edit'
      ? 'Không dùng phòng studio'
      : 'Chưa xếp phòng';

  return (
    <Layout>
      <section className="staff-page" aria-labelledby="job-detail-heading">
        <header className="staff-page-header">
          <Link className="staff-back-link" to="/staff/jobs">
            ← Quay lại Việc của tôi
          </Link>
          <h1 id="job-detail-heading">
            {kindLabel} · {job.bookingCode}
          </h1>
          <div className="staff-detail-badges">
            <StatusBadge map={JOB_STATUS} status={job.status} />
            {booking && <StatusBadge map={BOOKING_STATUS} status={booking.status} />}
          </div>
        </header>

        {bookingError && (
          <div className="staff-inline-error" role="alert">
            <p>Không thể tải trạng thái booking: {bookingError.message}</p>
            <button type="button" className="button button-outline" onClick={reloadBooking}>
              Thử lại
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="staff-cancelled-banner" role="alert">
            <strong>Booking Đã hủy</strong>
            <p>
              Booking {job.bookingCode} đã bị hủy. Lịch sử công việc được giữ lại để đối chiếu; các
              thao tác cập nhật trạng thái, ghi chú và đăng ảnh xem trước đã bị khóa.
            </p>
          </div>
        )}

        <section className="staff-panel" aria-labelledby="job-info-heading">
          <h2 id="job-info-heading">Thông tin công việc</h2>
          <dl className="staff-detail-grid">
            <div className="staff-detail-item">
              <dt>Khi nào</dt>
              <dd>{whenText}</dd>
            </div>
            <div className="staff-detail-item">
              <dt>Ở đâu</dt>
              <dd>{whereText}</dd>
            </div>
            <div className="staff-detail-item">
              <dt>Làm gì</dt>
              <dd>
                {kindLabel} — {job.packageName}
              </dd>
            </div>
            <div className="staff-detail-item">
              <dt>Với ai</dt>
              <dd>
                {job.customer?.name} (Mã booking: {job.bookingCode})
              </dd>
            </div>
            <div className="staff-detail-item">
              <dt>Trạng thái việc</dt>
              <dd>
                <StatusBadge map={JOB_STATUS} status={job.status} />
              </dd>
            </div>
            <div className="staff-detail-item">
              <dt>Trạng thái booking</dt>
              <dd>
                {booking ? (
                  <StatusBadge map={BOOKING_STATUS} status={booking.status} />
                ) : bookingLoading ? (
                  'Đang tải…'
                ) : (
                  'Chưa tải được'
                )}
              </dd>
            </div>
            <div className="staff-detail-item">
              <dt>Số ảnh xem trước</dt>
              <dd>{job.previewCount} ảnh</dd>
            </div>
          </dl>
        </section>

        <div className="staff-detail-layout">
          <section className="staff-panel" aria-labelledby="job-status-heading">
            <h2 id="job-status-heading">Cập nhật trạng thái</h2>

            <form onSubmit={statusForm.handleSubmit} noValidate>
              <FormField
                name="status"
                label="Trạng thái công việc"
                required
                error={statusForm.errors.status}
              >
                {(controlProps) => (
                  <select
                    {...controlProps}
                    value={statusForm.values.status}
                    onChange={handleStatusChange}
                    disabled={isCancelled || statusForm.submitting}
                  >
                    <option value="todo">{JOB_STATUS.todo}</option>
                    <option value="in_progress">{JOB_STATUS.in_progress}</option>
                    <option value="done">{JOB_STATUS.done}</option>
                  </select>
                )}
              </FormField>

              <FormField
                name="note"
                label="Ghi chú"
                type="textarea"
                value={statusForm.values.note}
                error={statusForm.errors.note}
                onChange={handleStatusChange}
                hint="Tối đa 500 ký tự. Xóa trắng ô để bỏ ghi chú."
                inputProps={{
                  maxLength: 500,
                  rows: 3,
                  disabled: isCancelled || statusForm.submitting,
                }}
              />

              {isCancelled && (
                <p className="field-hint">
                  Form cập nhật đã khóa vì booking {job.bookingCode} đang ở trạng thái Đã hủy.
                </p>
              )}

              {statusForm.submitError && (
                <p className="form-alert" role="alert">
                  {statusForm.submitError}
                </p>
              )}

              {statusMessage && (
                <p className="form-success" role="status">
                  {statusMessage}
                </p>
              )}

              <div className="staff-form-actions">
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={isCancelled || statusForm.submitting}
                >
                  {statusForm.submitting ? 'Đang lưu…' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </section>

          {canUploadPreviews && (
            <section className="staff-panel" aria-labelledby="job-previews-heading">
              <h2 id="job-previews-heading">Thêm ảnh preview</h2>

              <form onSubmit={uploadForm.handleSubmit} noValidate>
                <FormField
                  name="file"
                  label="Chọn ảnh xem trước"
                  required
                  error={uploadForm.errors.file}
                  hint="Chỉ nhận ảnh JPEG hoặc PNG, tối đa 5 MiB (5.242.880 byte)."
                >
                  {(controlProps) => (
                    <input
                      {...controlProps}
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      disabled={isCancelled || uploadForm.submitting}
                    />
                  )}
                </FormField>

                {isCancelled && (
                  <p className="field-hint">
                    Không thể đăng thêm ảnh xem trước vì booking {job.bookingCode} đã bị hủy.
                  </p>
                )}

                {uploadForm.submitError && (
                  <p className="form-alert" role="alert">
                    {uploadForm.submitError}
                  </p>
                )}

                {uploadMessage && (
                  <p className="form-success" role="status">
                    {uploadMessage}
                  </p>
                )}

                <div className="staff-form-actions">
                  <button
                    type="submit"
                    className="button button-dark"
                    disabled={isCancelled || uploadForm.submitting}
                  >
                    {uploadForm.submitting ? 'Đang tải ảnh…' : 'Tải ảnh lên'}
                  </button>
                </div>
              </form>

              <h3>Thư viện ảnh xem trước ({photos.length})</h3>
              <AsyncState
                loading={photosLoading}
                error={photosError}
                onRetry={reloadPhotos}
                isEmpty={photos.length === 0}
                emptyMessage="Chưa có ảnh xem trước nào trong booking này."
              >
                <div className="staff-photo-grid">
                  {photos.map((photo) => (
                    <figure key={photo.id} className="staff-photo-card">
                      <img src={photo.url} alt={photo.alt} loading="lazy" />
                      <figcaption>{photo.id}</figcaption>
                    </figure>
                  ))}
                </div>
              </AsyncState>
            </section>
          )}
        </div>
      </section>
    </Layout>
  );
}
