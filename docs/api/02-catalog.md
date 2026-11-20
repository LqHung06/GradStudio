# 02 — Catalog: services, packages, extras, portfolio, reviews (G1, G3, G6)

> **Owner:** TV2 Đặng Hoàng Tuấn Kiệt. This file uses the conventions and the error shape defined in [`README.md`](README.md).
> **Place in the example chain:** 2nd (after `01-auth.md`). All endpoints here are read-only and public.

| Method | Path | Roles |
|---|---|---|
| GET | `/api/services` | public |
| GET | `/api/packages` | public |
| GET | `/api/packages/:id` | public |
| GET | `/api/extras` | public |
| GET | `/api/portfolio` | public |
| GET | `/api/reviews` | public |

---

## GET /api/services

Returns the studio's photography services and shoot types.

- **Roles:** public.
- **200 OK:** `{"services": [Service…]}`.

### Examples

```http
GET /api/services
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "services": [
    {
      "id": "sv-ky-yeu",
      "name": "Kỷ yếu lớp",
      "fromPrice": 350000,
      "priceUnit": "người",
      "description": "Chụp tập thể lớp tại trường và ngoại cảnh, hỗ trợ concept theo yêu cầu.",
      "image": "/art/graduation-group.png",
      "shootTypes": ["Kỷ yếu lớp", "Kỷ yếu nhóm"]
    },
    {
      "id": "sv-tot-nghiep",
      "name": "Tốt nghiệp",
      "fromPrice": 1800000,
      "priceUnit": null,
      "description": "Chụp cá nhân hoặc nhóm bạn ngày lễ tốt nghiệp, hỗ trợ make-up và áo cử nhân.",
      "image": "/art/graduation-portrait.png",
      "shootTypes": ["Tốt nghiệp cá nhân", "Tốt nghiệp nhóm bạn"]
    },
    {
      "id": "sv-chan-dung",
      "name": "Chân dung/CV",
      "fromPrice": 690000,
      "priceUnit": null,
      "description": "Chụp chân dung cá nhân, ảnh hồ sơ CV và ảnh doanh nhân tại studio.",
      "image": "/art/portrait-window.png",
      "shootTypes": ["Chân dung cá nhân", "Ảnh CV / Profile"]
    }
  ]
}
```

---

## GET /api/packages

Returns packages, optionally filtered by `serviceId`.

- **Roles:** public.
- **Query parameters:**
  - `serviceId` (string, optional): filter packages belonging to this service.
- **200 OK:** `{"packages": [Package…]}`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 400 | `VALIDATION` | `serviceId` is provided but does not match any existing service | `fields.serviceId` |

### Examples

Filter by `sv-tot-nghiep`:

```http
GET /api/packages?serviceId=sv-tot-nghiep
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "packages": [
    {
      "id": "pkg-tn-premium",
      "serviceId": "sv-tot-nghiep",
      "name": "Gói Tốt nghiệp Premium",
      "durationHours": 2,
      "editedPhotos": 30,
      "price": 1800000,
      "includes": [
        "Make-up và làm tóc 60 phút trước giờ chụp",
        "2 giờ chụp cùng thợ chính tại studio hoặc ngoại cảnh",
        "30 ảnh chỉnh sửa chi tiết"
      ]
    }
  ]
}
```

Unknown `serviceId`:

```http
GET /api/packages?serviceId=sv-khong-ton-tai
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION",
    "message": "Dữ liệu chưa hợp lệ",
    "fields": {
      "serviceId": "Dịch vụ không tồn tại"
    },
    "details": null
  }
}
```

---

## GET /api/packages/:id

Returns full details of one package including its parent service reference.

- **Roles:** public.
- **Path parameters:** `id` (package id).
- **200 OK:** `{"package": {…, "service": {"id", "name"}}}`.
- **Errors:**

| Status | `error.code` | When | `error.fields` |
|---|---|---|---|
| 404 | `NOT_FOUND` | No package with this `id` | `{}` |

### Examples

```http
GET /api/packages/pkg-tn-premium
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "package": {
    "id": "pkg-tn-premium",
    "serviceId": "sv-tot-nghiep",
    "name": "Gói Tốt nghiệp Premium",
    "durationHours": 2,
    "editedPhotos": 30,
    "price": 1800000,
    "includes": [
      "Make-up và làm tóc 60 phút trước giờ chụp",
      "2 giờ chụp cùng thợ chính tại studio hoặc ngoại cảnh",
      "30 ảnh chỉnh sửa chi tiết"
    ],
    "service": {
      "id": "sv-tot-nghiep",
      "name": "Tốt nghiệp"
    }
  }
}
```

Package not found:

```http
GET /api/packages/pkg-missing
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy gói chụp này",
    "fields": {},
    "details": null
  }
}
```

---

## GET /api/extras

Returns optional add-on services (make-up, costume rental).

- **Roles:** public.
- **200 OK:** `{"extras": [Extra…]}`.

### Examples

```http
GET /api/extras
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "extras": [
    {
      "id": "ex-makeup",
      "name": "Makeup",
      "price": 0,
      "note": "Đã gồm trong Gói Tốt nghiệp Premium, 60 phút trước giờ chụp"
    },
    {
      "id": "ex-costume",
      "name": "Thuê áo cử nhân",
      "price": 150000,
      "note": "Áo cử nhân và mũ theo size, chuẩn bị sẵn trước buổi chụp"
    }
  ]
}
```

---

## GET /api/portfolio

Returns sample illustration photos for the studio's home page. Images are AI-generated illustrations in `client/public/art/` or SVGs in `client/public/samples/`; there are no photos of real people.

- **Roles:** public.
- **200 OK:** `{"photos": [PortfolioPhoto…]}`.

### Examples

```http
GET /api/portfolio
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "photos": [
    {
      "id": "pf-01",
      "title": "Tốt nghiệp · sân trường",
      "serviceId": "sv-tot-nghiep",
      "url": "/art/graduation-diploma.png",
      "alt": "Minh họa: sinh viên tốt nghiệp cầm bằng trước sân trường"
    },
    {
      "id": "pf-02",
      "title": "Kỷ yếu lớp · tập thể",
      "serviceId": "sv-ky-yeu",
      "url": "/art/graduation-group.png",
      "alt": "Minh họa: nhóm bạn mặc áo cử nhân chụp ảnh kỷ yếu"
    }
  ]
}
```

---

## GET /api/reviews

Returns customer reviews shown on the studio's home page.

- **Roles:** public.
- **200 OK:** `{"reviews": [Review…]}`.

### Examples

```http
GET /api/reviews
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "reviews": [
    {
      "id": "rv-01",
      "author": "Hồ Gia Bảo",
      "initials": "HB",
      "rating": 5,
      "text": "Studio sắp xếp lịch make-up và chụp rất rõ ràng, không phải chờ đợi.",
      "serviceId": "sv-ky-yeu",
      "date": "2026-06-20"
    },
    {
      "id": "rv-02",
      "author": "Phạm Hoàng Anh",
      "initials": "PA",
      "rating": 5,
      "text": "Chọn ảnh ngay trên tài khoản rất tiện, nhận file đúng hẹn.",
      "serviceId": "sv-tot-nghiep",
      "date": "2026-08-15"
    }
  ]
}
```

## Changes

- 2026-11-20: initial version: services, packages, package detail, extras, portfolio, reviews. (TV2)
