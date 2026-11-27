# 10 — Admin booking changes, cancellation and final link (G10)

> **Owner:** TV3 Lê Công Minh Nhựt. Uses Booking, ScheduleItemInput and Clash/Suggestion unchanged from [README.md](README.md).
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

Every error is `{"error": {"code": string, "message": string, "fields": object, "details": object or null}}`. Messages are Vietnamese; `fields` has one message per invalid field (dot/index paths), otherwise `{}`. CLASH details are `{clashes: Clash[], suggestions: Suggestion[]}`. A live pending payment (deposit or remaining) gives 409 CONFLICT for rescheduling and cancellation, with `details: {retryAt: string}` from the payment service. The lock ends at the 15-minute expiration (BS.1), and transaction expiration is managed by TV2. Errors never change data or consume IDs.

Integration status (27/11): the Admin guard reads the transaction's `expiresAt` timestamp. Legacy pending transactions without an expiration remain locked and return a reason with null details. The affected booking remains unchanged if shared confirmation is unavailable for a deposit already paid.

`normal` delays about 150 ms; `slow` delays 2 s; `error` returns the README 500 shape; `empty` makes every list, including nested lists, `[]`. Empty list reads return 200, not 404. No future-date validation applies.

## PATCH /api/bookings/:code

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `date` | string | yes | Real YYYY-MM-DD; past dates allowed |
| `items` | ScheduleItemInput[] | yes | 1–4 items, validated exactly as file 04: kind makeup/shoot, HH:mm end > start, existing staffId and roomId (null allowed for makeup) |

- **200 OK:** `{booking: Booking}`. Apply date/items directly. Check configured opening hours and recheck staff/room at save, ignoring only the same booking. Existing jobs retain IDs, status, notes and progress. The edit job keeps its assigned editor and null schedule fields.
- For awaiting_deposit/unpaid, do not create jobs. For awaiting_deposit/deposit_paid, carry over the same code, package and deposit. After validation and a clash-free schedule, the shared confirmation operation from TV2 creates jobs and reminders once and confirms the booking. Never start a new charge. Prepare all related changes before publishing any of them. Recovery waits on the TV2 confirmation operation.
- **Errors:** inherited 401/403/500; 400 VALIDATION with date/items.*; 404 NOT_FOUND for missing booking; 409 CONFLICT for cancelled/completed, paid_in_full, a shoot job in_progress/done, or a live payment; 409 CLASH with details.clashes/details.suggestions. Validation, clash and conflicts leave booking, jobs, reminders and payments unchanged.
- **TV1 mapping dependency:** existing job IDs are J-code-kind. Multiple same-kind slots or adding/removing kinds with existing jobs have no agreed mapping. Until TV1 hands over that rule, return 409 CONFLICT without mutation for a non-bijective mapping, never pick the first slot or return a dependency 500. Schedules without existing jobs remain subject to normal ScheduleItemInput validation. This is a reported integration limitation, not a new PO restriction.

## POST /api/bookings/:code/cancel

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `reason` | string | yes | 5–500 characters; non-blank |

- **200 OK:** `{booking: Booking}` with status cancelled; it no longer occupies resources. Payment fields are unchanged; no refund rule is introduced. Reason is input only: Booking has no cancellationReason field.
- Only awaiting_deposit/booked may become cancelled, subject to the live-payment guard. Keep jobs, their progress/notes and all payments/amounts. The conversation remains scheduled with the same booking code and message/proposal history. A new booking requires a new request in a separate conversation. Staff reads remain available while writes after cancellation are blocked.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.reason; 404 NOT_FOUND for missing booking; 409 CONFLICT if already cancelled or completed.

## PUT /api/bookings/:code/final-link

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `url` | string | yes | Absolute https:// URL, maximum 500 characters (TV3 plan; confirm with team) |

- **200 OK:** `{booking: Booking}`, finalLink replaced with url. Does not complete the booking or change its payment status. File 11 receive completes it after full payment.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.url; 404 NOT_FOUND for missing booking; 409 CONFLICT with a reason unless booking is booked, paid_in_full and its edit job is done. Admin reads the reasons through GET booking detail (05). Saving never completes the booking or conversation.

## Reminder updates (R04 / cancellation part of R05)

Group choices in plan 2.7: for a reserved booking, calculate reminder time from the earliest new item minus settings.reminderHoursBefore. Update unsent reminders and their schedule/staff/room text; retain sent history and distinguish schedule versions to avoid duplicates on reruns. Cancellation must stop unsent reminders without deleting sent history. Keep only queued/sent/failed e-mail statuses. Never create reminders for awaiting_deposit without a reservation.

The mock runs the shared reminder helpers on a copy of the reminder list. Rescheduling a booked booking recalculates its queued reminder or queues one for the changed schedule while retaining sent history. Repeating the same schedule keeps a single queued reminder for it. The mock publishes the prepared list with the booking and job updates after schedule validation, clash checks and job mapping succeed. On cancellation the mock removes only queued reminders for that booking. Sent reminders are still returned by [GET /api/reminders](07-reminders.md). Reminder and payment response shapes are unchanged.

## Examples — direct Admin changes

G10 does not create proposals or require Hân to act. GS-1024 stays booked after saving its final link, ready for receive in file 11.

```http
PATCH /api/bookings/GS-1023
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
  ]
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
PATCH /api/bookings/GS-1023
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
  ]
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

```http
PUT /api/bookings/GS-1024/final-link
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "url": "https://drive.example.com/gs-1024"
}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error":{"code":"CONFLICT","message":"Chờ việc chỉnh ảnh hoàn thành trước khi lưu link.","fields":{},"details":null}}
```

```http
PATCH /api/jobs/J-GS-1024-edit
Authorization: Bearer {{token:tuan}}
Content-Type: application/json

{"status":"done"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"job":{"id":"J-GS-1024-edit","bookingCode":"GS-1024","kind":"edit","date":null,"start":null,"end":null,"room":null,"staff":{"id":"u-tuan","name":"Tuấn"},"customer":{"id":"u-linh","name":"Linh"},"packageName":"Gói Tốt nghiệp Premium","status":"done","note":"","previewCount":36}}
```

```http
PUT /api/bookings/GS-1024/final-link
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"url":"https://drive.example.com/gs-1024"}
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

### Repeated cancellation

```http
POST /api/bookings/GS-1023/cancel
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "reason": "Khách xin hủy vì thay đổi kế hoạch cá nhân."
}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Booking đã hoàn thành hoặc đã hủy",
    "fields": {},
    "details": null
  }
}
```


## Changes

- 2026-11-27: QA10. B2.2 keeps one booking per conversation. B4.1 supersedes the earlier B1.8 recovery path. B4.2–4/B4.7 and BS.1 specify payment and schedule guards. B4.11 requires full payment and a completed edit job before final-link delivery.

- 2026-11-24: integrate TV2 reminder helpers for R04 and R05 after validation; retain sent history on reschedule and cancellation. (TV3)

- 2026-11-23: R03 direct date/items rescheduling (PO decision, plan 2.5); R05 retain jobs/payments, repeated cancel 409 and scheduled conversation; R07 fresh replacement (group choices, plan 2.7). Record pending TV1 job mapping and TV2 reminder handoff; shared shapes unchanged.


- 2026-11-20: first version: three admin endpoints; p-3 acceptance before apply; recheck and job synchronization; cancel and HTTPS final link. Owner: TV3 Lê Công Minh Nhựt (24120211).
