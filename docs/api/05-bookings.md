# 05 — Create, list and read bookings (G6, G7, G10)

> **Owner:** TV3 Lê Công Minh Nhựt. Every booking response uses the complete Booking from [README.md](README.md#booking).
> **Place in the example chain:** p-1 was declined and p-2 accepted in 03; availability in 04 made no changes. Only one successful create below produces GS-1024.

| Method | Path | Roles |
|---|---|---|
| POST | /api/bookings | admin |
| GET | /api/bookings | customer (own), admin |
| GET | /api/bookings/:code | customer (own), admin, staff (assigned) |

## Conventions and errors

All bodies and answers are JSON. All fields of shared objects, including nulls, remain present. All endpoints below inherit these errors from [README](README.md#error-shape):

| Status | error.code | When |
|---|---|---|
| 401 | UNAUTHENTICATED | Missing or invalid token |
| 403 | FORBIDDEN | The signed-in role is not allowed |
| 500 | SERVER_ERROR | Unexpected failure, including MOCK_MODE=error |

Every error is `{"error": {"code": string, "message": string, "fields": object, "details": object or null}}`. Messages are Vietnamese; `fields` has one message per invalid field (dot/index paths), otherwise `{}`. `details` is null except CLASH, where it is `{clashes: Clash[], suggestions: Suggestion[]}`. Errors never change data or consume IDs. Unknown records return 404 NOT_FOUND; customers asking for another customer's item also get 404.

`normal` delays about 150 ms; `slow` delays 2 s; `error` returns the README 500 shape; `empty` makes every list, including nested lists, `[]`. Empty list reads return 200, not 404. No future-date validation applies.

### Validation proposals awaiting team confirmation

The following limits are review proposals, **not product-owner decisions**: IDs are non-empty strings of at most 100 characters; shootType is 1–120 characters; note is optional, at most 1000 characters (omitted means an empty string); extraIds is a required array of 0–20 distinct existing extra IDs. Text is 1–1000 characters as in the TV3 plan. Confirm these limits with Hưng and Kiệt before implementing validation; do not add fields to shared objects.

## Booking and reservation rules

Booking is returned in full, including requestedTime, items[].room and finalLink when null. Prices are integer VND from the package, not caller-supplied prices; extras add no money. deposit = Math.round(price * 0.3), remaining = price - deposit. For pkg-tn-premium: price 1800000, deposit 540000 (30%, rounded to the nearest one VND), remaining 1260000. Remaining means price minus deposit, including after full payment; paymentStatus tells payment progress. Selection.limit comes from editedPhotos. requestedTime is null if the original time was retained, otherwise {start, note}.

Creating awaiting_deposit does **not** reserve any staff or room. Only successful deposit payment with resources checked again in file 06 changes status to booked, holds time, and creates jobs/reminder. Failure keeps awaiting_deposit/unpaid. Do not create jobs here.

## POST /api/bookings

- **Roles:** admin. **Path/query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `conversationId` | string | yes | Existing conversation; proposed maximum 100 characters |
| `proposalId` | string | yes | Proposal of that conversation; proposed maximum 100 characters |
| `shootType` | string | yes | Non-blank; proposed 1–120 characters |
| `packageId` | string | yes | Existing package; proposed maximum 100 characters |
| `extraIds` | string[] | yes | Proposed 0–20 distinct existing IDs; [] allowed |

- **201 Created:** `{booking: Booking}`. Uses the accepted proposal date/items, customer from conversation and package data from catalogue. Assigns next booking code (highest existing number + 1), sets conversation.bookingCode, status awaiting_deposit and paymentStatus unpaid. The first success is GS-1024. A replacement is allowed only after the current linked booking is cancelled, using a fresh proposal created after cancellation and accepted by the customer. Never reuse a proposal used for any previous booking, or a proposal from another conversation. The old booking keeps conversationId, amounts and payment history; the new booking starts awaiting_deposit/unpaid, with no transfer of old deposits. conversation.bookingCode points to the new code. GET list/detail retains all old bookings under the existing ownership rules.
- **Errors:** inherited 401/403/500; 400 VALIDATION for missing/wrong body fields, unknown package/extra IDs; 404 NOT_FOUND for missing conversation/proposal; 409 CONFLICT when proposal is not accepted, belongs to another conversation, proposal was used for an earlier booking or predates its cancellation, or the current linked booking is not cancelled. No mandatory slot reservation/check is introduced here; resource checks are enforced at proposal creation and deposit success.

### Examples

Declined p-1 cannot create a booking; GS-1024 is not consumed.

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "conversationId": "c-linh",
  "proposalId": "p-1",
  "shootType": "Tốt nghiệp cá nhân",
  "packageId": "pkg-tn-premium",
  "extraIds": [
    "ex-makeup"
  ]
}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Khách chưa đồng ý giờ đề xuất này",
    "fields": {},
    "details": null
  }
}
```

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "conversationId": "c-linh",
  "proposalId": "p-2",
  "shootType": "Tốt nghiệp cá nhân",
  "packageId": "pkg-tn-premium",
  "extraIds": [
    "ex-makeup"
  ]
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "booking": {
    "code": "GS-1024",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "conversationId": "c-linh",
    "serviceName": "Tốt nghiệp",
    "shootType": "Tốt nghiệp cá nhân",
    "package": {
      "id": "pkg-tn-premium",
      "name": "Gói Tốt nghiệp Premium",
      "durationHours": 2,
      "editedPhotos": 30
    },
    "extras": [
      {
        "id": "ex-makeup",
        "name": "Makeup"
      }
    ],
    "date": "2026-10-24",
    "requestedTime": {
      "start": "09:00",
      "note": "Mai bận 08:00–12:00"
    },
    "items": [
      {
        "kind": "makeup",
        "start": "13:00",
        "end": "14:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "14:00",
        "end": "16:00",
        "staff": {
          "id": "u-tuan",
          "name": "Tuấn"
        },
        "room": {
          "id": "r-b",
          "name": "Phòng B"
        }
      }
    ],
    "price": 1800000,
    "deposit": 540000,
    "remaining": 1260000,
    "status": "awaiting_deposit",
    "paymentStatus": "unpaid",
    "selection": {
      "limit": 30,
      "selectedCount": 0
    },
    "finalLink": null,
    "createdAt": "2026-10-20T17:40:00+07:00"
  }
}
```

## GET /api/bookings

- **Roles:** customer (own only), admin (all).
- **Path:** none. **Query:** optional status, one of awaiting_deposit, booked, completed, cancelled; omit for all visible bookings. **Body:** none.
- **200 OK:** `{bookings: Booking[]}`, every item is complete.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.status for an unknown value. No 404/409 for lists.

### Examples

```http
GET /api/bookings
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "bookings": [
    {
      "code": "GS-1024",
      "customer": {
        "id": "u-linh",
        "name": "Linh"
      },
      "conversationId": "c-linh",
      "serviceName": "Tốt nghiệp",
      "shootType": "Tốt nghiệp cá nhân",
      "package": {
        "id": "pkg-tn-premium",
        "name": "Gói Tốt nghiệp Premium",
        "durationHours": 2,
        "editedPhotos": 30
      },
      "extras": [
        {
          "id": "ex-makeup",
          "name": "Makeup"
        }
      ],
      "date": "2026-10-24",
      "requestedTime": {
        "start": "09:00",
        "note": "Mai bận 08:00–12:00"
      },
      "items": [
        {
          "kind": "makeup",
          "start": "13:00",
          "end": "14:00",
          "staff": {
            "id": "u-mai",
            "name": "Mai"
          },
          "room": null
        },
        {
          "kind": "shoot",
          "start": "14:00",
          "end": "16:00",
          "staff": {
            "id": "u-tuan",
            "name": "Tuấn"
          },
          "room": {
            "id": "r-b",
            "name": "Phòng B"
          }
        }
      ],
      "price": 1800000,
      "deposit": 540000,
      "remaining": 1260000,
      "status": "awaiting_deposit",
      "paymentStatus": "unpaid",
      "selection": {
        "limit": 30,
        "selectedCount": 0
      },
      "finalLink": null,
      "createdAt": "2026-10-20T17:40:00+07:00"
    }
  ]
}
```

```http
GET /api/bookings
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

## GET /api/bookings/:code

- **Roles:** customer (own), admin (all), staff (assigned). Other roles receive 403.
- **Path:** code, required booking code GS- followed by digits. **Query:** none. **Body:** none.
- **200 OK:** `{booking: Booking}`.
- **Errors:** inherited 401/403/500; 404 NOT_FOUND for unknown code or an existing booking outside the customer's ownership/staff assignment. An unrecognized path code is a missing resource, not a 400 field error. No 409 for a read.

### Examples

```http
GET /api/bookings/GS-1024
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "booking": {
    "code": "GS-1024",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "conversationId": "c-linh",
    "serviceName": "Tốt nghiệp",
    "shootType": "Tốt nghiệp cá nhân",
    "package": {
      "id": "pkg-tn-premium",
      "name": "Gói Tốt nghiệp Premium",
      "durationHours": 2,
      "editedPhotos": 30
    },
    "extras": [
      {
        "id": "ex-makeup",
        "name": "Makeup"
      }
    ],
    "date": "2026-10-24",
    "requestedTime": {
      "start": "09:00",
      "note": "Mai bận 08:00–12:00"
    },
    "items": [
      {
        "kind": "makeup",
        "start": "13:00",
        "end": "14:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "14:00",
        "end": "16:00",
        "staff": {
          "id": "u-tuan",
          "name": "Tuấn"
        },
        "room": {
          "id": "r-b",
          "name": "Phòng B"
        }
      }
    ],
    "price": 1800000,
    "deposit": 540000,
    "remaining": 1260000,
    "status": "awaiting_deposit",
    "paymentStatus": "unpaid",
    "selection": {
      "limit": 30,
      "selectedCount": 0
    },
    "finalLink": null,
    "createdAt": "2026-10-20T17:40:00+07:00"
  }
}
```

```http
GET /api/bookings/GS-1022
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

- 2026-11-23: R07: replacement after cancellation with a fresh accepted proposal and preserved history (group choice, plan 2.7); package-only price (PO R3), one-VND deposit rounding (group choice).

- 2026-11-20: first version: complete Booking responses, p-1 rejection, GS-1024 creation, ownership and deposit reservation boundary. Owner: TV3 Lê Công Minh Nhựt (24120211).
