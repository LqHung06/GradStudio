# 07 — Reminders (G7)

> **Owner:** TV2 Đặng Hoàng Tuấn Kiệt. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** 7th (after `06-payments.md` creates `rm-1` when `PAY-2` deposit succeeds).

| Method | Path | Roles |
|---|---|---|
| GET | `/api/reminders` | customer |

## Starting data (`mock/data/reminders.json`)

- Starts empty: `[]`.
- Before a customer has any booked shoot, `GET /api/reminders` returns `{"reminders": []}`.
- When a deposit succeeds (`06-payments.md`), the mock creates a reminder scheduled `db.settings.reminderHoursBefore` hours before the earliest milestone of the booking, with `emailStatus: "sent"` (in PA#4, the server sends the real e-mail).

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
