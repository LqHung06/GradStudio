import { formatMoney } from '../constants/status.js';

/**
 * Displays integer VND currency amounts with tabular numerals.
 */
export function Money({ amount, className = '' }) {
  return <span className={`money ${className}`.trim()}>{formatMoney(amount)}</span>;
}
