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

Router: `react-router-dom` với `BrowserRouter`. Trang chủ sau khi đăng nhập: customer `/my-bookings`, admin `/admin/conversations`, staff `/staff/jobs`, superadmin `/superadmin/admins`. Route có ID mẫu và không ghi `after Gx` dùng dữ liệu seed. Route ghi `after Gx` cần hoàn thành bước đó để có dữ liệu. Mở trước thì hiện thông báo.

| Path | Role | Steps | Endpoints | Ghi chú |
|---|---|---|---|---|
| `/` | public | G1 | GET `/api/services`, `/api/packages`, `/api/extras`, `/api/portfolio`, `/api/reviews` | |
| `/packages/pkg-tn-premium` | public | G1 | GET `/api/packages/:id`, GET `/api/extras` | |
| `/sign-in` | public | G2 | POST `/api/auth/login` | |
| `/chat` | customer | G3, G6 | GET `/api/conversations`, GET `/api/conversations/:id`, POST `/api/conversations`, POST `/api/conversations/:id/messages`, PATCH `/api/conversations/:id/proposals/:proposalId`, GET `/api/services`, `/api/packages`, `/api/extras` | |
| `/my-bookings` | customer | G7 | GET `/api/bookings` | |
| `/my-bookings/GS-1024` | customer | G7, G9 | GET `/api/bookings/:code`, POST `/api/bookings/:code/payments` | after G6 |
| `/test-gateway/PAY-1` | customer | G7, G9 | GET `/api/payments/:id`, POST `/api/test-gateway/:paymentId` | after G7 |
| `/payments/PAY-1/result` | customer | G7, G9 | GET `/api/payments/:id` | after G7 |
| `/notifications` | customer | G7 | GET `/api/reminders` | |
| `/my-bookings/GS-1024/gallery` | customer | G9 | GET `/api/bookings/:code`, GET `/api/bookings/:code/photos`, PUT `/api/bookings/:code/selection`, POST `/api/bookings/:code/payments`, POST `/api/bookings/:code/receive` | after G6; có ảnh sau G8 |
| `/admin/conversations` | admin (`thao`) | G4 | GET `/api/conversations` | Lọc theo trạng thái hội thoại |
| `/admin/conversations/c-linh` | admin (`thao`) | G4, G5, G6 | GET `/api/conversations/:id`, POST `/api/conversations/:id/messages`, POST `/api/conversations/:id/proposals`, GET `/api/resources`, GET `/api/schedule?date=...`, POST `/api/availability/check`, GET `/api/packages`, GET `/api/extras`, GET/POST `/api/bookings` | Hội thoại Linh có sẵn. Booking GS-1024 xuất hiện after G6. |
| `/admin/bookings` | admin (`thao`) | G10 | GET `/api/bookings` | Lọc theo trạng thái, mở chi tiết và hội thoại liên quan |
| `/admin/bookings/GS-1023` | admin (`thao`) | G10 | GET `/api/bookings/:code`, GET `/api/resources`, PATCH `/api/bookings/:code`, POST `/api/bookings/:code/cancel`, PUT `/api/bookings/:code/final-link` | Booking mẫu của Hân có sẵn. Thử đổi hoặc hủy lịch tại đây. Gắn link sau khi đã trả đủ và việc chỉnh ảnh hoàn thành. |
| `/staff/jobs` | staff | G8 | GET `/api/jobs` | |
| `/staff/jobs/J-GS-1022-shoot` | staff (tuan) | G8 | GET `/api/jobs/:id`, GET `/api/bookings/:code`, PATCH `/api/jobs/:id`, POST `/api/bookings/:code/previews`, GET `/api/bookings/:code/photos` | `J-GS-1024-*`: after G7 |
| `/superadmin/admins` | superadmin | G11 | GET `/api/admins`, POST `/api/admins`, PATCH `/api/admins/:id` | |
| `/superadmin/settings` | superadmin | G11 | GET `/api/settings`, PUT `/api/settings` | |
| path bất kỳ khác | | | | Màn "Không tìm thấy trang" |

## 5. Product owner decisions

Câu hỏi đặt dưới bài *GradStudio — questions for the product owners* (#WAD2431) trong group Facebook của môn. Đường dẫn tới bài trả lời PO chưa được cung cấp (sẽ bổ sung khi có, không tự tạo link).

> **Nguyên tắc áp dụng sau cập nhật 27/11/2026:** Khi hai quyết định PO cùng điều chỉnh một quy tắc, áp dụng câu mới hơn (đợt QA ngày 27/11 ở mục **5.3**). Cụ thể, **B2.2** thay thế quy ước cũ ngày 23/11 về việc tạo booking thay thế trong cùng hội thoại.

### 5.1 Phản hồi 10 mục từ Product Owner (23/11/2026)

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
| 4a / 4b Upload ảnh preview | Chỉ nhận JPEG/PNG (`image/jpeg`, `image/png`), mỗi request 1 file, tối đa đúng **5 MiB = 5.242.880 byte** phần nội dung file (cùng ngưỡng ở contract, form `file.size` và server). PA#4 kiểm tra thêm chữ ký file theo S5. | `08-jobs.md`, `mock/routes/jobs.mjs`, G8 |
| 4c / 4d Nhắc lịch & cài đặt | Trạng thái e-mail `queued` / `sent` / `failed` (PA#4: `sent` khi SMTP chấp nhận). Nhắc qua cả e-mail và tài khoản; số giờ nhắc trước là số nguyên 1–168, mặc định 24, tính từ mốc sớm nhất; nhắc chờ gửi được tính lại khi đổi lịch và dừng gửi khi hủy. *(Bổ sung chi tiết gửi đến hạn & giờ mở cửa 2 khung tại B4.4, B4.12–B4.13 mục 5.3.)* | `07-reminders.md`, `13-settings.md`, G7, G11 |
| 4e Đại diện lớp (kỷ yếu) | Một tài khoản đại diện lớp sở hữu booking kỷ yếu và dùng trọn luồng Customer; không thêm chia tiền hay nhiều tài khoản đồng quản lý. | Toàn bộ luồng Customer & kiểm tra chủ sở hữu |
| Quy ước kỹ thuật mục 2.7 | Làm tròn cọc `Math.round(price * 0.3)` (VND nguyên); Payment cọc trùng dùng `succeeded` + `deposit_paid` + `reservationFailure`; điều kiện trả 70% yêu cầu mọi job `shoot` của booking đã `done`; ID hội thoại mới sinh dạng `c-1`, `c-2`… | `README.md`, `03`, `06`, `08`, `10` |

### 5.3 Đợt QA bổ sung của Product Owner (cập nhật 27/11/2026)

Nguồn: các bài QA bổ sung (`B2`, `B3`, `B4`, `BS.1`, giải thích ký hiệu tại `docs/qa-reference.md`; chưa có đường dẫn bài đăng Facebook để trích dẫn, không tự tạo link). Trạng thái dưới đây phản ánh đúng commit `62c2d63` trên `main`.

| Mã QA | Bước / R | Quyết định PO | Phụ trách | Trạng thái tại `62c2d63` |
|---|---|---|---|---|
| `B2.1` | G8, G9 · R6 | Mở trả 70% khi các việc `shoot` đã `done` và danh sách ảnh đã lưu; hiện lý do khi khóa nút; việc `shoot` lùi trạng thái trước khi trả phải khóa nút 70% lại. | TV2 + TV1 | Đã hoàn thành trên `main` (`62c2d63`, PR #32 & PR #35). |
| `B2.2` | G4, G10 | Hủy booking vẫn giữ hội thoại `Đã chốt lịch`; **mỗi hội thoại gắn tối đa 1 booking, kể cả booking đã hủy**; đặt lại qua yêu cầu mới (thay quy ước R07 cũ). | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B2.3` | G5, G6 · R2 | Khách từ chối đề xuất thì hội thoại vẫn `Đang tư vấn`; Admin đề xuất tiếp và chỉ mở *Tạo booking* sau khi khách đồng ý giờ hợp lệ. | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B2.4` | G1, G6, G9 · R3, R5 | Mỗi dịch vụ có ít nhất 1 gói đủ tên, thời lượng, số ảnh chỉnh và giá; giá *"từ"* là giá thấp nhất; máy chủ tính giá/cọc và giới hạn ảnh; giữ nguyên Premium cho `GS-1024`. | TV2 + TV3 | Đã hoàn thành trên `main` (`62c2d63`, kiểm lại ở PR #33–#35). |
| `B2.5` | G3, G4, G6 | Tin từ trang dịch vụ và yêu cầu mới áp dụng quy tắc chọn hội thoại ở `B4.6`; khách vẫn nhắn tiếp được trong hội thoại gắn booking. | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B3.1` | G3, G6, G10 · R3 | Nếu dùng đơn giá mỗi người (Kỷ yếu), phải có số người trước khi tạo booking và máy chủ kiểm tra số nguyên theo giới hạn nhóm chốt; khóa sau khi đã cọc. | TV3 + TV2 | Đã chốt theo contract nhóm (giá trọn gói, extras không cộng giá riêng) trên `main` (`62c2d63`). |
| `B3.2` | G3 | Xếp độ gần theo thời điểm tin nhắn mới nhất; khi có nhiều hội thoại chưa hoàn thành và chưa có booking, ưu tiên hội thoại có tin nhắn mới nhất. | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B3.3` | G5, G6 · R2 | Đề xuất mới thay thế đề xuất đang `pending`; hiện chữ **Đã bị thay thế** trên đề xuất cũ và chỉ cho phản hồi đề xuất mới nhất. | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B4.1` | G7, G10 · R4, R7, R8 | Cọc thành công nhưng trùng giờ giữ tiền đã thu và `Chờ cọc 30%`; nếu giữ nguyên gói, đổi giờ trống trên **chính booking đó** để sang `Đã đặt lịch` và sinh việc/nhắc lịch đúng 1 lần; đổi gói hoặc bỏ chụp thì hủy (hoàn ngoài hệ thống). | TV3 + TV2 + TV1 | Đã hoàn thành trên `main` (`62c2d63`, PR #35 `confirmBookingReservation` & PR #36). |
| `B4.2` | G7, G9, G10 · R4, R7, R8 | Còn giao dịch chờ trong hạn thì hủy trả `409` kèm giờ được hủy; hết hạn chuyển `Thất bại`; ngoại lệ cổng thực thu sau khi hủy thì ghi tiền đã thu và giữ `Đã hủy`. Áp dụng cả 30% và 70%. | TV2 + TV3 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B4.3` | G7, G10 · R4, R7, R8 | Còn giao dịch chờ trong hạn thì đổi giờ trả `409` kèm giờ mở khóa; cọc thành công kiểm tra người/phòng theo giờ booking tại lúc trả; cọc trùng xử lý theo `B4.1`. | TV2 + TV3 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B4.4` | G5, G10, G11 · R1, R7 | Dùng khoảng `[bắt đầu, kết thúc)`, cho phép liền giờ; **giờ mở cửa tách T2–T6 (`weekday`) và T7–CN (`weekend`)**; kiểm ở đề xuất/tạo/đổi/gợi ý; đổi cấu hình giữ booking cũ, lúc cọc chỉ kiểm người/phòng. Seed T7 `24/10/2026` bao `09:00–16:00`. | TV1 + TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #32 QA8 & PR #33/#34 QA10). |
| `B4.5` | G5, G6 · R2 | Admin gửi đề xuất khác sau khi khách đã đồng ý và trước khi tạo booking thì giờ cũ hết hiệu lực, hội thoại về `Đang tư vấn` và khóa *Tạo booking* tới khi khách đồng ý giờ mới. | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B4.6` | G3, G4, G6 | Từ trang dịch vụ, chat và yêu cầu ưu tiên hội thoại chưa `Hoàn thành` và chưa có booking; nếu không có thì yêu cầu mở hội thoại mới, chat nối hội thoại chưa `Hoàn thành` có tin mới nhất hoặc mở mới; yêu cầu mới trong hội thoại đã có booking đi sang hội thoại mới. | TV3 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #33 & PR #35). |
| `B4.7` | G6, G10 · R3, R7 | Chỉ đổi giờ khi `Chờ cọc` hoặc `Đã đặt lịch` và việc `shoot` chưa `Đang làm`; từ lúc `shoot` `in_progress`/`done`, đã `paid_in_full` hoặc `completed` thì trả `409`; khóa gói/giá từ lúc tạo. | TV3 + TV1 | Đã hoàn thành trên `main` (`62c2d63`, PR #33). |
| `B4.8` | G8, G9, G10 · R6, R7 | Staff đổi trạng thái việc của mình theo thứ tự bất kỳ (kể cả lùi trạng thái) khi còn mở; **khóa `makeup`/`shoot` sau khi trả 70%**, **khóa `edit` sau khi gắn `finalLink`**; booking hủy vẫn hiện việc kèm nhãn, chặn cập nhật `409` và nhả lịch bận. | TV1 + TV2 + TV3 | Đã hoàn thành trên `main` (`62c2d63`, PR #32 QA8 & kiểm lại ở PR #37). |
| `B4.9` | G9 · R5, R6 | Chọn từ 1 đến giới hạn gói; danh sách rỗng trả `400` và không đủ điều kiện trả 70%. | TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #35 QA9). |
| `B4.10` | G9 · R5, R6, R8 | Khi trả 70% thành công, khóa danh sách lưu thành công gần nhất; khoản trả theo giá gói, không đổi theo số ảnh. | TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #35 QA9). |
| `B4.11` | G8, G9, G10 · R4, R6 | Admin phân công makeup, chụp, chỉnh khi tạo booking (seed Tuấn cho `GS-1024`); Staff chỉ mở chỉnh sau khi đã lưu ảnh và trả đủ 70%; Admin chỉ gắn `finalLink` khi đã trả đủ 70% và việc `edit` `done` (thiếu trả `409`). | TV3 + TV1 + TV2 | Đã hoàn thành trên `main` (`62c2d63`, PR #32, PR #33, PR #35 & PR #36). |
| `B4.12` | G7, G10 · R4, R7, R9 | Đổi lịch thay nhắc chưa gửi, giữ lịch sử đã gửi và tạo nhắc mới theo mốc sớm nhất mới; mốc đã tới/qua hiện ngay trong tài khoản, e-mail gửi ở lượt chạy kế tiếp, mỗi nhắc tối đa 1 lần. | TV2 + TV3 | Đã hoàn thành trên `main` (`62c2d63`, PR #35 QA9). |
| `B4.13` | G7, G11 · R4, R9 | Đổi số giờ nhắc chỉ áp dụng cho nhắc tạo sau hoặc tính lại khi đổi lịch; lỗi gửi vẫn hiện trong tài khoản với trạng thái `Gửi lỗi`. | TV2 + TV1 | Đã hoàn thành trên `main` (`62c2d63`, PR #32 QA8 & PR #35 QA9). |
| `BS.1` | G7, G9, G10 · R8 | Hạn thanh toán **15 phút** cho cả cọc 30% và 70% (cổng thử và hệ thống dùng cùng hạn; sang PA#4 nếu sandbox đòi tối thiểu dài hơn thì dùng mức ngắn nhất cổng cho phép). | TV2 + TV3 | Đã hoàn thành trên `main` (`62c2d63`, PR #35 QA9 & PR #33 QA10). |

### 5.4 Tóm tắt quy tắc TV3 theo QA của PO

- B2.2 và B4.6. Mỗi hội thoại gắn tối đa một booking. Sau hủy, giữ Đã chốt lịch, mã booking, lịch sử và tiền đã thu. Khách gửi yêu cầu riêng để đặt lại. API trả ID hội thoại đích để màn Customer mở đúng chỗ.
- B3.3 và B4.5. Đề xuất mới thay đề xuất đang chờ hoặc đã đồng ý. Chỉ đề xuất mới nhất có thể được phản hồi và dùng để tạo booking sau khi được khách đồng ý.
- B4.1. Khi cọc đã thu nhưng lịch bị trùng, Admin đổi sang giờ trống trên cùng mã booking. QA9 xác nhận lại lịch, giữ khoản cọc và phân công người chỉnh đã chọn, rồi tạo jobs và nhắc lịch một lần.
- B4.2–3 và BS.1. QA9 áp dụng hạn 15 phút cho cọc và khoản 70%. Admin bị khóa đổi/hủy khi giao dịch còn hạn. QA9 xử lý thử lại sau hết hạn và trường hợp cổng đã thực thu sau khi hủy.
- B4.4, B4.7 và B4.11. Admin dùng giờ mở cửa theo ngày thường/cuối tuần khi kiểm, đề xuất, tạo và đổi lịch. Việc chụp đã bắt đầu hoặc booking đã trả đủ thì khóa đổi lịch. Chỉ giao link khi booking đã trả đủ và việc chỉnh đã hoàn thành. Khách hoàn tất qua Nhận ảnh.

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


### TV3 — giới hạn tích hợp còn lại

- PA#3 dùng một job theo mỗi loại ca. Đổi lịch có jobs hiện hữu mà thêm, bớt hoặc lặp loại ca trả `409 CONFLICT`. Khôi phục booking đã nhận cọc cũng trả `409 CONFLICT` nếu lịch mới cần nhiều job cùng loại. Đây là giới hạn ánh xạ jobs của bản PA#3.
