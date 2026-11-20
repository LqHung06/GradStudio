# 09 — Gallery: booking photos and selection (G8, G9)

> **Owner:** TV2 Đặng Hoàng Tuấn Kiệt. This file uses the conventions, the error shape and the **Photo** object defined in [`README.md`](README.md).
> **Place in the example chain:** 9th (after `08-jobs.md` uploads the first preview to `GS-1024`, giving `ph-01` … `ph-36`). The remaining 70% payment example (`PAY-3`) is placed here after saving the selection so the chain runs in order.

| Method | Path | Roles |
|---|---|---|
| GET | `/api/bookings/:code/photos` | customer (own), admin, staff (assigned) |
| PUT | `/api/bookings/:code/selection` | customer (own) |

## Starting data (`mock/data/photos.json`)

- Contains 36 seeded preview photos for `GS-1022` with IDs `ph-101` … `ph-136` so `GS-1022` can be opened directly.
- `GS-1024` receives its 36 preview photos (`ph-01` … `ph-36`) in `08-jobs.md`.

---

## GET /api/bookings/:code/photos

Returns the preview photos and current selection for a booking.

- **Roles:** `customer` (own booking), `admin`, or `staff` (assigned to a job on this booking).
- **Path parameters:** `code` (booking code).
- **200 OK:** `{"bookingCode": string, "limit": number, "selectedIds": [string…], "photos": [Photo…]}`.
- **Errors:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

## PUT /api/bookings/:code/selection

Saves the customer's chosen photo IDs for editing, up to `booking.selection.limit`. Updates `booking.selection.selectedCount` on the booking.

- **Roles:** `customer` (own booking).
- **Path parameters:** `code` (booking code).
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `photoIds` | array of strings | yes | 1 to `booking.selection.limit` (30 for `GS-1024`) unique photo IDs belonging to this booking |

- **200 OK:** `{"bookingCode": string, "limit": number, "selectedIds": [string…]}`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | `photoIds` is empty, exceeds `limit`, or contains an ID not belonging to this booking | `fields.photoIds` |
| 401 | `UNAUTHENTICATED` | Missing or invalid token | `{}` |
| 403 | `FORBIDDEN` | Caller is not a `customer` | `{}` |
| 404 | `NOT_FOUND` | Booking does not exist or belongs to another customer | `{}` |
| 409 | `CONFLICT` | Booking is not `booked`, or remaining 70% has already been paid (`paid_in_full`) | `{}` |

---

### Examples

1. Linh reads the preview photos of `GS-1024`:

```http
GET /api/bookings/GS-1024/photos
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "bookingCode": "GS-1024",
  "limit": 30,
  "selectedIds": [],
  "photos": [
    {
      "id": "ph-01",
      "bookingCode": "GS-1024",
      "url": "/samples/preview-01.svg",
      "alt": "Ảnh xem trước số 1 (minh họa)",
      "uploadedBy": {"id": "u-tuan", "name": "Tuấn"},
      "uploadedAt": "…"
    },
    …
  ]
}
```

2. Linh tries to select 31 photos (exceeds the package limit of 30):

```http
PUT /api/bookings/GS-1024/selection
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{
  "photoIds": [
    "ph-01", "ph-02", "ph-03", "ph-04", "ph-05",
    "ph-06", "ph-07", "ph-08", "ph-09", "ph-10",
    "ph-11", "ph-12", "ph-13", "ph-14", "ph-15",
    "ph-16", "ph-17", "ph-18", "ph-19", "ph-20",
    "ph-21", "ph-22", "ph-23", "ph-24", "ph-25",
    "ph-26", "ph-27", "ph-28", "ph-29", "ph-30",
    "ph-31"
  ]
}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION",
    "message": "Dữ liệu chưa hợp lệ",
    "fields": {
      "photoIds": "Gói Tốt nghiệp Premium cho chọn tối đa 30 ảnh"
    },
    "details": null
  }
}
```

3. Linh selects 30 photos and saves:

```http
PUT /api/bookings/GS-1024/selection
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{
  "photoIds": [
    "ph-01", "ph-02", "ph-03", "ph-04", "ph-05",
    "ph-06", "ph-07", "ph-08", "ph-09", "ph-10",
    "ph-11", "ph-12", "ph-13", "ph-14", "ph-15",
    "ph-16", "ph-17", "ph-18", "ph-19", "ph-20",
    "ph-21", "ph-22", "ph-23", "ph-24", "ph-25",
    "ph-26", "ph-27", "ph-28", "ph-29", "ph-30"
  ]
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "bookingCode": "GS-1024",
  "limit": 30,
  "selectedIds": [
    "ph-01", "ph-02", "ph-03", "ph-04", "ph-05",
    "ph-06", "ph-07", "ph-08", "ph-09", "ph-10",
    "ph-11", "ph-12", "ph-13", "ph-14", "ph-15",
    "ph-16", "ph-17", "ph-18", "ph-19", "ph-20",
    "ph-21", "ph-22", "ph-23", "ph-24", "ph-25",
    "ph-26", "ph-27", "ph-28", "ph-29", "ph-30"
  ]
}
```

4. Linh pays the remaining 70% (`PAY-3`, endpoints defined in `06-payments.md`):

```http
POST /api/bookings/GS-1024/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"kind": "remaining"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "payment": {
    "id": "PAY-3",
    "bookingCode": "GS-1024",
    "kind": "remaining",
    "amount": 1260000,
    "status": "pending",
    "failureReason": null,
    "createdAt": "…"
  },
  "redirectUrl": "/test-gateway/PAY-3"
}
```

```http
POST /api/test-gateway/PAY-3
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "success"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "redirectUrl": "/payments/PAY-3/result"
}
```

```http
GET /api/payments/PAY-3
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-3",
    "bookingCode": "GS-1024",
    "kind": "remaining",
    "amount": 1260000,
    "status": "succeeded",
    "failureReason": null,
    "createdAt": "…"
  },
  "booking": {
    "code": "GS-1024",
    "status": "booked",
    "paymentStatus": "paid_in_full"
  }
}
```

5. Error — Linh tries to read Khoa's booking photos (`GS-1022`):

```http
GET /api/bookings/GS-1022/photos
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

- 2026-11-20: initial version: booking photos, 30-photo selection limit, remaining 70% payment chain. (TV2)
