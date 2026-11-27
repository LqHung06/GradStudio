# 13 — System settings (G11)

> **Owner:** TV1 Lê Quốc Hưng. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** last.

| Method | Path | Roles |
|---|---|---|
| GET | `/api/settings` | superadmin |
| PUT | `/api/settings` | superadmin |

## Settings object

```json
{"openingHours": {"weekday": {"open": "08:00", "close": "20:00"}, "weekend": {"open": "08:00", "close": "20:00"}}, "reminderHoursBefore": 24}
```

| Field | Type | Limits | Used by |
|---|---|---|---|
| `openingHours.weekday.open` | string `HH:mm` | 00:00–23:59 | Mon–Fri opening time (`04-availability.md`, proposals, create/reschedule): no slot starts before it |
| `openingHours.weekday.close` | string `HH:mm` | Later than `openingHours.weekday.open` | Mon–Fri closing time: no slot ends after it |
| `openingHours.weekend.open` | string `HH:mm` | 00:00–23:59 | Sat–Sun opening time (`04-availability.md`, proposals, create/reschedule): no slot starts before it |
| `openingHours.weekend.close` | string `HH:mm` | Later than `openingHours.weekend.open` | Sat–Sun closing time: no slot ends after it |
| `reminderHoursBefore` | integer | 1 to 168 (one week) | Reminders (`06-payments.md`, `07-reminders.md`): a reminder is scheduled this many hours before the earliest item of a booked day |

**Starting data:** `weekday` `08:00`–`20:00`, `weekend` `08:00`–`20:00` (Saturday `2026-10-24` covers `09:00`–`16:00` for `GS-1024`), reminders `24` hours before.

**How changes apply (PO B4.4, B4.13):**
- Changing opening hours keeps existing bookings intact; deposit confirmation checks only staff and room availability; new proposals, booking creation and reschedules use the current weekday/weekend opening hours.
- Changing `reminderHoursBefore` applies only to reminders created afterwards or recalculated on reschedule; existing reminders keep their scheduled time.
- Only the Superadmin reads or updates this object through the API. The mock uses `db.settings` internally (via `mock/lib/opening-hours.mjs`) for availability suggestions, scheduling checks and reminders.

---

## GET /api/settings

- **Roles:** superadmin.
- **200 OK:** `{"settings": Settings}`.
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No token |
| 403 | `FORBIDDEN` | The caller is not the Superadmin |

### Examples

```http
GET /api/settings
Authorization: Bearer {{token:superadmin}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"settings": {"openingHours": {"weekday": {"open": "08:00", "close": "20:00"}, "weekend": {"open": "08:00", "close": "20:00"}}, "reminderHoursBefore": 24}}
```

```http
GET /api/settings
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập chức năng này", "fields": {}, "details": null}}
```

---

## PUT /api/settings

Replaces the whole settings object.

- **Roles:** superadmin.
- **Body:** the whole Settings object; every field is required.

| Field | Type | Required | Limits |
|---|---|---|---|
| `openingHours.weekday.open` | string | yes | `HH:mm` |
| `openingHours.weekday.close` | string | yes | `HH:mm`, later than `openingHours.weekday.open` |
| `openingHours.weekend.open` | string | yes | `HH:mm` |
| `openingHours.weekend.close` | string | yes | `HH:mm`, later than `openingHours.weekend.open` |
| `reminderHoursBefore` | integer | yes | 1 to 168 |

- **200 OK:** `{"settings": Settings}`, the saved settings. The front end shows a confirmation from this answer.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | A field is missing, not in `HH:mm`, `close` is not after `open` for weekday or weekend, or `reminderHoursBefore` is not an integer from 1 to 168 | Keys `openingHours.weekday.open`, `openingHours.weekday.close`, `openingHours.weekend.open`, `openingHours.weekend.close`, `reminderHoursBefore` |
| 401 | `UNAUTHENTICATED` | No token | `{}` |
| 403 | `FORBIDDEN` | The caller is not the Superadmin | `{}` |

### Examples

The studio sets separate weekday (Mon–Fri) and weekend (Sat–Sun) hours:

```http
PUT /api/settings
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"openingHours": {"weekday": {"open": "07:30", "close": "20:30"}, "weekend": {"open": "08:00", "close": "21:00"}}, "reminderHoursBefore": 24}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"settings": {"openingHours": {"weekday": {"open": "07:30", "close": "20:30"}, "weekend": {"open": "08:00", "close": "21:00"}}, "reminderHoursBefore": 24}}
```

Closing times not after opening times, and a reminder more than a week ahead:

```http
PUT /api/settings
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"openingHours": {"weekday": {"open": "20:00", "close": "08:00"}, "weekend": {"open": "18:00", "close": "18:00"}}, "reminderHoursBefore": 200}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"openingHours.weekday.close": "Giờ đóng cửa phải sau giờ mở cửa", "openingHours.weekend.close": "Giờ đóng cửa phải sau giờ mở cửa", "reminderHoursBefore": "Chọn từ 1 đến 168 giờ"}, "details": null}}
```

A staff member cannot change the settings:

```http
PUT /api/settings
Authorization: Bearer {{token:mai}}
Content-Type: application/json

{"openingHours": {"weekday": {"open": "08:00", "close": "20:00"}, "weekend": {"open": "08:00", "close": "20:00"}}, "reminderHoursBefore": 24}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập chức năng này", "fields": {}, "details": null}}
```

## Changes

Every change to this file, once front-end code uses it, gets a line here: the date, what changed and why.

- 2026-11-19: first version. (TV1)
- 2026-11-27: align with PO B4.4 and B4.13 (QA8): split `openingHours` into `weekday` (Mon–Fri) and `weekend` (Sat–Sun) with separate `open`/`close` validation and examples; keep Saturday `2026-10-24` covering `09:00`–`16:00`. (TV1)
