# 10 — Admin booking changes, cancellation and final link (G10)

> **Owner:** TV3 Lê Công Minh Nhựt. Uses Booking, Proposal, Message and Clash/Suggestion unchanged from [README.md](README.md).
> **Place in the example chain:** after 06–09: GS-1024 is booked, paid_in_full, with 30 selected photos; GS-1023 is still awaiting_deposit, linked to c-han. Before 11: finalLink is set here, then Linh receives the photos there.

| Method | Path | Roles |
|---|---|---|
| PATCH | /api/bookings/:code | admin |
| POST | /api/bookings/:code/cancel | admin |
| PUT | /api/bookings/:code/final-link | admin |

## Conventions and errors

All bodies and answers are JSON. All fields of shared objects, including nulls, remain present. All endpoints below inherit these errors from [README](README.md#error-shape):

| Status | error.code | When |
|---|---|---|
| 401 | UNAUTHENTICATED | Missing or invalid token |
| 403 | FORBIDDEN | The signed-in role is not allowed |
| 500 | SERVER_ERROR | Unexpected failure, including MOCK_MODE=error |

Every error is `{"error": {"code": string, "message": string, "fields": object, "details": object or null}}`. Messages are Vietnamese; `fields` has one message per invalid field (dot/index paths), otherwise `{}`. `details` is null except CLASH, where it is `{clashes: Clash[], suggestions: Suggestion[]}`. Errors never change data or consume IDs. Unknown records return 404 NOT_FOUND; customers asking for another customer's item also get 404.

`normal` delays about 150 ms; `slow` delays 2 s; `error` returns the README 500 shape; `empty` makes every list, including nested lists, `[]`. Empty list reads return 200, not 404. No future-date validation applies.

## PATCH /api/bookings/:code

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `proposalId` | string | yes | Existing proposal; proposed length 1–100 characters, pending team confirmation |

- **200 OK:** `{booking: Booking}`. Date/items are taken only from the accepted proposal belonging to booking.conversationId. Applying a proposal updates the date, times, staff and room of existing related jobs atomically; edit jobs retain null date/start/end/room. Other booking fields, paymentStatus, amounts and job progress stay intact. Do not create jobs for an awaiting_deposit booking; GS-1023 has none yet.
- Recheck resources immediately before applying, ignoring this booking's own intervals. If the time became occupied after agreement, reject without partially updating booking/jobs. Customer acceptance alone never applies a reschedule.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.proposalId if missing/wrong type; 404 NOT_FOUND for missing booking or proposal; 409 CONFLICT if proposal is not accepted, belongs to another conversation, was already applied, or booking is completed/cancelled; 409 CLASH with details.clashes/details.suggestions if the final recheck fails.

## POST /api/bookings/:code/cancel

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `reason` | string | yes | 5–500 characters; non-blank |

- **200 OK:** `{booking: Booking}` with status cancelled; it no longer occupies resources. Payment fields are unchanged; no refund rule is introduced. Reason is input only: Booking has no cancellationReason field.
- Related jobs must cease to be actionable. **Shared-spec gap:** Job has no cancelled status, and README does not specify removal versus archival. Do not add Job.status=cancelled. Hưng must confirm lifecycle representation before implementing cancellation for bookings with jobs; the executable example uses GS-1023, which has no jobs before deposit.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.reason; 404 NOT_FOUND for missing booking; 409 CONFLICT if completed. Repeat cancellation behavior needs team confirmation; no extra error case is assumed here.

## PUT /api/bookings/:code/final-link

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `url` | string | yes | Absolute https:// URL, maximum 500 characters (TV3 plan; confirm with team) |

- **200 OK:** `{booking: Booking}`, finalLink replaced with url. Does not complete the booking or change its payment status. File 11 receive completes it after full payment.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.url (Vietnamese message: Link phải bắt đầu bằng https:// for non-HTTPS input); 404 NOT_FOUND for missing booking; 409 CONFLICT unless booking is booked. No payment prerequisite beyond status booked is added for saving a link.

## Examples — one ordered reschedule chain

The conversation endpoints below are defined in file 03 and intentionally executed here. Token han is resolved by contract-check using 01-auth and FRONTEND.md; no extra sign-in endpoint example is needed. The 24/10 clash consumes no ID, so the valid 25/10 proposal is p-3.

GS-1023's full package/amount/selection/timestamp fixture is not given in README (only owner, conversation, status and the plan's date). The full Booking values below propose the same premium package for Hân; **Hưng and Kiệt must confirm those seed values before runtime verification**. No new Booking field is introduced.

```http
POST /api/conversations/c-han/proposals
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "date": "2026-10-24",
  "items": [
    {
      "kind": "makeup",
      "start": "09:00",
      "end": "10:00",
      "staffId": "u-mai",
      "roomId": null
    },
    {
      "kind": "shoot",
      "start": "10:00",
      "end": "12:00",
      "staffId": "u-tuan",
      "roomId": "r-b"
    }
  ],
  "note": "Đổi lịch sang 24/10 lúc 09:00"
}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CLASH",
    "message": "Mai bận 08:00–12:00 nên makeup 09:00–10:00 bị trùng",
    "fields": {},
    "details": {
      "clashes": [
        {
          "itemIndex": 0,
          "resource": {
            "id": "u-mai",
            "name": "Mai",
            "type": "staff"
          },
          "busyFrom": "08:00",
          "busyTo": "12:00",
          "reason": "Mai bận 08:00–12:00 nên makeup 09:00–10:00 bị trùng"
        }
      ],
      "suggestions": [
        {
          "date": "2026-10-24",
          "label": "Makeup 13:00–14:00 với Mai · Chụp 14:00–16:00 với Tuấn · Phòng B",
          "items": [
            {
              "kind": "makeup",
              "start": "13:00",
              "end": "14:00",
              "staffId": "u-mai",
              "roomId": null
            },
            {
              "kind": "shoot",
              "start": "14:00",
              "end": "16:00",
              "staffId": "u-tuan",
              "roomId": "r-b"
            }
          ]
        },
        {
          "date": "2026-10-24",
          "label": "Makeup 14:00–15:00 với Mai · Chụp 15:00–17:00 với Tuấn · Phòng B",
          "items": [
            {
              "kind": "makeup",
              "start": "14:00",
              "end": "15:00",
              "staffId": "u-mai",
              "roomId": null
            },
            {
              "kind": "shoot",
              "start": "15:00",
              "end": "17:00",
              "staffId": "u-tuan",
              "roomId": "r-b"
            }
          ]
        },
        {
          "date": "2026-10-25",
          "label": "25/10 · Makeup 09:00–10:00 với Mai · Chụp 10:00–12:00 với Tuấn · Phòng B",
          "items": [
            {
              "kind": "makeup",
              "start": "09:00",
              "end": "10:00",
              "staffId": "u-mai",
              "roomId": null
            },
            {
              "kind": "shoot",
              "start": "10:00",
              "end": "12:00",
              "staffId": "u-tuan",
              "roomId": "r-b"
            }
          ]
        }
      ]
    }
  }
}
```

```http
POST /api/conversations/c-han/proposals
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "date": "2026-10-25",
  "items": [
    {
      "kind": "makeup",
      "start": "09:00",
      "end": "10:00",
      "staffId": "u-mai",
      "roomId": null
    },
    {
      "kind": "shoot",
      "start": "10:00",
      "end": "12:00",
      "staffId": "u-tuan",
      "roomId": "r-b"
    }
  ],
  "note": "Đổi lịch sang 25/10 · Makeup 09:00–10:00 · Chụp 10:00–12:00"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "proposal": {
    "id": "p-3",
    "status": "pending",
    "date": "2026-10-25",
    "items": [
      {
        "kind": "makeup",
        "start": "09:00",
        "end": "10:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "10:00",
        "end": "12:00",
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
    "note": "Đổi lịch sang 25/10 · Makeup 09:00–10:00 · Chụp 10:00–12:00"
  },
  "message": {
    "id": "m-7",
    "from": "studio",
    "author": {
      "id": "u-thao",
      "name": "Thảo"
    },
    "type": "proposal",
    "text": "Đổi lịch sang 25/10 · Makeup 09:00–10:00 · Chụp 10:00–12:00",
    "request": null,
    "proposal": {
      "id": "p-3",
      "status": "pending",
      "date": "2026-10-25",
      "items": [
        {
          "kind": "makeup",
          "start": "09:00",
          "end": "10:00",
          "staff": {
            "id": "u-mai",
            "name": "Mai"
          },
          "room": null
        },
        {
          "kind": "shoot",
          "start": "10:00",
          "end": "12:00",
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
      "note": "Đổi lịch sang 25/10 · Makeup 09:00–10:00 · Chụp 10:00–12:00"
    },
    "at": "2026-10-20T17:25:00+07:00"
  }
}
```

Apply before Hân accepts: no mutation.

```http
PATCH /api/bookings/GS-1023
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "proposalId": "p-3"
}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Khách chưa đồng ý giờ mới",
    "fields": {},
    "details": null
  }
}
```

```http
PATCH /api/conversations/c-han/proposals/p-3
Authorization: Bearer {{token:han}}
Content-Type: application/json

{
  "decision": "accepted"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "proposal": {
    "id": "p-3",
    "status": "accepted",
    "date": "2026-10-25",
    "items": [
      {
        "kind": "makeup",
        "start": "09:00",
        "end": "10:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "10:00",
        "end": "12:00",
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
    "note": "Đổi lịch sang 25/10 · Makeup 09:00–10:00 · Chụp 10:00–12:00"
  },
  "conversation": {
    "id": "c-han",
    "customer": {
      "id": "u-han",
      "name": "Lê Ngọc Hân"
    },
    "topic": "Gói Tốt nghiệp",
    "status": "scheduled",
    "lastMessage": {
      "text": "Đổi lịch sang 25/10 · Makeup 09:00–10:00 · Chụp 10:00–12:00",
      "at": "2026-10-20T17:25:00+07:00"
    },
    "bookingCode": "GS-1023",
    "updatedAt": "2026-10-20T17:25:00+07:00"
  }
}
```

Apply after agreement. Ignore GS-1023 itself during recheck; update any existing related jobs in the same operation.

```http
PATCH /api/bookings/GS-1023
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "proposalId": "p-3"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "booking": {
    "code": "GS-1023",
    "customer": {
      "id": "u-han",
      "name": "Lê Ngọc Hân"
    },
    "conversationId": "c-han",
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
    "date": "2026-10-25",
    "requestedTime": null,
    "items": [
      {
        "kind": "makeup",
        "start": "09:00",
        "end": "10:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "10:00",
        "end": "12:00",
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
    "createdAt": "2026-10-20T16:00:00+07:00"
  }
}
```

```http
POST /api/bookings/GS-1023/cancel
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "reason": "Khách xin hủy vì thay đổi kế hoạch cá nhân."
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "booking": {
    "code": "GS-1023",
    "customer": {
      "id": "u-han",
      "name": "Lê Ngọc Hân"
    },
    "conversationId": "c-han",
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
    "date": "2026-10-25",
    "requestedTime": null,
    "items": [
      {
        "kind": "makeup",
        "start": "09:00",
        "end": "10:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "10:00",
        "end": "12:00",
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
    "status": "cancelled",
    "paymentStatus": "unpaid",
    "selection": {
      "limit": 30,
      "selectedCount": 0
    },
    "finalLink": null,
    "createdAt": "2026-10-20T16:00:00+07:00"
  }
}
```

GS-1024 remains booked until receive in file 11.

```http
PUT /api/bookings/GS-1024/final-link
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "url": "https://drive.example.com/gs-1024"
}
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
    "status": "booked",
    "paymentStatus": "paid_in_full",
    "selection": {
      "limit": 30,
      "selectedCount": 30
    },
    "finalLink": "https://drive.example.com/gs-1024",
    "createdAt": "2026-10-20T17:40:00+07:00"
  }
}
```

## Changes

- 2026-11-20: first version: three admin endpoints; p-3 acceptance before apply; recheck and job synchronization; cancel and HTTPS final link. Owner: TV3 Lê Công Minh Nhựt (24120211).
