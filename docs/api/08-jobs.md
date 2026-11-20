# 08 — Staff jobs and preview uploads (G8)

> **Owner:** TV1 Lê Quốc Hưng. This file uses the conventions, the error shape and the **Job** and **Photo** objects defined in [`README.md`](README.md).
> **Place in the example chain:** after `07-reminders`. By then, `06-payments` has made GS-1024 `booked`, and that created the jobs `J-GS-1024-makeup` (Mai), `J-GS-1024-shoot` and `J-GS-1024-edit` (Tuấn).

| Method | Path | Roles |
|---|---|---|
| GET | `/api/jobs` | staff |
| GET | `/api/jobs/:id` | staff (assigned) |
| PATCH | `/api/jobs/:id` | staff (assigned) |
| POST | `/api/bookings/:code/previews` | staff (assigned) |

## What a job is

A job is one piece of work for one staff member on one booking: `makeup`, `shoot` or `edit`. When a deposit succeeds, a booking gets one job per `ScheduleItem` (make-up, shoot), plus one `edit` job for the photographer.

- `id` is always `J-<booking code>-<kind>`.
- An `edit` job has no time or room (`date`, `start`, `end`, `room` are `null`). It is done after the customer chooses the photos.
- `previewCount` is the number of photos the booking has (see `GET /api/bookings/:code/photos`). It is the same on every job of a booking.
- A staff member sees only their own jobs.

## Starting data (`mock/data/jobs.json`)

| id | Staff | Booking | When, where | status | note | previewCount |
|---|---|---|---|---|---|---|
| `J-GS-1021-makeup` | Mai | GS-1021, Hồ Gia Bảo, Gói Kỷ yếu lớp | 2026-10-24 08:00–12:00, Phòng A | `todo` | Makeup cho 12 bạn lớp 12A3 | 0 |
| `J-GS-1021-shoot` | Hà | GS-1021 | 2026-10-24 08:00–12:00, Phòng A | `todo` | | 0 |
| `J-GS-1022-shoot` | Tuấn | GS-1022, Trần Minh Khoa, Gói Chân dung CV | 2026-10-20 09:00–10:30, Phòng B | `done` | | 36 |
| `J-GS-1022-edit` | Tuấn | GS-1022 | no time | `todo` | Chờ khách chọn ảnh | 36 |

**Ordering:** jobs are sorted by `date`, then `start`. Jobs with no date (`edit`) come last, ordered by booking code.

---

## GET /api/jobs

The signed-in staff member's jobs.

- **Roles:** staff. A staff member gets only their own jobs.
- **Query:**

| Parameter | Required | Values |
|---|---|---|
| `status` | no | `todo`, `in_progress` or `done`. Returns only jobs in that status. |

- **200 OK:** `{"jobs": [Job…]}`. The list is `[]` when the staff member has no job (or in `MOCK_MODE=empty`).
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 400 | `VALIDATION` | `status` is not one of the values. `fields.status` is set. |
| 401 | `UNAUTHENTICATED` | No token |
| 403 | `FORBIDDEN` | The caller is not staff |

### Examples

Tuấn's jobs: two shoots and two edits.

```http
GET /api/jobs
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"jobs": [
  {"id": "J-GS-1022-shoot", "bookingCode": "GS-1022", "kind": "shoot", "date": "2026-10-20", "start": "09:00", "end": "10:30",
   "room": {"id": "r-b", "name": "Phòng B"}, "staff": {"id": "u-tuan", "name": "Tuấn"},
   "customer": {"id": "u-khoa", "name": "Trần Minh Khoa"}, "packageName": "Gói Chân dung CV",
   "status": "done", "note": "", "previewCount": 36},
  {"id": "J-GS-1024-shoot", "bookingCode": "GS-1024", "kind": "shoot", "date": "2026-10-24", "start": "14:00", "end": "16:00",
   "room": {"id": "r-b", "name": "Phòng B"}, "staff": {"id": "u-tuan", "name": "Tuấn"},
   "customer": {"id": "u-linh", "name": "Linh"}, "packageName": "Gói Tốt nghiệp Premium",
   "status": "todo", "note": "", "previewCount": 0},
  {"id": "J-GS-1022-edit", "bookingCode": "GS-1022", "kind": "edit", "date": null, "start": null, "end": null,
   "room": null, "staff": {"id": "u-tuan", "name": "Tuấn"},
   "customer": {"id": "u-khoa", "name": "Trần Minh Khoa"}, "packageName": "Gói Chân dung CV",
   "status": "todo", "note": "Chờ khách chọn ảnh", "previewCount": 36},
  {"id": "J-GS-1024-edit", "bookingCode": "GS-1024", "kind": "edit", "date": null, "start": null, "end": null,
   "room": null, "staff": {"id": "u-tuan", "name": "Tuấn"},
   "customer": {"id": "u-linh", "name": "Linh"}, "packageName": "Gói Tốt nghiệp Premium",
   "status": "todo", "note": "", "previewCount": 0}
]}
```

Mai's jobs: the make-up before GS-1021 that makes her busy 08:00–12:00, and Linh's make-up.

```http
GET /api/jobs
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"jobs": [
  {"id": "J-GS-1021-makeup", "bookingCode": "GS-1021", "kind": "makeup", "date": "2026-10-24", "start": "08:00", "end": "12:00",
   "room": {"id": "r-a", "name": "Phòng A"}, "staff": {"id": "u-mai", "name": "Mai"},
   "customer": {"id": "u-bao", "name": "Hồ Gia Bảo"}, "packageName": "Gói Kỷ yếu lớp",
   "status": "todo", "note": "Makeup cho 12 bạn lớp 12A3", "previewCount": 0},
  {"id": "J-GS-1024-makeup", "bookingCode": "GS-1024", "kind": "makeup", "date": "2026-10-24", "start": "13:00", "end": "14:00",
   "room": null, "staff": {"id": "u-mai", "name": "Mai"},
   "customer": {"id": "u-linh", "name": "Linh"}, "packageName": "Gói Tốt nghiệp Premium",
   "status": "todo", "note": "", "previewCount": 0}
]}
```

Only Tuấn's finished jobs:

```http
GET /api/jobs?status=done
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"jobs": [
  {"id": "J-GS-1022-shoot", "bookingCode": "GS-1022", "kind": "shoot", "date": "2026-10-20", "start": "09:00", "end": "10:30",
   "room": {"id": "r-b", "name": "Phòng B"}, "staff": {"id": "u-tuan", "name": "Tuấn"},
   "customer": {"id": "u-khoa", "name": "Trần Minh Khoa"}, "packageName": "Gói Chân dung CV",
   "status": "done", "note": "", "previewCount": 36}
]}
```

An unknown status:

```http
GET /api/jobs?status=finished
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"status": "Trạng thái không hợp lệ"}, "details": null}}
```

A customer cannot read jobs:

```http
GET /api/jobs
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập chức năng này", "fields": {}, "details": null}}
```

---

## GET /api/jobs/:id

One job of the signed-in staff member.

- **Roles:** staff (assigned): only the staff member the job belongs to.
- **Path:** `id`, a job id such as `J-GS-1024-shoot`.
- **200 OK:** `{"job": Job}`.
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No token |
| 403 | `FORBIDDEN` | The caller is not staff |
| 404 | `NOT_FOUND` | No such job, or it belongs to another staff member |

### Examples

```http
GET /api/jobs/J-GS-1024-shoot
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"job": {"id": "J-GS-1024-shoot", "bookingCode": "GS-1024", "kind": "shoot", "date": "2026-10-24", "start": "14:00", "end": "16:00",
  "room": {"id": "r-b", "name": "Phòng B"}, "staff": {"id": "u-tuan", "name": "Tuấn"},
  "customer": {"id": "u-linh", "name": "Linh"}, "packageName": "Gói Tốt nghiệp Premium",
  "status": "todo", "note": "", "previewCount": 0}}
```

Mai's job, asked for by Tuấn:

```http
GET /api/jobs/J-GS-1021-makeup
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy việc này", "fields": {}, "details": null}}
```

---

## PATCH /api/jobs/:id

Updates the status of one's own job, and optionally its note.

- **Roles:** staff (assigned).
- **Path:** `id`, a job id.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `status` | string | yes | `todo`, `in_progress` or `done` |
| `note` | string | no | At most 500 characters. Left out: the note does not change. `""` clears it. |

- **200 OK:** `{"job": Job}`, the job after the change. The front end shows this answer without reloading the list.
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 400 | `VALIDATION` | `status` is missing or unknown, or `note` is too long. `fields` names the field. |
| 401 | `UNAUTHENTICATED` | No token |
| 403 | `FORBIDDEN` | The caller is not staff |
| 404 | `NOT_FOUND` | No such job, or it belongs to another staff member |

Any status may follow any other; the mock checks only the values.

### Examples

Tuấn marks Linh's shoot as done:

```http
PATCH /api/jobs/J-GS-1024-shoot
Authorization: Bearer {{token:tuan}}
Content-Type: application/json

{"status": "done", "note": "Đã chụp xong, đang đăng ảnh xem trước"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"job": {"id": "J-GS-1024-shoot", "bookingCode": "GS-1024", "kind": "shoot", "date": "2026-10-24", "start": "14:00", "end": "16:00",
  "room": {"id": "r-b", "name": "Phòng B"}, "staff": {"id": "u-tuan", "name": "Tuấn"},
  "customer": {"id": "u-linh", "name": "Linh"}, "packageName": "Gói Tốt nghiệp Premium",
  "status": "done", "note": "Đã chụp xong, đang đăng ảnh xem trước", "previewCount": 0}}
```

An unknown status:

```http
PATCH /api/jobs/J-GS-1024-shoot
Authorization: Bearer {{token:tuan}}
Content-Type: application/json

{"status": "finished"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"status": "Trạng thái không hợp lệ"}, "details": null}}
```

Mai cannot change Tuấn's job:

```http
PATCH /api/jobs/J-GS-1024-shoot
Authorization: Bearer {{token:mai}}
Content-Type: application/json

{"status": "in_progress"}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy việc này", "fields": {}, "details": null}}
```

---

## POST /api/bookings/:code/previews

Adds one low-resolution preview photo to a booking's gallery.

- **Roles:** staff (assigned): the photographer of the booking, that is, a staff member with a `shoot` or `edit` job on it. The make-up artist cannot upload.
- **Path:** `code`, a booking code such as `GS-1024`.
- **Body:** `multipart/form-data` with one field:

| Field | Type | Required | Limits |
|---|---|---|---|
| `file` | file | yes | JPEG or PNG (`image/jpeg`, `image/png`), at most **5 MB**. One file per request. |

  The front end checks the type and the size **before** sending, with these same limits, and shows the message next to the file input. To add several photos it sends one request per photo.
- **201 Created:** `{"photo": Photo, "totalPhotos": number}`. `totalPhotos` is the number of photos the booking has after this upload. Every job of the booking now shows that number as `previewCount`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | No `file` field | `{"file": "Vui lòng chọn ảnh"}` |
| 400 | `VALIDATION` | Wrong type | `{"file": "Chỉ nhận ảnh JPEG hoặc PNG"}` |
| 400 | `VALIDATION` | Larger than 5 MB | `{"file": "Ảnh tối đa 5 MB"}` |
| 401 | `UNAUTHENTICATED` | No token | |
| 403 | `FORBIDDEN` | The caller is not staff, or is staff on this booking without a `shoot` or `edit` job | |
| 404 | `NOT_FOUND` | No such booking, or the caller has no job on it | |

### Examples

Tuấn uploads the first preview of GS-1024. In the mock, the first upload to a booking with no photos also adds the rest of the shoot (see [Mock behaviour](#mock-behaviour)), so the booking has 36 photos afterwards.

```sh
curl -i http://localhost:3001/api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:preview-01.png:300KB}};type=image/png"
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"photo": {"id": "ph-01", "bookingCode": "GS-1024", "url": "/samples/preview-01.svg", "alt": "Ảnh xem trước số 1 (minh họa)",
  "uploadedBy": {"id": "u-tuan", "name": "Tuấn"}, "uploadedAt": "…"},
 "totalPhotos": 36}
```

A file larger than 5 MB:

```sh
curl -i http://localhost:3001/api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:big.png:6MB}};type=image/png"
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"file": "Ảnh tối đa 5 MB"}, "details": null}}
```

A PDF instead of a photo:

```sh
curl -i http://localhost:3001/api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:cv.pdf:200KB}};type=application/pdf"
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"file": "Chỉ nhận ảnh JPEG hoặc PNG"}, "details": null}}
```

The make-up artist of the same booking:

```sh
curl -i http://localhost:3001/api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:mai}}" \
  -F "file=@{{file:preview-02.png:300KB}};type=image/png"
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Chỉ thợ chụp hoặc chỉnh ảnh của booking này được đăng ảnh xem trước", "fields": {}, "details": null}}
```

A booking Tuấn has no job on:

```sh
curl -i http://localhost:3001/api/bookings/GS-1021/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:preview-03.png:300KB}};type=image/png"
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking này", "fields": {}, "details": null}}
```

## Mock behaviour

**The mock does not store uploaded files.** For each accepted upload, it adds one Photo whose `url` is an illustration: `/samples/preview-NN.svg`, where `NN` is the photo's number in the booking, written with two digits.

**The first upload to a booking with no photos adds the rest of the shoot.** The uploaded file becomes `ph-01`, and the mock adds `ph-02` … `ph-36` "from the shoot", 36 photos in total. This lets G9 try the 30-photo limit. Later uploads add one photo each: `ph-37`, and so on.

**Photo ids are unique in the whole mock.** The seeded photos of GS-1022 are `ph-101` … `ph-136`, so the GS-1024 ids `ph-01` … `ph-36` that `09-gallery.md` uses do not collide.

**Size check.** The mock checks the size with the request's `Content-Length`: more than 5 MB plus 64 KB (room for the multipart headers) is "too large".

**Type check.** The mock reads the `Content-Type:` line in the headers of the `file` part (the body is read as `latin1`). Anything other than `image/jpeg` or `image/png` is the wrong type.

**Order of checks.** A refused upload adds no photo. The checks run in this order:
1. token (401);
2. role (403 if not staff);
3. booking and job (404, or 403 for the make-up artist);
4. `file` present;
5. type;
6. size.

## Changes

Every change to this file, once front-end code uses it, gets a line here: the date, what changed and why.

- 2026-11-19: first version. (TV1)
