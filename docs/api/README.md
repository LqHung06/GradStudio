# GradStudio API — contract (PA#3)

This folder is the contract between the React front end (`client/`) and the API. It is written **before** any code that uses it:

- In PA#3, `mock/server.mjs` answers it exactly as written.
- In PA#4, the Express server replaces the mock on the same port. The front end does not change.

`tools/contract-check.mjs` reads this folder in a fixed order: this `README.md` first, then the other files alphabetically (`01-…` to `13-…`). Each file is read top to bottom, and every example is sent to **one freshly started mock**. An example may therefore rely on what an earlier example created. The order of examples follows the main flow G1–G11 (see [Example chain](#example-chain)).

This README holds no `http` examples. Code blocks here are `json` or `text` and are not sent.

## Files

| File | Resource | Owner | Steps |
|---|---|---|---|
| `README.md` | Conventions, error shape, shared objects, endpoint table | TV1 Lê Quốc Hưng | all |
| `01-auth.md` | Sign-in, current user, sign-out | TV1 Lê Quốc Hưng | G2 |
| `02-catalog.md` | Services, packages, extras, portfolio, reviews | TV2 Đặng Hoàng Tuấn Kiệt | G1, G3 |
| `03-conversations.md` | Conversations, messages, time proposals | TV3 Lê Công Minh Nhựt | G3, G4, G5, G6 |
| `04-availability.md` | Resources, day schedule, clash check | TV3 Lê Công Minh Nhựt | G5, G10 |
| `05-bookings.md` | Create, list and read bookings | TV3 Lê Công Minh Nhựt | G6, G7, G10 |
| `06-payments.md` | Payments and the test gateway | TV2 Đặng Hoàng Tuấn Kiệt | G7, G9 |
| `07-reminders.md` | Reminders in the customer's account | TV2 Đặng Hoàng Tuấn Kiệt | G7 |
| `08-jobs.md` | Staff jobs and preview uploads | TV1 Lê Quốc Hưng | G8 |
| `09-gallery.md` | Booking photos and the customer's selection | TV2 Đặng Hoàng Tuấn Kiệt | G9 |
| `10-admin-bookings.md` | Change, cancel, final file link | TV3 Lê Công Minh Nhựt | G10 |
| `11-receive.md` | Customer receives the photos | TV2 Đặng Hoàng Tuấn Kiệt | G9 |
| `12-admins.md` | Admin accounts | TV1 Lê Quốc Hưng | G11 |
| `13-settings.md` | System settings | TV1 Lê Quốc Hưng | G11 |

Every resource file describes, for each endpoint:
- who may call it;
- the path and query parameters;
- the body, with each field's type, whether it is required, and its limits;
- the success answer;
- every error answer that can happen (`400` with a message per field, `401`, `403`, `404`, `409`).

Every endpoint has at least one example: a `http` request block followed by a `http` answer block. Each file ends with a `## Changes` section.

## Base path and format

- **Base path:** `/api`. Every path in this contract starts with `/api/`.
- **Bodies:** request and answer bodies are JSON in UTF-8, sent with `Content-Type: application/json`. The only exception is the preview upload (`08-jobs.md`), which is `multipart/form-data`.
- **Relative paths only:** the front end calls `/api/...` and never `http://localhost:3001/...`. The Vite dev server and `vite preview` forward `/api` to `http://localhost:3001`.
- **Mock settings:** port `3001` (`PORT`). `MOCK_MODE` selects how it answers; see [Mock behaviour](#mock-behaviour).

## Authentication

- `POST /api/auth/login` returns a `token`. Every endpoint that is not `public` must be called with:

  ```text
  Authorization: Bearer <token>
  ```

- **Token format in the mock:** `token-<userId>`, for example `token-u-linh`. It stays valid after the mock restarts. The front end must treat the token as an opaque string, because PA#4 replaces it with real tokens.
- **Roles:** `customer`, `admin`, `staff`, `superadmin`. Every user has exactly one role.
- **Reading the *Roles* column** of the endpoint table:

| Written | Meaning |
|---|---|
| `public` | Needs no token. |
| `signed-in` | Any role, with a valid token. |
| `customer (own)` | A customer, and only for their own conversations, bookings and payments. |
| `staff (assigned)` | A staff member, and only for jobs and bookings they are assigned to. |
| `admin`, `superadmin` | That role only. |

- **Error answers for access:**

| Situation | Answer |
|---|---|
| Missing, unknown, or locked-account token on a protected endpoint | **401** `UNAUTHENTICATED` |
| Locked account signing in via `POST /api/auth/login` | **403** `FORBIDDEN` (`"Tài khoản đã bị khóa"`) |
| Valid token, but the role is not allowed | **403** `FORBIDDEN` |
| A customer or staff member asks for an item that exists but is not theirs | **404** `NOT_FOUND` (the item is not revealed) |

- **Demo accounts** (e-mail, password, the *name in examples* used in `{{token:<name>}}`) are listed in `FRONTEND.md`, section *Demo accounts*:

| Name in examples | Role | User id |
|---|---|---|
| `linh` | customer | `u-linh` |
| `han` | customer | `u-han` |
| `thao` | admin | `u-thao` |
| `mai` | staff | `u-mai` |
| `tuan` | staff | `u-tuan` |
| `superadmin` | superadmin | `u-superadmin` |

## Error shape

Every error answer of every endpoint has this one shape:

```json
{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"email": "Email không đúng định dạng"}, "details": null}}
```

| Field | Type | Always present | Meaning |
|---|---|---|---|
| `error.code` | string | yes | One of the codes below. The front end decides what to do from this field. |
| `error.message` | string | yes | Vietnamese text that can be shown to the user as it is. |
| `error.fields` | object | yes | One Vietnamese message per invalid field. It is `{}` when the error is not about fields. Keys are field paths as written in the request body, using dots and indexes: `email`, `request.preferredDate`, `items.1.roomId`. |
| `error.details` | object or `null` | yes | `null`, except for `CLASH`, where it is `{"clashes": [Clash…], "suggestions": [Suggestion…]}` (see [Shared objects](#shared-objects)). |

| HTTP | `error.code` | When |
|---|---|---|
| 400 | `VALIDATION` | A field is missing, has the wrong type, breaks a limit, or the body is not valid JSON. `fields` names every invalid field. |
| 401 | `UNAUTHENTICATED` | Missing, unknown, or locked-account token on a protected endpoint. |
| 401 | `INVALID_CREDENTIALS` | `POST /api/auth/login` with a wrong e-mail or password. |
| 403 | `FORBIDDEN` | The caller's role may not call this endpoint, or the account is locked on sign-in. |
| 404 | `NOT_FOUND` | The path matches nothing, or the item does not exist or is not the caller's. |
| 409 | `CONFLICT` | The request is valid, but the item's current state does not allow it (for example, creating a booking before the customer agreed). `message` says why. |
| 409 | `CLASH` | A staff member or room is busy at the requested time. `details` holds the clashes and free suggestions. |
| 409 | `EMAIL_TAKEN` | `POST /api/admins` with an e-mail already in use. `fields.email` is set. |
| 500 | `SERVER_ERROR` | Unexpected failure. The mock in `error` mode answers this for every request except sign-in. |

The `500` answer of the mock in `error` mode:

```json
{"error": {"code": "SERVER_ERROR", "message": "Máy chủ đang gặp sự cố, vui lòng thử lại.", "fields": {}, "details": null}}
```

## HTTP status codes used

| Status | Used for |
|---|---|
| `200 OK` | A successful read or change that returns the item. |
| `201 Created` | A new item was created (message, proposal, booking, payment, photo, admin). The answer holds the new item. |
| `204 No Content` | Success with no body. Used only by `POST /api/auth/logout`. |
| `400`, `401`, `403`, `404`, `409`, `500` | Errors, always in the [error shape](#error-shape). |

## Data conventions

| Kind | Format | Example |
|---|---|---|
| Money | Integer number of VND. The front end shows it as `1.800.000đ`. | `1800000` |
| Date | `YYYY-MM-DD` | `"2026-10-24"` |
| Time of day | `HH:mm`, 24-hour | `"13:00"` |
| Moment | ISO 8601 with offset `+07:00` | `"2026-10-23T13:00:00+07:00"` |
| IDs | Strings | `"u-linh"`, `"c-linh"`, `"p-2"`, `"PAY-1"`, `"J-GS-1024-shoot"`, `"ph-01"` |
| Booking codes | `GS-` and a number. New codes are the highest existing number + 1, so the first new booking is `GS-1024`. | `"GS-1024"` |
| Lists | Always wrapped in an object with a named key | `{"bookings": [ … ]}` |

- **Stable shape.** Every item of one kind always has all its fields. A field with no value is `null` (or `[]` for a list); it is never left out. This lets `contract-check` compare field names.
- **Status values** are codes (next section). The front end turns them into labels only in `client/src/constants/status.js`.
- **No "date must be in the future" rule.** The story date, 24/10/2026, is already in the past.
- **Writing an answer block:** copy the mock's real answer (`curl -i`). Replace values that change between runs (the token, `…At` moments) with `…`. A request body never contains `…`. See `tools/contract-check-README.md` for every form of `…`.

## Status codes (business)

| Kind | Field | Code → label shown on screen |
|---|---|---|
| Conversation | `status` | `unanswered` → Chưa trả lời · `consulting` → Đang tư vấn · `scheduled` → Đã chốt lịch · `done` → Hoàn thành |
| Booking | `status` | `awaiting_deposit` → Chờ cọc 30% (G7 may show *Đã thống nhất lịch · Chờ cọc 30%*) · `booked` → Đã đặt lịch · `completed` → Hoàn thành · `cancelled` → Đã hủy |
| Booking | `paymentStatus` | `unpaid` → Chưa cọc · `deposit_paid` → Đã cọc 30% · `paid_in_full` → Đã thanh toán đủ |
| Payment | `status` | `pending` → Đang chờ thanh toán · `succeeded` → Thành công · `failed` → Thất bại |
| Payment | `kind` | `deposit` → Cọc 30% · `remaining` → 70% còn lại |
| Proposal | `status` | `pending` → Chờ khách trả lời · `accepted` → Khách đã đồng ý · `declined` → Khách đã từ chối |
| Job | `status` | `todo` → Chưa bắt đầu · `in_progress` → Đang làm · `done` → Hoàn thành |
| Job, schedule item | `kind` | `makeup` → Makeup · `shoot` → Chụp ảnh · `edit` → Chỉnh ảnh (`edit` is used by jobs only) |
| Reminder | `emailStatus` | `queued` → Chờ gửi · `sent` → Đã gửi · `failed` → Gửi lỗi |
| Message | `from` | `customer` → the customer · `studio` → the studio (an Admin) |
| Message | `type` | `text` · `request` (a booking request) · `proposal` (a proposed time) |
| User | `role` | `customer` · `admin` · `staff` · `superadmin` |

A booking holds its slot **only** from `booked` on, that is, after the 30% deposit succeeds and the resources are re-checked. A booking in `awaiting_deposit` does not block anyone's time.

## Shared objects

Several files use these objects, and their shape is defined here once. A file that returns one of them shows it in full in its examples. A change to a shared object is a change to this README and gets a line in [Changes](#changes).

### User

What `POST /api/auth/login` and `GET /api/auth/me` return:

```json
{"id": "u-linh", "name": "Linh", "role": "customer"}
```

### Reference objects

Short references used inside other objects:

```json
{"id": "u-mai", "name": "Mai"}
{"id": "r-b", "name": "Phòng B"}
```

| Name | Shape | Points to |
|---|---|---|
| PersonRef | `{"id", "name"}` | A user: customer, staff or admin |
| RoomRef | `{"id", "name"}` | A room |

### ScheduleItemInput

What a request sends for one part of a shoot day. Used by `POST /api/conversations/:id/proposals` and `POST /api/availability/check`:

```json
{"kind": "shoot", "start": "14:00", "end": "16:00", "staffId": "u-tuan", "roomId": "r-b"}
```

| Field | Type | Required | Limits |
|---|---|---|---|
| `kind` | string | yes | `makeup` or `shoot` |
| `start` | string | yes | `HH:mm` |
| `end` | string | yes | `HH:mm`, later than `start` |
| `staffId` | string | yes | An existing staff user |
| `roomId` | string or `null` | yes | An existing room for `shoot`; may be `null` for `makeup` |

A request holds 1 to 4 items, all on the same `date`.

### ScheduleItem

What an answer shows for one part of a shoot day:

```json
{"kind": "makeup", "start": "13:00", "end": "14:00", "staff": {"id": "u-mai", "name": "Mai"}, "room": null}
```

### Clash and Suggestion

Used in the answer of `POST /api/availability/check`, and in `error.details` of every `409 CLASH`:

```json
{"itemIndex": 0, "resource": {"id": "u-mai", "name": "Mai", "type": "staff"},
 "busyFrom": "08:00", "busyTo": "12:00", "reason": "Mai bận 08:00–12:00 nên makeup 09:00–10:00 bị trùng"}
```

```json
{"date": "2026-10-24", "label": "Makeup 13:00–14:00 với Mai · Chụp 14:00–16:00 với Tuấn · Phòng B",
 "items": [{"kind": "makeup", "start": "13:00", "end": "14:00", "staffId": "u-mai", "roomId": null},
           {"kind": "shoot", "start": "14:00", "end": "16:00", "staffId": "u-tuan", "roomId": "r-b"}]}
```

| Object | Field | Meaning |
|---|---|---|
| Clash | `itemIndex` | Index of the clashing item in the request's `items` |
| Clash | `resource.type` | `staff` or `room` |
| Clash | `reason` | Vietnamese sentence shown to the user as it is. The clash is explained in words, never by colour alone. |
| Suggestion | `items` | `ScheduleItemInput` objects, so the front end can send them back as they are |
| Suggestion | `label` | Vietnamese sentence describing the free time |

### Booking

Owned by `05-bookings.md`. Every endpoint that returns a booking returns this whole object:

```json
{
  "code": "GS-1024",
  "customer": {"id": "u-linh", "name": "Linh"},
  "conversationId": "c-linh",
  "serviceName": "Tốt nghiệp",
  "shootType": "Tốt nghiệp cá nhân",
  "package": {"id": "pkg-tn-premium", "name": "Gói Tốt nghiệp Premium", "durationHours": 2, "editedPhotos": 30},
  "extras": [{"id": "ex-makeup", "name": "Makeup"}],
  "date": "2026-10-24",
  "requestedTime": {"start": "09:00", "note": "Mai bận 08:00–12:00"},
  "items": [
    {"kind": "makeup", "start": "13:00", "end": "14:00", "staff": {"id": "u-mai", "name": "Mai"}, "room": null},
    {"kind": "shoot", "start": "14:00", "end": "16:00", "staff": {"id": "u-tuan", "name": "Tuấn"}, "room": {"id": "r-b", "name": "Phòng B"}}
  ],
  "price": 1800000,
  "deposit": 540000,
  "remaining": 1260000,
  "status": "awaiting_deposit",
  "paymentStatus": "unpaid",
  "selection": {"limit": 30, "selectedCount": 0},
  "finalLink": null,
  "createdAt": "2026-10-20T17:40:00+07:00"
}
```

| Field | Meaning |
|---|---|
| `requestedTime` | The time the customer first asked for, with the reason it was not possible. `null` if the first time was kept. G7 shows it struck out. |
| `items` | `ScheduleItem` objects, in time order |
| `deposit` | 30% of `price`, rounded to the nearest integer VND (`Math.round(price * 0.3)`). Extras have no separate price (PO #6). |
| `remaining` | `price − deposit` |
| `selection.limit` | Number of edited photos in the package |
| `selection.selectedCount` | Number of photos the customer has saved in their selection |
| `finalLink` | `https://` link to the final files, set by the Admin; `null` until then |

### Message and Proposal

Owned by `03-conversations.md`.

Message:

```json
{"id": "m-3", "from": "customer", "author": {"id": "u-linh", "name": "Linh"}, "type": "request",
 "text": "Mình muốn đặt lịch chụp tốt nghiệp",
 "request": {"shootType": "Tốt nghiệp cá nhân", "packageId": "pkg-tn-premium", "packageName": "Gói Tốt nghiệp Premium",
             "preferredDate": "2026-10-24", "preferredTime": "09:00", "extraIds": ["ex-makeup"], "extraNames": ["Makeup"]},
 "proposal": null, "at": "2026-10-20T17:25:00+07:00"}
```

- `request` is `null` unless `type` is `request`.
- `proposal` is `null` unless `type` is `proposal`, in which case it holds a Proposal.

Proposal:

```json
{"id": "p-2", "status": "pending", "date": "2026-10-24",
 "items": [{"kind": "makeup", "start": "13:00", "end": "14:00", "staff": {"id": "u-mai", "name": "Mai"}, "room": null},
           {"kind": "shoot", "start": "14:00", "end": "16:00", "staff": {"id": "u-tuan", "name": "Tuấn"}, "room": {"id": "r-b", "name": "Phòng B"}}],
 "note": "09:00 bị trùng vì Mai bận 08:00–12:00"}
```

### Job

Owned by `08-jobs.md`. When a deposit succeeds, the mock creates the jobs of that booking (`06-payments.md`):

```json
{"id": "J-GS-1024-shoot", "bookingCode": "GS-1024", "kind": "shoot", "date": "2026-10-24", "start": "14:00", "end": "16:00",
 "room": {"id": "r-b", "name": "Phòng B"}, "staff": {"id": "u-tuan", "name": "Tuấn"},
 "customer": {"id": "u-linh", "name": "Linh"}, "packageName": "Gói Tốt nghiệp Premium",
 "status": "todo", "note": "", "previewCount": 0}
```

- `kind` is `makeup`, `shoot` or `edit`.
- An `edit` job has `date`, `start`, `end` and `room` set to `null`.
- `id` is always `J-<booking code>-<kind>`.

### Photo

Created by `POST /api/bookings/:code/previews` (`08-jobs.md`), listed by `GET /api/bookings/:code/photos` (`09-gallery.md`):

```json
{"id": "ph-01", "bookingCode": "GS-1024", "url": "/samples/preview-01.svg", "alt": "Ảnh xem trước số 1 (minh họa)",
 "uploadedBy": {"id": "u-tuan", "name": "Tuấn"}, "uploadedAt": "2026-10-24T17:00:00+07:00"}
```

`url` is a path served by the front end (`client/public/`), not by the API. Images are illustrations; there are no photos of real people.

## Endpoints

Every request the app makes is in this table, and every row has at least one example in its file. A path parameter is written `:name`.

| Method | Path | Roles | File | Steps |
|---|---|---|---|---|
| POST | `/api/auth/login` | public | `01-auth.md` | G2 |
| GET | `/api/auth/me` | signed-in | `01-auth.md` | G2 |
| POST | `/api/auth/logout` | signed-in | `01-auth.md` | G2 |
| GET | `/api/services` | public | `02-catalog.md` | G1, G3 |
| GET | `/api/packages` | public | `02-catalog.md` | G1, G3, G6 |
| GET | `/api/packages/:id` | public | `02-catalog.md` | G1 |
| GET | `/api/extras` | public | `02-catalog.md` | G1, G3, G6 |
| GET | `/api/portfolio` | public | `02-catalog.md` | G1 |
| GET | `/api/reviews` | public | `02-catalog.md` | G1 |
| GET | `/api/conversations` | customer (own), admin | `03-conversations.md` | G3, G4 |
| POST | `/api/conversations` | customer | `03-conversations.md` | G3 |
| GET | `/api/conversations/:id` | customer (own), admin | `03-conversations.md` | G3, G4 |
| POST | `/api/conversations/:id/messages` | customer (own), admin | `03-conversations.md` | G3, G4 |
| POST | `/api/conversations/:id/proposals` | admin | `03-conversations.md` | G5 |
| PATCH | `/api/conversations/:id/proposals/:proposalId` | customer (own) | `03-conversations.md` | G6 |
| GET | `/api/resources` | admin | `04-availability.md` | G5, G10 |
| GET | `/api/schedule` | admin | `04-availability.md` | G5, G10 |
| POST | `/api/availability/check` | admin | `04-availability.md` | G5, G10 |
| POST | `/api/bookings` | admin | `05-bookings.md` | G6 |
| GET | `/api/bookings` | customer (own), admin | `05-bookings.md` | G7, G10 |
| GET | `/api/bookings/:code` | customer (own), admin, staff (assigned) | `05-bookings.md` | G7, G9, G10 |
| POST | `/api/bookings/:code/payments` | customer (own) | `06-payments.md` | G7, G9 |
| GET | `/api/payments/:id` | customer (own), admin | `06-payments.md` | G7, G9 |
| POST | `/api/test-gateway/:paymentId` | customer (own) | `06-payments.md` | G7, G9 |
| GET | `/api/reminders` | customer | `07-reminders.md` | G7 |
| GET | `/api/jobs` | staff | `08-jobs.md` | G8 |
| GET | `/api/jobs/:id` | staff (assigned) | `08-jobs.md` | G8 |
| PATCH | `/api/jobs/:id` | staff (assigned) | `08-jobs.md` | G8 |
| POST | `/api/bookings/:code/previews` | staff (assigned) | `08-jobs.md` | G8 |
| GET | `/api/bookings/:code/photos` | customer (own), admin, staff (assigned) | `09-gallery.md` | G8, G9 |
| PUT | `/api/bookings/:code/selection` | customer (own) | `09-gallery.md` | G9 |
| PATCH | `/api/bookings/:code` | admin | `10-admin-bookings.md` | G10 |
| POST | `/api/bookings/:code/cancel` | admin | `10-admin-bookings.md` | G10 |
| PUT | `/api/bookings/:code/final-link` | admin | `10-admin-bookings.md` | G10 |
| POST | `/api/bookings/:code/receive` | customer (own) | `11-receive.md` | G9 |
| GET | `/api/admins` | superadmin | `12-admins.md` | G11 |
| POST | `/api/admins` | superadmin | `12-admins.md` | G11 |
| PATCH | `/api/admins/:id` | superadmin | `12-admins.md` | G11 |
| GET | `/api/settings` | superadmin | `13-settings.md` | G11 |
| PUT | `/api/settings` | superadmin | `13-settings.md` | G11 |

`POST /api/test-gateway/:paymentId` exists **only in PA#3**: it stands in for the payment gateway. In PA#4 the real gateway (sandbox) replaces it. The front end keeps the same redirect and result handling: it follows `redirectUrl`, and reads the result from `GET /api/payments/:id`.

## Example chain

The examples of all files run in this order on one freshly started mock. Every file writes its examples so that they work at its place in the chain:

1. **`01-auth`:** sign in (a successful sign-in is the **first** `POST …/login` example, because `contract-check` uses it to get tokens).
2. **`02-catalog`:** read the catalogue (no state change).
3. **`03-conversations`:**
   1. Linh sends a booking request in `c-linh`; Thảo replies.
   2. Thảo proposes 09:00 and gets **409 `CLASH`**.
   3. Thảo proposes `p-1` (make-up 14:00–15:00, shoot 15:00–17:00); Linh **declines** it.
   4. Thảo proposes `p-2` (make-up 13:00–14:00, shoot 14:00–16:00); Linh **accepts** it. `c-linh` becomes `scheduled`.
4. **`04-availability`:**
   - Check 09:00: `available: false`, with the reason and suggestions.
   - Check 13:00/14:00: `available: true`.
5. **`05-bookings`:**
   - Create from `p-1`: **409 `CONFLICT`**.
   - Create from `p-2`: **201**, booking **`GS-1024`**, `awaiting_deposit`.
6. **`06-payments`:**
   - `PAY-1` deposit, gateway `failed`: GS-1024 stays `awaiting_deposit`.
   - `PAY-2` deposit, gateway `success`: GS-1024 becomes `booked`. The jobs `J-GS-1024-makeup`, `-shoot`, `-edit` and reminder `rm-1` are created.
7. **`07-reminders`:** Linh reads `rm-1`.
8. **`08-jobs`:**
   - Tuấn lists his jobs and updates `J-GS-1024-shoot` to `done`.
   - Tuấn uploads previews to GS-1024: an exact 5 MiB (`5 242 880` bytes) PNG (201), a 5 MiB + 1 byte (`5 242 881` bytes) PNG (400), and a PDF (400).
9. **`09-gallery`:**
   - Linh reads the photos of GS-1024.
   - Selecting 31 photos gives **400**; selecting 30 gives **200**.
   - Linh pays the remaining 70% (`PAY-3`, gateway `success`): `paid_in_full`.
10. **`10-admin-bookings`:**
    - Thảo PATCHes GS-1023 with date/items for 24/10 09:00 → **409 CLASH**, no mutation.
    - Thảo PATCHes date/items for 25/10 09:00 → **200**, no customer re-acceptance (G10, PO).
    - Thảo cancels GS-1023 and sets the final link of GS-1024.
    - Supplemental examples: repeat cancel → 409; propose a fresh p-3 after cancellation, Hân accepts (G6), create replacement GS-1025 in c-han. This does not change GS-1024.
    - Payment.reservationFailure remains a TV2 handoff (R08).

11. **`11-receive`:** Linh receives the photos of GS-1024; the booking becomes `completed`.
12. **`12-admins`, `13-settings`:** the Superadmin lists, creates, locks/unlocks Admins (verifying locked sign-in refusal `403`, locked token refusal `401`, and unlocked sign-in `200`), then reads and saves the settings.

### Data the mock starts with

Ids from `mock/data/`, so that every route has data when opened directly:

| Kind | Starting data |
|---|---|
| Users | Can sign in: `u-linh` (Linh), `u-han` (Lê Ngọc Hân), `u-thao` (Thảo), `u-mai` (Mai, make-up), `u-tuan` (Tuấn, photographer), `u-superadmin`.<br>Cannot sign in (people of the story): `u-ha` (Hà, photographer), and the customers of the seeded bookings `u-khoa` (Trần Minh Khoa), `u-bao` (Hồ Gia Bảo), `u-anh` (Phạm Hoàng Anh). Full list in `01-auth.md`. |
| Rooms | `r-a` (Phòng A), `r-b` (Phòng B) |
| Services | `sv-ky-yeu` (Kỷ yếu lớp, from 350 000 per person), `sv-tot-nghiep` (Tốt nghiệp, from 1 800 000), `sv-chan-dung` (Chân dung/CV, from 690 000) |
| Package | `pkg-tn-premium` (Gói Tốt nghiệp Premium, 2 hours, 30 edited photos, 1 800 000) |
| Extras | `ex-makeup`, `ex-costume` |
| Conversations | `c-linh` (`consulting`, already holds Linh's 09:00 question and the studio's reply), `c-khoa` (`unanswered`), `c-han` (`scheduled`, linked to `GS-1023`), `c-bao` (`scheduled`), `c-anh` (`done`) |
| Bookings | `GS-1020` (Phạm Hoàng Anh, `completed`)<br>`GS-1021` (Hồ Gia Bảo · Lớp 12A3, `booked`, 24/10 08:00–12:00 with Mai and Hà in Phòng A; this is why Mai is busy)<br>`GS-1022` (Trần Minh Khoa, `booked`, 36 previews `ph-101` … `ph-136`, jobs for Tuấn)<br>`GS-1023` (Lê Ngọc Hân, `awaiting_deposit`, conversationId: `"c-han"`) |

## Mock behaviour

**Rules for `mock/`:**
- `mock/server.mjs` uses Node built-in modules only. It runs with `node mock/server.mjs`, with no `npm install`.
- It starts from `mock/data/*.json`, keeps every change in memory, and starts over when restarted.
- It prints one line per request: method, path, status.

| `MOCK_MODE` | Behaviour |
|---|---|
| `normal` (default) | Answers after about 150 ms. |
| `slow` | Answers after 2 s. |
| `error` | Every request except `POST /api/auth/login` gets `500 SERVER_ERROR`. |
| `empty` | Every list in every answer is `[]`, including lists inside objects. A single item (one booking, one package) still answers. |

The mock is **lenient**. It refuses only what the flow needs to show:

| Request | Answer |
|---|---|
| Missing or invalid field | `400` |
| Locked Admin signing in | `403 FORBIDDEN` (`"Tài khoản đã bị khóa"`); existing token on protected endpoints → `401 UNAUTHENTICATED` |
| A staff member or room is busy | `409 CLASH` |
| Creating a booking before the customer accepted the proposal | `409` |
| Rescheduling cancelled/completed, or cancelling again | `409` |
| Updating a job or uploading previews for a `cancelled` booking | `409 CONFLICT` |
| Uploading a preview larger than 5 MiB (`5 242 880` bytes of file content) or wrong file type | `400 VALIDATION` |
| Selecting more photos than the package allows | `400` |
| Paying the remaining 70% before the selection is saved | `409` |
| Receiving the photos before full payment or before the final link exists | `409` |

The mock does not invent other rules.

## Changes

- 2026-11-23: TV3 sync only: direct G10 date/items (PO); replacement after cancellation and one-VND deposit rounding (group choices, plan 2.7). File 03 appends a new c-1 after the canonical proposal chain.

Every change to this file, once front-end code uses it, gets a line here: the date, what changed and why.

- 2026-11-19: first version: conventions, error shape, business status codes, shared objects, endpoint table (39 endpoints), example chain, mock behaviour. (TV1)
- 2026-11-19: starting data now lists the customers of the seeded bookings and the photo ids of GS-1022. `01-auth.md` and `08-jobs.md` refer to them, and the ids keep the GS-1024 photos `ph-01` … `ph-36` unique. (TV1)
- 2026-11-20: rescheduling now requires customer agreement in chat first (brief: "Both sides settle a time in chat"): `c-han` is `scheduled` and linked to `GS-1023`, `han` can sign in (`han-demo`) to accept proposal `p-3`, and `PATCH /api/bookings/:code` takes `{"proposalId"}` after agreement. (TV1)
- 2026-11-23: align TV1 contract with PO decisions and 23/11 plan (R01, R02, R06, R11, R16): add `PATCH /api/admins/:id` (40 endpoints), document locked-account refusal (`403` on sign-in, `401` on existing token), confirm Job status labels (`Chưa bắt đầu` / `Đang làm` / `Hoàn thành`) and Booking `cancelled` label, update deposit rounding to nearest integer VND (PO #6 / plan 2.7), and document cancelled-booking job write lock (`409`) and exact 5 MiB (`5 242 880` bytes) upload limit. (TV1)
