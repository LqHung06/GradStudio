# 07 — Reminders (G7)

> **Owner:** TV2 Đặng Hoàng Tuấn Kiệt. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** 7th (after `06-payments.md` creates `rm-1` when `PAY-2` deposit succeeds).

| Method | Path | Roles |
|---|---|---|
| GET | `/api/reminders` | customer |

## Starting data (`mock/data/reminders.json`)

- Starts empty: `[]`.
- Before a customer has any booked shoot, `GET /api/reminders` returns `{"reminders": []}`.
- When a booking is confirmed (`06-payments.md` or G10 `B4.1` recovery), the mock creates a reminder scheduled `db.settings.reminderHoursBefore` hours before the earliest milestone of the booking, starting in `emailStatus: "queued"` (`B4.12`). Changes to `db.settings.reminderHoursBefore` apply only to reminders created afterwards or recalculated on subsequent reschedules (`B4.13`).
- **Due dispatch (`B4.12`, `B4.13`):** future reminders (`sendAt > now`) stay `queued`; when the simulated delivery run executes (`GET /api/reminders` in PA#3), due `queued` reminders (`sendAt <= now`) transition once to `"sent"` (or `"failed"` if delivery fails). Re-running dispatch never re-sends `"sent"` or `"failed"` reminders, and `"failed"` entries remain visible in the customer's account.
- **Rescheduling (`10-admin-bookings.md`):** any `queued` reminder for that booking is recalculated from the earliest milestone of the new schedule minus `db.settings.reminderHoursBefore` (updating `sendAt` and `text`); existing `sent` and `failed` history is preserved and new schedule version reminders avoid duplicate sends.
- **Cancellation (`10-admin-bookings.md`):** any `queued` reminder for that booking is stopped and will not be sent; existing `sent` and `failed` history is preserved. No status beyond `queued`, `sent`, `failed` is added.

---

## GET /api/reminders

Returns all reminders belonging to the signed-in customer.

- **Roles:** `customer`.
- **200 OK:** `{"reminders": [Reminder…]}`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token | `{}` |
| 403 | `FORBIDDEN` | Caller is not a `customer` | `{}` |

### Examples

Linh reads her reminders after `PAY-2` succeeded:

```http
GET /api/reminders
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "reminders": [
    {
      "id": "rm-1",
      "bookingCode": "GS-1024",
      "sendAt": "2026-10-23T13:00:00+07:00",
      "channels": ["email", "account"],
      "emailStatus": "sent",
      "text": "Nhắc lịch: makeup 13:00 ngày 24/10/2026 với Mai tại GradStudio"
    }
  ]
}
```

Unauthenticated request:

```http
GET /api/reminders
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Vui lòng đăng nhập để tiếp tục",
    "fields": {},
    "details": null
  }
}
```

Admin tries to call `GET /api/reminders`:

```http
GET /api/reminders
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "FORBIDDEN",
    "message": "Bạn không có quyền truy cập mục này",
    "fields": {},
    "details": null
  }
}
```

## Changes

- 2026-11-20: initial version: customer reminders list with emailStatus. (TV2)
- 2026-11-23: documented reminder recalculation on reschedule (R04) and stopping queued reminders on cancel while preserving sent history (R05). (TV2)
- 2026-11-25: `84a9c34` (`mock/lib/reminders.mjs`) allocated reminder IDs from the max numeric `rm-N` suffix and ignored null/malformed item times so cancelling queued reminders never collides on subsequent IDs. (TV2)
- 2026-11-27: QA9 reminder lifecycle (`B4.12`, `B4.13`): start booking reminders as `queued`, dispatch due reminders at most once on delivery pass, keep future reminders `queued`, preserve `sent`/`failed` history, and apply `reminderHoursBefore` changes only to new/recalculated reminders. (TV2)
