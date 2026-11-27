# 04 — Resources, day schedule and availability (G5, G10)

> **Owner:** TV3 Lê Công Minh Nhựt. Uses ScheduleItemInput, Clash and Suggestion from [README.md](README.md).
> **Place in the example chain:** after p-2 is accepted, before GS-1024 is created. These reads and checks do not change state or allocate IDs.

| Method | Path | Roles |
|---|---|---|
| GET | /api/resources | admin |
| GET | /api/schedule | admin |
| POST | /api/availability/check | admin |

## Conventions and errors

All bodies and answers are JSON. All fields of shared objects, including nulls, remain present. All endpoints below inherit these errors from [README](README.md#error-shape):

| Status | error.code | When |
|---|---|---|
| 401 | UNAUTHENTICATED | Missing or invalid token |
| 403 | FORBIDDEN | The signed-in role is not allowed |
| 500 | SERVER_ERROR | Unexpected failure, including MOCK_MODE=error |

Every error is `{"error": {"code": string, "message": string, "fields": object, "details": object or null}}`. Messages are Vietnamese; `fields` has one message per invalid field (dot/index paths), otherwise `{}`. `details` is null except CLASH, where it is `{clashes: Clash[], suggestions: Suggestion[]}`. Errors never change data or consume IDs. Unknown records return 404 NOT_FOUND; customers asking for another customer's item also get 404.

`normal` delays about 150 ms; `slow` delays 2 s; `error` returns the README 500 shape; `empty` makes every list, including nested lists, `[]`. Empty list reads return 200, not 404. No future-date validation applies.

## GET /api/resources

- **Roles:** admin.
- **Path/query:** none. **Body:** none.
- **200 OK:** `{staff, rooms, costumes}`. staff entries have id/name strings and skill (makeup or photo); rooms have id/name; costumes have id/name and quantity (non-negative integer). Costumes are listed only; ScheduleItemInput defines no costume field, so do not invent costume clash inputs.
- **Errors:** inherited 401/403/500; no 400, 404 or 409 for this unparameterized read.

### Example

```http
GET /api/resources
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "staff": [
    {
      "id": "u-mai",
      "name": "Mai",
      "skill": "makeup"
    },
    {
      "id": "u-tuan",
      "name": "Tuấn",
      "skill": "photo"
    },
    {
      "id": "u-ha",
      "name": "Hà",
      "skill": "photo"
    }
  ],
  "rooms": [
    {
      "id": "r-a",
      "name": "Phòng A"
    },
    {
      "id": "r-b",
      "name": "Phòng B"
    }
  ],
  "costumes": [
    {
      "id": "co-cu-nhan",
      "name": "Áo cử nhân",
      "quantity": 10
    }
  ]
}
```

## GET /api/schedule

- **Roles:** admin.
- **Path:** none. **Query:** required date, a real calendar date YYYY-MM-DD; past dates allowed. **Body:** none.
- **200 OK:** `{date: string, rows: [{resource: {id, name, type}, busy: [{start, end, label, bookingCode}]}]}`. type is staff or room; times are HH:mm; label explains the busy interval in Vietnamese; bookingCode identifies its booking. Free resources have busy: []. Schedule rows cover staff and rooms; costumes have no time allocation in the current spec.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.date if missing/invalid. No 404 for an empty day; no 409.
- Awaiting-deposit bookings and accepted proposals do not occupy time. The full resource-row fixture below needs confirmation when mock data are added; README guarantees Mai's 08:00–12:00 block.

### Example

```http
GET /api/schedule?date=2026-10-24
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "date": "2026-10-24",
  "rows": [
    {
      "resource": {
        "id": "u-mai",
        "name": "Mai",
        "type": "staff"
      },
      "busy": [
        {
          "start": "08:00",
          "end": "12:00",
          "label": "Makeup kỷ yếu Lớp 12A3",
          "bookingCode": "GS-1021"
        }
      ]
    },
    {
      "resource": {
        "id": "u-tuan",
        "name": "Tuấn",
        "type": "staff"
      },
      "busy": []
    },
    {
      "resource": {
        "id": "u-ha",
        "name": "Hà",
        "type": "staff"
      },
      "busy": [
        {
          "start": "08:00",
          "end": "12:00",
          "label": "Chụp kỷ yếu Lớp 12A3",
          "bookingCode": "GS-1021"
        }
      ]
    },
    {
      "resource": {
        "id": "r-a",
        "name": "Phòng A",
        "type": "room"
      },
      "busy": [
        {
          "start": "08:00",
          "end": "12:00",
          "label": "Chụp kỷ yếu Lớp 12A3",
          "bookingCode": "GS-1021"
        }
      ]
    },
    {
      "resource": {
        "id": "r-b",
        "name": "Phòng B",
        "type": "room"
      },
      "busy": []
    }
  ]
}
```

## POST /api/availability/check

Admin scheduling uses Superadmin's configured opening hours for weekdays (Monday–Friday) and weekends (Saturday–Sunday). Each item must start at or after opening and end at or before closing. Return 400 VALIDATION on the relevant `items.N.start` or `items.N.end` with the applicable hours in the message. Apply the same rule when sending a proposal, creating a booking or rescheduling. Suggest only times within the applicable hours for the suggested date. A preferred customer time and the deposit resource recheck are outside this rule. Past dates and contiguous half-open intervals are valid. The shared settings helper still accepts a single configured interval for legacy data.

- **Roles:** admin. **Path/query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `date` | string | yes | Real calendar date YYYY-MM-DD; past dates allowed |
| `items` | ScheduleItemInput[] | yes | 1–4 items, all on date |
| `items[].kind` | string | yes | makeup or shoot |
| `items[].start` | string | yes | HH:mm, 24-hour |
| `items[].end` | string | yes | HH:mm; later than start; no overnight interval |
| `items[].staffId` | string | yes | Existing staff ID; proposed maximum 100 characters |
| `items[].roomId` | string or null | yes | Existing room for shoot; null allowed for makeup; proposed maximum 100 characters |

- **200 OK:** `{available: boolean, clashes: Clash[], suggestions: Suggestion[]}`. Even a clash is 200 here: it is a check result, not a failed write. A free schedule returns true and two empty arrays. Clash.reason and Suggestion.label are readable Vietnamese explanations; suggestions contain sendable ScheduleItemInput values.
- Checks staff and room intervals on the same date. Half-open intervals overlap when a.start < b.end and b.start < a.end; touching endpoints are allowed. Only booked slots block time in this PA#3 check; awaiting_deposit does not. Suggestions are alternatives, never reservations.
- **Errors:** inherited 401/403/500; 400 VALIDATION on date/items/items.N.* for invalid values or unknown staff/room IDs. No 404 for an unknown body resource (field error); no 409 for an availability result.
- There is no ignoreBooking request field in the spec: do not add it. The linked-conversation proposal and PATCH booking checks infer the excluded booking internally. Proposed ID length limit: 100 characters, pending team confirmation.

### Examples

```http
POST /api/availability/check
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
HTTP/1.1 200 OK
Content-Type: application/json

{
  "available": false,
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
```

```http
POST /api/availability/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "date": "2026-10-24",
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
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "available": true,
  "clashes": [],
  "suggestions": []
}
```

The exact same clashes/suggestions objects are placed inside error.details for 409 CLASH in files 03, 05 (if rechecked) and 10. A check never creates proposals, bookings or jobs.

## Changes

- 2026-11-27: QA10, B4.4. Validate configured opening hours in scheduling operations, keep the past-date example and use half-open intervals.

- 2026-11-20: first version: resources, readable daily schedule, read-only clash check and complete alternatives. Owner: TV3 Lê Công Minh Nhựt (24120211).
