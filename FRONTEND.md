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
| `han` | customer | `han@gradstudio.test` | `han-demo` |
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
| `/admin/conversations` | admin | G4 | GET `/api/conversations` | Lọc theo trạng thái hội thoại |
| `/admin/conversations/c-linh` | admin | G4, G5, G6 | GET `/api/conversations/:id`, POST `/api/conversations/:id/messages`, POST `/api/conversations/:id/proposals`, GET `/api/resources`, GET `/api/schedule?date=...`, POST `/api/availability/check`, GET `/api/packages`, GET `/api/extras`, GET/POST `/api/bookings` | Kết quả tạo và lịch sử booking hiện trong hội thoại |
| `/admin/bookings` | admin | G6 | GET `/api/bookings` | Danh sách chỉ đọc, mở hội thoại liên quan nếu có |
| `/staff/jobs` | staff | G8 | GET `/api/jobs` | |
| `/staff/jobs/J-GS-1022-shoot` | staff (tuan) | G8 | GET `/api/jobs/:id`, PATCH `/api/jobs/:id`, POST `/api/bookings/:code/previews`, GET `/api/bookings/:code/photos` | `J-GS-1024-*`: after G7 |
| `/superadmin/admins` | superadmin | G11 | GET `/api/admins`, POST `/api/admins`, PATCH `/api/admins/:id` | |
| `/superadmin/settings` | superadmin | G11 | GET `/api/settings`, PUT `/api/settings` | |
| path bất kỳ khác | | | | Màn "Không tìm thấy trang" |

## 5. Product owner decisions

Câu hỏi đặt dưới bài *GradStudio — questions for the product owners* (#WAD2431) trong group Facebook của môn. Đường dẫn tới bài trả lời PO chưa được cung cấp (sẽ bổ sung khi có, không tự tạo link).

### 5.1 Phản hồi 10 mục từ Product Owner

| Ngày | Link tới comment | Mục / Câu hỏi | Quyết định | Áp dụng ở |
|---|---|---|---|---|
| 23/11/2026 | Chưa có link | #1 Phạm vi quản lý Admin (G11) | Superadmin chỉ xem và tạo Admin; không sửa thông tin, không xóa. *(Nhóm chọn bổ sung khóa/mở khóa ở mục 5.2.)* | `12-admins.md`, `01-auth.md`, G11 |
| 23/11/2026 | Chưa có link | #2 Trạng thái việc Staff (G8) | Makeup, chụp ảnh, chỉnh ảnh dùng chung 3 nhãn **Chưa bắt đầu** (`todo`), **Đang làm** (`in_progress`), **Hoàn thành** (`done`). Staff chỉ sửa việc của mình; cập nhật việc không tự đổi trạng thái booking/hội thoại. | `README.md`, `08-jobs.md`, `status.js`, G8 |
| 23/11/2026 | Chưa có link | #3 Hủy booking (G10/G7) | Chỉ Admin hủy booking `Chờ cọc 30%` hoặc `Đã đặt lịch` (`Hoàn thành` trả 409). Cả Admin và khách thấy **Đã hủy** (`cancelled`); khách yêu cầu hủy qua chat. Hủy nhả người/phòng, ngừng nhắc lịch, giữ khoản đã thu; hoàn tiền xử lý ngoài hệ thống. | `05-bookings.md`, `08-jobs.md`, `10-admin-bookings.md`, G7, G8, G10 |
| 23/11/2026 | Chưa có link | #4 Vòng đời hội thoại (G4/G9) | Hội thoại tự chuyển `Chưa trả lời` → `Đang tư vấn` khi Admin trả lời lần đầu; → `Đã chốt lịch` khi khách đồng ý đề xuất giờ; giữ `Đã chốt lịch` đến khi bấm *Nhận ảnh* mới chuyển `Hoàn thành`. Admin không đặt tay. | `03-conversations.md`, `11-receive.md`, G4, G9 |
| 23/11/2026 | Chưa có link | #5 Đổi lịch booking (G10) | Admin đổi lịch trực tiếp có kiểm tra trùng (trùng trả 409 kèm lý do), **không** bắt khách đồng ý lại proposal. Giữ trạng thái booking/tiền, cập nhật việc và tính lại nhắc lịch từ mốc sớm nhất mới. | `10-admin-bookings.md`, G10 |
| 23/11/2026 | Chưa có link | #6 Giá gói và extras (G6/G7) | Máy chủ lấy giá gói để tính cọc 30% và 70% còn lại; Admin không sửa giá/giảm giá. Extras không có giá riêng, chỉ ghi để bố trí người/trang phục. GS-1024 giữ 1.800.000đ (cọc 540.000đ, còn 1.260.000đ). | `02-catalog.md`, `05-bookings.md`, `06-payments.md`, G1, G6, G7 |
| 23/11/2026 | Chưa có link | #7 Thanh toán thất bại & thử lại (G7/G9) | Thanh toán thất bại giữ nguyên trạng thái booking và tiền đã thu, báo rõ khoản đang chờ và cho thử lại không giới hạn. Khoản đã thành công không được thanh toán lại (409). | `06-payments.md`, G7, G9 |
| 23/11/2026 | Chưa có link | #8 Cọc đã xác nhận nhưng trùng giờ (G7/G10) | Hai booking cùng chờ cọc chưa giữ chỗ. Khoản cọc xác nhận trước và còn trống sẽ giữ chỗ; khoản sau đã nhận tiền nhưng trùng vẫn ghi nhận tiền đã thu, giữ booking `Chờ cọc 30%`, báo lý do, không sinh việc/nhắc lịch, không tự hoàn tiền và không mời trả cọc lại. | `06-payments.md`, `10-admin-bookings.md`, G7, G10 |
| 23/11/2026 | Chưa có link | #9 Chỉnh sửa danh sách chọn ảnh (G9) | Khách được sửa lựa chọn trong giới hạn của gói cho đến trước khi trả xong 70%; sau khi trả đủ 70% thì khóa lựa chọn (API trả 409). | `09-gallery.md`, G9 |
| 23/11/2026 | Chưa có link | #10 Kiểm tra trùng trang phục (G5/G10) | Chỉ kiểm tra trùng nhân sự và phòng. Thuê trang phục chỉ là extra, không kiểm tra tồn kho / số lượng trang phục. | `04-availability.md`, `02-catalog.md`, G5, G10 |

### 5.2 Các lựa chọn bổ sung và quy ước triển khai của nhóm (chốt 23/11/2026 — không phải phản hồi PO)

| Mục | Quyết định của nhóm | Áp dụng ở |
|---|---|---|
| Khóa/mở khóa Admin | Thêm `PATCH /api/admins/:id` (`{"active": boolean}`) cho Superadmin; tài khoản bị khóa bị từ chối đăng nhập (`403 FORBIDDEN`) và bị từ chối token cũ (`401 UNAUTHENTICATED`). Không mở sửa thông tin hay xóa Admin. | `README.md`, `01-auth.md`, `12-admins.md`, `server.mjs`, G11 |
| Việc của Staff sau khi hủy booking | Giữ nguyên lịch sử việc (`GET` vẫn trả, không thêm `job.status = "cancelled"`), hiển thị booking Đã hủy và chặn Staff cập nhật việc / đăng preview (`409 CONFLICT`). | `08-jobs.md`, `10-admin-bookings.md`, G8 |
| Hội thoại & booking thay thế sau hủy | Khi booking bị hủy, hội thoại giữ trạng thái `Đã chốt lịch` (`scheduled`) và hiển thị riêng booking Đã hủy. Cho phép chốt giờ mới và tạo mã booking thay thế trong cùng hội thoại; giữ nguyên lịch sử và tiền đã thu của booking cũ. | `03-conversations.md`, `05-bookings.md`, `10-admin-bookings.md`, G4, G6, G7, G10 |
| 4a / 4b Upload ảnh preview | Chỉ nhận JPEG/PNG (`image/jpeg`, `image/png`), mỗi request 1 file, tối đa đúng **5 MiB = 5.242.880 byte** phần nội dung file (cùng ngưỡng ở contract, form `file.size` và server). PA#4 kiểm tra thêm chữ ký file theo S5. | `08-jobs.md`, `mock/routes/jobs.mjs`, G8 |
| 4c / 4d Nhắc lịch & cài đặt | Trạng thái e-mail `queued` / `sent` / `failed` (PA#4: `sent` khi SMTP chấp nhận). Nhắc qua cả e-mail và tài khoản; số giờ nhắc trước là số nguyên 1–168, mặc định 24, tính từ mốc sớm nhất; nhắc chờ gửi được tính lại khi đổi lịch và dừng gửi khi hủy. | `07-reminders.md`, `13-settings.md`, G7, G11 |
| 4e Đại diện lớp (kỷ yếu) | Một tài khoản đại diện lớp sở hữu booking kỷ yếu và dùng trọn luồng Customer; không thêm chia tiền hay nhiều tài khoản đồng quản lý. | Toàn bộ luồng Customer & kiểm tra chủ sở hữu |
| Quy ước kỹ thuật mục 2.7 | Làm tròn cọc `Math.round(price * 0.3)` (VND nguyên); Payment cọc trùng dùng `succeeded` + `deposit_paid` + `reservationFailure`; điều kiện trả 70% yêu cầu mọi job `shoot` của booking đã `done`; ID hội thoại mới sinh dạng `c-1`, `c-2`… | `README.md`, `03`, `06`, `08`, `10` |

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


### TV3 — phần còn chờ sau tích hợp reminders

Mock đã dùng helper của TV2 để tính lại nhắc lịch khi đổi và dừng nhắc chờ gửi khi hủy (R04/R05). `reservationFailure` đã có trong contract và mock payments. TV2 cần sửa cách cấp ID trong helper dùng chung: nếu hủy xóa một nhắc queued trước một ID còn tồn tại, lần tạo tiếp theo theo độ dài danh sách có thể trùng ID. Quy tắc ánh xạ jobs khi nhiều ca cùng loại hoặc thêm/bớt loại ca chờ TV1. Mock hiện trả 409 cho trường hợp không ánh xạ một-một. R06 chặn Staff sửa việc/upload sau hủy, đồng thời giữ quyền đọc lịch sử. Kiểm tra hồi quy bằng `node --test tools/tv3-booking-rules.test.mjs`.

### TV3 — phạm vi R14 trong brief mục 24–25

G4/G5/G6 đã có các route ở bảng trên. Khách có thể đồng ý đề xuất ở `/chat`. G10 còn thiếu route chi tiết `/admin/bookings/:code` và các thao tác trên giao diện để đổi lịch trực tiếp bằng `date/items`, hủy và lưu link ảnh cuối. Khi tạo booking thay thế, API kiểm tra đề xuất có trước thời điểm hủy hay đã được dùng. Contract hiện thiếu trường cho phép giao diện phân biệt các trường hợp đó nếu khách trả lời một đề xuất cũ sau khi hủy.
