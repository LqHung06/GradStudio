# QA11 GradStudio · 28/11/2026

TV3 kiểm bốn chế độ mock trên production build của nhánh `fix/tv3-submission-readiness`. Base của đợt kiểm là `1655427`, cùng nội dung với `origin/main` tại merge commit `37d2878` của PR #38. Ma trận bên dưới dùng route cụ thể từ năm nhóm router và trang 404 của `App.jsx`. Quyền sở hữu booking, nhân sự và tài khoản lấy từ seed hoặc dữ liệu tạo qua API của từng mock.

## Chạy lại

Từ thư mục gốc, dùng Node 22 và Chrome. Có thể cấu hình đường dẫn Chrome qua biến `CHROME_PATH`. Cổng 3001 và 4181 cần trống.

```powershell
Push-Location client
npm.cmd ci
npm.cmd run build
Pop-Location
node tools/qa11-app-check.mjs "$env:TEMP/gradstudio-qa11.json"
```

Harness chạy `vite preview` trên `client/dist`, khởi động bốn mock riêng và giữ mỗi bộ dữ liệu trong bộ nhớ. Các ca Thử lại chuyển proxy QA từ error về normal trong khi vẫn giữ trang, URL và token. Với màn có nhiều endpoint, lượt lỗi riêng gửi một endpoint sang mock error, các endpoint khác tiếp tục đi qua normal. Trình duyệt ghi request/status, vùng loading, retry và lỗi JavaScript; JSON lưu cả đoạn nội dung nhìn thấy ở ca lỗi. Harness trả mã thoát 1 nếu có ca lỗi hoặc chưa chạy.

Tài khoản được xác thực qua API và dùng phiên do API trả về. Ca `/sign-in` điền và gửi form thật bằng `han`. Sáu ca mở sớm chạy trước khi có booking/payment/job runtime. `PAY-99999` là ID vắng mặt chủ ý. Tài khoản `han` sở hữu booking seed `GS-1023`, `mai` có công việc makeup ở `GS-1021`, `tuan` có việc chụp ở `GS-1022`. Các ca Admin dùng `thao`, G11 dùng `superadmin`.

Để mở phần xếp lịch theo ngày, harness gửi yêu cầu chụp ngày 24/10/2026 từ `linh` vào `c-linh`. Phần sau G6–G8 tạo đề xuất 13:00–14:00 với Mai và 14:00–16:00 với Tuấn ở Phòng B, khách đồng ý, Admin tạo booking với Tuấn chỉnh ảnh. Harness tạo cọc pending cho Hân để mở gateway, xác nhận cọc Linh để mở màn kết quả/nhắc lịch và dùng tài khoản Tuấn tải preview. Các bước này chạy qua HTTP để chuẩn bị dữ liệu. Các trạng thái trong ma trận được kiểm qua Chrome trên các route mở trực tiếp.

## Đối chiếu Routes

- `/packages/pkg-tn-premium` còn gọi `GET /api/extras`. Chi tiết Staff còn đọc `GET /api/bookings/:code`. Cả hai thuộc contract và có trong trace. Đề nghị TV2 và TV1 cập nhật dòng Routes tương ứng.
- `/my-bookings/GS-1023` của Hân là ca seed bổ sung. `GS-1024` của Linh dùng dữ liệu sau G6. Hai route payment dùng đúng URL do API trả về trên mock đang chạy.

## Các gate chạy ở checkout này

| Gate | Lệnh | Kết quả |
|---|---|---|
| Syntax và seed | `node --check` trên server, `mock/lib/*.mjs`, `mock/routes/*.mjs` và `tools/*.mjs`. `JSON.parse` trên `mock/data/*.json` | 28 module và 14 seed JSON qua |
| Contract HTTP | `node tools/contract-check.mjs --base http://127.0.0.1:3011` | Mock normal mới, 112/112 ví dụ và 40/40 endpoint |
| Hồi quy | `node --test tools/tv1-rules.test.mjs tools/tv2-reminders-id.test.mjs tools/tv2-qa9.test.mjs tools/tv3-booking-rules.test.mjs` | 46/46 PASS, 0 FAIL, 0 skip, 0 TODO |
| React | `npm ci` và `npm run build` trong `client` | 95 module. Vite ghi trực tiếp vào `client/dist`. |
| Repo | Tìm conflict markers với `rg` trong source/tài liệu/workflow và `git diff --check` | Qua |

W3C Nu, responsive toàn app và một lượt F5 riêng cho mọi route chưa được kiểm ở đợt này. Ma trận cũng không thay luồng nghiệp vụ xuyên vai trò của nhóm sau khi người dùng đã chọn ảnh, trả 70% và nhận ảnh.

## Bàn giao

- **TV1 Hưng, khung ứng dụng.** Chrome dùng profile mới mở `/my-bookings/GS-1024` bằng `linh` trong normal trước G6. Trang hiện đúng thông báo chờ studio tạo booking. `GET /api/bookings/GS-1024 → 404` là kết quả đã dự kiến. Chrome còn gửi `GET /favicon.ico → 404` trên cùng origin; đây là lỗi tài nguyên tĩnh ngoài dự kiến và làm ca thất bại. Có thể tái hiện bằng cách mở trực tiếp bất kỳ trang build nào bằng profile mới. Giao TV1 rà icon khai báo ở `client/index.html` và file trong `client/public/`.

## Kết quả Chrome của lần chạy

Base `16554275b2c75070983e84977121818f76b7c500`, Node `v22.16.0`.

| Mode | Route cụ thể đã mở | Số ca | PASS | FAIL | Chưa chạy |
| --- | --- | --- | --- | --- | --- |
| normal | 24 | 28 | 27 | 1 | 0 |
| slow | 22 | 22 | 22 | 0 | 0 |
| error | 22 | 48 | 48 | 0 | 0 |
| empty | 22 | 26 | 26 | 0 | 0 |
| Tổng | — | 124 | 123 | 1 | 0 |

Bảng chính gồm 18 mẫu route của router và trang 404. Một số route tham số được kiểm thêm bằng seed và bằng dữ liệu runtime. Ô slow kiểm thấy loading trước dữ liệu. Ô error ghi số lần bấm Thử lại có xác nhận phục hồi cùng document. Hai trang tĩnh dùng form đăng nhập hoặc thông báo 404 làm dấu hiệu thay cho loading/danh sách. Các ô FAIL dẫn tới bảng lỗi bên dưới.

| Route | Vai trò / tài khoản | Tiền đề | Dấu hiệu dữ liệu normal | normal | slow | error | empty |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | ẩn danh (Public) | seed | Kỷ yếu lớp · Gói Tốt nghiệp Premium · Thuê áo cử nhân · Tốt nghiệp · sân trường · Hồ Gia Bảo | PASS · Lưu giữ những khoảnh khắc đáng nhớ của bạn. | PASS · tải rồi hiện dữ liệu | PASS · 5 nút | PASS · Hiện chưa có dịch vụ chụp ảnh nào · Chưa có gói chụp nào · Hiện chưa có dịch vụ thêm nào · Chưa có ảnh mẫu nào · Chưa có đánh giá nào |
| `/packages/pkg-tn-premium` | ẩn danh (Public) | seed | Gói Tốt nghiệp Premium | PASS · Gói Tốt nghiệp Premium | PASS · tải rồi hiện dữ liệu | PASS · 2 nút | PASS · Chưa có danh sách hạng mục chi tiết · Hiện chưa có dịch vụ thêm nào |
| `/chat` | linh (customer) | seed + yêu cầu ngày 24/10 qua HTTP | Chat với GradStudio · Mình muốn đặt lịch chụp tốt nghiệp | PASS · Chat với GradStudio | PASS · tải rồi hiện dữ liệu | PASS · 2 nút | PASS · Bạn chưa có cuộc trò chuyện nào · Chọn một cuộc trò chuyện bên trái |
| `/my-bookings` | han (customer) | seed | GS-1023 | PASS · Lịch chụp của tôi | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Bạn chưa có lịch chụp nào |
| `/my-bookings/GS-1023` | han (customer) | seed | Thông tin gói chụp | PASS · Lịch chụp GS-1023 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có ca chụp chi tiết |
| `/admin/conversations` | thao (admin) | seed | Linh | PASS · Hội thoại khách hàng | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có hội thoại nào |
| `/admin/conversations/c-linh` | thao (admin) | seed + yêu cầu ngày 24/10 qua HTTP | Đề xuất giờ · Lịch sử booking | PASS · Gói Tốt nghiệp | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có tin nhắn · Chưa có booking trong hội thoại này · Chưa có nhân sự để xếp lịch · Chưa có gói chụp · Chưa có nhân viên chỉnh ảnh · Không có dịch vụ thêm |
| `/admin/bookings` | thao (admin) | seed | GS-1023 | PASS · Booking | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có booking nào |
| `/admin/bookings/GS-1023` | thao (admin) | seed | Áp dụng lịch mới | PASS · Chi tiết booking GS-1023 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có ca trong lịch · Booking này chưa có dịch vụ thêm · Chưa có nhân sự để xếp lịch |
| `/staff/jobs` | mai (staff) | seed | GS-1021 | PASS · Việc của tôi | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · chưa có việc |
| `/staff/jobs/J-GS-1022-shoot` | tuan (staff) | seed | Thông tin công việc | PASS · Chụp ảnh · GS-1022 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có ảnh xem trước |
| `/superadmin/admins` | superadmin (superadmin) | seed | Thảo | PASS · Tài khoản Admin | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có tài khoản Admin nào |
| `/superadmin/settings` | superadmin (superadmin) | seed | Giờ hoạt động & Nhắc lịch | PASS · Cài đặt hệ thống | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Giờ hoạt động & Nhắc lịch |
| `/sign-in` | public → han (Customer) | UI sign-in | Đăng nhập han | PASS · Lịch chụp của tôi | PASS · Lịch chụp của tôi | PASS · Lịch chụp của tôi | PASS · Lịch chụp của tôi |
| `/qa11-missing` | ẩn danh (Public) | router catch-all | Không tìm thấy trang | PASS · Không tìm thấy trang | PASS · Không tìm thấy trang | PASS · Không tìm thấy trang | PASS · Không tìm thấy trang |
| `/my-bookings/GS-1024` | linh (customer) | HTTP G6–G8 | Thông tin gói chụp | PASS · Lịch chụp GS-1024 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có ca chụp chi tiết |
| `/my-bookings/GS-1024/gallery` | linh (customer) | HTTP G6–G8 | Chọn tối đa 30 ảnh | PASS · Chọn ảnh để chỉnh · GS-1024 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Studio chưa đăng ảnh xem trước |
| `/test-gateway/PAY-1` | han (customer) | HTTP G6–G8 | Thanh toán thành công (thử nghiệm) | PASS · Cổng thanh toán thử nghiệm | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Thanh toán thành công (thử nghiệm) |
| `/payments/PAY-2/result` | linh (customer) | HTTP G6–G8 | Đặt cọc thành công | PASS · Kết quả thanh toán | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Đặt cọc thành công |
| `/notifications` | linh (customer) | HTTP G6–G8 | GS-1024 | PASS · Thông báo và nhắc lịch | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có nhắc lịch |
| `/admin/bookings/GS-1024` | thao (admin) | HTTP G6–G8 | Người chỉnh ảnh đã chọn: Tuấn | PASS · Chi tiết booking GS-1024 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có ca trong lịch |
| `/staff/jobs/J-GS-1024-shoot` | tuan (staff) | HTTP G6–G8 | Thông tin công việc | PASS · Chụp ảnh · GS-1024 | PASS · tải rồi hiện dữ liệu | PASS · 1 nút | PASS · Chưa có ảnh xem trước |

### Mở sớm, lỗi theo từng vùng và rỗng lồng nhau

| Mode | Route | Tài khoản / vai trò | Tiền đề | Mong đợi | Thực tế |
| --- | --- | --- | --- | --- | --- |
| normal | `/my-bookings/GS-1024` | linh (customer) | before G6/G7 | Chưa có lịch chụp GS-1024 | FAIL |
| normal | `/my-bookings/GS-1024/gallery` | linh (customer) | before G6/G7 | Chưa có lịch chụp GS-1024 | PASS · Chọn ảnh để chỉnh · GS-1024 |
| normal | `/admin/bookings/GS-1024` | thao (admin) | before G6/G7 | Booking có thể chưa được tạo | PASS · Chi tiết booking GS-1024 |
| normal | `/test-gateway/PAY-99999` | han (customer) | before G6/G7 | Không tìm thấy giao dịch | PASS · Không tìm thấy giao dịch PAY-99999 |
| normal | `/payments/PAY-99999/result` | han (customer) | before G6/G7 | Không tìm thấy kết quả thanh toán | PASS · Không tìm thấy kết quả thanh toán |
| normal | `/staff/jobs/J-GS-1024-shoot` | tuan (staff) | before G6/G7 | Không tìm thấy công việc | PASS · Không tìm thấy công việc |
| error | `/` | ẩn danh (Public) | `/api/services` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Các dịch vụ chụp ảnh → /api/services |
| error | `/` | ẩn danh (Public) | `/api/packages` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Gói chụp và chi tiết → /api/packages |
| error | `/` | ẩn danh (Public) | `/api/extras` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Tùy chọn đi kèm buổi chụp → /api/extras |
| error | `/` | ẩn danh (Public) | `/api/portfolio` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Bộ sưu tập minh họa → /api/portfolio |
| error | `/` | ẩn danh (Public) | `/api/reviews` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Cảm nhận từ khách hàng → /api/reviews |
| error | `/packages/pkg-tn-premium` | ẩn danh (Public) | `/api/packages/pkg-tn-premium` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/packages/pkg-tn-premium |
| error | `/packages/pkg-tn-premium` | ẩn danh (Public) | `/api/extras` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Dịch vụ thêm đi kèm → /api/extras |
| error | `/chat` | linh (customer) | `/api/conversations` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/conversations, /api/conversations/c-linh |
| error | `/chat` | linh (customer) | `/api/services` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Gửi yêu cầu đặt lịch → /api/services, /api/packages, /api/extras |
| error | `/chat` | linh (customer) | `/api/packages` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Gửi yêu cầu đặt lịch → /api/services, /api/packages, /api/extras |
| error | `/chat` | linh (customer) | `/api/extras` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Dịch vụ thêm (tùy chọn, không tính giá riêng) → /api/extras |
| error | `/chat` | linh (customer) | `/api/conversations/c-linh` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/conversations/c-linh |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/conversations/c-linh` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/conversations/c-linh, /api/bookings, /api/schedule, /api/packages, /api/extras, /api/resources |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/bookings` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Lịch sử booking → /api/bookings, /api/conversations/c-linh, /api/schedule, /api/packages, /api/extras, /api/resources |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/resources` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Kiểm tra và đề xuất giờ → /api/resources |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/schedule` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Kiểm tra và đề xuất giờ → /api/schedule |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/packages` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Booking mới → /api/packages |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/extras` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Dịch vụ thêm → /api/extras |
| error | `/admin/bookings/GS-1023` | thao (admin) | `/api/bookings/GS-1023` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/bookings/GS-1023, /api/resources |
| error | `/admin/bookings/GS-1023` | thao (admin) | `/api/resources` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Đổi lịch → /api/resources |
| error | `/staff/jobs/J-GS-1022-shoot` | tuan (staff) | `/api/jobs/J-GS-1022-shoot` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/jobs/J-GS-1022-shoot, /api/bookings/GS-1022, /api/bookings/GS-1022/photos |
| error | `/staff/jobs/J-GS-1022-shoot` | tuan (staff) | `/api/bookings/GS-1022` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Thông tin công việc → /api/bookings/GS-1022 |
| error | `/staff/jobs/J-GS-1022-shoot` | tuan (staff) | `/api/bookings/GS-1022/photos` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Thêm ảnh preview → /api/bookings/GS-1022/photos |
| error | `/admin/conversations/c-linh` | thao (admin) | `/api/resources` · form người chỉnh | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Booking mới → /api/resources |
| empty | `/chat` | linh (customer) | `/api/conversations/c-linh` | Chưa có tin nhắn | PASS · Chưa có tin nhắn |
| empty | `/chat` | linh (customer) | `/api/packages` | Chưa tải được danh sách gói chụp | PASS · Chưa tải được danh sách gói chụp |
| empty | `/chat` | linh (customer) | `/api/extras` | Hiện không có dịch vụ thêm | PASS · Hiện không có dịch vụ thêm |
| empty | `/admin/conversations/c-linh` | thao (admin) | `/api/schedule` | Không có tài nguyên trong lịch ngày này | PASS · Không có tài nguyên trong lịch ngày này |
| error | `/my-bookings/GS-1024/gallery` | linh (customer) | `/api/bookings/GS-1024` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Trang → /api/bookings/GS-1024, /api/bookings/GS-1024/photos |
| error | `/my-bookings/GS-1024/gallery` | linh (customer) | `/api/bookings/GS-1024/photos` | 500, có Thử lại, phục hồi đúng GET trong cùng trang | PASS · Ảnh xem trước và lựa chọn chỉnh sửa → /api/bookings/GS-1024/photos |

### Chi tiết ca lỗi hoặc chưa chạy

- `/my-bookings/GS-1024` · normal · **FAIL**. browser errors + actual - expected  + [ +   '404 http://127.0.0.1:4181/favicon.ico' + ] - []

### ID của dữ liệu chuẩn bị qua HTTP

- normal · `GS-1024`, `J-GS-1024-shoot`, `/test-gateway/PAY-1`, `/payments/PAY-2/result`, `ph-01`.
- slow · `GS-1024`, `J-GS-1024-shoot`, `/test-gateway/PAY-1`, `/payments/PAY-2/result`, `ph-01`.
- empty · `GS-1024`, `J-GS-1024-shoot`, `/test-gateway/PAY-1`, `/payments/PAY-2/result`, `ph-01`.

## Kiểm lại sau khi sửa favicon và Routes · 28/11/2026

- Checkout `e0e966e` với diff sửa favicon và hai dòng Routes. Build lại bằng `npm.cmd run build` trong `client/` rồi chạy lại `node tools/qa11-app-check.mjs` trên Vite preview với Chrome profile mới.
- Ca normal trước G6 dùng phiên `linh`, mở trực tiếp `/my-bookings/GS-1024` và thấy “Chưa có lịch chụp GS-1024”. `GET /api/bookings/GS-1024 → 404` vẫn đúng ở thời điểm này.
- Ở ca kiểm riêng với mock normal và Chrome profile mới, đăng nhập `linh` qua form rồi mở URL trên. DevTools ghi `POST /api/auth/login → 200`, `GET /api/auth/me → 200` và `GET /favicon.svg → 200 image/svg+xml`, không có icon 404 hay lỗi trình duyệt. Kiểm HTTP trên preview của ma trận cũng xác nhận HTML khai báo đúng icon.
- Dòng Routes chi tiết việc Staff ghi `GET /api/bookings/:code` theo `StaffJobDetailPage.jsx`. Dòng chi tiết gói ghi `GET /api/extras` theo `PackageDetailPage.jsx`. Cả hai đã có trong contract. Trace normal ghi `GET /api/bookings/GS-1022 → 200` khi `tuan` mở việc `J-GS-1022-shoot` và `GET /api/extras → 200` khi mở `/packages/pkg-tn-premium`.
- W3C Nu, responsive toàn app, F5 mọi route và toàn chuỗi chọn ảnh → trả 70% → nhận ảnh chưa được kiểm ở lượt này. Giới hạn đổi lịch trong `FRONTEND.md` §7 vẫn áp dụng.

| Mode | PASS | FAIL | Chưa chạy |
| --- | ---: | ---: | ---: |
| normal | 28 | 0 | 0 |
| slow | 22 | 0 | 0 |
| error | 48 | 0 | 0 |
| empty | 26 | 0 | 0 |
| **Tổng lượt kiểm lại** | **124** | **0** | **0** |

Harness thoát 0. Ma trận 123/124 ở trên là bằng chứng của lượt trước khi sửa.
