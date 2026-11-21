// Time helpers for the mock. Moments in the contract are ISO 8601 with offset +07:00
// (docs/api/README.md, "Data conventions"), e.g. "2026-11-21T10:00:00+07:00".

const OFFSET_MS = 7 * 60 * 60 * 1000;

// The current moment in Vietnam time, whatever the time zone of the machine.
export function nowIso() {
  // Shift the UTC clock by +7 h, print it as UTC without the "Z" and milliseconds, then add the offset.
  return new Date(Date.now() + OFFSET_MS).toISOString().slice(0, 19) + '+07:00';
}
