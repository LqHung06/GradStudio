// Shared atomic booking confirmation helper (B4.1, B4.11) — owner TV2, shared with TV3.

import { checkClash } from './clash.mjs';
import { buildBookingReminderDraft } from './reminders.mjs';

function resolveEditor(db, booking, shootItem) {
  const assigned = db.bookingEditors?.[booking.code];
  if (assigned?.id) {
    const user = (db.users || []).find((u) => u.id === assigned.id);
    return {
      id: assigned.id,
      name: assigned.name || user?.name || shootItem?.staff?.name || '',
    };
  }
  return shootItem?.staff || null;
}

export function draftBookingJobs(db, booking) {
  const existingIds = new Set((db.jobs || []).map((j) => j.id));
  const items = booking.items || [];
  const drafts = [];

  for (const it of items) {
    const id = `J-${booking.code}-${it.kind}`;
    if (!existingIds.has(id)) {
      drafts.push({
        id,
        bookingCode: booking.code,
        kind: it.kind,
        date: booking.date,
        start: it.start,
        end: it.end,
        room: it.room || null,
        staff: it.staff,
        customer: booking.customer,
        packageName: booking.package?.name || '',
        status: 'todo',
        note: '',
        previewCount: 0,
      });
      existingIds.add(id);
    }
  }

  const shootItem = items.find((it) => it.kind === 'shoot') || items[0];
  const editId = `J-${booking.code}-edit`;
  const editorStaff = resolveEditor(db, booking, shootItem);
  if (shootItem && editorStaff && !existingIds.has(editId)) {
    drafts.push({
      id: editId,
      bookingCode: booking.code,
      kind: 'edit',
      date: null,
      start: null,
      end: null,
      room: null,
      staff: editorStaff,
      customer: booking.customer,
      packageName: booking.package?.name || '',
      status: 'todo',
      note: '',
      previewCount: 0,
    });
  }

  return drafts;
}

/**
 * Re-checks resource clashes and atomically transitions a paid awaiting_deposit booking
 * (or first deposit settlement) to booked, provisioning jobs and queued reminder at most once.
 */
export async function confirmBookingReservation(db, booking, { checkClashFn } = {}) {
  if (!booking || booking.status === 'cancelled' || booking.status === 'completed') {
    return { ok: false, reason: 'INVALID_BOOKING_STATUS', clashes: [] };
  }

  if (booking.status === 'booked') {
    return {
      ok: true,
      alreadyConfirmed: true,
      jobsCreated: 0,
      reminderCreated: false,
      reminder: null,
    };
  }

  const clashItems = (booking.items || []).map((it) => ({
    kind: it.kind,
    start: it.start,
    end: it.end,
    staffId: it.staff?.id || null,
    roomId: it.room?.id || null,
  }));

  const checker = typeof checkClashFn === 'function' ? checkClashFn : checkClash;
  const clashResult = await checker(db, booking.date, clashItems, {
    ignoreBooking: booking.code,
  });

  if (!clashResult.available) {
    return {
      ok: false,
      reason: 'CLASH',
      clashes: clashResult.clashes || [],
    };
  }

  // Draft all records before mutating db or booking so failures never leave half-provisioned state.
  const jobsDraft = draftBookingJobs(db, booking);
  const reminderDraft = buildBookingReminderDraft(db, booking);

  booking.status = 'booked';
  if (booking.paymentStatus === 'unpaid') {
    booking.paymentStatus = 'deposit_paid';
  }

  if (!Array.isArray(db.jobs)) db.jobs = [];
  if (jobsDraft.length > 0) {
    db.jobs.push(...jobsDraft);
  }

  if (reminderDraft) {
    if (!Array.isArray(db.reminders)) db.reminders = [];
    db.reminders.push(reminderDraft);
  }

  return {
    ok: true,
    alreadyConfirmed: false,
    jobsCreated: jobsDraft.length,
    reminderCreated: Boolean(reminderDraft),
    reminder: reminderDraft,
  };
}
