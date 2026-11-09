# GradStudio — PA#2 Responsive Prototype

## 1. Team

| STT | Họ và tên | Mã số sinh viên (MSSV) | Email sinh viên | Vai trò trong nhóm |
| :---: | :--- | :---: | :--- | :--- |
| 1 | Lê Quốc Hưng | 24120184 | 24120184@student.hcmus.edu.vn | Trưởng nhóm / Kiến trúc & Màn hình Dịch vụ (`index.html`) |
| 2 | Lê Công Minh Nhựt | 24120211 | 24120211@student.hcmus.edu.vn | Thành viên / Màn hình Điều phối Studio (`studio.html`) & Xử lý xung đột |
| 3 | Đặng Hoàng Tuấn Kiệt | 24120354 | 24120354@student.hcmus.edu.vn | Thành viên / Màn hình Booking (`booking.html`), Responsive & Kiểm thử W3C/E2E |

---

## 2. How to Open It (Hướng dẫn khởi chạy)

Prototype được xây dựng bằng React 19 + Vite 7, biên dịch ra static HTML/CSS/JS thuần trong thư mục `dist/` kèm bước pre-render (`scripts/prerender.cjs`) nhúng sẵn toàn bộ DOM ngữ nghĩa vào `<div id="root">...</div>` của cả 3 file `dist/index.html`, `dist/studio.html`, `dist/booking.html`.

- **Môi trường yêu cầu:**
  - Chạy tương tác đầy đủ qua HTTP server cục bộ với trình duyệt bật JavaScript (theo thông báo cập nhật PA#2 cho phép sử dụng React).
  - Nhờ bước pre-render tĩnh trong `dist/*.html`, khi tắt JavaScript hoặc tải trực tiếp file lên W3C Nu HTML Checker, cả 3 trang vẫn hiển thị đầy đủ nội dung, landmark (`<header>`, `<nav>`, `<main>`, `<footer>`), tiêu đề `<h1>`, liên kết tương đối và đạt **0 lỗi, 0 cảnh báo**.
- **Khả năng hoạt động offline:** **100% Offline** — Hoạt động hoàn toàn không cần kết nối Internet (Zero external CDN, Zero external fonts, system fonts Georgia / system-ui, toàn bộ SVG và ảnh minh họa lưu trữ cục bộ).
- **Cách mở nhanh bản production build (khuyến nghị cho chấm bài):**
  ```bash
  # Cách 1: Chạy qua HTTP server cục bộ tại thư mục dist/
  python3 -m http.server 5173 --directory dist
  # Sau đó truy cập:
  # - Screen 1: http://localhost:5173/index.html
  # - Screen 2: http://localhost:5173/studio.html
  # - Screen 3: http://localhost:5173/booking.html

  # Cách 2: Dùng Vite preview
  npm run preview
  ```
- **Lệnh build từ source:**
  ```bash
  npm install
  npm run build
  ```
- **Lệnh chạy kiểm thử tự động (Playwright Chromium):**
  ```bash
  npm test
  ```

---

## 3. Screens (Bảng danh sách màn hình và luồng điều hướng)

| Tên file HTML | Màn hình trong brief | Hành động chính của người dùng | Các liên kết và đích đến (Relative Links) |
| :--- | :--- | :--- | :--- |
| **`index.html`** (`dist/index.html`) | **Screen 1 — Khám phá dịch vụ & Tư vấn (Customer Home)** | • Khám phá 3 gói dịch vụ chụp kỷ yếu, tốt nghiệp, chân dung.<br>• Xem kho ảnh mẫu (Contact sheet) theo từng chủ đề.<br>• Mở xem ảnh phóng to, kéo thả ảnh vào khung xem.<br>• Mở khung chat tư vấn với studio (nổi trên desktop, nằm trong luồng trang trên mobile ≤767px). | • `studio.html`: Liên kết "Tiếp tục tư vấn gói này" trên gói Tốt nghiệp.<br>• `booking.html`: Liên kết "Lịch của tôi", menu tài khoản Linh.<br>• `#dich-vu`: Neo cuộn đến phần Danh sách dịch vụ.<br>• `#quy-trinh`: Neo cuộn đến phần 4 bước quy trình.<br>• Nút Chat: Mở khung chat tư vấn với câu hỏi ban đầu của Linh. |
| **`studio.html`** (`dist/studio.html`) | **Screen 2 — Quản lý hội thoại & Lịch tài nguyên (Admin Thảo)** | • Tìm kiếm khách hàng theo tên/nội dung hội thoại.<br>• Lọc hội thoại theo trạng thái (`Chưa trả lời`, `Đang tư vấn`, `Đã chốt lịch`).<br>• Xem chi tiết tin nhắn khách Linh đã chốt giờ 14:00 (cuộn tự nhiên theo trang, không có thanh cuộn lồng), gửi phản hồi hoặc báo giá.<br>• Xem và thao tác form "Booking mới" đầy đủ các trường.<br>• Xem bảng phân bổ lịch tài nguyên (thợ chụp, makeup, phòng chụp) kèm lý do xung đột 09:00 và đổi ngày xem. | • `booking.html`: Nút "Tạo booking" (chỉ kích hoạt khi khách Linh ở trạng thái `Đã chốt lịch`), liên kết "Booking" trên header.<br>• `index.html`: Liên kết "Trang dịch vụ", logo GradStudio.<br>• Nút đổi ngày / chọn giờ: Cập nhật dữ liệu tài nguyên và kiểm tra xung đột theo thời gian thực. |
| **`booking.html`** (`dist/booking.html`) | **Screen 3 — Xem lịch hẹn & Thanh toán cọc (Customer Linh)** | • Xem lịch hẹn chi tiết mã **GS-1024** (Thứ Bảy, 24/10/2026).<br>• Xem giờ cũ 09:00 bị gạch bỏ kèm lý do xung đột (Mai bận makeup 08:00–12:00) và giờ đã thống nhất (Makeup 13:00–14:00 với Mai, Chụp 14:00–16:00 với Tuấn tại Phòng B).<br>• Xem chi tiết hóa đơn (Tổng: 1.800.000đ, Cọc 30%: 540.000đ, Còn lại 70%: 1.260.000đ).<br>• Lọc danh sách lịch hẹn theo trạng thái.<br>• Nút "Thanh toán cọc 30% · 540.000đ" ở trạng thái `disabled` kèm giải thích rõ ràng. | • `studio.html`: Liên kết "Mở góc nhìn Studio · Thảo".<br>• `index.html`: Liên kết "Dịch vụ", logo GradStudio.<br>• Menu tài khoản Linh: Xem "Tài khoản của tôi", "Lịch chụp của tôi", "Ảnh đã chọn". |

---

## 4. Changed since the brief (Những thay đổi so với bản brief gốc và lý do)

Dự án đã giải quyết toàn bộ các vấn đề trong danh sách **"Fix these"** của đề bài cùng các tinh chỉnh thiết kế:

| Vấn đề trong brief ("Fix these") | Giải pháp hiện thực trong Prototype | Lý do thay đổi / Căn cứ |
| :--- | :--- | :--- |
| **1. Hình ảnh người thật chưa rõ bản quyền (Photos of real people)** | Thay thế toàn bộ ảnh người thật chưa kiểm chứng bản quyền bằng bộ ảnh minh họa người mẫu hư cấu tạo riêng cho đồ án bằng công cụ AI Image Generation (`public/art/graduation-portrait.png`, `graduation-group.png`, `graduation-diploma.png`, `portrait-window.png`, `family-afternoon.png`, `couple-garden.png`) và đồ họa vector SVG tự vẽ (`public/art/graduation.svg`, `src/art.svg`). | Tuân thủ yêu cầu bản quyền của brief ("Use illustrations or initials, or licensed images whose source you name in PROTOTYPE.md"). |
| **2. Các nút điều khiển demo không thuộc sản phẩm (Demo controls)** | Loại bỏ hoàn toàn thanh `Màn 1 / Màn 2 / Màn 3`, `Đặt lại demo`, `Mô phỏng phản hồi của Linh` và `Mô phỏng thanh toán`. Chuyển màn bằng các liên kết ngữ cảnh có nhãn rõ vai trò người tiếp tục (ví dụ: `Tiếp tục tư vấn gói này`, `Tạo booking`, `Mở góc nhìn Studio · Thảo`). | Đảm bảo giao diện phản ánh sản phẩm thực tế thay vì thanh điều khiển bản nháp. |
| **3. Hành động chưa có trang tiếp theo & liên kết dẫn đến `#` (Actions with no next page & Things that lead nowhere)** | • Nút `"Thanh toán cọc 30% · 540.000đ"` trên `booking.html` được đặt `disabled` kèm chú thích hiển thị ngay bên dưới.<br>• Loại bỏ các mục điều hướng thừa không có màn hình trong PA#2 (`Lịch studio`, `Tài nguyên`, `Nhân sự`, `Xem đường đi`).<br>• Toàn bộ liên kết `<a>` đều dùng đường dẫn tương đối hợp lệ (`index.html`, `studio.html`, `booking.html`, `#dich-vu`, `#quy-trinh`), tuyệt đối không có `href="#"`. | Tuân thủ quy định điều hướng và kiểm chuẩn W3C của rubric. |
| **4. Một trạng thái tĩnh trên mỗi trang & Một câu chuyện xuyên suốt (One state per page & One story)** | • **Screen 1 (`index.html`)**: Linh tìm gói tốt nghiệp và hỏi lịch 24/10 lúc 09:00 trong chat.<br>• **Screen 2 (`studio.html`)**: Trạng thái sau khi Linh đồng ý giờ 14:00, hội thoại `Đã chốt lịch`, nút `Tạo booking` được kích hoạt, báo rõ xung đột 09:00 do Mai bận 08:00–12:00.<br>• **Screen 3 (`booking.html`)**: Booking `GS-1024` (`Gói Tốt nghiệp Premium`, 2 giờ, 30 ảnh chỉnh sửa, tổng 1.800.000đ, cọc 540.000đ, còn lại 1.260.000đ) ở trạng thái `Chờ cọc 30%`. | Đảm bảo tính nhất quán dữ liệu nghiệp vụ xuyên suốt 3 màn hình theo Mục 3 & Mục 5 của brief. |
| **5. Form Screen 2 bị che khuất và thanh cuộn lồng nhau (Form cut off & nested scrollbar)** | Bỏ chiều cao cố định và thanh cuộn riêng của `.message-thread` trên `studio.html`; toàn bộ cuộc trò chuyện và toàn bộ form `Booking mới` đều nằm trong luồng cuộn của trang ở mọi độ rộng (360px, 768px, 1280px). | Khắc phục triệt để lỗi cắt form và thanh cuộn lồng nhau trên màn hình nhỏ. |
| **6. Lịch tài nguyên cắt chữ (Labels cut off on resource calendar)** | Thiết kế bảng phân bổ tài nguyên kết hợp danh sách chi tiết theo mã số `① ② ③ ④` hiển thị trọn vẹn tên khách hàng, gói chụp và trạng thái (`Linh · Makeup trước ca chụp`, `GS-1024 · Linh (Chụp tốt nghiệp)`), không bị cắt chữ `...`. Xung đột được thể hiện bằng cả nhãn chữ (`Trùng lịch`, `Không khả dụng`), biểu tượng `⚠` và họa tiết viền, không chỉ dựa vào màu sắc. | Đảm bảo khả năng đọc ở mọi kích thước màn hình và đạt chuẩn trợ năng WCAG. |
| **7. Hộp chat Screen 1 che nội dung ở 360px (Chat box covers content at 360px)** | Trên màn hình điện thoại (`≤767px`), khung chat khi mở được đặt trực tiếp vào luồng trang (`position: relative`) với độ cao tự nhiên, không nổi đè che bất kỳ nội dung nào phía sau. Có nút đóng (`×`) và hỗ trợ phím `Escape` trả focus về nút mở. | Đảm bảo ở độ rộng 360px không có nội dung nào của trang bị khung chat che khuất. |
| **8. Screen 1 hứa hẹn giữ lịch quá sớm (Promises too early)** | Viết lại Bước 4 trong phần quy trình (`#quy-trinh` trên `index.html`): *"Cọc thành công và kiểm tra lại — lúc đó lịch mới được giữ. Lịch chỉ được giữ chính thức sau khi giao dịch cọc thành công và tài nguyên được kiểm tra lại."* | Khớp chính xác với quy tắc nghiệp vụ ở Mục 3 của brief. |
| **9. Đồng nhất tên trạng thái & Nâng cấp bảng màu Blue Theme** | • Chuẩn hóa tên trạng thái trên cả 3 trang: Hội thoại (`Chưa trả lời`, `Đang tư vấn`, `Đã chốt lịch`, `Hoàn thành`); Booking (`Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`).<br>• Áp dụng hệ thống thiết kế Editorial kết hợp bảng màu Blue Theme (`#2F6099`, `#1D3E5C`, `#DFEEFC`, `#EDF5FD`) và điểm nhấn Terracotta (`#B94D32`). | Đảm bảo tính nhất quán thuật ngữ và phân cấp thị giác rõ ràng. |

---

## 5. Not Wired Yet (Các chức năng chưa liên kết trong Prototype)

Để giữ đúng phạm vi bản prototype theo yêu cầu của đề tài PA#2, các chức năng sau chỉ dừng ở mức hiển thị giao diện minh họa (demo fixtures) và chưa liên kết backend:

1. **Cổng thanh toán trực tuyến (Online Payment Gateway):** Nút *"Thanh toán cọc 30% · 540.000đ"* trên `booking.html` được đặt ở trạng thái vô hiệu hóa (`disabled`) kèm chú thích minh họa rõ ràng. Chưa tích hợp cổng thanh toán thực tế.
2. **Đăng nhập / Đăng xuất tài khoản thật (Authentication):** Menu người dùng Linh hiển thị thông tin demo có sẵn kèm ghi chú *"Đăng xuất chưa khả dụng trong prototype"*.
3. **Lưu trữ dữ liệu máy chủ (Backend Persistence):** Dữ liệu chat demo được lưu tạm thời trong `sessionStorage` của trình duyệt để giữ nội dung khi chuyển giữa các trang trong cùng phiên làm việc.
4. **Tìm kiếm & Lọc hội thoại phía máy chủ:** Thanh tìm kiếm và bộ lọc trạng thái trong Studio hoạt động trên tập dữ liệu 5 hội thoại mẫu tại client.
5. **Đăng tải & Giao file ảnh:** Mục "Ảnh đã chọn" trong menu tài khoản hiển thị danh sách mã ảnh minh họa của booking, chưa kết nối kho lưu trữ file thật.

---

## 6. CSS Architecture & Design System

### 6.1. Phương pháp tổ chức CSS
- Sử dụng **Plain CSS** (CSS thuần) được chia thành 5 module theo thứ tự thác đổ (cascade) trong `src/styles/` và tổng hợp tại [`src/styles.css`](file:///home/hungj2020/Documents/User/hc%20tap/hk1-3/Web/PA#2/GradStudio/src/styles.css):
  - `src/styles/base-and-pages.css`: Design tokens `:root`, reset, typography, shared header/footer và bố cục cơ sở.
  - `src/styles/responsive-layout.css`: Các breakpoint đáp ứng cho mobile (`360px`), tablet (`768px`), desktop (`1280px+`).
  - `src/styles/chat-and-motion.css`: Khung chat tư vấn (nổi trên desktop, nằm trong luồng trang trên mobile) và hiệu ứng chuyển động.
  - `src/styles/studio-workspace.css`: Bố cục 3 cột của Studio Workspace, form booking và bảng lịch tài nguyên.
  - `src/styles/editorial-refinements.css`: Hiệu ứng nền cuộn và tinh chỉnh typography phong cách biên tập.
- Không sử dụng CSS framework ngoài, không tải font hay script từ CDN mạng.
- **0 khai báo `!important` trong toàn bộ định kiểu component/layout** (chỉ sử dụng duy nhất 1 dòng `@media (prefers-reduced-motion: reduce)` để tắt animation/transition theo chuẩn trợ năng).

### 6.2. Thang đo khoảng cách (Spacing Scale)
Dựa trên bội số chuẩn của 4px (0.25rem):
- `--space-1: 0.25rem` (4px)
- `--space-2: 0.5rem` (8px)
- `--space-3: 0.75rem` (12px)
- `--space-4: 1rem` (16px)
- `--space-6: 1.5rem` (24px)
- `--space-8: 2rem` (32px)
- `--space-12: 3rem` (48px)
- `--space-16: 4rem` (64px)

### 6.3. Bảng màu Design Tokens
- `--primary: #2F6099` (Xanh dương chủ đạo)
- `--primary-dark: #1D3E5C` (Xanh navy đậm — tiêu đề, bong bóng chat quản trị)
- `--primary-light: #DFEEFC` (Xanh nhạt — nền phụ)
- `--primary-hover: #244F80` (Xanh hover nút bấm)
- `--primary-soft: #EDF5FD` (Xanh pastel dịu mắt)
- `--surface: #FFFEFA` (Trắng ấm bề mặt thẻ)
- `--ink: #20201E` (Xám than đậm chữ chính)
- `--muted: #56564F` (Xám chữ phụ)
- `--line: #D8D6CF` (Viền trung tính)
- `--coral: #A9432B` (Đỏ gạch Terracotta — điểm nhấn biên tập)

### 6.4. Breakpoints Responsive
- **360px (Mobile First):** Bố cục 1 cột dọc, điều hướng hiển thị trực tiếp không ẩn sau nút cần JS, mọi nút bấm/liên kết độc lập đạt chiều cao tối thiểu $\ge 44\text{px}$, chat nằm trong luồng trang, không tràn ngang (`scrollWidth <= clientWidth`, `outside = []`).
- **768px (Tablet):** Bố cục lưới 2 cột cân đối cho gallery và danh sách gói dịch vụ.
- **1280px (Desktop):** Bố cục 3 cột hoàn chỉnh cho Studio Workspace (Danh sách hội thoại – Chi tiết chat & Form booking – Lịch tài nguyên).
- **1440px (Large Screen):** Giới hạn độ rộng container tối đa `1320px` giúp giữ nhịp điệu thị giác.

---

## 7. Automated Verification & Quality Assurance (Kiểm thử & Bằng chứng)

1. **Bộ kiểm thử tự động Playwright (`tests/ui.test.cjs`):**
   - Đạt **31/31 test suites (100% PASS)**.
   - Kiểm tra tự động cả 3 màn hình ở 360px, 768px, 1280px, 1440px.
   - Xác nhận không tràn ngang (`overflow: false`), không có phần tử nào vượt mép phải khung nhìn (`outside: []`), không có ảnh hỏng (`broken: 0`), không có tap target độc lập nào dưới ngưỡng (`small: []`).
   - Kết quả lưu tại: [`checks/ui-test-results.json`](file:///home/hungj2020/Documents/User/hc%20tap/hk1-3/Web/PA#2/GradStudio/checks/ui-test-results.json).

2. **Kiểm tra chuẩn cú pháp W3C Nu HTML Checker (`https://validator.w3.org/nu/`):**
   - Đã chạy kiểm tra trực tiếp các file HTML đã pre-render trong `dist/` qua W3C Nu HTML Checker, đạt **0 ERRORS và 0 WARNINGS** trên cả 3 trang (`The document validates according to the specified schema(s).`).
   - Báo cáo lưu tại thư mục `checks/`:
     - [`checks/validator-index.txt`](file:///home/hungj2020/Documents/User/hc%20tap/hk1-3/Web/PA#2/GradStudio/checks/validator-index.txt)
     - [`checks/validator-studio.txt`](file:///home/hungj2020/Documents/User/hc%20tap/hk1-3/Web/PA#2/GradStudio/checks/validator-studio.txt)
     - [`checks/validator-booking.txt`](file:///home/hungj2020/Documents/User/hc%20tap/hk1-3/Web/PA#2/GradStudio/checks/validator-booking.txt)

3. **Ảnh chụp màn hình đầy đủ (9 full-page screenshots):**
   - Đầy đủ 9 ảnh full-page ở 3 độ rộng (360px, 768px, 1280px) lưu tại thư mục [`screenshots/`](file:///home/hungj2020/Documents/User/hc%20tap/hk1-3/Web/PA#2/GradStudio/screenshots/):
     - `index-360.png`, `index-768.png`, `index-1280.png`
     - `studio-360.png`, `studio-768.png`, `studio-1280.png`
     - `booking-360.png`, `booking-768.png`, `booking-1280.png`
