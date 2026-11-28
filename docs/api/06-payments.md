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
  "reservationFailure": null,
  "createdAt": "2026-10-20T18:00:00+07:00",
  "expiresAt": "2026-10-20T18:15:00+07:00"
}
```

- `failureReason`: `null` unless `status` is `"failed"` (e.g. gateway decline or 15-minute payment expiry `"Giao dịch đã hết hạn (quá 15 phút)"`).
- `reservationFailure`: `null` normally; when a deposit payment succeeds at the gateway but the resource re-check finds a clash (PO #8 / R08), it holds `{"message": "Khung giờ vừa có người đặt. Studio sẽ liên hệ bạn", "clashes": [Clash…]}`.
- `expiresAt`: persisted ISO 8601 (`+07:00`) timestamp equal to `createdAt + 15 minutes` for both `"deposit"` and `"remaining"` payments (`BS.1`). A pending payment is active while `now < Date.parse(expiresAt)` and expires at `now >= Date.parse(expiresAt)`.

## Starting data (`mock/data/payments.json`)

- Starts empty: `[]`.
- Payment IDs are generated sequentially: `PAY-1`, `PAY-2`, `PAY-3`, …

---

## POST /api/bookings/:code/payments

Starts a payment for a booking and returns the gateway URL to open. Any overdue `pending` payment on this booking (`now >= expiresAt`) is transitioned to `failed` first, and any older unexpired `pending` payment of the same `(bookingCode, kind)` is closed as `failed` (`"Đã thay thế bởi giao dịch mới"`) — and likewise closed (`"Booking đã được thanh toán"`) when a sibling attempt settles as `succeeded` — so Admin payment locks (`activePaymentLock`) never stay blocked on stale attempts (`B4.2`, `B4.3`).

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
| 409 | `CONFLICT` | Deposit already paid (`paymentStatus` is not `unpaid`); or `"remaining"` requested before `booked`, before saving photo selection, or before all `shoot` jobs of the booking are `done` (R19); or booking is already `paid_in_full` / `cancelled` / `completed` | `{}` |

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
| `gatewayCaptured` | boolean | no | Optional flag indicating a real gateway capture after expiry/cancellation; defaults to `false` (`B4.2` late-callback exception). |

- **Mock behaviour before applying outcome (`B4.2`, `B4.3`):**
  - First expires overdue pending attempts (`now >= Date.parse(payment.expiresAt)`). If this payment has expired and `!(result === "success" && gatewayCaptured === true)`, transitions it to `failed` with `failureReason = "Giao dịch đã hết hạn (quá 15 phút)"` and returns `409 CONFLICT` (`"Giao dịch đã hết hạn"`).
  - If `payment.status !== "pending"` (and not recovered via a first-time post-cancel `gatewayCaptured` capture), returns `409 CONFLICT`.
- **Mock behaviour on `result: "success"`:**
  - Re-checks `booking.status`:
    - If `booking.status === "cancelled"` **and** `gatewayCaptured === true` and this `payment.kind` has not yet been recorded on the booking (`deposit` when `unpaid`, or `remaining` when `deposit_paid`), records the late real-gateway capture for reconciliation (`B4.2`): sets `payment.status = "succeeded"`, `payment.failureReason = null`, `payment.reservationFailure = null`, advances `booking.paymentStatus` (`deposit_paid` or `paid_in_full`), keeps `booking.status = "cancelled"`, creates **no** jobs or reminders, and refuses any replay with `409 CONFLICT`.
    - Otherwise, `booking.status === "cancelled"` or `"completed"` returns `409 CONFLICT` so standard stale pending payments cannot resurrect a cancelled booking (R09 / `B4.2`).
  - Re-checks `booking.paymentStatus` (`deposit` when not `unpaid`, or `remaining` when not `deposit_paid` → `409 CONFLICT`).
  - For `kind: "deposit"`:
    1. Calls the shared confirmation helper `confirmBookingReservation(db, booking)` (in `mock/lib/booking-confirmation.mjs`), which runs `checkClash(db, booking.date, booking.items, { ignoreBooking: code })` from `mock/lib/clash.mjs`.
    2. If there is **no clash**: atomically sets `booking.status = "booked"`, `booking.paymentStatus = "deposit_paid"`, prepares and commits staff jobs (`J-<code>-makeup`, `J-<code>-shoot`, `J-<code>-edit`, assigning `J-<code>-edit` from `db.bookingEditors[code]` with fallback to the `shoot` staff only when missing — `B4.11`) and queued reminder (`B4.12`) scheduled `db.settings.reminderHoursBefore` hours before the earliest item. Sets `payment.status = "succeeded"`, `payment.failureReason = null`, `payment.reservationFailure = null`. (`confirmBookingReservation` is also usable directly by Admin reschedule recovery `B4.1`.)
    3. If there **is a clash** (PO #8 / R08 / `B2.2`): sets `payment.status = "succeeded"`, `payment.failureReason = null`, `payment.reservationFailure = {"message": "Khung giờ vừa có người đặt. Studio sẽ liên hệ bạn", "clashes": clashResult.clashes}`, sets `booking.paymentStatus = "deposit_paid"`, and keeps `booking.status = "awaiting_deposit"`. No jobs or reminders are created, and retrying deposit returns `409 CONFLICT` (admin resolves via `PATCH /api/bookings/:code` direct reschedule `B4.1` or cancels to open a new consultation).
  - For `kind: "remaining"`: sets `payment.status = "succeeded"`, `payment.failureReason = null`, `payment.reservationFailure = null`, and `booking.paymentStatus = "paid_in_full"`.
- **Mock behaviour on `result: "failed"`:**
  - Re-checks `booking.status` (`cancelled` or `completed` → `409 CONFLICT`). Sets `payment.status = "failed"` with `failureReason = "Giao dịch bị từ chối (thử nghiệm)"` and `reservationFailure = null`. Booking status does not change; customer may retry without limit (PO #7).
- **200 OK:** `{"redirectUrl": "/payments/<paymentId>/result"}`.
- **Errors:** `400 VALIDATION` (invalid `result`), `401`, `403`, `404 NOT_FOUND`, `409 CONFLICT` (payment expired or no longer `pending`, booking is `cancelled`/`completed`, or that payment kind was already collected).

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
    "reservationFailure": null,
    "createdAt": "…",
    "expiresAt": "…"
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
    "reservationFailure": null,
    "createdAt": "…",
    "expiresAt": "…"
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
    "reservationFailure": null,
    "createdAt": "…",
    "expiresAt": "…"
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
    "reservationFailure": null,
    "createdAt": "…",
    "expiresAt": "…"
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
    "reservationFailure": null,
    "createdAt": "…",
    "expiresAt": "…"
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
- 2026-11-23: added `reservationFailure` for succeeded-but-clashed deposits (PO #8 / R08), re-checked booking/payment state at gateway callback (R09), and required `shoot` jobs to be `done` before remaining 70% payment (R19). (TV2)
- 2026-11-27: QA9 added `Payment.expiresAt` (+15 min expiry rule, retry allowed after expiry, `409` on expired gateway callback), superseded/closed older pending attempts of the same `(bookingCode, kind)` on new attempt or settlement (`activePaymentLock` clean unlock), documented `gatewayCaptured` post-cancel late-callback exception (`B4.2`), and extracted `confirmBookingReservation` with assigned editor provisioning (`B4.1`, `B4.11`). (TV2)
