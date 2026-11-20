# 13 — System settings (G11)

> **Owner:** TV1 Lê Quốc Hưng. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** last.

| Method | Path | Roles |
|---|---|---|
| GET | `/api/settings` | superadmin |
| PUT | `/api/settings` | superadmin |

## Settings object

```json
{"openingHours": {"open": "08:00", "close": "20:00"}, "reminderHoursBefore": 24}
```

| Field | Type | Limits | Used by |
|---|---|---|---|
| `openingHours.open` | string `HH:mm` | 00:00–23:59 | Free-time suggestions (`04-availability.md`): no suggestion starts before it |
| `openingHours.close` | string `HH:mm` | Later than `open` | Free-time suggestions: no suggestion ends after it |
| `reminderHoursBefore` | integer | 1 to 168 (one week) | Reminders (`06-payments.md`): a reminder is sent this many hours before the earliest item of a booked day |

**Starting data:** `08:00`–`20:00`, reminders 24 hours before.

A change applies to suggestions and reminders created **after** it. Reminders that already exist keep their time. Only the Superadmin reads this object through the API. The mock uses `db.settings` internally for suggestions and reminders.

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

{"settings": {"openingHours": {"open": "08:00", "close": "20:00"}, "reminderHoursBefore": 24}}
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
| `openingHours.open` | string | yes | `HH:mm` |
| `openingHours.close` | string | yes | `HH:mm`, later than `openingHours.open` |
| `reminderHoursBefore` | integer | yes | 1 to 168 |

- **200 OK:** `{"settings": Settings}`, the saved settings. The front end shows a confirmation from this answer.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | A field is missing, not in `HH:mm`, `close` is not after `open`, or `reminderHoursBefore` is not an integer from 1 to 168 | Keys `openingHours.open`, `openingHours.close`, `reminderHoursBefore` |
| 401 | `UNAUTHENTICATED` | No token | `{}` |
| 403 | `FORBIDDEN` | The caller is not the Superadmin | `{}` |

### Examples

The studio opens earlier and closes later:

```http
PUT /api/settings
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"openingHours": {"open": "07:30", "close": "21:00"}, "reminderHoursBefore": 24}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"settings": {"openingHours": {"open": "07:30", "close": "21:00"}, "reminderHoursBefore": 24}}
```

Closing time before opening time, and a reminder more than a week ahead:

```http
PUT /api/settings
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"openingHours": {"open": "20:00", "close": "08:00"}, "reminderHoursBefore": 200}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"openingHours.close": "Giờ đóng cửa phải sau giờ mở cửa", "reminderHoursBefore": "Chọn từ 1 đến 168 giờ"}, "details": null}}
```

A staff member cannot change the settings:

```http
PUT /api/settings
Authorization: Bearer {{token:mai}}
Content-Type: application/json

{"openingHours": {"open": "08:00", "close": "20:00"}, "reminderHoursBefore": 24}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập chức năng này", "fields": {}, "details": null}}
```

## Changes

Every change to this file, once front-end code uses it, gets a line here: the date, what changed and why.

- 2026-11-19: first version. (TV1)
