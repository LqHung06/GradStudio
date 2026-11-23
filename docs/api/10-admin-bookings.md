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

Every error is `{"error": {"code": string, "message": string, "fields": object, "details": object or null}}`. Messages are Vietnamese; `fields` has one message per invalid field (dot/index paths), otherwise `{}`. `details` is null except CLASH, where it is `{clashes: Clash[], suggestions: Suggestion[]}`. Errors never change data or consume IDs. Unknown records return 404 NOT_FOUND; customers asking for another customer's item also get 404.

`normal` delays about 150 ms; `slow` delays 2 s; `error` returns the README 500 shape; `empty` makes every list, including nested lists, `[]`. Empty list reads return 200, not 404. No future-date validation applies.

## PATCH /api/bookings/:code

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `date` | string | yes | Real YYYY-MM-DD; past dates allowed |
| `items` | ScheduleItemInput[] | yes | 1–4 items, validated exactly as file 04: kind makeup/shoot, HH:mm end > start, existing staffId and roomId (null allowed for makeup) |

- **200 OK:** `{booking: Booking}`. Admin supplies date/items directly; no proposalId or customer re-acceptance. Recheck staff/room at save, internally ignoring only this booking's own intervals; ignoreBooking is not a request field. Keep all non-schedule booking data, money, paymentStatus and selection. Update existing related jobs' schedule and staff/room; preserve IDs, status, note and progress. Edit jobs keep date/start/end/room null and follow the shoot staff. Do not create jobs for awaiting_deposit. Prepare all changes before writing: validation/clash failure leaves booking/jobs/reminders/payments unchanged.
- **Errors:** inherited 401/403/500; 400 VALIDATION with date/items.*; 404 NOT_FOUND for missing booking; 409 CONFLICT for cancelled/completed; 409 CLASH with details.clashes/details.suggestions.
- **TV1 mapping dependency:** existing job IDs are J-code-kind. Multiple same-kind slots or adding/removing kinds with existing jobs have no agreed mapping. Until TV1 hands over that rule, return 409 CONFLICT without mutation for a non-bijective mapping, never pick the first slot or return a dependency 500. Schedules without existing jobs remain subject to normal ScheduleItemInput validation. This is a reported integration limitation, not a new PO restriction.

## POST /api/bookings/:code/cancel

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `reason` | string | yes | 5–500 characters; non-blank |

- **200 OK:** `{booking: Booking}` with status cancelled; it no longer occupies resources. Payment fields are unchanged; no refund rule is introduced. Reason is input only: Booking has no cancellationReason field.
- Only awaiting_deposit/booked may become cancelled. Keep jobs, their progress/notes and all payments/amounts; do not add refund or job statuses. Keep conversation scheduled and clear acceptedProposalId for the old schedule; all pre-cancellation proposals become ineligible for a replacement. TV1 owns blocking Staff PATCH/upload after cancellation, while GET history remains available.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.reason; 404 NOT_FOUND for missing booking; 409 CONFLICT if already cancelled or completed.

## PUT /api/bookings/:code/final-link

- **Roles:** admin.
- **Path:** code, required booking code GS- followed by digits. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `url` | string | yes | Absolute https:// URL, maximum 500 characters (TV3 plan; confirm with team) |

- **200 OK:** `{booking: Booking}`, finalLink replaced with url. Does not complete the booking or change its payment status. File 11 receive completes it after full payment.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.url (Vietnamese message: Link phải bắt đầu bằng https:// for non-HTTPS input); 404 NOT_FOUND for missing booking; 409 CONFLICT unless booking is booked. No payment prerequisite beyond status booked is added for saving a link.

## Reminder handoff (R04 / cancellation part of R05)

Group choices in plan 2.7: for a reserved booking, calculate reminder time from the earliest new item minus settings.reminderHoursBefore. Update unsent reminders and their schedule/staff/room text; retain sent history and distinguish schedule versions to avoid duplicates on reruns. Cancellation must stop unsent reminders without deleting sent history. Keep only queued/sent/failed e-mail statuses. Never create reminders for awaiting_deposit without a reservation.

**Not yet integrated:** TV2 has not delivered a shared helper or version/cancellation representation in contract 07. Current payments.ensureBookingReminder is private and skips existing reminders. TV3 does not duplicate it or change Reminder/Payment shapes. Booking/job edits and cancellation work independently, but reminder synchronization/stopping is pending; do not claim the complete flow passes. Requested interface for discussion: prepareBookingReminders(db, previousBooking, nextBooking) -> staged reminder replacements, computed without mutation, with an agreed version identity and unsent-stop representation. It must preserve sent history, produce no duplicate on repeat and no changes if validation/clash fails. See the regression TODO cases and FRONTEND Not done.

## Examples — direct Admin changes

These keep GS-1024 unchanged for receive in file 11. G10 does not create proposals or require Hân to act. Extra replacement examples run only after the original GS-1023 cancel and GS-1024 final-link steps.

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

### Supplemental cancellation and replacement (after the main chain)

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
  "note": "Lịch mới sau hủy"
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
    "note": "Lịch mới sau hủy"
  },
  "message": {
    "id": "m-8",
    "from": "studio",
    "author": {
      "id": "u-thao",
      "name": "Thảo"
    },
    "type": "proposal",
    "text": "Lịch mới sau hủy",
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
      "note": "Lịch mới sau hủy"
    },
    "at": "…"
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
    "note": "Lịch mới sau hủy"
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
      "text": "Lịch mới sau hủy",
      "at": "…"
    },
    "bookingCode": "GS-1023",
    "updatedAt": "…"
  }
}
```

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "conversationId": "c-han",
  "proposalId": "p-3",
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
    "code": "GS-1025",
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
    "createdAt": "…"
  }
}
```

## Changes

- 2026-11-23: R03 direct date/items rescheduling (PO decision, plan 2.5); R05 retain jobs/payments, repeated cancel 409 and scheduled conversation; R07 fresh replacement (group choices, plan 2.7). Record pending TV1 job mapping and TV2 reminder handoff; shared shapes unchanged.


- 2026-11-20: first version: three admin endpoints; p-3 acceptance before apply; recheck and job synchronization; cancel and HTTPS final link. Owner: TV3 Lê Công Minh Nhựt (24120211).
