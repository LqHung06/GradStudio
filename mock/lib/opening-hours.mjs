// Shared opening-hours helper for G5, G10 and G11 (PO B4.4) — owner TV1.
// Mon–Fri use openingHours.weekday; Sat–Sun use openingHours.weekend.
// Keeps a safe fallback for legacy { open, close } objects in older fixtures/tests.

export const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidHoursRange(range) {
  return Boolean(
    range
    && typeof range === 'object'
    && typeof range.open === 'string'
    && typeof range.close === 'string'
    && HHMM_RE.test(range.open)
    && HHMM_RE.test(range.close)
    && range.open < range.close,
  );
}

/**
 * Returns true if dateStr ("YYYY-MM-DD") falls on Saturday (6) or Sunday (0).
 */
export function isWeekendDate(dateStr) {
  if (typeof dateStr !== 'string' || !DATE_RE.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y
    || dt.getUTCMonth() + 1 !== m
    || dt.getUTCDate() !== d
  ) {
    return false;
  }
  const day = dt.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Resolves the applicable { open, close } window for a given "YYYY-MM-DD" date
 * from db.settings (weekday for Mon–Fri, weekend for Sat–Sun).
 * Returns null if settings/openingHours is missing or invalid.
 */
export function getOpeningHoursForDate(settings, dateStr) {
  const hours = settings?.openingHours;
  if (!hours || typeof hours !== 'object') return null;

  if (hours.weekday || hours.weekend) {
    const picked = isWeekendDate(dateStr) ? hours.weekend : hours.weekday;
    return isValidHoursRange(picked) ? { open: picked.open, close: picked.close } : null;
  }

  // Legacy fallback: { open, close }
  return isValidHoursRange(hours) ? { open: hours.open, close: hours.close } : null;
}
