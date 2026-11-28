// Reminders routes: docs/api/07-reminders.md (owner TV2).

import { dispatchDueReminders } from '../lib/reminders.mjs';

export default [
  {
    method: 'GET',
    path: '/api/reminders',
    roles: ['customer'],
    handler: ({ user, db }) => {
      dispatchDueReminders(db);
      const bookings = db.bookings || [];
      const ownCodes = new Set(
        bookings.filter((b) => b.customer?.id === user.id).map((b) => b.code),
      );
      const reminders = (db.reminders || [])
        .filter((r) => ownCodes.has(r.bookingCode))
        .map(({ id, bookingCode, sendAt, channels, emailStatus, text }) => ({
          id,
          bookingCode,
          sendAt,
          channels,
          emailStatus,
          text,
        }));
      return { status: 200, body: { reminders } };
    },
  },
];
