# 06 — Payments and the test gateway (G7, G9)

> **Owner:** TV2 Đặng Hoàng Tuấn Kiệt. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** 6th (after `05-bookings.md` creates `GS-1024` in `awaiting_deposit`).
> **PA#3 note:** `POST /api/test-gateway/:paymentId` exists **only in PA#3** to simulate the online payment gateway. In PA#4, the real gateway (sandbox) replaces it while the front end keeps the same redirect and result-checking flow.

| Method | Path | Roles |
|---|---|---|
| POST | `/api/bookings/:code/payments` | customer (own) |
| GET | `/api/payments/:id` | customer (own), admin |
| POST | `/api/test-gateway/:paymentId` | customer (own) |

## Payment object

Every endpoint that returns a payment returns all fields below:

```json
{
  "id": "PAY-1",
  "bookingCode": "GS-1024",
  "kind": "deposit",
  "amount": 540000,
  "status": "pending",
  "failureReason": null,
  "createdAt": "2026-10-20T18:00:00+07:00"
}
```

## Starting data (`mock/data/payments.json`)

- Starts empty: `[]`.
- Payment IDs are generated sequentially: `PAY-1`, `PAY-2`, `PAY-3`, …

---

## POST /api/bookings/:code/payments

Starts a payment for a booking and returns the gateway URL to open.

- **Roles:** `customer` (only for their own booking).
- **Path parameters:** `code` (booking code, e.g. `GS-1024`).
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `kind` | string | yes | `"deposit"` (30%) or `"remaining"` (70%) |

- **201 Created:** `{"payment": Payment, "redirectUrl": "/test-gateway/<paymentId>"}`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | `kind` is missing or not `"deposit"` / `"remaining"` | `fields.kind` |
| 401 | `UNAUTHENTICATED` | Missing or invalid token | `{}` |
| 403 | `FORBIDDEN` | Caller is not a `customer` | `{}` |
| 404 | `NOT_FOUND` | Booking does not exist or belongs to another customer | `{}` |
| 409 | `CONFLICT` | Deposit already paid; or `"remaining"` requested before `booked` or before saving photo selection; or booking is already `paid_in_full` / `cancelled` | `{}` |

---

## GET /api/payments/:id

Reads a payment's real status from the API (used by both `/test-gateway/:paymentId` and `/payments/:id/result`).

- **Roles:** `customer` (own payment) or `admin`.
- **Path parameters:** `id` (payment id, e.g. `PAY-1`).
- **200 OK:** `{"payment": Payment, "booking": {"code": string, "status": string, "paymentStatus": string}}`.
- **Errors:** `401`, `403`, `404 NOT_FOUND`.

---

## POST /api/test-gateway/:paymentId

Submits the simulated gateway outcome in PA#3 and returns the result page URL.

- **Roles:** `customer` (own payment).
- **Path parameters:** `paymentId`.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `result` | string | yes | `"success"` or `"failed"` |

- **Mock behaviour on `result: "success"`:**
  - For `kind: "deposit"`:
    1. Calls `checkClash(db, booking.date, booking.items, { ignoreBooking: code })` from `mock/lib/clash.mjs` to re-check resources.
    2. If there is **no clash**: sets `booking.status = "booked"`, `booking.paymentStatus = "deposit_paid"`, `payment.status = "succeeded"`. Creates staff jobs (`J-<code>-makeup`, `J-<code>-shoot`, `J-<code>-edit`) and reminder `rm-1` scheduled `db.settings.reminderHoursBefore` hours before the earliest item.
    3. If there **is a clash** (product owner fallback): sets `payment.status = "failed"` with `failureReason = "Khung giờ vừa có người đặt. Studio sẽ liên hệ bạn"` and keeps booking in `awaiting_deposit`.
  - For `kind: "remaining"`: sets `payment.status = "succeeded"` and `booking.paymentStatus = "paid_in_full"`.
- **Mock behaviour on `result: "failed"`:**
  - Sets `payment.status = "failed"` with `failureReason = "Giao dịch bị từ chối (thử nghiệm)"`. Booking status does not change.
- **200 OK:** `{"redirectUrl": "/payments/<paymentId>/result"}`.
- **Errors:** `400 VALIDATION` (invalid `result`), `401`, `403`, `404 NOT_FOUND`, `409 CONFLICT` (payment is no longer `pending`).

---

### Examples

1. Linh starts the 30% deposit for `GS-1024` (`PAY-1`):

```http
POST /api/bookings/GS-1024/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"kind": "deposit"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1",
    "bookingCode": "GS-1024",
    "kind": "deposit",
    "amount": 540000,
    "status": "pending",
    "failureReason": null,
    "createdAt": "…"
  },
  "redirectUrl": "/test-gateway/PAY-1"
}
```

2. The test gateway page loads `PAY-1`:

```http
GET /api/payments/PAY-1
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1",
    "bookingCode": "GS-1024",
    "kind": "deposit",
    "amount": 540000,
    "status": "pending",
    "failureReason": null,
    "createdAt": "…"
  },
  "booking": {
    "code": "GS-1024",
    "status": "awaiting_deposit",
    "paymentStatus": "unpaid"
  }
}
```

3. Linh clicks "Thanh toán thất bại (thử nghiệm)" on `PAY-1`:

```http
POST /api/test-gateway/PAY-1
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "failed"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "redirectUrl": "/payments/PAY-1/result"
}
```

4. The result page reads `PAY-1` from the API (`GS-1024` stays `awaiting_deposit`):

```http
GET /api/payments/PAY-1
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1",
    "bookingCode": "GS-1024",
    "kind": "deposit",
    "amount": 540000,
    "status": "failed",
    "failureReason": "Giao dịch bị từ chối (thử nghiệm)",
    "createdAt": "…"
  },
  "booking": {
    "code": "GS-1024",
    "status": "awaiting_deposit",
    "paymentStatus": "unpaid"
  }
}
```

5. Linh retries the deposit (`PAY-2`):

```http
POST /api/bookings/GS-1024/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"kind": "deposit"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "payment": {
    "id": "PAY-2",
    "bookingCode": "GS-1024",
    "kind": "deposit",
    "amount": 540000,
    "status": "pending",
    "failureReason": null,
    "createdAt": "…"
  },
  "redirectUrl": "/test-gateway/PAY-2"
}
```

6. Linh clicks "Thanh toán thành công (thử nghiệm)" on `PAY-2` (resources are re-checked, jobs and reminder `rm-1` are created):

```http
POST /api/test-gateway/PAY-2
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "success"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "redirectUrl": "/payments/PAY-2/result"
}
```

7. The result page reads `PAY-2` (`GS-1024` is now `booked` and `deposit_paid`):

```http
GET /api/payments/PAY-2
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-2",
    "bookingCode": "GS-1024",
    "kind": "deposit",
    "amount": 540000,
    "status": "succeeded",
    "failureReason": null,
    "createdAt": "…"
  },
  "booking": {
    "code": "GS-1024",
    "status": "booked",
    "paymentStatus": "deposit_paid"
  }
}
```

8. Error — deposit already paid on `GS-1024`:

```http
POST /api/bookings/GS-1024/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"kind": "deposit"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Booking này đã đặt cọc rồi",
    "fields": {},
    "details": null
  }
}
```

9. Error — invalid `kind`:

```http
POST /api/bookings/GS-1024/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"kind": "full"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION",
    "message": "Dữ liệu chưa hợp lệ",
    "fields": {
      "kind": "Loại thanh toán phải là deposit hoặc remaining"
    },
    "details": null
  }
}
```

10. Error — Linh tries to pay for Khoa's booking (`GS-1022`):

```http
POST /api/bookings/GS-1022/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"kind": "remaining"}
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

- 2026-11-20: initial version: deposit and remaining payments, PA#3 test gateway, failure and success examples. (TV2)
