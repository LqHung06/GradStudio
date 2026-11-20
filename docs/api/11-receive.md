# 11 — Receive: customer confirms receiving final photos (G9)

> **Owner:** TV2 Đặng Hoàng Tuấn Kiệt. This file uses the conventions, the error shape and the **Booking** object defined in [`README.md`](README.md).
> **Place in the example chain:** 11th (after `10-admin-bookings.md` sets `finalLink` on `GS-1024`).

| Method | Path | Roles |
|---|---|---|
| POST | `/api/bookings/:code/receive` | customer (own) |

---

## POST /api/bookings/:code/receive

Marks the booking as `completed` once the customer has paid in full and the Admin has added `finalLink`. Also sets the linked conversation (`c-linh`) to `done`.

- **Roles:** `customer` (only for their own booking).
- **Path parameters:** `code` (booking code, e.g. `GS-1024`).
- **Body:** none.
- **200 OK:** `{"booking": Booking}` with `status: "completed"`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token | `{}` |
| 403 | `FORBIDDEN` | Caller is not a `customer` | `{}` |
| 404 | `NOT_FOUND` | Booking does not exist or belongs to another customer | `{}` |
| 409 | `CONFLICT` | Remaining 70% is not paid yet, `finalLink` is not set yet, or booking is already `completed` / `cancelled` | `{}` |

### Examples

1. Linh clicks *Nhận ảnh* on `GS-1024` (after `paid_in_full` and `finalLink` is set):

```http
POST /api/bookings/GS-1024/receive
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "booking": {
    "code": "GS-1024",
    "customer": {"id": "u-linh", "name": "Linh"},
    "conversationId": "c-linh",
    "serviceName": "Tốt nghiệp",
    "shootType": "Tốt nghiệp cá nhân",
    "package": {
      "id": "pkg-tn-premium",
      "name": "Gói Tốt nghiệp Premium",
      "durationHours": 2,
      "editedPhotos": 30
    },
    "extras": [{"id": "ex-makeup", "name": "Makeup"}],
    "date": "2026-10-24",
    "requestedTime": {"start": "09:00", "note": "Mai bận 08:00–12:00"},
    "items": [
      {
        "kind": "makeup",
        "start": "13:00",
        "end": "14:00",
        "staff": {"id": "u-mai", "name": "Mai"},
        "room": null
      },
      {
        "kind": "shoot",
        "start": "14:00",
        "end": "16:00",
        "staff": {"id": "u-tuan", "name": "Tuấn"},
        "room": {"id": "r-b", "name": "Phòng B"}
      }
    ],
    "price": 1800000,
    "deposit": 540000,
    "remaining": 1260000,
    "status": "completed",
    "paymentStatus": "paid_in_full",
    "selection": {"limit": 30, "selectedCount": 30},
    "finalLink": "https://drive.example.com/gs-1024",
    "createdAt": "…"
  }
}
```

2. Error — Linh clicks *Nhận ảnh* again on an already completed booking:

```http
POST /api/bookings/GS-1024/receive
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Booking này đã hoàn thành nhận ảnh",
    "fields": {},
    "details": null
  }
}
```

3. Error — Linh tries to receive Khoa's booking (`GS-1022`):

```http
POST /api/bookings/GS-1022/receive
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy booking",
    "fields": {},
    "details": null
  }
}
```

## Changes

- 2026-11-20: initial version: receive final photos and complete booking + conversation. (TV2)
