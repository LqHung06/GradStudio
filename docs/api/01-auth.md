# 01 — Auth: sign in, current user, sign out (G2)

> **Owner:** TV1 Lê Quốc Hưng. This file uses the conventions, the error shape and the **User** object defined in [`README.md`](README.md).
> **Place in the example chain:** first. The **first** example below is a successful sign-in. `tools/contract-check.mjs` reuses that example to get every `{{token:<name>}}`, so it must stay first and must stay valid.

| Method | Path | Roles |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | signed-in |
| POST | `/api/auth/logout` | signed-in |

## Starting data (`mock/data/users.json`)

| id | name | role | e-mail | Can sign in |
|---|---|---|---|---|
| `u-linh` | Linh | customer | `linh@gradstudio.test` | yes, `linh-demo` |
| `u-thao` | Thảo | admin | `thao@gradstudio.test` | yes, `thao-demo` |
| `u-mai` | Mai | staff (make-up) | `mai@gradstudio.test` | yes, `mai-demo` |
| `u-tuan` | Tuấn | staff (photographer) | `tuan@gradstudio.test` | yes, `tuan-demo` |
| `u-ha` | Hà | staff (photographer) | `ha@gradstudio.test` | no |
| `u-superadmin` | Superadmin | superadmin | `superadmin@gradstudio.test` | yes, `superadmin-demo` |
| `u-khoa` | Trần Minh Khoa | customer | `khoa@gradstudio.test` | no |
| `u-bao` | Hồ Gia Bảo | customer | `bao@gradstudio.test` | no |
| `u-han` | Lê Ngọc Hân | customer | `han@gradstudio.test` | no |
| `u-anh` | Phạm Hoàng Anh | customer | `anh@gradstudio.test` | no |

- Users marked "no" exist only as people in the story (customers of the seeded bookings, the second photographer). They have no password, and signing in as them answers `401 INVALID_CREDENTIALS`.
- The accounts that can sign in are the *Demo accounts* of `FRONTEND.md`.
- Admin accounts created through `POST /api/admins` (`12-admins.md`) can sign in too.

---

## POST /api/auth/login

Signs a user in and returns a token.

- **Roles:** public.
- **Body:**

| Field | Type | Required | Limits |
|---|---|---|---|
| `email` | string | yes | A valid e-mail address, at most 120 characters. Compared without case. Spaces around it are ignored. |
| `password` | string | yes | 1 to 100 characters |

- **200 OK:** `{"token": string, "user": User}`. The front end sends the token as `Authorization: Bearer <token>` on every later request. In the mock the token is `token-<userId>`; the front end must not rely on that format.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | `email` or `password` is missing, empty, too long, or `email` is not an e-mail address | One message per invalid field |
| 401 | `INVALID_CREDENTIALS` | No account with this e-mail and password, or the account cannot sign in | `{}` |

- This endpoint keeps working when the mock runs in `MOCK_MODE=error`, so the error screens can be reached after signing in.

### Examples

Successful sign-in as the customer Linh. **This example must stay first.**

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh@gradstudio.test", "password": "linh-demo"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"token": "…", "user": {"id": "u-linh", "name": "Linh", "role": "customer"}}
```

Successful sign-in as the Admin Thảo. Every role signs in through the same endpoint; `user.role` tells the front end which home to open.

```http
POST /api/auth/login
Content-Type: application/json

{"email": "thao@gradstudio.test", "password": "thao-demo"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"token": "…", "user": {"id": "u-thao", "name": "Thảo", "role": "admin"}}
```

Wrong password:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh@gradstudio.test", "password": "sai-mat-khau"}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "INVALID_CREDENTIALS", "message": "Email hoặc mật khẩu không đúng", "fields": {}, "details": null}}
```

An account that exists but cannot sign in (a customer of a seeded booking):

```http
POST /api/auth/login
Content-Type: application/json

{"email": "khoa@gradstudio.test", "password": "khoa-demo"}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "INVALID_CREDENTIALS", "message": "Email hoặc mật khẩu không đúng", "fields": {}, "details": null}}
```

Both fields empty: every invalid field gets its own message.

```http
POST /api/auth/login
Content-Type: application/json

{"email": "", "password": ""}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"email": "Vui lòng nhập email", "password": "Vui lòng nhập mật khẩu"}, "details": null}}
```

Not an e-mail address:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh-gradstudio", "password": "linh-demo"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION", "message": "Dữ liệu chưa hợp lệ", "fields": {"email": "Email không đúng định dạng"}, "details": null}}
```

---

## GET /api/auth/me

Returns the user the token belongs to. The front end calls it when the app opens with a saved token, to know whether the session is still valid and which role it has.

- **Roles:** signed-in.
- **200 OK:** `{"user": User}`.
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No `Authorization` header, or a token that matches no user |

### Examples

```http
GET /api/auth/me
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"user": {"id": "u-linh", "name": "Linh", "role": "customer"}}
```

```http
GET /api/auth/me
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"user": {"id": "u-tuan", "name": "Tuấn", "role": "staff"}}
```

No token:

```http
GET /api/auth/me
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Vui lòng đăng nhập để tiếp tục", "fields": {}, "details": null}}
```

A token that matches no user:

```http
GET /api/auth/me
Authorization: Bearer token-u-nobody
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Vui lòng đăng nhập để tiếp tục", "fields": {}, "details": null}}
```

---

## POST /api/auth/logout

Ends the session.

- **Roles:** signed-in.
- **Body:** none.
- **204 No Content:** no body. The front end then clears the user and the token from its auth context and from storage.
- **Errors:**

| Status | `error.code` | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No token, or a token that matches no user |

- **Mock:** mock tokens (`token-<userId>`) are not stored, so signing out does not invalidate them. The same token works again after sign-out. Later examples in the chain depend on that, because `contract-check` keeps using the token it got first. In PA#4 the real server invalidates the token; the front end behaves the same either way.

### Examples

```http
POST /api/auth/logout
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 204 No Content
```

```http
POST /api/auth/logout
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Vui lòng đăng nhập để tiếp tục", "fields": {}, "details": null}}
```

## Changes

Every change to this file, once front-end code uses it, gets a line here: the date, what changed and why.

- 2026-11-19: first version. (TV1)
