import { getStatusLabel } from '../constants/status.js';

const TONE_BY_CODE = {
  // Positive / done
  booked: 'success',
  completed: 'success',
  done: 'success',
  succeeded: 'success',
  accepted: 'success',
  deposit_paid: 'success',
  paid_in_full: 'success',
  sent: 'success',
  // In progress / awaiting action
  awaiting_deposit: 'warning',
  consulting: 'warning',
  in_progress: 'warning',
  pending: 'warning',
  scheduled: 'info',
  unpaid: 'warning',
  unanswered: 'warning',
  queued: 'neutral',
  todo: 'neutral',
  // Negative / failed
  cancelled: 'danger',
  declined: 'danger',
  failed: 'danger',
};

/**
 * Renders a business status badge with text (never colour alone).
 */
export function StatusBadge({ map, status, label, tone, className = '' }) {
  const text = label || getStatusLabel(map, status);
  const resolvedTone = tone || TONE_BY_CODE[status] || 'neutral';
  return (
    <span className={`status-badge status-badge-${resolvedTone} ${className}`.trim()}>
      {text}
    </span>
  );
}
