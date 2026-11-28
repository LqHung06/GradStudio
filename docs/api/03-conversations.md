# 03 — Conversations, messages and proposals (G3–G6)

> **Owner:** TV3 Lê Công Minh Nhựt. Uses Message, Proposal, ScheduleItemInput and the error shape from [README.md](README.md).
> **Place in the example chain:** after catalogue, before availability and bookings. Examples run top to bottom.

| Method | Path | Roles |
|---|---|---|
| GET | /api/conversations | customer (own), admin |
| POST | /api/conversations | customer |
| GET | /api/conversations/:id | customer (own), admin |
| POST | /api/conversations/:id/messages | customer (own), admin |
| POST | /api/conversations/:id/proposals | admin |
| PATCH | /api/conversations/:id/proposals/:proposalId | customer (own) |

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

## Response objects

Conversation summary (TV3 plan 5.1): `id` string, `customer` PersonRef, `topic` string, `status` conversation code, `lastMessage` object with `text` string and `at` ISO moment, `bookingCode` string or null, `updatedAt` ISO moment. Detail adds `messages: Message[]` and `acceptedProposalId: string or null`. Summary responses do not add acceptedProposalId; read detail after accepting if needed.

Message has exactly `id, from, author, type, text, request, proposal, at`. The API derives author and from from the token, request display names from catalogue IDs, and type from the operation. Text messages have request and proposal null; requests have proposal null; proposal messages have request null. Proposal has exactly `id, status, date, items, note`; items are ScheduleItem, not ScheduleItemInput.

Seed messages m-1 and m-2 below describe the two existing c-linh messages in README. Their timestamps and the topic are example fixture values for Hưng/TV3 to confirm when seeding; no mock exists yet. New messages continue m-3 onward; proposals have their own p-* counter.

## GET /api/conversations

- **Roles:** customer (own only), admin (all).
- **Path:** no parameters. **Query:** optional `status`, one of unanswered, consulting, scheduled, done. Omit for all visible conversations. No pagination or other filters are specified.
- **Body:** none.
- **200 OK:** `{conversations: ConversationSummary[]}`.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.status for an unknown status. No 404 or 409 for a list.

### Examples

```http
GET /api/conversations
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "conversations": [
    {
      "id": "c-linh",
      "customer": {
        "id": "u-linh",
        "name": "Linh"
      },
      "topic": "Gói Tốt nghiệp",
      "status": "consulting",
      "lastMessage": {
        "text": "Để mình kiểm tra lịch cho bạn nhé",
        "at": "2026-10-20T17:25:00+07:00"
      },
      "bookingCode": null,
      "updatedAt": "2026-10-20T17:25:00+07:00"
    }
  ]
}
```

## POST /api/conversations

- **Roles:** customer; customer identity comes from token.
- **Path/query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `text` | string | yes | 1–1000 characters; non-blank |
| `request` | BookingRequestInput | no | Same fields and validation as POST /api/conversations/:id/messages |

- This is the service-page entry point when the customer has not selected a conversation. Both ordinary chat and a booking request prefer the customer's non-done conversation without a booking. If several legacy or seed threads qualify, choose the latest `lastMessage.at`. Without such a thread, a request creates a new conversation. Ordinary chat uses the newest non-done thread or creates one if none exists.
- **200 OK** when appending and **201 Created** when opening a thread. Both return `{conversation: ConversationDetail}` with the destination in `conversation.id` and the new message in its history. New threads start unanswered with null bookingCode and acceptedProposalId. Numbering uses the largest numeric c-* suffix plus one. The token supplies the owner, and validation failures consume no IDs.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.text or request and its child fields.

### Example

The validation example consumes no ID. The successful create runs after the main c-linh chain below, preserving its message/proposal IDs.

```http
POST /api/conversations
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{
  "text": ""
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
      "text": "Vui lòng nhập tin nhắn"
    },
    "details": null
  }
}
```

## GET /api/conversations/:id

- **Roles:** customer (own), admin.
- **Path:** id, required non-empty conversation ID (proposed maximum 100 characters). **Query:** none. **Body:** none.
- **200 OK:** `{conversation: ConversationDetail}`, messages in chronological order.
- **Errors:** inherited 401/403/500; 404 NOT_FOUND when absent or owned by another customer. No body validation (400) or state mutation (409).

### Example

```http
GET /api/conversations/c-linh
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "conversation": {
    "id": "c-linh",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "topic": "Gói Tốt nghiệp",
    "status": "consulting",
    "lastMessage": {
      "text": "Để mình kiểm tra lịch cho bạn nhé",
      "at": "2026-10-20T17:25:00+07:00"
    },
    "bookingCode": null,
    "updatedAt": "2026-10-20T17:25:00+07:00",
    "messages": [
      {
        "id": "m-1",
        "from": "customer",
        "author": {
          "id": "u-linh",
          "name": "Linh"
        },
        "type": "text",
        "text": "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?",
        "request": null,
        "proposal": null,
        "at": "2026-10-20T17:25:00+07:00"
      },
      {
        "id": "m-2",
        "from": "studio",
        "author": {
          "id": "u-thao",
          "name": "Thảo"
        },
        "type": "text",
        "text": "Để mình kiểm tra lịch cho bạn nhé",
        "request": null,
        "proposal": null,
        "at": "2026-10-20T17:25:00+07:00"
      }
    ],
    "acceptedProposalId": null
  }
}
```

## POST /api/conversations/:id/messages

The selected thread stays the destination for ordinary chat in an active thread, including one with a booking. A customer request in a thread with a booking, or a customer message in a completed thread, uses the customer's open thread without a booking if one exists, otherwise opens one. Read `conversation.id` from the response even if it differs from the path parameter. Admin text replies use the selected thread. Only customers send booking requests. Preferred date/time in a request express a preference and are not opening-hours constraints.

- **Roles:** customer (own), admin.
- **Path:** id, required conversation ID (proposed maximum 100 characters). **Query:** none.
- **Body:** text alone sends a text message; adding request sends a booking request. Do not send response-only type, author, packageName or extraNames.

| Field | Type | Required | Limits |
|---|---|---|---|
| `text` | string | yes | 1–1000 characters; non-blank |
| `request` | object | no | If present, all five fields below are required |
| `request.shootType` | string | if request | 1–120 characters proposed |
| `request.packageId` | string | if request | Existing package ID; maximum 100 characters proposed |
| `request.preferredDate` | string | if request | Real date YYYY-MM-DD, including past dates |
| `request.preferredTime` | string | if request | HH:mm, 24-hour |
| `request.extraIds` | string[] | if request | 0–20 distinct existing IDs proposed; [] for none |

- **201 Created:** `{message: Message, conversation: ConversationSummary}`; lastMessage and updatedAt reflect this message. An admin reply to unanswered changes it to consulting.
- **Errors:** inherited 401/403/500; 404 NOT_FOUND for absent/hidden conversation; 400 VALIDATION with text or request.* paths for invalid values, unknown package/extra IDs. No 409 is specified for sending a message.

### Examples

Linh sends the canonical request.

```http
POST /api/conversations/c-linh/messages
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{
  "text": "Mình muốn đặt lịch chụp tốt nghiệp",
  "request": {
    "shootType": "Tốt nghiệp cá nhân",
    "packageId": "pkg-tn-premium",
    "preferredDate": "2026-10-24",
    "preferredTime": "09:00",
    "extraIds": [
      "ex-makeup"
    ]
  }
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": {
    "id": "m-3",
    "from": "customer",
    "author": {
      "id": "u-linh",
      "name": "Linh"
    },
    "type": "request",
    "text": "Mình muốn đặt lịch chụp tốt nghiệp",
    "request": {
      "shootType": "Tốt nghiệp cá nhân",
      "packageId": "pkg-tn-premium",
      "packageName": "Gói Tốt nghiệp Premium",
      "preferredDate": "2026-10-24",
      "preferredTime": "09:00",
      "extraIds": [
        "ex-makeup"
      ],
      "extraNames": [
        "Makeup"
      ]
    },
    "proposal": null,
    "at": "2026-10-20T17:25:00+07:00"
  },
  "conversation": {
    "id": "c-linh",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "topic": "Gói Tốt nghiệp",
    "status": "consulting",
    "lastMessage": {
      "text": "Mình muốn đặt lịch chụp tốt nghiệp",
      "at": "2026-10-20T17:25:00+07:00"
    },
    "bookingCode": null,
    "updatedAt": "2026-10-20T17:25:00+07:00"
  }
}
```

Thảo filters consulting conversations after Linh sends the request.

```http
GET /api/conversations?status=consulting
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "conversations": [
    {
      "id": "c-linh",
      "customer": {
        "id": "u-linh",
        "name": "Linh"
      },
      "topic": "Gói Tốt nghiệp",
      "status": "consulting",
      "lastMessage": {
        "text": "Mình muốn đặt lịch chụp tốt nghiệp",
        "at": "2026-10-20T17:25:00+07:00"
      },
      "bookingCode": null,
      "updatedAt": "2026-10-20T17:25:00+07:00"
    }
  ]
}
```

```http
POST /api/conversations/c-linh/messages
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "text": "Studio sẽ kiểm tra lịch makeup của Mai và giờ chụp cho bạn."
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": {
    "id": "m-4",
    "from": "studio",
    "author": {
      "id": "u-thao",
      "name": "Thảo"
    },
    "type": "text",
    "text": "Studio sẽ kiểm tra lịch makeup của Mai và giờ chụp cho bạn.",
    "request": null,
    "proposal": null,
    "at": "2026-10-20T17:25:00+07:00"
  },
  "conversation": {
    "id": "c-linh",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "topic": "Gói Tốt nghiệp",
    "status": "consulting",
    "lastMessage": {
      "text": "Studio sẽ kiểm tra lịch makeup của Mai và giờ chụp cho bạn.",
      "at": "2026-10-20T17:25:00+07:00"
    },
    "bookingCode": null,
    "updatedAt": "2026-10-20T17:25:00+07:00"
  }
}
```

## POST /api/conversations/:id/proposals

- **Roles:** admin.
- **Path:** id, required existing conversation ID (proposed maximum 100 characters). **Query:** none.
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

| Field | Type | Required | Limits |
|---|---|---|---|
| `note` | string | no | Proposed 0–1000 characters; default empty string |

- **201 Created:** `{proposal: Proposal, message: Message}`; the proposal is pending, and a studio Message of type proposal is appended. Its text is the proposal note; request is null. This does not hold a slot.
- Proposals are for conversations without a booking. G10 changes a booking schedule directly. Sending a valid proposal marks earlier pending or accepted proposals `superseded` (Đã bị thay thế), clears acceptedProposalId and changes the conversation to consulting. Earlier declined proposals remain in history. Validate opening hours (04) and clashes before changing any existing proposal.
- **Errors:** inherited 401/403/500; 404 NOT_FOUND for missing conversation; 400 VALIDATION for date, items, items.N.kind/start/end/staffId/roomId or note; 409 CLASH with clashes and suggestions; 409 CONFLICT if the conversation is completed or has any linked booking. A failed proposal allocates neither proposal nor message ID.

### Examples

09:00 clashes. No p-* ID is consumed.

```http
POST /api/conversations/c-linh/proposals
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
  "note": "Kiểm tra giờ 09:00"
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
POST /api/conversations/c-linh/proposals
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{
  "date": "2026-10-24",
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
  ],
  "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "proposal": {
    "id": "p-1",
    "status": "pending",
    "date": "2026-10-24",
    "items": [
      {
        "kind": "makeup",
        "start": "14:00",
        "end": "15:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "15:00",
        "end": "17:00",
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
    "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
  },
  "message": {
    "id": "m-5",
    "from": "studio",
    "author": {
      "id": "u-thao",
      "name": "Thảo"
    },
    "type": "proposal",
    "text": "09:00 bị trùng vì Mai bận 08:00–12:00",
    "request": null,
    "proposal": {
      "id": "p-1",
      "status": "pending",
      "date": "2026-10-24",
      "items": [
        {
          "kind": "makeup",
          "start": "14:00",
          "end": "15:00",
          "staff": {
            "id": "u-mai",
            "name": "Mai"
          },
          "room": null
        },
        {
          "kind": "shoot",
          "start": "15:00",
          "end": "17:00",
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
      "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
    },
    "at": "2026-10-20T17:25:00+07:00"
  }
}
```

## PATCH /api/conversations/:id/proposals/:proposalId

Only the latest pending proposal in a conversation without a booking can be answered. An earlier proposal or an already linked booking returns 409 CONFLICT. Accepting sets acceptedProposalId and scheduled. Declining keeps consulting.

- **Roles:** customer (own). Admin, staff and superadmin receive 403.
- **Path:** id and proposalId, required non-empty IDs (proposed maximum 100 characters each); proposal must belong to this conversation. **Query:** none.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `decision` | string | yes | accepted or declined |

- **200 OK:** `{proposal: Proposal, conversation: ConversationSummary}`. Updates the embedded proposal in the existing message without allocating IDs. Accepting sets acceptedProposalId and scheduled. Declining keeps consulting and acceptedProposalId null. Acceptance does not hold a slot.
- **Errors:** inherited 401/403/500; 400 VALIDATION with fields.decision; 404 NOT_FOUND for missing/hidden conversation or proposal not in that conversation; 409 CONFLICT if the proposal is no longer pending.

### Examples (continue the same chain)

```http
PATCH /api/conversations/c-linh/proposals/p-1
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{
  "decision": "declined"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "proposal": {
    "id": "p-1",
    "status": "declined",
    "date": "2026-10-24",
    "items": [
      {
        "kind": "makeup",
        "start": "14:00",
        "end": "15:00",
        "staff": {
          "id": "u-mai",
          "name": "Mai"
        },
        "room": null
      },
      {
        "kind": "shoot",
        "start": "15:00",
        "end": "17:00",
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
    "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
  },
  "conversation": {
    "id": "c-linh",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "topic": "Gói Tốt nghiệp",
    "status": "consulting",
    "lastMessage": {
      "text": "09:00 bị trùng vì Mai bận 08:00–12:00",
      "at": "2026-10-20T17:25:00+07:00"
    },
    "bookingCode": null,
    "updatedAt": "2026-10-20T17:25:00+07:00"
  }
}
```

```http
POST /api/conversations/c-linh/proposals
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
  ],
  "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "proposal": {
    "id": "p-2",
    "status": "pending",
    "date": "2026-10-24",
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
    "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
  },
  "message": {
    "id": "m-6",
    "from": "studio",
    "author": {
      "id": "u-thao",
      "name": "Thảo"
    },
    "type": "proposal",
    "text": "09:00 bị trùng vì Mai bận 08:00–12:00",
    "request": null,
    "proposal": {
      "id": "p-2",
      "status": "pending",
      "date": "2026-10-24",
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
      "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
    },
    "at": "2026-10-20T17:25:00+07:00"
  }
}
```

```http
PATCH /api/conversations/c-linh/proposals/p-2
Authorization: Bearer {{token:linh}}
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
    "id": "p-2",
    "status": "accepted",
    "date": "2026-10-24",
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
    "note": "09:00 bị trùng vì Mai bận 08:00–12:00"
  },
  "conversation": {
    "id": "c-linh",
    "customer": {
      "id": "u-linh",
      "name": "Linh"
    },
    "topic": "Gói Tốt nghiệp",
    "status": "scheduled",
    "lastMessage": {
      "text": "09:00 bị trùng vì Mai bận 08:00–12:00",
      "at": "2026-10-20T17:25:00+07:00"
    },
    "bookingCode": null,
    "updatedAt": "2026-10-20T17:25:00+07:00"
  }
}
```

### Successful new conversation (after the main chain)

Hân's seeded thread already has a booking. A structured request opens a separate conversation.

```http
POST /api/conversations
Authorization: Bearer {{token:han}}
Content-Type: application/json

{"text":"Tôi muốn tư vấn một lịch chụp mới","request":{"shootType":"Tốt nghiệp cá nhân","packageId":"pkg-tn-premium","preferredDate":"2026-10-24","preferredTime":"07:00","extraIds":[]}}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"conversation":{"id":"c-1","customer":{"id":"u-han","name":"Lê Ngọc Hân"},"topic":"Tôi muốn tư vấn một lịch chụp mới","status":"unanswered","lastMessage":{"text":"Tôi muốn tư vấn một lịch chụp mới","at":"…"},"bookingCode":null,"updatedAt":"…","messages":[{"id":"m-7","from":"customer","author":{"id":"u-han","name":"Lê Ngọc Hân"},"type":"request","text":"Tôi muốn tư vấn một lịch chụp mới","request":{"shootType":"Tốt nghiệp cá nhân","packageId":"pkg-tn-premium","packageName":"Gói Tốt nghiệp Premium","preferredDate":"2026-10-24","preferredTime":"07:00","extraIds":[],"extraNames":[]},"proposal":null,"at":"…"}],"acceptedProposalId":null}}
```

## Changes

- 2026-11-28: Backfill traceability for `b4a5277`. A new booking request sent from a linked thread follows the unbooked-thread rule, and the response identifies the destination thread. A stale tab cannot respond to a superseded proposal.

- 2026-11-27: QA10. B4.6 clarifies B2.5/B3.2 for destination selection. B3.3 and B4.5 replace earlier pending/accepted proposals. B2.2 supersedes the previous same-thread replacement rule.

- 2026-11-23: R15: numeric conversation IDs and executable 201 (group implementation choice, plan 2.7); R07: new proposals after cancellation (group choice), G10 direct changes (PO, plan 2.5).

- 2026-11-20: first version: six endpoints, booking request, clash, decline p-1 and accept p-2; shared objects unchanged. Owner: TV3 Lê Công Minh Nhựt (24120211).
