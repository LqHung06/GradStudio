# FRONTEND.md — GradStudio PA#3

> Trạng thái: **đang làm**. Nhóm cập nhật file này trong suốt PA#3; bản cuối phải khớp với bản build trong zip.

## 1. Team

| Vai trò | Họ tên | MSSV | Phụ trách |
|---|---|---|---|
| TV1 | Lê Quốc Hưng | 24120184 | Nền front end (router, đăng nhập, gọi API, form), G2, G8, G11; khung mock; contract `README`, `01-auth`, `08-jobs`, `12-admins`, `13-settings` |
| TV2 | Đặng Hoàng Tuấn Kiệt | 24120354 | Phía khách: G1, G3, G6 (khách), G7, G9; contract `02-catalog`, `06-payments`, `07-reminders`, `09-gallery`, `11-receive` |
| TV3 | Lê Công Minh Nhựt | 24120211 | Chat, kiểm tra trùng lịch, booking: G4, G5, G6 (Admin), G10; contract `03-conversations`, `04-availability`, `05-bookings`, `10-admin-bookings` |

## 2. How to run it

```sh
# terminal 1: mock API (port 3001). Chế độ: MOCK_MODE=normal | slow | error | empty
node mock/server.mjs
MOCK_MODE=slow node mock/server.mjs

# terminal 2: front end
cd client
npm ci
npm run dev                 # http://localhost:5173, /api được chuyển tới http://localhost:3001

# xem bản build (giống cách chấm)
npm run build
npx vite preview            # http://localhost:4173, cùng proxy /api

# kiểm tra contract: khởi động lại mock trước mỗi lần chạy
node tools/contract-check.mjs --base http://localhost:3001
```

## 3. Demo accounts

| Name in examples | Role | E-mail | Password |
|---|---|---|---|
| `linh` | customer | `linh@gradstudio.test` | `linh-demo` |
| `thao` | admin | `thao@gradstudio.test` | `thao-demo` |
| `mai` | staff | `mai@gradstudio.test` | `mai-demo` |
| `tuan` | staff | `tuan@gradstudio.test` | `tuan-demo` |
| `superadmin` | superadmin | `superadmin@gradstudio.test` | `superadmin-demo` |

## 4. Routes

Router: `react-router-dom` với `BrowserRouter`. Trang chủ sau khi đăng nhập: customer `/my-bookings`, admin `/admin/conversations`, staff `/staff/jobs`, superadmin `/superadmin/admins`. Các ID là ID mock có sẵn khi vừa khởi động. Route ghi `after Gx` chỉ có dữ liệu sau bước đó; mở trước thì hiện thông báo.

| Path | Role | Steps | Endpoints | Ghi chú |
|---|---|---|---|---|
| `/` | public | G1 | GET `/api/services`, `/api/packages`, `/api/extras`, `/api/portfolio`, `/api/reviews` | |
| `/packages/pkg-tn-premium` | public | G1 | GET `/api/packages/:id` | |
| `/sign-in` | public | G2 | POST `/api/auth/login` | |
| `/chat` | customer | G3, G6 | GET `/api/conversations`, GET `/api/conversations/:id`, POST `/api/conversations`, POST `/api/conversations/:id/messages`, PATCH `/api/conversations/:id/proposals/:proposalId`, GET `/api/services`, `/api/packages`, `/api/extras` | |
| `/my-bookings` | customer | G7 | GET `/api/bookings` | |
| `/my-bookings/GS-1024` | customer | G7, G9 | GET `/api/bookings/:code`, POST `/api/bookings/:code/payments` | after G6 |
| `/test-gateway/PAY-1` | customer | G7, G9 | GET `/api/payments/:id`, POST `/api/test-gateway/:paymentId` | after G7 |
| `/payments/PAY-1/result` | customer | G7, G9 | GET `/api/payments/:id` | after G7 |
| `/notifications` | customer | G7 | GET `/api/reminders` | |
| `/my-bookings/GS-1024/gallery` | customer | G9 | GET `/api/bookings/:code`, GET `/api/bookings/:code/photos`, PUT `/api/bookings/:code/selection`, POST `/api/bookings/:code/payments`, POST `/api/bookings/:code/receive` | after G6; có ảnh sau G8 |
| `/admin/conversations` | admin | G4 | GET `/api/conversations` | |
| `/admin/conversations/c-linh` | admin | G4, G5, G6 | GET `/api/conversations/:id`, POST `/api/conversations/:id/messages`, POST `/api/conversations/:id/proposals`, GET `/api/resources`, GET `/api/schedule`, POST `/api/availability/check`, GET `/api/packages`, `/api/extras`, POST `/api/bookings` | |
| `/admin/bookings` | admin | G10 | GET `/api/bookings` | |
| `/admin/bookings/GS-1023` | admin | G10 | GET `/api/bookings/:code`, PATCH `/api/bookings/:code`, POST `/api/bookings/:code/cancel`, PUT `/api/bookings/:code/final-link`, POST `/api/availability/check`, GET `/api/resources` | GS-1024: after G6 |
| `/staff/jobs` | staff | G8 | GET `/api/jobs` | |
| `/staff/jobs/J-GS-1022-shoot` | staff (tuan) | G8 | GET `/api/jobs/:id`, PATCH `/api/jobs/:id`, POST `/api/bookings/:code/previews`, GET `/api/bookings/:code/photos` | `J-GS-1024-*`: after G7 |
| `/superadmin/admins` | superadmin | G11 | GET `/api/admins`, POST `/api/admins` | |
| `/superadmin/settings` | superadmin | G11 | GET `/api/settings`, PUT `/api/settings` | |
| path bất kỳ khác | | | | Màn "Không tìm thấy trang" |

## 5. Product owner decisions

Câu hỏi đặt dưới bài *GradStudio — questions for the product owners* (#WAD2431) trong group Facebook của môn. Mỗi quyết định nhóm dựa vào ghi một dòng:

| Ngày | Link tới comment | Câu hỏi | Quyết định | Áp dụng ở |
|---|---|---|---|---|
| | | | | |

## 6. Libraries

| Thư viện | Vì sao |
|---|---|
| `react`, `react-dom` 19 | Dùng tiếp từ PA#2 |
| `vite` 7, `@vitejs/plugin-react` | Build và dev server, proxy `/api` sang mock |
| `react-router-dom` | Router cho các màn của 4 vai trò (thêm ở bước nền front end) |
| CSS thuần (`client/src/styles/`) | Giữ design tokens của PA#2, không dùng CSS framework |
| Không dùng form library | Hook `useForm` và component `FormField` do nhóm tự viết |

Ảnh: các ảnh trong `client/public/art/` là ảnh minh họa do AI (GPT) tạo, nhân vật hư cấu, không phải ảnh người thật. Ảnh preview và ảnh mẫu là SVG trong `client/public/samples/`.

## 7. Not done

Đang làm. Mục này được cập nhật trước khi nộp: bước nào hoặc phần nào của một bước chưa chạy thì ghi vào đây.
