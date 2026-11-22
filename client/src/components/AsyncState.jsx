/**
 * Standard loading / error (+ Retry) / empty state wrapper for screens using `useFetch`.
 */
export function AsyncState({
  loading,
  error,
  onRetry,
  isEmpty = false,
  emptyMessage = 'Không có dữ liệu.',
  children,
}) {
  if (loading) {
    return (
      <p className="async-loading" role="status">
        Đang tải…
      </p>
    );
  }

  if (error) {
    return (
      <div className="async-error" role="alert">
        <p>{error.message || 'Không thể tải dữ liệu.'}</p>
        {onRetry && (
          <button type="button" className="button button-outline" onClick={onRetry}>
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="async-empty">{emptyMessage}</p>;
  }

  return children;
}
