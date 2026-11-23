import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AsyncState } from '../../components/AsyncState.jsx';
import { Layout } from '../../components/Layout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { formatDate, getStatusLabel, JOB_KIND, JOB_STATUS } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import '../../styles/staff-jobs.css';

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'todo', label: JOB_STATUS.todo },
  { value: 'in_progress', label: JOB_STATUS.in_progress },
  { value: 'done', label: JOB_STATUS.done },
];

function groupJobsByDate(jobs) {
  const groups = [];
  const byKey = new Map();

  for (const job of jobs) {
    const key = job.date || '__unscheduled__';
    let group = byKey.get(key);
    if (!group) {
      group = {
        key,
        heading: job.date ? formatDate(job.date) : 'Chỉnh ảnh (chưa gắn ngày)',
        items: [],
      };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(job);
  }

  return groups;
}

export function StaffJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';

  const endpoint = statusParam
    ? `/api/jobs?status=${encodeURIComponent(statusParam)}`
    : '/api/jobs';

  const { data, error, loading, reload } = useFetch(endpoint);
  const jobs = data?.jobs || [];
  const groups = useMemo(() => groupJobsByDate(jobs), [jobs]);

  const handleFilterChange = (nextStatus) => {
    if (!nextStatus) {
      setSearchParams({});
    } else {
      setSearchParams({ status: nextStatus });
    }
  };

  const emptyMessage =
    statusParam && JOB_STATUS[statusParam]
      ? `Không có việc nào ở trạng thái "${JOB_STATUS[statusParam]}".`
      : 'Bạn chưa có việc nào được giao.';

  return (
    <Layout>
      <section className="staff-page" aria-labelledby="staff-jobs-heading">
        <header className="staff-page-header">
          <h1 id="staff-jobs-heading">Việc của tôi</h1>
          <p className="staff-lead">
            Danh sách công việc makeup, chụp ảnh và chỉnh ảnh được phân công cho bạn, nhóm theo ngày.
          </p>

          <div className="staff-filter-bar" role="group" aria-label="Lọc công việc theo trạng thái">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                className="staff-filter-btn"
                aria-pressed={statusParam === option.value}
                onClick={() => handleFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <AsyncState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={jobs.length === 0}
          emptyMessage={emptyMessage}
        >
          <div className="staff-groups">
            {groups.map((group) => (
              <section key={group.key} className="staff-date-group" aria-label={group.heading}>
                <h2 className="staff-date-heading">{group.heading}</h2>
                <div className="staff-job-list">
                  {group.items.map((job) => {
                    const kindLabel = getStatusLabel(JOB_KIND, job.kind);
                    const timeText =
                      job.start && job.end
                        ? `${job.start}–${job.end}`
                        : 'Chỉnh ảnh sau khi khách chọn ảnh';
                    const roomText = job.room
                      ? job.room.name
                      : job.kind === 'edit'
                        ? 'Không dùng phòng'
                        : 'Chưa xếp phòng';

                    return (
                      <article key={job.id} className="staff-job-card">
                        <div className="staff-job-card-top">
                          <h3>
                            {kindLabel} · {job.bookingCode}
                          </h3>
                          <StatusBadge map={JOB_STATUS} status={job.status} />
                        </div>

                        <dl className="staff-job-meta">
                          <div className="staff-job-meta-row">
                            <dt>Giờ:</dt>
                            <dd>{timeText}</dd>
                          </div>
                          <div className="staff-job-meta-row">
                            <dt>Phòng:</dt>
                            <dd>{roomText}</dd>
                          </div>
                          <div className="staff-job-meta-row">
                            <dt>Khách hàng:</dt>
                            <dd>{job.customer?.name}</dd>
                          </div>
                          <div className="staff-job-meta-row">
                            <dt>Mã booking:</dt>
                            <dd>{job.bookingCode}</dd>
                          </div>
                          <div className="staff-job-meta-row">
                            <dt>Gói:</dt>
                            <dd>{job.packageName}</dd>
                          </div>
                          <div className="staff-job-meta-row">
                            <dt>Ảnh xem trước:</dt>
                            <dd>{job.previewCount} ảnh</dd>
                          </div>
                          {job.note && (
                            <div className="staff-job-meta-row">
                              <dt>Ghi chú:</dt>
                              <dd>{job.note}</dd>
                            </div>
                          )}
                        </dl>

                        <div className="staff-job-card-actions">
                          <Link
                            className="button button-dark"
                            to={`/staff/jobs/${encodeURIComponent(job.id)}`}
                          >
                            Xem việc
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </AsyncState>
      </section>
    </Layout>
  );
}
