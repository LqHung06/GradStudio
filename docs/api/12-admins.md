# 12 — Admin accounts (G11)

> **Owner:** TV1 Lê Quốc Hưng. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** after `11-receive`. Nothing later depends on it except `13-settings`.

| Method | Path | Roles |
|---|---|---|
| GET | `/api/admins` | superadmin |
| POST | `/api/admins` | superadmin |

## Admin object

```json
{"id": "u-thao", "name": "Thảo", "email": "thao@gradstudio.test", "active": true, "createdAt": "2026-09-01T08:00:00+07:00"}
```

| Field | Type | Meaning |
|---|---|---|
| `id` | string | The user id. New Admins get `u-admin-1`, `u-admin-2`, … in the mock. |
| `name` | string | Display name |
| `email` | string | Sign-in e-mail, stored in lower case |
| `active` | boolean | Always `true` in PA#3 (no endpoint deactivates an Admin) |
| `createdAt` | moment | When the account was created |

The password is never returned.

**Starting data:** one Admin, Thảo (`u-thao`), created `2026-09-01T08:00:00+07:00`.

---

## GET /api/admins

All Admin accounts, oldest first.

- **Roles:** superadmin.
- **200 OK:** `{"admins": [Admin…]}`.
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No token |
| 403 | `FORBIDDEN` | The caller is not the Superadmin |

### Examples

```http
GET /api/admins
Authorization: Bearer {{token:superadmin}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"admins": [{"id": "u-thao", "name": "Thảo", "email": "thao@gradstudio.test", "active": true, "createdAt": "2026-09-01T08:00:00+07:00"}]}
```

An Admin cannot manage Admin accounts:

```http
GET /api/admins
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập chức năng này", "fields": {}, "details": null}}
```

---

## POST /api/admins

Creates an Admin account. The new Admin can sign in at once through `POST /api/auth/login`.

- **Roles:** superadmin.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `name` | string | yes | 2 to 80 characters after trimming spaces |
| `email` | string | yes | A valid e-mail address, at most 120 characters, not used by any user (compared without case) |
| `password` | string | yes | 8 to 100 characters |

- **201 Created:** `{"admin": Admin}`. The front end adds it to the list from this answer, without reloading the list.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | A field is missing or breaks its limit | One message per invalid field |
| 401 | `UNAUTHENTICATED` | No token | `{}` |
| 403 | `FORBIDDEN` | The caller is not the Superadmin | `{}` |
| 409 | `EMAIL_TAKEN` | The e-mail is already used by a user | `{"email": "Email này đã được dùng"}` |

### Examples

The Superadmin creates a second Admin:

```http
POST /api/admins
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"name": "Ngô Minh Quân", "email": "quan@gradstudio.test", "password": "quan-demo-123"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"admin": {"id": "u-admin-1", "name": "Ngô Minh Quân", "email": "quan@gradstudio.test", "active": true, "createdAt": "…"}}
```

The new Admin signs in:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "quan@gradstudio.test", "password": "quan-demo-123"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"token": "…", "user": {"id": "u-admin-1", "name": "Ngô Minh Quân", "role": "admin"}}
```

The list now has two Admins:

```http
GET /api/admins
Authorization: Bearer {{token:superadmin}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"admins": [
  {"id": "u-thao", "name": "Thảo", "email": "thao@gradstudio.test", "active": true, "createdAt": "2026-09-01T08:00:00+07:00"},
  {"id": "u-admin-1", "name": "Ngô Minh Quân", "email": "quan@gradstudio.test", "active": true, "createdAt": "…"}
]}
```

An e-mail already in use (written in another case):

```http
POST /api/admins
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"name": "Thảo Nguyễn", "email": "Thao@GradStudio.test", "password": "thao-moi-123"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "EMAIL_TAKEN", "message": "Email này đã được dùng", "fields": {"email": "Email này đã được dùng"}, "details": null}}
```

Every field breaks its limit:

```http
POST /api/admins
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"name": "Q", "email": "quan-gradstudio", "password": "123"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"name": "Tên từ 2 đến 80 ký tự", "email": "Email không đúng định dạng", "password": "Mật khẩu ít nhất 8 ký tự"}, "details": null}}
```

An Admin cannot create Admins:

```http
POST /api/admins
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"name": "Ngô Minh Quân", "email": "quan2@gradstudio.test", "password": "quan-demo-123"}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền truy cập chức năng này", "fields": {}, "details": null}}
```

## Changes

Every change to this file, once front-end code uses it, gets a line here: the date, what changed and why.

- 2026-11-19: first version. (TV1)
