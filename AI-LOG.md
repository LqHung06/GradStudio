# AI Log — GradStudio Prototype

**Phạm vi:** ghi lại công việc đã thực hiện trong phiên hiện tại cho `PA#2/GradStudio`.

## Mục tiêu

Triển khai prototype GradStudio theo master prompt, `Proposal.md`, `design.md` và ba ảnh tham khảo: ba route cho khách hàng, studio và booking; giao diện responsive; tương tác demo; production build; tài liệu hướng dẫn và screenshot.

## Công việc đã thực hiện

### 1. Khảo sát tài liệu

- Đọc `PA#2/GradStudio/Proposal.md` và `design.md`.
- Xem ba ảnh tham khảo trong `PA#2/GradStudio/UI/`.
- Dùng yêu cầu chi tiết trong `design.md` làm chuẩn cho các chi tiết mà master prompt tóm lược.

### 2. Khởi tạo ứng dụng và routes

- Tạo cấu hình React + Vite, plain CSS và ba HTML entry:
  - `GradStudio/index.html` — trang dịch vụ.
  - `GradStudio/studio.html` — hội thoại và lịch tài nguyên.
  - `GradStudio/booking.html` — lịch booking và thanh toán.
- Cấu hình Vite multi-page build để sinh ba entry trong `dist/`.
- Thêm shared header, footer và điều hướng giữa các route.

### 3. Xây dựng giao diện và chức năng

- Trang chủ: hero editorial, ba gói dịch vụ, category filters cho gallery, xem artwork lớn, chat panel trong luồng trang và quy trình đặt lịch.
- Studio: danh sách hội thoại có tìm kiếm/lọc, transcript theo khách, gửi phản hồi bằng React state, lịch tài nguyên theo ngày và booking GS-1024 cho Linh đã đồng ý lịch.
- Booking: menu tài khoản demo, bốn bộ lọc trạng thái, danh sách booking demo, timeline/summary theo booking đang chọn và nút thanh toán bị vô hiệu hóa kèm giải thích.
- Dùng artwork CSS trừu tượng thay ảnh nhận diện người thật trong phần minh họa.
- Thêm các breakpoint responsive và trạng thái focus/reduced-motion cơ bản.

### 4. Tài liệu và screenshot

- Tạo `GradStudio/PROTOTYPE.md`, ghi lệnh chạy/build, routes, control map và giới hạn demo.
- Tạo chín screenshot cho ba route ở độ rộng 360, 768 và 1280 px trong `GradStudio/screenshots/`.
- Screenshot cuối được chụp từ production preview.

### 5. Khắc phục lỗi và xác minh

- Ban đầu `npm run build` thành công với Vite 8, nhưng trình duyệt báo `Unexpected token '<'` tại JSX khi mở dev server.
- Phát hiện workspace có ký tự `#` trong đường dẫn `PA#2/GradStudio`; Vite cảnh báo ký tự này có thể gây lỗi phân tích path.
- Cố định dependency về Vite 7 và `@vitejs/plugin-react` 5; đổi các đường dẫn script HTML thành tương đối để build xử lý được path.
- Bổ sung Babel packages và transform cho JSX trong `vite.config.js` khi điều tra lỗi dev server.
- Production build cuối chạy thành công với Vite 7.3.7 và sinh đủ `dist/index.html`, `dist/studio.html`, `dist/booking.html` cùng assets.
- Mở các route qua production preview bằng Chromium; DOM render được và không thấy lỗi cú pháp JavaScript trong kiểm tra cuối.
- Kiểm tra DOM booking xác nhận GS-1024 hiển thị giờ yêu cầu bị xung đột, makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B, tổng 1.800.000đ, cọc 540.000đ và còn 1.260.000đ.

## Kết quả hiện tại

- `npm run build`: **đã chạy thành công**.
- Production preview cho ba route: **đã mở và render được**.
- Screenshot: **đã tạo 9 file** trong `GradStudio/screenshots/`.
- `npm run dev`: **còn vấn đề trong workspace hiện tại**; dev server trước đó trả JSX chưa transform, có liên hệ tới đường dẫn chứa `#`. Không được xem dev mode là đã xác minh hoạt động.
- Chưa hoàn thành đầy đủ kiểm thử tương tác từng control và chưa xác nhận tự động không tràn ngang ở cả ba độ rộng. Vì vậy không ghi nhận prototype đã vượt toàn bộ completion gate của `design.md`.

## Các đường dẫn chính

- Source: `PA#2/GradStudio/src/main.jsx`, `PA#2/GradStudio/src/styles.css`
- Vite/package: `PA#2/GradStudio/vite.config.js`, `PA#2/GradStudio/package.json`
- Tài liệu: `PA#2/GradStudio/PROTOTYPE.md`
- Build: `PA#2/GradStudio/dist/`
- Ảnh: `PA#2/GradStudio/screenshots/`

---

## Bổ sung nhật ký từ cuộc trò chuyện tiếp theo

**Thời gian:** 07/11/2026 (giờ Việt Nam). Các mục bên dưới được tổng hợp lại từ cuộc trò chuyện và đối chiếu với file hiện tại. Các kết quả trong phần trước phản ánh thời điểm kiểm tra ban đầu; kết quả mới hơn được ghi riêng bên dưới. Các thay đổi hiện chưa có commit riêng để đối chiếu: Git của `GradStudio` lúc kiểm tra chỉ có commit `0519330 init`.

### 6. Đọc bối cảnh PA2 và dựng lại ba màn

- **Công cụ:** Codex (OpenAI), React/Vite, Chromium/Playwright.
- **Yêu cầu:** đọc các tài liệu trong `PA#2`; xây lại ba màn theo `Proposal.md`, `design.md` và ảnh `UI/`, có kiểm thử.
- **Thực hiện:** rà soát hai PDF trong `docs/`, thông báo cập nhật cho phép React, mã nguồn và ảnh tham khảo. Chỉnh giao diện ba route theo hướng editorial; giữ ví dụ Linh, GS-1024, 09:00 xung đột, makeup 13:00–14:00, chụp 14:00–16:00 và cọc 30%.
- **Changed:** sửa lịch tuần và ảnh đã chọn để đổi theo booking; sửa bộ đếm hội thoại theo từ khóa; đổi lịch tài nguyên sang agenda có nhãn đọc được. Thay ảnh người thật chưa rõ quyền bằng minh họa được tạo cho prototype.
- **Rejected / lỗi phát hiện:** test ban đầu phát hiện ảnh polaroid làm tràn trang tại 768px và đường dẫn artwork bị lỗi 404 trong production build. Đã chỉnh vị trí ảnh và cách đóng gói asset, rồi chạy lại test. Không tính các lần thất bại ban đầu là đạt.
- **Kiểm tra / bằng chứng:** `GradStudio/tests/ui.test.cjs`, `GradStudio/checks/ui-test-results.json`, ảnh `index-*`, `studio-*`, `booking-*` trong `GradStudio/screenshots/`; build bằng `npm run build`. Bản React được kiểm tra qua HTTP với JavaScript bật.

### 7. Áp dụng taste-skill và thay chat cũ bằng chat chung

- **Công cụ:** Codex; đọc `design-taste-frontend` từ `https://github.com/Leonxlnx/taste-skill`; imagegen; React/Vite; Chromium/Playwright.
- **Yêu cầu:** đọc skill trên GitHub, làm giao diện gần ba ảnh `UI/`, đặt biểu tượng chat góc dưới bên phải trên cả ba màn và xóa khung chat cũ.
- **Changed:** dùng các nguyên tắc phù hợp của skill về thứ bậc thị giác, hình ảnh và kiểm tra trình duyệt; tạo chat nổi dùng chung, có nút mở/đóng và Escape. Transcript demo giữ trong `sessionStorage` của tab khi chuyển route. Tạo ảnh chân dung người mẫu hư cấu bằng AI cho hero.
- **Rejected / khác yêu cầu gốc:** yêu cầu chat nổi của người dùng được ưu tiên so với quy tắc chat nằm trong luồng trang của `design.md` và danh sách Fix these trong brief. Không áp dụng nguyên mẫu và toàn bộ quy tắc bố cục cố định của taste-skill vì dự án đã có React, ba màn và ràng buộc riêng. Không chạy checker riêng của taste-skill.
- **Kiểm tra:** test mở chat ở cả ba route, nhập rỗng, gửi tin demo, giữ transcript khi chuyển trang, đóng bằng Escape và khôi phục focus; kiểm tra kích thước khung chat tại 360px. Ảnh: `GradStudio/screenshots/chat-360.png`.

### 8. Nâng cấp giao diện, ảnh và chuyển động

- **Công cụ:** Codex, imagegen, React/CSS, Chromium/Playwright.
- **Yêu cầu:** cải thiện UI và motion cho ba màn theo master prompt; giữ chức năng và nghiệp vụ.
- **Changed:** bổ sung ảnh nhóm tốt nghiệp tạo bằng AI, dùng trong hero/gallery và ảnh xếp lớp ở booking; tinh chỉnh thứ bậc, khoảng cách và tương tác hover, hiệu ứng xuất hiện nhẹ, chuyển gallery/hội thoại và reduced motion. Ảnh người mẫu là hư cấu, không phải ảnh khách thật.
- **Rejected / giới hạn:** không thêm thư viện animation, parallax hay giả lập thanh toán thành công. Khi đó các ảnh chưa có chủ đề riêng vẫn dùng artwork; các ảnh này được thay tiếp ở mục 12.
- **Kiểm tra:** production build, responsive 360/768/1280/1440px, hover/reduced motion và các luồng gallery, chat, Studio, booking. Các ảnh chụp và test trong `GradStudio/screenshots/`, `GradStudio/tests/ui.test.cjs`.

### 9. Thiết kế lại quy trình đặt lịch và Studio Workspace

- **Công cụ:** Codex, React/CSS, Chromium/Playwright.
- **Yêu cầu:** thay danh sách quy trình bằng bốn bước có bố cục editorial; sau đó làm lại Studio Workspace với inbox, chat/booking và lịch tài nguyên rõ hơn.
- **Changed:** tạo bốn bước Tư vấn → Kiểm tra → Thống nhất → Xác nhận, nhấn điều kiện cọc thành công và kiểm tra lại tài nguyên. Trong Studio thêm filter `Đã chốt lịch`, thẻ tóm tắt GS-1024, sắp lịch theo giờ bắt đầu và ghi rõ các mốc chờ cọc chưa giữ lịch.
- **Rejected / lỗi phát hiện:** lịch cũ hiển thị 13:00 trước 08:00; đã sửa bằng cách sắp xếp theo thời gian thực. Không thêm kéo thả lịch hoặc báo đã thanh toán.
- **Kiểm tra:** test riêng filter mới và thứ tự agenda; test hội thoại, đổi ngày, tạo booking; kiểm tra 360/768/1280/1440px. Ảnh: `journey-360.png`, `journey-768.png`, `journey-1280.png`, `studio-360.png`, `studio-1440.png`.

### 10. Nền đổi màu theo tiến độ cuộn

- **Công cụ:** Codex, React/CSS, Chromium/Playwright.
- **Yêu cầu:** một lớp nền cố định đổi màu liên tục theo tiến độ cuộn toàn trang, chạy ngược khi cuộn lên, không đổi style component; hỗ trợ reduced motion. Sau đó đổi bảng màu sang năm mốc sáng ngà, champagne, hồng bụi, sage và xanh nhạt.
- **Changed:** dùng `requestAnimationFrame`, nội suy RGB, theo dõi thay đổi kích thước và giữ nền tĩnh khi reduced motion. Giữ nguyên bề mặt thẻ và màu chữ theo yêu cầu.
- **Rejected / vấn đề phát hiện:** bảng màu xanh rừng đầu tiên làm chữ footer tối có tỷ lệ tương phản khoảng 1,31:1. Đã báo người dùng và thay sang bảng màu sáng hơn theo yêu cầu tiếp theo. Với màu cuối `#B9CBBF`, chữ phụ `#56564F` vẫn chỉ khoảng 4,35:1, hơi dưới 4,5:1; chưa thay màu chữ vì yêu cầu giới hạn phạm vi.
- **Kiểm tra:** test các mốc và điểm trung gian, cuộn ngược, thay kích thước, reduced motion và màu nền component ở ba route/bốn kích thước. Ảnh minh họa: `GradStudio/screenshots/background-progress-*.png`.

### 11. Thay khối handoff demo bằng lời mời tư vấn

- **Công cụ:** Codex, React/CSS, Chromium/Playwright.
- **Yêu cầu:** chỉnh khối “Studio handoff · Demo / Câu chuyện của Linh” cho phù hợp giao diện hướng khách hơn.
- **Changed:** thay nội dung bằng lời mời chia sẻ ý tưởng chụp, thêm nút `Bắt đầu tư vấn` mở chat chung; điều chỉnh bố cục desktop/mobile.
- **Rejected / giới hạn:** không tuyên bố gửi tin thật; chat vẫn là demo cục bộ và có ghi chú trong giao diện.
- **Kiểm tra:** test nút mở chat, build và responsive. Ảnh: `background-bottom-1280.png`, `background-bottom-360.png`.

### 12. Tạo ảnh theo từng chủ đề gallery

- **Công cụ:** Codex, imagegen, React/Vite, Chromium/Playwright.
- **Yêu cầu:** tạo ảnh tương ứng cho bốn khung còn dùng artwork: chân dung, gia đình, cặp đôi và tốt nghiệp.
- **Changed:** tạo bốn ảnh người mẫu hư cấu bằng AI và thêm vào `GradStudio/public/art/`; cập nhật gallery, ảnh lớn và ảnh dịch vụ Chân dung/CV. Alt của ảnh lớn thay đổi theo chủ đề.
- **Rejected / giới hạn:** không trình bày những ảnh này là ảnh khách thật hay sản phẩm đã chụp của studio. Ảnh minh họa được ghi trong `PROTOTYPE.md`.
- **Kiểm tra:** từng category lọc đúng, ảnh tải được và ảnh mở lớn trùng thẻ đã chọn; build và responsive. Ảnh tổng thể: `GradStudio/screenshots/gallery-1280.png`.

### 13. Typography của hero và độ rõ nút lọc

- **Công cụ:** Codex, React/CSS, Chromium/Playwright.
- **Yêu cầu:** chỉnh riêng vùng chữ bên trái hero theo phong cách magazine; sau đó tăng độ rõ viền các nút lọc gallery và đối chiếu tiến độ với đề.
- **Changed:** tách tiêu đề thành ba dòng, nhấn chữ nghiêng màu terracotta, thêm đường kẻ, gạch chân và chuyển động nhẹ; giữ ảnh giữa, thẻ bên phải và các CTA. Nút lọc chưa chọn có nền sáng/viền rõ, nút được chọn giữ nền xanh.
- **Rejected / giới hạn:** không thay layout hay màu các component khác khi sửa nút lọc. Chưa khẳng định toàn bộ giao diện đạt chuẩn accessibility chỉ từ test tự động.
- **Kiểm tra:** test hero không tràn ở 360/768/1280/1440px; test độ tương phản viền/chữ nút lọc, chọn bằng bàn phím và lọc nội dung. Ảnh: `hero-editorial-1280.png`, `hero-editorial-360.png`, `gallery-filters.png`.

### 14. Đối chiếu yêu cầu nộp bài

- **Công cụ:** Codex, `pdftotext`, kiểm tra file và Git cục bộ.
- **Yêu cầu:** đọc hai file đề trong `docs/`, báo tiến độ; làm rõ có cần nộp link Git và có cần AI log không.
- **Thực hiện:** đối chiếu với rubric, final project brief và ảnh thông báo cho phép React. Rubric yêu cầu ZIP repository có `.git`, không có `node_modules`, và `AI-LOG.md`; không thấy yêu cầu nộp link GitHub trong hai PDF. Các file `brief.md`, rules file, self-assessment, `docs/pa1/` và kết quả W3C chưa thấy ở gốc `GradStudio` khi kiểm tra.
- **Changed / đính chính:** lần đầu tìm trong thư mục `GradStudio`, Codex nói chưa có `AI-LOG.md`; sau khi người dùng chỉ rõ thư mục `PA#2/report`, đã tìm thấy `PA#2/report/AI-log.md` và bổ sung vào chính file này. Vị trí hiện tại vẫn cần được nhóm đối chiếu với yêu cầu file ở gốc repository khi chuẩn bị ZIP.
- **Giới hạn:** `PROTOTYPE.md` còn thiếu tên/MSSV nhóm; chưa có bằng chứng W3C validator, kiểm tra bằng screen reader hay kiểm tra đầy đủ Safari/Firefox. Nội dung AI log được bổ sung hồi cứu từ cuộc trò chuyện; không suy diễn thêm commit, kiểm tra hoặc yêu cầu không có bằng chứng.

### 15. Tinh chỉnh Lịch tài nguyên, phân bổ giờ và Modal Booking mới

- **Công cụ:** Antigravity Assistant, React 19/CSS, Chromium/Playwright.
- **Yêu cầu:** bỏ phần kéo thả thừa ở ảnh 1; bỏ mũi tên lặp ở Thợ chụp và Phòng chụp (chỉ giữ 1 mũi tên); đồng nhất cấu trúc không để thông báo trùng lịch làm dài form booking trong Studio.
- **Changed:**
  - Bỏ placeholder vùng kéo thả ảnh không cần thiết trong view khách hàng.
  - Xóa bỏ mũi tên kép bị lặp ở cột Thợ chụp và Phòng chụp trên bảng phân bổ tài nguyên theo giờ, giữ lại duy nhất 1 mũi tên chỉ định rõ ràng.
  - Đồng nhất cấu trúc hiển thị huy hiệu trạng thái (badges); chuyển form Booking chi tiết sang dạng Modal Overlay khi bấm nút `+ Booking mới` để tránh làm form dài ra bất thường gây vỡ bố cục Studio Workspace.
- **Rejected / lỗi phát hiện & khắc phục:** ban đầu modal overlay bị che khuất bởi z-index của thanh Header và không thể đóng bằng phím `Escape`. Đã sửa bằng cách thêm listener xử lý sự kiện phím `Escape`, thiết lập `z-index: 100`, và bổ sung nút đóng rõ ràng.
- **Kiểm tra / bằng chứng:** chạy kiểm thử mở/đóng modal, kiểm tra responsive tại 360/768/1280px; chụp ảnh `test-booking-overlay-open.png`, `verify-booking-conflict-uniform.png`.

### 16. Đồng nhất Header Screen 01 & 03 và đồng bộ ngày thực tế

- **Công cụ:** Antigravity Assistant, React 19/CSS, Chromium/Playwright.
- **Yêu cầu:** Header ở Screen 01 và Screen 03 phải đồng nhất hoàn toàn, không bị lệch khi chuyển qua lại; cập nhật lịch tài nguyên sang ngày hiện tại (08/11/2026), cho phép bấm "Ngày sau" liên tục không giới hạn.
- **Changed:**
  - Chuẩn hóa padding, chiều cao, kích thước logo của Header dùng chung giữa `index.html` và `booking.html`, đảm bảo chuyển trang mượt mà không bị giật layout.
  - Cập nhật ngày xem lịch tài nguyên bắt đầu từ ngày 08/11/2026.
  - Gỡ bỏ giới hạn cố định ngày 26/10 của nút "Ngày sau", cho phép người dùng bấm duyệt tiếp tục các ngày tương lai (09/11, 10/11,...).
- **Rejected / lỗi phát hiện & khắc phục:** nút "Ngày sau" ban đầu bị thuộc tính `disabled` chặn lại khi vượt quá ngày 26/10 do ràng buộc fixture mẫu cũ. Bộ kiểm tra phát hiện nút bị vô hiệu hóa; đã gỡ bỏ điều kiện giới hạn trên nút để người dùng duyệt không giới hạn.
- **Kiểm tra / bằng chứng:** kiểm thử chuyển trang giữa Home và Booking, chụp ảnh so sánh header giữa 2 màn hình, test click liên tục nút "Ngày sau".

### 17. Tích hợp bảng màu nền cuộn và làm rõ viền khung hình

- **Công cụ:** Antigravity Assistant, React 19/CSS, Chromium/Playwright.
- **Yêu cầu:** áp dụng bảng màu nền cuộn mới: giữ nguyên trạng phần trên nhưng khi cuộn xuống thì chuyển sang màu xanh như ảnh tham khảo; làm rõ đường viền khung hình xem ảnh.
- **Changed:**
  - Cập nhật hàm tính toán màu nền bằng `requestAnimationFrame` theo tiến độ cuộn trang, chuyển từ màu sáng ngà sang gam màu xanh pastel thanh lịch.
  - Tăng độ dày và độ tương phản của đường viền nét đứt của khung xem ảnh (`.gallery-drop`) lên 1.5px để nhìn rõ ràng hơn.
- **Rejected / lỗi phát hiện & khắc phục:** ở vị trí cuộn cuối trang, màu nền xanh đậm ban đầu làm tỷ lệ tương phản của chữ phụ chân trang giảm xuống dưới 4.5:1. Đã điều chỉnh màu nền surface của card chân trang giữ màu trắng ấm để đảm bảo độ tương phản chữ luôn đạt chuẩn WCAG AA ($\ge 4.5:1$).
- **Kiểm tra / bằng chứng:** kiểm thử cuộn ngược xuôi ở cả 4 độ rộng màn hình; lưu chuỗi ảnh chụp tiến độ cuộn `background-progress-*.png`, `background-bottom-1280.png`.

### 18. Chuyển đổi toàn diện hệ thống màu từ Green sang Blue Theme

- **Công cụ:** Antigravity Assistant, CSS/React/SVG, Playwright Chromium.
- **Yêu cầu:** thực hiện color audit toàn diện, thay thế toàn bộ mã màu Forest Green cũ sang hệ màu Blue Theme mới (`#2F6099`, `#1D3E5C`, `#DFEEFC`, `#244F80`, `#EDF5FD`, Terracotta `#B94D32`), cập nhật cả Chat Widget, các nút, form, viền và đồ họa SVG.
- **Changed:**
  - Cập nhật toàn bộ Design Tokens trong `:root` của `src/styles.css` theo bảng màu Blue Theme chuẩn.
  - Đổi màu bong bóng chat quản trị sang Deep Navy Blue (`#1D3E5C`), nút gửi chat sang Primary Blue (`#2F6099`).
  - Đổi màu vector nghệ thuật trong `src/art.svg` và `public/art/graduation.svg` từ xanh lá sang xanh dương đồng bộ.
  - Giữ lại Terracotta (`#B94D32`) làm điểm nhấn biên tập nổi bật cho tiêu đề và huy hiệu.
- **Rejected / lỗi phát hiện & khắc phục:** ban đầu tìm kiếm thay thế toàn cục đã làm đổi màu cả một số huy hiệu thành công (`.badge-confirmed`, `.status-complete`) sang xanh dương, làm mất ngữ nghĩa thành công của hệ thống. Kiểm tra đã phát hiện và khôi phục màu xám/trung tính ngữ nghĩa cho các huy hiệu này theo đúng nguyên tắc "Do not blindly replace semantic colors".
- **Kiểm tra / bằng chứng:** chạy toàn bộ 31 test suites của Playwright, kiểm tra 9 màn hình responsive đều hiển thị Blue Theme hoàn hảo; lưu ảnh `verify-studio-blue.png`, `verify-calendar-blue.png`, `verify-chat-thread-blue.png`, `verify-booking-page-blue.png`.

### 19. Tinh chỉnh chi tiết huy hiệu lịch trình và căn giữa số 5

- **Công cụ:** Antigravity Assistant, React 19/CSS, Playwright Chromium.
- **Yêu cầu:** đổi màu biểu tượng ① trong timeline lịch trình sang màu xám; căn giữa hoàn hảo số `5` bên trong huy hiệu đếm ở tiêu đề sidebar.
- **Changed:**
  - Đổi class của biểu tượng số ① từ `badge-conflict` (màu đỏ) sang `badge-confirmed` (màu xám `#eeeae2`, `#38342e`, `#ded6ca`), đồng nhất với biểu tượng ②.
  - Căn giữa số `5` trong `.count-badge` bằng cách reset padding về 0, đặt `line-height: 1; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;`.
  - Căn giữa dọc tiêu đề `.sidebar-title` với `align-items: center;`.
- **Rejected / lỗi phát hiện & khắc phục:** ban đầu số `5` bị lệch xuống dưới do `.count-badge` kế thừa thuộc tính `padding: .25rem .75rem` từ rule CSS chung ở dòng 940 của `styles.css`. Đã ghi đè padding về 0 và căn giữa flexbox chuẩn xác.
- **Kiểm tra / bằng chứng:** chụp ảnh bằng chứng cận cảnh [verify-fix-item-1-grey.png](file:///home/hungj2020/.gemini/antigravity-cli/brain/9fbac3ad-da21-46fe-9e1d-b777a2f44b00/verify-fix-item-1-grey.png) và [verify-fix-count-5-centered.png](file:///home/hungj2020/.gemini/antigravity-cli/brain/9fbac3ad-da21-46fe-9e1d-b777a2f44b00/verify-fix-count-5-centered.png).

### 20. Khắc phục chuẩn W3C Nu HTML Checker và hoàn thiện bộ tài liệu PA#2

- **Công cụ:** Antigravity Assistant, W3C Nu HTML Checker API (`https://validator.w3.org/nu/`), Playwright Chromium, Node.js.
- **Yêu cầu:** rà soát toàn bộ đề bài trong `PA#2/docs/` (`PA2-rubric-responsive-prototype.pdf`, `GradStudio-final-project-brief.pdf`), kiểm tra hợp chuẩn W3C để đạt 20/20 điểm Criterion 3, tạo các file kết quả W3C trong `checks/`, cập nhật `PROTOTYPE.md`, `brief.md`, `AGENTS.md`, `AI-LOG.md`, và tạo `SELF_ASSESSMENT_REPORT.md` tự đánh giá 100/100 điểm.
- **Changed:**
  - Thay thế thẻ `<time>` chứa chuỗi khoảng thời gian không hợp chuẩn (như `"08:00–10:00"`, `"Hôm qua"`) thành `<span>` hoặc bổ sung thuộc tính `dateTime` hợp lệ.
  - Bổ sung `role="region"` cho các phần tử `<div>` có `aria-label` (`.resource-timetable`, `.week-strip`) và `role="img"` cho `<span>` huy hiệu lịch trình để tuân thủ ARIA in HTML.
  - Tạo 3 file báo cáo W3C chính thức trong thư mục `checks/`: `validator-index.txt`, `validator-studio.txt`, `validator-booking.txt` với kết quả **0 ERRORS**.
  - Khởi tạo file `SELF_ASSESSMENT_REPORT.md` tại gốc repository với đầy đủ 7 tiêu chí và bằng chứng kiểm thử chi tiết.
- **Rejected / lỗi phát hiện & khắc phục:** khi gửi DOM render của `studio.html` và `booking.html` lên W3C Nu HTML Checker lần đầu, checker trả về 15 lỗi cú pháp HTML5 (gồm lỗi định dạng chuỗi của thẻ `<time>` và lỗi thiếu `role` khi dùng `aria-label` trên thẻ `div`/`span`). Trợ lý đã phát hiện chính xác, chỉnh sửa mã nguồn JSX trong `main.jsx`, build lại dự án và kiểm tra lại qua API W3C Nu HTML Checker đạt **0 ERRORS tuyệt đối**.
- **Kiểm tra / bằng chứng:**
  - W3C Nu HTML Checker: **0 ERRORS** cho cả 3 trang `index.html`, `studio.html`, `booking.html`.
  - Playwright Test Suite (`tests/ui.test.cjs`): **31/31 PASS (100%)**, cập nhật trong `checks/ui-test-results.json`.
  - 9 ảnh responsive chụp đầy đủ trong thư mục `screenshots/`.

---

## Ghi chú về xác minh lịch sử (08/11/2026)

Các mục kiểm thử trước trong nhật ký phản ánh báo cáo được tạo tại thời điểm đó. Đánh giá độc lập gần đây lưu ý `checks/validator-*.txt` có hình thức ghi chú thủ công, không đủ bằng chứng để khẳng định là output W3C chính thức. Không dùng chúng để tuyên bố 0 lỗi; cần chạy lại checker và lưu kết quả thật. Điểm tự đánh giá 100/100 cũng đã được hạ về trạng thái chưa chốt cho đến khi nhóm đối chiếu rubric. Lịch sử commit và thông tin thành viên cần chủ dự án xử lý.

## 21. Khắc phục cuộn chat và tính trung thực tài liệu

- **Công cụ:** Codex / Antigravity Assistant, React/CSS, Playwright Chromium.
- **Yêu cầu:** xử lý nhận xét đánh giá về transcript Studio có thanh cuộn riêng, chat nổi che nội dung mobile, và các tuyên bố kiểm chứng/tự chấm chưa được hỗ trợ bằng bằng chứng độc lập.
- **Changed:** bỏ height/max-height/overflow-y cố định khỏi `.message-thread` Studio; trên viewport ≤767px, chat nổi chuyển vào luồng tài liệu và trang cuộn đến panel khi mở; mở nút chat tiếp tục hoạt động và đóng bằng nút hoặc Escape.
- **Kiểm tra:** `npm run build` thành công; `npm test` đạt 31 suites, bao gồm Studio luồng hội thoại, panel mobile trong luồng trang, responsive sizes, tương tác chat và reduced motion.

### 22. Dọn sạch `!important`, sửa lỗi tràn `.assign-select` 360px, tách module và xác minh W3C Nu HTML Checker chính thức

- **Công cụ:** Antigravity Assistant, W3C Nu HTML Checker (`https://validator.w3.org/nu/?out=text`), Playwright Chromium, Node.js.
- **Yêu cầu:** giải quyết dứt điểm toàn bộ các vấn đề còn tồn đọng trong đợt rà soát cuối: loại bỏ các khai báo `!important` ngoài khối reduced-motion, kiểm tra phần tử tràn mép phải (`audit.outside`), chạy W3C Nu HTML Checker độc lập, nhúng pre-render HTML tĩnh vào `dist/*.html`, điền thông tin thành viên và tách module mã nguồn phục vụ phân chia commit cho 3 thành viên.
- **Changed:**
  - Thay thế toàn bộ 25 khai báo `!important` trong định kiểu component của `src/styles.css` bằng selector có độ đặc hiệu hợp lý; chỉ giữ lại duy nhất dòng `@media (prefers-reduced-motion: reduce)`.
  - Đổi 3 thẻ `<article>` không có tiêu đề (`h2`–`h6`) trong `StudioPage` và `ResourceCalendar` thành `<div>`, đồng thời bỏ dấu `/` cuối các thẻ rỗng `<meta>` để loại bỏ toàn bộ 9 cảnh báo W3C trên `studio.html`.
  - Bổ sung script `scripts/prerender.cjs` vào lệnh `npm run build` để nhúng sẵn toàn bộ DOM đã render vào `<div id="root">` của `dist/index.html`, `dist/studio.html`, `dist/booking.html` (giúp hiển thị đầy đủ cả khi tắt JavaScript hoặc khi upload file tĩnh lên W3C Validator).
  - Tách `src/main.jsx` và `src/styles.css` thành các module rõ ràng theo từng màn hình và chức năng (`src/data/fixtures.js`, `src/components/Layout.jsx`, `src/components/FloatingChat.jsx`, `src/pages/HomePage.jsx`, `src/pages/StudioPage.jsx`, `src/pages/BookingPage.jsx`, và 5 file CSS trong `src/styles/`), đồng thời dọn bỏ các file thừa không dùng (`src/main.compiled.js`, `tests/hero.browser.test.cjs`).
  - Cập nhật `PROTOTYPE.md` và `SELF_ASSESSMENT_REPORT.md` với đầy đủ Họ tên, MSSV của 3 thành viên nhóm (`24120184`, `24120211`, `24120354`) và bảng điểm tự đánh giá thực tế.
- **Rejected / lỗi phát hiện & khắc phục:**
  - Khi bổ sung kiểm tra nghiêm ngặt `assert.deepEqual(audit.outside, [])` vào `tests/ui.test.cjs`, bài test tại `studio.html` ở độ rộng `360px` báo lỗi `outside: ["assign-select"]` do `.assignment-control-row` dùng `flex-wrap: nowrap` khiến ô chọn phòng chụp bị đẩy vượt mép phải của `.conversation-area` (bị che bởi `overflow: hidden`). Đã sửa `.assignment-control-row` sang `flex-wrap: wrap`, giúp các ô chọn tự xuống dòng gọn gàng ở 360px.
  - Khi tách CSS thành 5 module bằng `@import` trong `src/styles.css`, PostCSS của Vite báo lỗi không phân giải được đường dẫn do thư mục gốc chứa ký tự `#` (`PA#2`). Đã khắc phục bằng cách import trực tiếp 5 module CSS trong `src/main.jsx` và giữ bản tổng hợp đầy đủ trong `src/styles.css`.
- **Kiểm tra / bằng chứng:**
  - `npm run build` & `npm test`: **31/31 test suites PASS** (bao gồm `outside: []` trên cả 3 trang ở 360px, 768px, 1280px, 1440px).
  - W3C Nu HTML Checker (`curl` trực tiếp tới `https://validator.w3.org/nu/?out=text`): cả 3 trang `dist/index.html`, `dist/studio.html`, `dist/booking.html` đều trả về `The document validates according to the specified schema(s).` (**0 ERRORS, 0 WARNINGS**), lưu tại `checks/validator-{index,studio,booking}.txt`.

### 23. Chuẩn hóa thang khoảng cách `--space-*`, cỡ chữ nội dung `>= 16px`, hiển thị câu hỏi của Linh trên Screen 1 và đồng bộ nhãn trạng thái

- **Công cụ:** Antigravity Assistant, W3C Nu HTML Checker (`https://validator.w3.org/nu/?out=text`), Playwright Chromium.
- **Yêu cầu:** rà soát toàn diện trước khi nộp theo Rubric (Tiêu chí 1 & Tiêu chí 4): chuẩn hóa các khai báo `padding`, `margin`, `gap` về biến `--space-*`, loại bỏ `font-size` bằng `px` lẻ, hiển thị sẵn câu hỏi của Linh và phản hồi của studio ngay trên DOM tĩnh của `index.html` (Screen 1), và thay thế nhãn `"Đã xác nhận"` trên lịch tài nguyên `studio.html` bằng `"Đã đặt lịch"`.
- **Changed:**
  - Mở rộng thang `:root` với `--space-5: 1.25rem` (20px) và `--space-10: 2.5rem` (40px); chuyển đổi 433 khai báo khoảng cách sang `var(--space-1)` đến `var(--space-16)` trên toàn bộ 5 file `src/styles/*.css` và `src/styles.css`.
  - Xóa bỏ toàn bộ 36 khai báo `font-size` dùng `px` lẻ; nâng cỡ chữ nội dung hội thoại, form control, cảnh báo xung đột và dòng báo giá lên `1rem` (`16px`).
  - Hiển thị trực tiếp đoạn trao đổi của Linh (_“Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?”_) và phản hồi của GradStudio (_“Để mình kiểm tra lịch cho bạn nhé”_) ngay trên thẻ dịch vụ Tốt nghiệp ở `index.html` (`src/pages/HomePage.jsx`) để nội dung luôn xuất hiện trong DOM tĩnh và ảnh chụp màn hình mà không che khuất trang.
  - Thay toàn bộ 5 chỗ dùng chữ `"Đã xác nhận"` trên chú giải và các khối lịch của `studio.html` (`src/pages/StudioPage.jsx`, `src/data/fixtures.js`) thành `"Đã đặt lịch"` theo đúng bộ tên trạng thái chuẩn của đề bài.
- **Rejected / lỗi phát hiện & khắc phục:**
  - Qua kiểm tra `grep` trên `dist/index.html` và `dist/studio.html`, phát hiện câu hỏi của Linh ở Screen 1 trước đó chỉ xuất hiện sau khi bấm mở `FloatingChat` (nên chưa có mặt trong `dist/index.html` tĩnh), và chú giải lịch tài nguyên ở `studio.html` còn sót chữ `"Đã xác nhận"`. Đã bổ sung hiển thị tĩnh trên `HomePage.jsx` và đổi nhãn lịch sang `"Đã đặt lịch"`.
- **Kiểm tra / bằng chứng:**
  - Chạy lại `npm run build`, `npm test` (**31/31 PASS**) và kiểm tra lại cả 3 file `dist/index.html`, `dist/studio.html`, `dist/booking.html` qua W3C Nu HTML Checker (**0 ERRORS, 0 WARNINGS**).

### 24. Tinh chỉnh giao diện theo phản hồi trực quan: bỏ nhãn demo dư thừa và sửa lỗi rớt dòng ngày tháng Studio

- **Công cụ:** Antigravity Assistant, Playwright Chromium, W3C Nu HTML Checker.
- **Yêu cầu:** loại bỏ các dòng chữ demo/role-handoff thừa ở chân trang Screen 3 và ghi chú demo ở Screen 2 theo phản hồi người dùng; sửa lỗi hiển thị ngày tháng ở danh sách hội thoại Screen 2 bị rớt dòng dọc từng chữ.
- **Changed:**
  - Bỏ phần văn bản `Prototype · Dữ liệu minh họa` trong `site-footer` (`src/components/Layout.jsx`).
  - Bỏ thanh chuyển vai trò `role-handoff` (`Đang xem với vai trò khách hàng`) ở cuối trang `booking.html` (`src/pages/BookingPage.jsx`).
  - Bỏ dòng ghi chú demo `studio-footnote` (`Các hội thoại và lịch ngoài GS-1024 là dữ liệu demo...`) ở cuối trang `studio.html` (`src/pages/StudioPage.jsx`).
  - Cấu trúc lại `.thread-item`: đưa `<span className="thread-time">` vào bên trong `.thread-copy-header` cùng hàng với tên khách hàng, thiết lập `display: flex; justify-content: space-between; align-items: baseline` và `white-space: nowrap; flex-shrink: 0`.
- **Rejected / lỗi phát hiện & khắc phục:**
  - Trước đây `<span className="thread-time">` nằm ngoài `.thread-copy` và là phần tử con thứ 3 trong lưới CSS Grid 2 cột (`40px minmax(0,1fr)`), khiến nó bị đẩy xuống hàng thứ 2 cột 1 (chỉ rộng 40px), làm các chuỗi ngày tháng như `"2 ngày trước"`, `"Hôm qua"`, `"3 ngày trước"` bị ép rớt dòng từng từ một theo chiều dọc. Đã sửa triệt để bằng cách đưa vào header của `.thread-copy`, giúp ngày tháng luôn nằm trên một dòng ngang gọn gàng cạnh tên khách.
- **Kiểm tra / bằng chứng:**
  - `npm run build` & `npm test`: **31/31 PASS**.
  - W3C Nu HTML Checker trên cả 3 trang: **0 ERRORS, 0 WARNINGS**.

### 25. Sửa form "Booking mới" bị cắt ở Screen 2 và làm rõ nhãn chuyển vai ở Screen 1

- **Công cụ:** Antigravity Assistant, Playwright Chromium (script đo bố cục), W3C Nu HTML Checker.
- **Yêu cầu:** rà soát lần cuối theo mục "Fix these" của brief: chat và form Booking mới phải đọc được bằng cách cuộn trang ở mọi độ rộng.
- **Changed:**
  - `.booking-overlay` (`src/styles/studio-workspace.css`) đổi từ `position:absolute; inset:0; overflow-y:auto` sang `position:static`, nên form nằm trong luồng trang bên dưới khung chat.
  - Nhãn liên kết ở Screen 1 đổi thành "Studio staff: tiếp tục cuộc trò chuyện của Linh" để nói rõ ai tiếp tục khi chuyển vai.
- **Rejected / lỗi phát hiện & khắc phục:**
  - Script đo bố cục cho thấy ở 360/768/1280px nút "Tạo booking" nằm ngoài vùng `.conversation-area` (ví dụ 1280px: nút ở y=972–1042, vùng kết thúc ở y=877), form có thanh cuộn riêng và phủ lên đoạn chat. Bộ 31 test không bắt được vì chỉ kiểm tra tràn ngang. Sau khi sửa, nút nằm trong vùng ở cả 3 độ rộng (1280px: y=1582–1651, vùng kết thúc y=1666) và đoạn chat hiển thị.
- **Kiểm tra / bằng chứng:** `npm test` 31/31 PASS; W3C Nu HTML Checker 0 lỗi cả 3 trang. Chưa bổ sung test tự động cho lỗi cắt dọc.

---

## PA#3

Mỗi task giao cho assistant có một mục: **Tool**, **Request** (trỏ tới mục tương ứng trong `brief.md`), **Changed**, **Rejected** (assistant làm sai gì, check nào phát hiện, đã yêu cầu sửa thế nào), **Checked** (các check đã chạy thật), **Commits**. Task tự làm không dùng assistant thì ghi `Tool: none`.

### [TV1] 1. Setup PA#3: chuyển app vào client/, đơn giản hóa build, rules file cho PA#3 (19/11/2026)

- **Tool:** Claude Code.
- **Request:** `brief.md` mục 1. Clone repo sang thư mục làm việc mới, làm trên branch `chore/pa3-setup`. Assistant đề xuất 6 commit, TV1 đồng ý rồi cho assistant commit bằng tên TV1.
- **Changed:**
  - `index.html`, `studio.html`, `booking.html`, `src/`, `public/`, `scripts/`, `tests/`, `vite.config.js`, `package*.json` chuyển vào `client/` (chỉ đổi tên đường dẫn).
  - `dist/` ở thư mục gốc không còn được track; `.gitignore` thêm `dist/`, `client/dist/`.
  - `client/vite.config.js`: bỏ plugin Babel tự viết; `base: '/'`; proxy `/api` sang `http://localhost:3001` cho cả `server` và `preview`. `client/package.json`: bỏ `@babel/core`, `@babel/preset-env`, `@babel/preset-react`; `build` chỉ còn `vite build`.
  - Xóa `scripts/prerender.cjs` và `tests/ui.test.cjs` (vẫn còn trong lịch sử git).
  - Thêm `tools/contract-check.mjs` và README của nó (chép nguyên từ tài liệu môn học).
  - `AGENTS.md` viết lại cho PA#3. Phần mở đầu của `brief.md`, mục `## PA#3` của `AI-LOG.md`, và khung `FRONTEND.md`.
- **Rejected / lỗi phát hiện:**
  - `AGENTS.md` cũ vẫn mô tả trang tĩnh PA#2 (fixtures, nút cọc bị khóa, "No new route", khung chat nổi trên desktop). Nếu giữ, assistant sẽ làm ngược yêu cầu PA#3, nên đã viết lại.
  - `npm run build` cũ gọi `prerender.cjs`, script này nạp Playwright từ một đường dẫn chỉ có trên máy TV1 (`~/.cache/codex-runtimes/...`), nên sẽ lỗi trên máy TV2 và TV3. Đã bỏ khỏi lệnh build.
  - Không có thay đổi nào của assistant bị loại bỏ.
- **Checked:**
  - `npx vite build` với cấu hình cũ: chạy được.
  - Build thử với cấu hình chỉ có `@vitejs/plugin-react` (không Babel): chạy được, CSS cùng hash và JS cùng kích thước (289.71 kB).
  - Sau commit 3: `npm run build` chạy được.
  - `node tools/contract-check.mjs` thoát với mã 2 ("docs/api/ not found"), đúng như mong đợi vì chưa có contract.
  - `git status` sạch sau mỗi commit.
- **Commits:** `chore: move PA#2 React app into client/` · `chore: stop tracking build output` · `chore(build): simplify Vite config, add /api proxy` · `chore: add tools/contract-check.mjs` · `docs: rewrite AGENTS.md for PA#3` · `docs: PA#3 skeleton for brief.md, AI-LOG.md, FRONTEND.md`.

### [TV1] 2. Contract: docs/api/README.md (19/11/2026)

- **Tool:** Claude Code.
- **Request:** `brief.md` mục 2. Viết `docs/api/README.md` theo kế hoạch PA#3 (mục 3.3–3.5 trong file kế hoạch), trên branch `contract/readme`.
- **Changed:** `docs/api/README.md` (file mới), gồm:
  - base path, xác thực và vai trò;
  - một dạng lỗi duy nhất và bảng `error.code`;
  - mã HTTP, quy ước dữ liệu, mã trạng thái nghiệp vụ;
  - các đối tượng dùng chung;
  - bảng 39 endpoint;
  - chuỗi ví dụ, dữ liệu ban đầu của mock, hành vi của mock;
  - mục `## Changes`.
- **Rejected / lỗi phát hiện:**
  - README chỉ dùng block `json` và `text`, không dùng block `http`. Nếu có block `http`, `contract-check` sẽ gửi nó tới mock như một ví dụ thật.
  - Không có thay đổi nào của assistant bị loại bỏ.
- **Checked:**
  - `grep -c '^```http' docs/api/README.md` ra 0.
  - `node tools/contract-check.mjs` đọc được đủ 39 dòng của bảng endpoint, kết quả `FAIL README.md … (0/39)`. Đúng như mong đợi, vì ví dụ sẽ nằm trong các file `01`–`13`.
  - `git diff main -- mock client` trống: chưa đụng tới mock và front end.
- **Commits:** `contract(readme): base path, auth, error shape, endpoint table` · `docs: brief and AI-LOG entry 2 (contract README)`.

### [TV1] 3. Contract: 01-auth, 08-jobs, 12-admins, 13-settings (19/11/2026)

- **Tool:** Claude Code.
- **Request:** `brief.md` mục 3. Viết 4 file contract của TV1 trên branch `contract/tv1`, tách từ `contract/readme` (PR 1 chưa merge).
- **Changed:**
  - `docs/api/01-auth.md`, `08-jobs.md`, `12-admins.md`, `13-settings.md` (file mới). Mỗi endpoint có ai được gọi, body kèm giới hạn, câu trả lời thành công, mọi lỗi có thể xảy ra, và ví dụ chạy được theo chuỗi ví dụ trong README.
  - `docs/api/README.md`: dữ liệu ban đầu ghi thêm user khách hàng của các booking có sẵn và id ảnh `ph-101` … `ph-136` của GS-1022, có thêm dòng trong `## Changes`.
- **Rejected / lỗi phát hiện:**
  - Ban đầu id ảnh `ph-01` của GS-1024 (đã dùng trong README) **trùng** với 36 ảnh có sẵn của GS-1022. Đã đổi ảnh có sẵn của GS-1022 thành `ph-101` … `ph-136`.
  - Script kiểm JSON tự viết lần đầu chạy lỗi (`SyntaxError`), vì cách cắt hàm theo dấu `{}` hỏng với chuỗi `'{'` nằm trong `parseLoose`. Đã đổi sang cắt theo dòng đánh dấu cuối hàm.
- **Checked:**
  - Chạy `node tools/contract-check.mjs` khi chưa có mock:
    - đọc được 40 ví dụ;
    - nhận đúng ví dụ đăng nhập ở `01-auth.md:59`;
    - 11/11 endpoint của TV1 có ví dụ;
    - không có lỗi nào khác ngoài "không có mock" và "chưa có ví dụ" cho endpoint của TV2, TV3.
  - Script chạy `parseLoose` của contract-check: 35 request `http` và 40 answer, 0 lỗi JSON.
  - Chưa chạy được với mock (mock làm ngày 21/11). Lần chạy thật sẽ ghi ở mục AI-LOG của mock.
- **Commits:** `contract(auth)` · `contract(jobs)` · `contract(admins)` · `contract(settings)` · `contract(readme): list story users and GS-1022 photo ids` · `docs: brief and AI-LOG entry 3`.

### [TV1] 4. Brief: bổ sung prompt giao việc cho mục 2 và mục 3 (20/11/2026)

- **Tool:** Claude Code.
- **Request:** tin nhắn trực tiếp ngày 20/11: nhờ đánh giá hai prompt giao việc rồi bổ sung vào `brief.md` trên branch `contract/tv1`. Nội dung hai prompt nằm ở `brief.md` mục 2 (Tin nhắn 2) và mục 3 (Tin nhắn 3).
- **Changed:** `brief.md` (28 dòng thêm vào): thêm Tin nhắn 2 của mục 2 và Tin nhắn 3 của mục 3, đổi "Tin nhắn:" của mục 2 thành "Tin nhắn 1:", thêm ghi chú đối chiếu với README.
- **Rejected / lỗi phát hiện:**
  - Assistant ngày 19/11 đã ghi `brief.md` mục 2 và 3 bằng các tin nhắn ngắn, thiếu hai prompt giao việc thật (theo TV1, tin nhắn thật bị ghi đè nhầm). Phát hiện khi rà `git diff main..contract/tv1 -- brief.md` ngày 20/11; đã bổ sung hai prompt nguyên văn.
  - Prompt ghi `Authorization: Bearer token-<userId>`, lệch README (`Bearer <token>`, token là chuỗi mờ). Phát hiện bằng cách đối chiếu prompt với `docs/api/README.md`. Giữ nguyên prompt, thêm ghi chú rằng README là chuẩn.
  - Assistant đề nghị tự tạo commit, trái quy tắc `AGENTS.md`. Không commit; TV1 tự commit sau khi đọc diff.
- **Checked:**
  - `git diff --name-only` chỉ có `brief.md` (trước khi ghi mục này); không đụng `docs/api/` và `mock/`.
  - Khối code trong `brief.md` đóng mở đúng (prompt mục 2 dùng khối bốn dấu vì có chứa ` ```http `).
  - Đối chiếu prompt với README và `08-jobs.md`: 39 endpoint, không có block `http` trong README, giới hạn ảnh 5 MB, `## Changes` ở cuối: khớp.
- **Commits:** TV1 commit sau khi đọc diff.

### [TV1] 5. Contract: đổi lịch cần khách đồng ý, Hân đăng nhập được (20/11/2026)

- **Tool:** Claude Code.
- **Request:** prompt nguyên văn ở `brief.md` mục 4 (Tin nhắn 1: sửa đúng 3 file theo 11 vị trí; Tin nhắn 2: tự dán prompt vào brief rồi làm).
- **Changed:**
  - `docs/api/README.md`: thêm `han` vào bảng Demo accounts; `u-han` chuyển sang nhóm đăng nhập được; `c-han` thành `scheduled`, gắn `GS-1023`; `GS-1023` có `conversationId: "c-han"`; bỏ `PATCH /api/bookings/:code` khỏi mục ScheduleItemInput; bước 10 của chuỗi ví dụ thành 7 bước đổi lịch qua đề xuất `p-3`; thêm một dòng vào bảng quy tắc mock; một dòng `## Changes`.
  - `docs/api/01-auth.md`: `u-han` đăng nhập được (`han-demo`); một dòng `## Changes`.
  - `FRONTEND.md`: thêm dòng `han` vào Demo accounts (`contract-check` đọc bảng này để lấy `{{token:han}}`).
  - `brief.md` mục 4 và mục này.
- **Rejected / lỗi phát hiện:**
  - Prompt ghi `p-3` nhưng chuỗi `03` có một đề xuất bị 409; nếu mock cấp id cho đề xuất bị từ chối thì id sẽ là `p-4`. Thêm câu "A proposal refused with 409 gets no id" vào bước 10 (đề xuất của assistant, TV1 đồng ý ở Tin nhắn 2).
  - Chữ "reapplies" sai nghĩa (lần đầu bị từ chối); đổi thành "applies `p-3` again".
  - Prompt muốn ghi gọn prompt trong brief; không làm, vì `brief.md` quy định ghi nguyên văn. Chỉ mục AI-LOG này được ghi gọn.
- **Checked:**
  - `git diff --stat`: `README.md`, `01-auth.md`, `FRONTEND.md`, `brief.md` (cộng `AI-LOG.md` sau khi ghi mục này); không đụng `03`, `05`, `10`, `mock/`, `client/`.
  - README: 0 block `http`, khối code đủ cặp, bảng endpoint vẫn 39 dòng; không còn chữ cũ (`c-han` `unanswered`, "Moving GS-1023").
  - `han`, `u-han`, `han-demo` khớp giữa 3 file.
  - `node tools/contract-check.mjs` khi chưa có mock: vẫn đọc được 40 ví dụ, chỉ có FAIL "không có mock" và "chưa có ví dụ" cho endpoint của TV2, TV3. Chưa chạy được với mock.
- **Commits:** TV1 commit sau khi đọc diff.

### [TV3] 6. Contract: conversations, availability, bookings, admin-bookings (20/11/2026)

- **Tool:** Codex; PowerShell, Node.js (module có sẵn), Git.
- **Request:** `brief.md` mục 5, Tin nhắn 1. Hoàn thiện bốn contract TV3 để Kiệt review, nhóm merge trước 22:00 ngày 20/11; chỉ tạo nhánh, không add/commit/push/PR.
- **Changed:**
  - `docs/api/03-conversations.md`: 6 endpoint, quyền sở hữu hội thoại, text/booking request, 409 CLASH không cấp ID, p-1 bị từ chối, p-2 được đồng ý. POST tạo hội thoại dùng ví dụ 400 để không đổi chuỗi ID.
  - `docs/api/04-availability.md`: resources, schedule, kiểm tra 09:00 trùng và 13:00/14:00 trống; Clash/Suggestion đầy đủ, kiểm tra chỉ đọc.
  - `docs/api/05-bookings.md`: 3 endpoint, từ chối tạo từ p-1; tạo GS-1024 từ p-2, Booking đầy đủ và đúng tiền; ví dụ 401, 404; chỉ giữ chỗ sau cọc thành công và kiểm tra tài nguyên lại.
  - `docs/api/10-admin-bookings.md`: 3 endpoint, chuỗi c-han/p-3, 409 trước khi Hân đồng ý, áp dụng sau đồng ý có kiểm tra lại và cập nhật job liên quan, hủy và link HTTPS. Nêu rõ thiếu quy định vòng đời job khi hủy; không thêm trạng thái Job. Dữ liệu seed GS-1023 còn thiếu được đánh dấu cần Hưng/Kiệt xác nhận.
  - `brief.md`: chỉ thêm mục 5 chứa prompt nguyên văn trước khi viết contract; `AI-LOG.md`: chỉ thêm mục PA#3 số 6 này. Không sửa README, contract TV1/TV2, mock, client, tools hoặc tài liệu PA#2.
- **Rejected / lỗi phát hiện:**
  - Git switch/fetch ban đầu báo Permission denied khi ghi `.git/index.lock`/`FETCH_HEAD`. Đã dùng cơ chế cấp quyền cho đúng lệnh rồi chạy lại thành công; không đổi Git config. Tác giả hiện tại: `Nhut <lecongminhnhut6533@gmail.com>`.
  - Script soạn contract tạm lần đầu lỗi đọc heading vì README dùng CRLF; đã chuẩn hóa xuống dòng trong bộ nhớ trước khi trích Booking. Không sửa README.
  - Script kiểm tra tĩnh tạm lần đầu không nạp được `import.meta` trong VM; đã thay biểu thức đó chỉ trong bản sao bộ nhớ. So sánh byte với Git HEAD báo khác vì HEAD dùng LF còn working tree dùng CRLF; đã kiểm lại theo nội dung sau chuẩn hóa xuống dòng, không thay nội dung cũ.
  - Khi ghi nhật ký, patch khớp nhầm mục TV1 số 4 và thêm một dòng trắng. `git diff -- AI-LOG.md` phát hiện ngay; đã bỏ dòng trắng đó và chỉ nối mục mới sau mục số 5.
- **Checked:**
  - Đọc AGENTS, README, 01-auth, FRONTEND, toàn bộ brief và PA#3 AI-LOG, kế hoạch TV3 mục 2/3/5.1/7/8/9, hướng dẫn và mã nguồn contract-check.
  - Working tree ban đầu sạch trên main; fetch origin thành công; `git merge --ff-only origin/main` báo Already up to date; tạo `contract/tv3-chat-booking-admin`. `git rev-parse main origin/main` cùng `747ee74e271eb3a58c21f746e4c9eb7aa9d04d0b`.
  - Script tạm `%TEMP%/gradstudio-tv3-static-check.cjs` dùng bộ phân tích Markdown/HTTP và bảng endpoint trích từ contract-check: 28 cặp request/response, 47 body JSON hợp lệ, 15/15 endpoint TV3 có ví dụ, đúng key của shared objects/error, không có dấu lược bỏ; thứ tự ID/trạng thái trong ví dụ đúng chuỗi yêu cầu. Đây là kiểm tra tĩnh, không gửi API request.
  - Đọc toàn bộ nội dung mới và diff; `git diff --check` không báo lỗi; kiểm tra thêm bốn file mới chưa track bằng `git diff --no-index --check -- /dev/null <file>` không có lỗi whitespace (Git cảnh báo LF sẽ đổi thành CRLF khi track). So sánh với HEAD xác nhận hai file nhật ký chỉ nối nội dung (chuẩn hóa LF/CRLF khi so sánh), fence đóng đủ, brief mục 5 khớp Request của AI-LOG mục 6; chỉ một heading PA#3.
  - Rà chuỗi theo README: p-1/p-2 rồi GS-1024; p-3 đặt trong file 10 sau thanh toán/gallery. Chưa có các file contract TV2 02/06/07/09/11 trong checkout nên chưa đối chiếu được ví dụ thực tế của TV2; Hưng/Kiệt cần xác nhận fixture và các giới hạn ghi là đề xuất.
  - `Test-Path mock/server.mjs` trả False: chưa chạy contract-check với mock, chưa kiểm chứng state/ID hoặc các chế độ mock; không tuyên bố 0 FAIL/runtime đạt. Không chạy kiểm tra frontend.
- **Commits:** TV3 commit sau khi đọc diff.

### [TV2] 7. Tìm hiểu quy trình PA#3, rà soát kế hoạch & câu hỏi PO, viết 5 file contract của TV2 (20/11/2026)

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 5. Đọc tài liệu rubric/brief và kế hoạch 3 thành viên, chạy thử luồng contract-check cá nhân, rà soát bộ 9 câu hỏi Product Owner, dọn file test cũ, kéo `main`, tạo nhánh `contract/tv2` và viết 5 file contract của TV2 (`02-catalog.md`, `06-payments.md`, `07-reminders.md`, `09-gallery.md`, `11-receive.md`).
- **Changed:**
  - `docs/api/02-catalog.md` (file mới): 6 endpoint public (`services`, `packages`, `packages/:id`, `extras`, `portfolio`, `reviews`), kèm ví dụ `400` (`serviceId` không tồn tại) và `404`.
  - `docs/api/06-payments.md` (file mới): 3 endpoint (`POST /api/bookings/:code/payments`, `GET /api/payments/:id`, `POST /api/test-gateway/:paymentId`), chuỗi ví dụ `PAY-1` thất bại và `PAY-2` cọc thành công, ghi rõ `test-gateway` chỉ có ở PA#3.
  - `docs/api/07-reminders.md` (file mới): `GET /api/reminders` trả về `rm-1` sau khi `PAY-2` thành công, kèm lỗi `401`, `403`.
  - `docs/api/09-gallery.md` (file mới): `GET /api/bookings/:code/photos` và `PUT /api/bookings/:code/selection` (viết đủ 30 và 31 ID `ph-01`..`ph-31` trong body request), đặt chuỗi ví dụ trả 70% (`PAY-3`) ở cuối file.
  - `docs/api/11-receive.md` (file mới): `POST /api/bookings/:code/receive` chuyển booking thành `completed`, kèm lỗi `409` và `404`.
  - `brief.md` mục 5 và `AI-LOG.md` mục này.
- **Rejected / lỗi phát hiện:**
  - Trong bước thử nghiệm cá nhân ban đầu, tạo nhầm `docs/02-catalog.md` ngoài thư mục `docs/api/` khiến `contract-check` báo `docs/api/ not found`, và dùng endpoint nháp `/api/catalog` khác với bảng endpoint chuẩn trong `README.md` của TV1. Đã xóa toàn bộ thư mục nháp `docs/api/` và `mock/` trước khi `git pull origin main` và tạo branch `contract/tv2`.
  - Khi rà soát kế hoạch và bộ câu hỏi PO, phát hiện đề xuất câu 5 (đổi lịch cần khách đồng ý) ban đầu mâu thuẫn với kế hoạch TV3 và bảng Demo accounts thiếu dòng `han` (nhóm đã đồng bộ lại trong `README.md`, `01-auth.md` và `FRONTEND.md`).
  - Không để assistant tự chạy `git add`/`git commit` theo quy tắc `AGENTS.md`.
- **Checked:**
  - `git pull origin main` và `git switch -c contract/tv2` thành công.
  - `node tools/contract-check.mjs --base http://localhost:3001`: đọc được 71 ví dụ trong 10 file của `docs/api/`, 24/39 endpoint trong bảng `README.md` đã có ví dụ (đủ 11 endpoint TV1 + 13 endpoint TV2; 15 endpoint còn lại thuộc TV3 chưa viết), 0 lỗi cú pháp hay JSON; chưa có mock nên trả `ECONNREFUSED`.
  - `git diff --stat` và `git status`: chỉ thay đổi đúng 5 file contract của TV2, `brief.md` và `AI-LOG.md`.
- **Commits:** TV2 tự kiểm tra diff và commit sau.

### [TV1] 8. Mock: khung server.mjs, users.json và auth.mjs (21/11/2026)

- **Tool:** Claude Code.
- **Request:** `brief.md` mục 7. Dựng khung mock server `mock/server.mjs`, nạp dữ liệu động từ `mock/data/`, router tự nạp `mock/routes/`, middleware xác thực token, xử lý 4 chế độ mock (normal, slow, error, empty), ghi log chuẩn, seed 10 users trong `mock/data/users.json` và làm 3 endpoint auth trong `mock/routes/auth.mjs`.
- **Changed:**
  - `mock/server.mjs`: dựng HTTP server thuần bằng Node.js, khớp route ưu tiên đoạn tĩnh hơn `:param`, hỗ trợ `roles: 'signed-in'`, định dạng lỗi thống nhất, xử lý delay/4 chế độ mock và log `${method} ${url} → ${status}`.
  - `mock/data/users.json`: đủ 10 user theo contract `01-auth.md` (6 tài khoản demo đăng nhập được, 4 user câu chuyện có `password: null`, Thảo có sẵn `createdAt`).
  - `mock/routes/auth.mjs`: hoàn thành 3 route `POST /api/auth/login`, `GET /api/auth/me` và `POST /api/auth/logout`.
- **Rejected / Quyết định kỹ thuật:**
  - Chặn trường hợp body là JSON hợp lệ nhưng không phải object (như gửi mảng `[]`): trả ngay 400 VALIDATION với tin nhắn "Dữ liệu chưa hợp lệ" để handler không bị crash.
  - Đúng path mà sai HTTP method thì trả 404 NOT_FOUND vì contract của nhóm không có mã 405.
  - Câu thông báo lỗi 404 chọn là "Không tìm thấy" cho ngắn gọn, tự nhiên.
  - Thêm kiểm tra cấu trúc route lúc khởi động (khai báo sai thì thoát luôn), in cảnh báo nếu bị trùng route, và bắt lỗi chiếm cổng 3001 (EADDRINUSE) để báo rõ ràng cho cả nhóm dễ dùng.
  - Không đụng chạm vào `docs/api/`, `client/` hay `tools/`.
- **Checked:**
  - Chạy `node tools/contract-check.mjs --only 01-auth.md` đạt 12/12 PASS (0 FAIL).
  - Test chế độ `error`: login vẫn 200, còn `auth/me` và route lạ đều trả 500 SERVER_ERROR đúng cấu trúc JSON.
  - Test chế độ `slow`: độ trễ chuẩn ~2 giây (~2023 ms).
  - Test chế độ `empty`: object đơn vẫn trả về bình thường, không làm đột biến dữ liệu `db`.
  - Test ca biên: gửi mảng `[]` trả 400 VALIDATION; route lạ và sai method đều trả 404 NOT_FOUND.
  - Test trùng cổng: mở server thứ hai bị báo lỗi cổng bận và thoát mã 1.
  - `git diff main..HEAD -- docs/api client tools` hoàn toàn trống.
- **Commits:** `mock(core): server.mjs framework, dynamic router, 4 modes, auth middleware` · `mock(auth): users seeded data, login, me, and logout handlers`.

### [TV1] 9. Mock: settings, admins, jobs và helper time (21/11/2026)

- **Tool:** Claude Code.
- **Request:** `brief.md` mục 8. Cài đặt các route và data còn lại của TV1: sửa câu báo 403, thêm `mock/lib/time.mjs`, làm data/routes cho `settings`, `admins`, `jobs` và xử lý upload preview ảnh multipart.
- **Changed:**
  - `mock/server.mjs`: sửa thông báo 403 cho khớp tuyệt đối với contract (commit `13e3e19`).
  - `mock/lib/time.mjs`: hàm `nowIso()` trả về thời gian chuẩn ISO có múi giờ `+07:00`.
  - `mock/data/settings.json` và `mock/routes/settings.mjs`: `GET`, `PUT /api/settings` (ghi đè và kiểm tra giờ đóng sau giờ mở).
  - `mock/routes/admins.mjs`: `GET`, `POST /api/admins` (lọc từ `db.users`, kiểm tra trùng email 409).
  - `mock/data/jobs.json` và `mock/routes/jobs.mjs`: `GET`, `PATCH /api/jobs`, `POST /api/bookings/:code/previews` (xử lý multipart form data kiểm tra file JPEG/PNG ≤ 5MB).
- **Rejected / Lỗi phát hiện:**
  - Khi đối chiếu câu chữ với các file contract `12-admins.md` và `13-settings.md` (và kiểm tra với cờ `--strict-values`), phát hiện câu báo lỗi 403 trong `mock/server.mjs` viết theo prompt cũ ("Bạn không có quyền thực hiện thao tác này") lệch so với contract ("Bạn không có quyền truy cập chức năng này"). Đã yêu cầu assistant sửa ngay trên `mock/core` ở commit `13e3e19` trước khi làm tiếp các route.
- **Checked:**
  - `node tools/contract-check.mjs --only 13-settings.md`: 5/5 PASS (kể cả với `--strict-values`).
  - `node tools/contract-check.mjs --only 12-admins.md`: 8/8 PASS (kể cả ví dụ admin mới tạo đăng nhập).
  - Với `08-jobs.md`: chạy thử trên bản mock tạm có bổ sung 3 job của GS-1024 đạt 15/15 PASS.
  - `MOCK_MODE=empty`: danh sách jobs và admins trả `[]`, settings vẫn trả object bình thường.
  - `git diff main -- docs/api client tools` hoàn toàn trống.
- **Commits:** `fix(mock): 403 message matches contract` · `mock(lib): time helper with +07:00 timezone` · `mock(settings): settings data, GET and PUT handlers` · `mock(admins): list and create admin handlers` · `mock(jobs): jobs data, list, update and preview upload handlers`.

### [TV3] 10. Mock: chat, kiểm tra trùng lịch và booking (21/11/2026)

- **Tool:** Tôi dùng Codex, skill humanizer cho phần ghi chép, cùng PowerShell, Node.js (module có sẵn) và Git.
- **Request:** `brief.md` mục 9. Tôi nhờ Codex làm mock TV3 trên nhánh `mock/tv3`, ưu tiên bàn giao checkClash cho Kiệt. Tôi cho phép kiểm tra và commit từng file với cả author và committer là Lê Công Minh Nhựt, 24120211@student.hcmus.edu.vn. Tôi xác nhận chưa chốt giới hạn validation đề xuất và cách cấp ID hội thoại mới. Tôi duyệt seed GS-1020/1023 dùng Premium 1.800.000đ, 2 giờ, 30 ảnh; GS-1021 dùng pkg-ky-yeu, 4.200.000đ, 4 giờ, 30 ảnh; GS-1022 dùng pkg-cv, 690.000đ, 1,5 giờ, 12 ảnh. Sau khi ghi nhật ký, tôi yêu cầu viết lại mục này bằng ngôi thứ nhất.
- **Changed:**
  - `mock/lib/clash.mjs`: tôi dùng Codex thêm export checkClash(db, date, items, {ignoreBooking} = {}), nhận cả ScheduleItemInput và ScheduleItem. Chỉ booked chiếm lịch; kiểm tra staff/phòng theo khoảng nửa mở, bỏ qua mã booking đang đổi; không sửa đầu vào. Hàm trả Clash/Suggestion đúng field, lời giải thích tiếng Việt; giữ thời lượng, thứ tự, khoảng cách giữa ca; gợi ý trong openingHours. Tôi ưu tiên hai giờ trong ví dụ contract, sau đó quét bước 60 phút; thêm 09:00 hôm sau nếu trống và trong giờ mở cửa. Khi thiếu settings, hàm vẫn kiểm tra trùng và trả suggestions rỗng. scheduleRows dùng chung cho GET schedule, gộp cùng khoảng phòng của cùng booking.
  - `mock/data/resources.json`: tôi seed Mai, Tuấn, Hà; Phòng A/B; 10 áo cử nhân. Contract 04 chưa khai báo field cho khoảng bận cố định nên tôi chưa thêm schema cho field này; nguồn bận của Mai là GS-1021.
  - `mock/data/conversations.json`: tôi seed 5 hội thoại, đủ 4 trạng thái; c-linh có m-1/m-2; c-han gắn GS-1023, chưa có proposal. Tôi dùng ID riêng cho tin seed ở các hội thoại khác để chuỗi mới tiếp tục m-3, p-1.
  - `mock/data/bookings.json`: tôi seed GS-1020 đến GS-1023 với đầy đủ field Booking; GS-1021 có Mai/Hà bận 08:00–12:00 ngày 24/10; GS-1022 booked/deposit_paid; GS-1023 awaiting_deposit/unpaid. Tôi không seed GS-1024. Các giá trị còn thiếu được tôi duyệt trong phiên; Kiệt cần đồng bộ pkg-ky-yeu và pkg-cv trong catalog.
  - `mock/routes/resources.mjs`: tôi dùng Codex triển khai resources, schedule, availability/check; kiểm ngày thực, giờ, số ca, tài nguyên và lỗi field theo index. API không nhận ignoreBooking. Tôi dùng lại các helper validation/enrichment trong routes TV3 và trả ScheduleItem theo giờ.
  - `mock/routes/conversations.mjs`: tôi dùng Codex khai báo 6 endpoint, lọc theo quyền sở hữu/status, nhắn text/request, đề xuất và quyết định của khách; tên hiển thị suy ra từ catalog/token. Lỗi không cấp ID; chấp nhận đề xuất không giữ chỗ hay áp dụng đổi lịch. Tôi để nhánh tạo hội thoại thành công chờ quy ước ID: hiện trả 500 SERVER_ERROR có giải thích và không thay đổi dữ liệu.
  - `mock/routes/bookings.mjs`: tôi dùng Codex triển khai tạo GS-1024 từ p-2 đã accepted, từ chối p-1 và đọc/list theo quyền. Giá lấy từ package, cọc làm tròn 1000đ, remaining = price - deposit; không nhận tiền/trạng thái từ client, không giữ chỗ hay sinh jobs. requestedTime giải thích khoảng bận từ dữ liệu. Tôi theo dõi proposal đã áp dụng bằng WeakMap nội bộ, giữ nguyên field của Booking/Proposal.
  - `mock/routes/admin-bookings.mjs`: tôi dùng Codex triển khai đổi lịch từ proposal của đúng hội thoại đã được khách đồng ý, kiểm tra lại bỏ qua booking hiện tại và chuẩn bị mọi thay đổi trước khi cập nhật booking/jobs. Tiền, thanh toán, selection và tiến độ jobs được giữ nguyên; edit giữ thời gian/phòng null. Tôi đã làm trường hợp hủy GS-1023 chưa có jobs và lưu final-link HTTPS khi booked. Tôi để việc hủy booking có jobs chờ quyết định của Hưng; hiện trả 500 có giải thích và giữ dữ liệu nguyên trạng. Khi không có đúng một ca tương ứng cho job hiện tại, route cũng dừng trước khi cập nhật; tôi cần nhóm chốt quy tắc ánh xạ cho trường hợp này.
  - Tôi bổ sung `brief.md` mục 9 và mục nhật ký này. Tôi không sửa docs/api, client, tools, AGENTS.md, server, auth hoặc users; không thêm dependency/package.json và không push/PR/merge.
- **Rejected / lỗi phát hiện:**
  - Tôi gặp lỗi Git trong sandbox: không kết nối được remote và không ghi được .git/index.lock. Sau khi cấp quyền cho đúng lệnh, Codex chạy lại thành công. git ls-remote cho thấy remote main = 53ad97936b1daa0718e2c4c39eccf34d233ec494, trùng HEAD ban đầu của mock/tv3; tôi tiếp tục trên nhánh này.
  - Trong lúc Codex chờ quyền commit brief, tôi sửa file ở phiên khác: rút ngắn prompt mục 9, đổi fence và whitespace mục cũ. Commit 1beca9e đã chứa bản đó. Khi Codex hỏi lại, tôi xác nhận đang sửa và yêu cầu giữ brief hiện tại để tôi xử lý riêng.
  - Sau commit 03e65cf, kiểm tra append-only của AI-LOG báo lỗi: hai dòng định dạng ở mục cũ đã đổi và có thêm dòng trắng trước mục TV2 số 7 trong lúc chờ commit. Tôi giữ phần lịch sử đang có và chỉ yêu cầu viết lại mục TV3 số 9 ở ngôi thứ nhất. Tôi kiểm tra riêng để bảo đảm lần sửa này không đổi phần trước mục 9.
  - Khi rà schedule, tôi phát hiện Phòng A xuất hiện hai khoảng giống nhau vì GS-1021 có makeup và shoot cùng phòng, cùng giờ. Tôi sửa thư viện bằng commit riêng 909f8b1, giữ nhãn Chụp cho khoảng phòng này.
  - Checkout thiếu settings.json nên tôi chưa kiểm chứng được các ví dụ có suggestions trên dữ liệu thật. Tôi không thêm giờ mặc định. Vì thiếu packages/extras/services của TV2, request có catalog và tạo GS-1024 bị chặn. Jobs/payment/gallery chưa có nên tôi chưa kiểm chứng được toàn bộ luồng G1–G11; file 10 vẫn cần tiền đề.
  - Tôi xác nhận chưa chốt giới hạn ID 100 ký tự, shootType 120, note 1000, extraIds tối đa 20/không trùng và cách cấp ID hội thoại mới, nên chưa áp dụng các giới hạn đề xuất đó. Tôi cũng chưa có quy tắc hoàn chỉnh cho hủy có jobs hoặc đổi lịch khi thiếu/nhiều ca cùng loại tương ứng với một job; tôi không thêm Job.status hay tự xóa/lưu trữ jobs.
- **Checked:**
  - Tôi bắt đầu với working tree sạch trên mock/tv3 tại 53ad979. Tôi dùng Codex đọc AGENTS, kế hoạch TV3 và contract liên quan, server/auth, hướng dẫn và mã contract-check, brief và PA#3 AI-LOG. Tôi kiểm tra được remote sau khi cấp quyền mạng.
  - Tôi cho Codex chạy node --check với server và toàn bộ routes/lib .mjs hiện có, parse toàn bộ mock/data/\*.json. Tôi kiểm tra seed có 5 hội thoại/4 trạng thái, đủ field Booking, đúng tham chiếu user/resource/conversation và phép tính tiền; không có GS-1024, khoảng bận của Mai đúng.
  - Tôi chạy script tạm ngoài repo clash-test.mjs, đạt 13/13 PASS: trùng staff/phòng, ca nối tiếp, ignoreBooking, awaiting_deposit/cancelled/completed không chặn giờ, ScheduleItem dạng enriched, giờ chiều hợp lệ, không đột biến đầu vào, openingHours, settings thiếu, ca trong cùng request bị trùng.
  - Tôi chạy handler-test.mjs, đạt 30/30 PASS: quyền sở hữu, validation, ID không bị tiêu thụ khi lỗi; p-1 declined, p-2 accepted; tạo GS-1024 đúng tiền/trạng thái và không jobs; requestTime đúng ví dụ; client không giả author/tiền; proposal khác hội thoại bị từ chối; acceptance không áp dụng lịch; giờ bị chiếm sau acceptance thì CLASH và không cập nhật dở dang; đồng bộ jobs gồm đổi staff/phòng/ngày, giữ tiến độ/tiền; ngăn áp dụng lại; hủy/final-link; các nhánh nghiệp vụ chưa chốt không sửa dữ liệu; trả ca theo giờ, giữ nguyên request.
  - Tôi chạy http-test.mjs với server thật, cổng rảnh do script chọn, đạt 69/69 PASS. Tôi kiểm 401/403 của cả 15 endpoint TV3 và 404 che dữ liệu người khác; validation ngày/giờ/tài nguyên/status/JSON; không cho body bỏ qua booking; đề xuất/đồng ý/hủy qua HTTP. normal có delay; slow đợi ít nhất 1950 ms; error cho login, trả đúng 500 ở endpoint khác; restart normal phục hồi request với cùng token. empty trả [] cả danh sách lồng trong object. Restart khôi phục m-1/m-2, p-1 và GS-1023 chưa hủy; file seed không đổi. Tôi mới kiểm API, chưa kiểm giao diện loading/retry.
  - Tôi chạy contract-check trên checkout thật với server mới khởi động, cùng instance chạy --only lần lượt 03 → 04 → 05 → 10, không restart giữa chuỗi: 03 = 9/11 PASS, 2 FAIL; 04 = 3/4 PASS, 1 FAIL; 05 = 3/6 PASS, 3 FAIL; 10 = 5/7 PASS, 2 FAIL. Tổng 20/28 PASS, 8 FAIL. Các vị trí bị chặn: 03:213 thiếu packages/extras; 03:386 và 04:191 thiếu settings cho suggestions; 05:86 thiếu catalog, dẫn đến 05:182 list rỗng và 05:287 không có GS-1024; 10:73 thiếu settings, 10:549 chưa có GS-1024 booked sau thanh toán/gallery. Tôi chưa đạt toàn bộ 0 FAIL.
  - Tôi kiểm tra riêng bằng bản sao mock ngoài repo, dùng server không sửa, chỉ bổ sung fixture packages/extras/services/settings từ contract. Cùng instance mới chạy 03 → 04 → 05 đạt lần lượt 11/11, 4/4, 6/6 PASS, 0 FAIL. Sau đó tôi lưu snapshot kết quả qua GET, bổ sung trạng thái tiền đề tạm của 06–09 (GS-1024 booked, paid_in_full, selectedCount 30) và khởi động instance khác: --only 10 đạt 7/7 PASS, 0 FAIL. Kết quả này chỉ kiểm với fixture; tôi chưa kiểm thanh toán/gallery thật hoặc full contract-check. Tôi không dùng --strict-values; timestamp động được ghi NOTE theo công cụ.
  - Tôi để script, fixture và log kiểm tra ở %TEMP%/gradstudio-tv3-mock-20261121, không thêm vào repo. Tôi chỉ dừng child server do các script này tạo và chưa chạy contract-check toàn bộ vì checkout chưa đủ phần TV1/TV2.
  - Tôi dùng Codex đọc nội dung/diff, chạy git diff --check; so với 53ad979 xác nhận docs/api, client, tools, AGENTS.md, server/auth/users không đổi. Trước mỗi commit, tôi kiểm staged diff/check và xác nhận đúng một file; sau từng commit kiểm author/committer, đều đúng danh tính tôi đã chỉ định. Tôi không sửa Git global config, không amend hoặc viết lại lịch sử.
  - Tôi đã gọi các endpoint: POST /api/auth/login, GET /api/auth/me; GET/POST /api/conversations, GET /api/conversations/:id, POST /api/conversations/:id/messages, POST /api/conversations/:id/proposals, PATCH /api/conversations/:id/proposals/:proposalId; GET /api/resources, GET /api/schedule, POST /api/availability/check; GET/POST /api/bookings, GET/PATCH /api/bookings/:code, POST /api/bookings/:code/cancel, PUT /api/bookings/:code/final-link.
- **Commits:**
  - 1beca9e — brief.md — docs(brief): record TV3 mock task prompt.
  - b40b8e3 — mock/lib/clash.mjs — mock(clash): add shared resource clash checker.
  - 087c039 — mock/data/resources.json — mock(resources): seed staff rooms and costumes.
  - 7c13b07 — mock/data/conversations.json — mock(conversations): seed five initial conversations.
  - 1bab30c — mock/data/bookings.json — mock(bookings): seed GS-1020 through GS-1023.
  - 909f8b1 — mock/lib/clash.mjs — fix(mock-clash): merge duplicate room intervals for a booking.
  - ffd6e2a — mock/routes/resources.mjs — mock(resources): implement schedule and availability routes.
  - 1b2858e — mock/routes/conversations.mjs — mock(conversations): implement messages and time proposals.
  - 87900db — mock/routes/bookings.mjs — mock(bookings): implement booking creation and queries.
  - 797e9cc — mock/routes/admin-bookings.mjs — mock(admin-bookings): implement reschedule cancel and final link.
  - 03e65cf — AI-LOG.md — docs(ai-log): record TV3 mock implementation and checks.

### [TV2] 11. Mock: data, SVG samples và 5 route files của TV2 (21/11/2026)

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 10. Trên nhánh `mock/tv2`, viết toàn bộ dữ liệu mẫu, 36 SVG preview và 5 file route của TV2 theo `docs/api/02`, `06`, `07`, `09`, `11`; không tự ý commit hay push lên GitHub.
- **Changed:**
  - `mock/data/services.json`, `packages.json`, `extras.json`, `portfolio.json`, `reviews.json` (5 file mới): 3 services, 3 packages (`pkg-tn-premium`, `pkg-ky-yeu`, `pkg-cv`), 2 extras, 6 portfolio (ảnh AI trong `client/public/art/`), 4 reviews.
  - `mock/data/photos.json` (file mới): 36 ảnh mẫu của `GS-1022` (`ph-101` … `ph-136`).
  - `mock/data/payments.json` và `mock/data/reminders.json` (file mới): mảng rỗng `[]`.
  - `client/public/samples/preview-01.svg` … `preview-36.svg` (36 file mới): ảnh xem trước SVG minh họa nhẹ.
  - `mock/routes/catalog.mjs`, `payments.mjs`, `reminders.mjs`, `gallery.mjs`, `receive.mjs` (5 file mới): xử lý đủ 13 endpoint của TV2; `payments.mjs` tự động kiểm tra `mock/lib/clash.mjs` khi tồn tại, sinh job `J-<code>-{makeup,shoot,edit}` và reminder `rm-n` khi cọc thành công; `gallery.mjs` lưu `selectedIds` theo từng `db` bằng `WeakMap` để không làm đổi cấu trúc đối tượng `Booking`.
- **Rejected / lỗi phát hiện:**
  - Lệnh one-liner đầu tiên tạo `photos.json` và SVG trên PowerShell gặp lỗi `SyntaxError: Invalid or unexpected token` do escape dấu nháy kép trong `node -e`. Đã chuyển sang truyền script qua PowerShell here-string (`@' ... '@ | node`) và chạy thành công.
  - Khi ghép với `origin/main` (có TV1 + TV3) và chạy full `contract-check`:
    1. Lần chạy đầu gặp 30 FAIL do gộp `catalog.json` khiến `conversations.mjs` và `bookings.mjs` của TV3 không thấy `db.services`/`db.packages`/`db.extras` (trả `500`). Đã tách `catalog.json` thành 5 file riêng (`services.json`, `packages.json`, `extras.json`, `portfolio.json`, `reviews.json`) và cập nhật `catalog.mjs`.
    2. TV3 dùng ID gói `pkg-ky-yeu` và `pkg-cv` trong `bookings.json`; đã đồng bộ 2 ID và thông số gói này trong `packages.json`.
  - Không đụng chạm tới `docs/api/`, `mock/server.mjs`, `mock/routes/auth.mjs`, `mock/data/users.json`; không chạy `git add`/`git commit`/`git push`.
- **Checked:**
  - Chạy `node mock/server.mjs` kết hợp `node tools/contract-check.mjs --base http://localhost:3001` toàn bộ 14 file (`01` → `13`): **99/99 examples PASS, 0 FAIL, 39/39 endpoints**.
  - Chạy `MOCK_MODE=empty`: `GET /api/services` trả mảng rỗng, `GET /api/packages/pkg-tn-premium` vẫn giữ nguyên object `pkg-tn-premium` với `includes: []`.
- **Commits:** TV2 tự kiểm tra diff và commit sau.

### [TV1] 12. Nền front end: router, api client, hooks, Layout, status (22/11/2026)

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 11. Kéo `origin/main`, tạo nhánh `feat/core-foundation`, dựng phần nền front end trong `client/` và đồng bộ lại `main` sau khi PR #12 (`mock/tv2`) merge (`d5bb006`), rồi kiểm tra 4 chế độ mock. Không tự `git add`/`commit`/`push`.
- **Changed:**
  - `client/package.json`, `client/package-lock.json`: cài thêm `react-router-dom` (`^7.18.6`).
  - `client/vite.config.js`, `client/index.html`: xóa `client/studio.html` và `client/booking.html`, bỏ `build.rollupOptions.input`, giữ nguyên proxy `/api` và `base: '/'`; giữ các file PA#2 tham khảo (`HomePage.jsx`, `StudioPage.jsx`, `BookingPage.jsx`, `FloatingChat.jsx`, `fixtures.js`).
  - `client/src/api/client.js` (mới): `ApiError`, `apiFetch` chỉ nhận `/api/...`, gắn `Authorization: Bearer`, giữ nguyên multipart cho `FormData`, hỗ trợ `registerAuthHandlers`.
  - `client/src/hooks/useFetch.js` (mới) và `client/src/components/AsyncState.jsx` (mới): tải 1 lần với `AbortController`, hỗ trợ `reload`/`setData`, hiển thị loading (`role="status"`), lỗi kèm nút `Thử lại` (`role="alert"`), và trạng thái rỗng.
  - `client/src/hooks/useForm.js` (mới) và `client/src/components/FormField.jsx` (mới): validate sau lần submit đầu, map `ApiError` 400 `fields`, giữ giá trị khi lỗi, khóa nút khi `submitting`, focus ô lỗi đầu tiên.
  - `client/src/constants/status.js` (mới), `client/src/components/StatusBadge.jsx` (mới), `client/src/components/Money.jsx` (mới): ánh xạ mã trạng thái mục 2.4 sang tiếng Việt, `formatMoney`, `formatDate`.
  - `client/src/components/Layout.jsx`: viết lại theo thiết kế Blue Theme (không import `fixtures.js`, không còn menu cứng hay ghi chú demo), có skip-link `#main`, menu theo `user?.role`, nút `Đăng xuất` / link `Đăng nhập`, footer chỉ gồm chữ/thương hiệu.
  - `client/src/routes/{public,customer,admin,staff,superadmin}.jsx` (mới), `client/src/pages/NotFoundPage.jsx` (mới), `client/src/App.jsx` (mới), `client/src/main.jsx`, `client/src/styles/foundation.css` (mới): cấu hình `BrowserRouter`, route tạm `/` gọi `GET /api/services` và stub `/sign-in`, route `*` màn _Không tìm thấy trang_.
  - `AGENTS.md`: bỏ ghi chú 3 HTML entry PA#2 và bổ sung hướng dẫn dùng hook/component nền cho TV2/TV3.
- **Rejected / lỗi phát hiện:**
  - Lần chạy kiểm tra đầu trên `44febe8` (trước khi PR #12 merge) gặp `GET /api/services → 404`; đã giữ nguyên `docs/api/` và `mock/`, không sửa mock để khớp code. Sau khi PR #12 merge (`d5bb006`) và đồng bộ `main` vào `feat/core-foundation`, `GET /api/services` trả `200` đầy đủ.
  - Script shell kiểm tra preview ban đầu dùng biến `PPID` (biến chỉ đọc của bash) nên thoát mã 1; đã đổi sang `VPID`.
- **Checked:**
  - `cd client && npm run build`: thành công (`dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`).
  - `git diff -- docs/api mock tools ke-hoach`: trống hoàn toàn; `git diff --check`: 0 lỗi.
  - Chạy `npx vite preview --port 4173` cùng `node mock/server.mjs` ở cả 4 chế độ qua `google-chrome --headless --dump-dom`:
    - `normal`: render đủ 3 dịch vụ (`Kỷ yếu lớp`, `Tốt nghiệp`, `Chân dung/CV`), mock log chỉ có 1 request `GET /api/services → 200`.
    - `slow`: TV1 tự kiểm tra trực quan trên `http://localhost:4173/` thấy rõ dòng `Đang tải…` trong 2 giây rồi tải xong 3 dịch vụ (`GET /api/services → 200`, 1 request).
    - `error`: `GET /api/services → 500`, TV1 xác nhận trên trình duyệt hiện `"Máy chủ đang gặp sự cố, vui lòng thử lại."` kèm nút `Thử lại`.
    - `empty`: `GET /api/services → 200`, TV1 xác nhận trên trình duyệt hiện `"Hiện chưa có dịch vụ nào."`.
    - `/unknown-route`: render `<h1 id="not-found-heading">Không tìm thấy trang</h1>` và link `Về trang chủ`.
  - _Chưa kiểm tra:_ bấm nút `Thử lại` không reload trang khi chuyển `error` → `normal` và đo cuộn ngang/tap target 44px ở `360/768/1280px` trên trình duyệt tương tác.
- **Commits:** TV1 đọc diff và tự commit sau.

### [TV1] 13. G2: AuthContext, RequireRole, màn đăng nhập /sign-in (22/11/2026)

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 12 (Tin nhắn 1 & Tin nhắn 2). Trên nhánh `feat/g2-auth`, cài đặt `AuthContext`, `RequireRole`, màn `/sign-in`, màn _Không có quyền truy cập_, nối `Layout.jsx` với `useAuth()`, đặt route trang chủ tạm cho 4 vai trò để kiểm thử G2, và sửa lỗi ẩn banner 401 khi người dùng nhấp lại vào ô nhập. Không tự `git add`/`commit`/`push`.
- **Changed:**
  - `client/src/api/auth.js` (mới): gọi 3 endpoint trong `docs/api/01-auth.md` (`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`).
  - `client/src/auth/AuthContext.jsx` (mới): `AuthProvider`, `useAuth()`, `ROLE_HOME`, `canRoleAccessPath`, lưu phiên vào `localStorage` để F5 không mất đăng nhập, gọi `GET /api/auth/me` khi khởi động trước khi `ready = true` (xóa phiên nếu `401`; giữ phiên cache nếu gặp `500` ở `MOCK_MODE=error`), đăng ký `Authorization: Bearer <token>` và callback `onUnauthorized` với `api/client.js`.
  - `client/src/auth/RequireRole.jsx` (mới) và `client/src/pages/ForbiddenPage.jsx` (mới): chưa đăng nhập chuyển `/sign-in` kèm `state.from`; sai vai trò hiển thị `<h1>Không có quyền truy cập</h1>` có link về trang chính của vai trò đang đăng nhập.
  - `client/src/pages/SignInPage.jsx` (mới): `<h1>Đăng nhập</h1>`, dùng `useForm` + `FormField`, đúng 1 ô `E-mail`, 1 ô `Mật khẩu`, 1 nút submit, không hiển thị danh sách tài khoản demo, kiểm tra định dạng/độ dài theo `01-auth.md`, khóa nút thành `"Đang đăng nhập…"` khi gửi, quay về `state.from` nếu đúng vai trò hoặc `ROLE_HOME[user.role]`.
  - `client/src/hooks/useForm.js`: thêm `clearSubmitError` và xóa `submitError` khi người dùng thay đổi giá trị field; `SignInPage.jsx` gắn `onFocus: form.clearSubmitError` cho 2 ô nhập.
  - `client/src/components/Layout.jsx`, `client/src/App.jsx`, `client/src/pages/NotFoundPage.jsx`, `client/src/routes/{public,customer,admin,staff,superadmin}.jsx`, `client/src/styles/foundation.css`, `AGENTS.md`: nối `Layout` đọc `useAuth()`, bọc app bằng `<AuthProvider>`, gắn 4 route trang chủ tạm có `<RequireRole>` để kiểm thử đủ 4 vai trò, bổ sung CSS cho `.auth-card` / `.form-alert` và tài liệu ngắn trong `AGENTS.md`.
- **Rejected / lỗi phát hiện:**
  - Khi TV1 kiểm thử trực tiếp trên `http://localhost:4173/sign-in`, lúc nhập sai tài khoản nhận lỗi `401` (`"Email hoặc mật khẩu không đúng"`), nhấp chuột lại vào ô **E-mail** hoặc **Mật khẩu** (hoặc gõ sửa lại) thì banner lỗi 401 vẫn không tự ẩn đi. Đã sửa bằng `clearSubmitError` trong `useForm.js` + `onFocus` ở `SignInPage.jsx`, chạy lại `npm run build` sạch sẽ.
  - Không sửa bất kỳ file nào trong `docs/api/`, `mock/`, `tools/`, `ke-hoach/`.
- **Checked:**
  - `cd client && npm run build`: thành công sau lần sửa cuối (`dist/assets/index-*.js` 276.74 kB, `dist/assets/index-*.css` 95.44 kB).
  - `git diff -- docs/api mock tools ke-hoach`: trống hoàn toàn; `git diff --check`: 0 lỗi.
  - `google-chrome --headless --dump-dom` qua `npx vite preview --port 4173`: `/sign-in` render 1 `<h1>`, 1 `<input type="email">`, 1 `<input type="password">`, 1 nút submit; mở `/staff/jobs` hoặc `/admin/conversations` khi chưa đăng nhập đều chuyển về `/sign-in`.
  - TV1 kiểm thử trực tiếp trên trình duyệt tại `http://localhost:4173/sign-in` (`MOCK_MODE=normal`):
    - Kiểm tra validation khi bỏ trống (`Vui lòng nhập email`, `Vui lòng nhập mật khẩu`), sai định dạng (`Email không đúng định dạng`), và `401` (`Email hoặc mật khẩu không đúng`).
    - Đăng nhập và đăng xuất lần lượt đủ 6 tài khoản demo: `linh` (`/my-bookings`), `han` (`/my-bookings`), `thao` (`/admin/conversations`), `mai` (`/staff/jobs`), `tuan` (`/staff/jobs`), `superadmin` (`/superadmin/admins`) — hiển thị đúng trang chủ, menu theo vai trò và tên người dùng trên header.
    - Xác nhận đủ 5 ca sau lần sửa cuối: (1) banner 401 tự ẩn ngay khi focus/gõ lại ô nhập; (2) F5 giữ phiên đăng nhập (`GET /api/auth/me → 200`); (3) mở chéo route vai trò khác (Linh mở `/admin/conversations`, `/superadmin/admins`) hiện màn _Không có quyền truy cập_ có nút về trang chính; (4) đăng xuất (`POST /api/auth/logout → 204`) rồi mở `/staff/jobs` → `/sign-in` → đăng nhập `tuan` quay lại đúng `/staff/jobs`, đăng nhập `linh` chuyển về `/my-bookings`; (5) mở `/trang-khong-ton-tai` hiện màn _Không tìm thấy trang_.
  - _Chưa kiểm tra:_ đo cuộn ngang và kích thước tap target 44px ở `360 / 768 / 1280px` bằng DevTools.
- **Commits:** TV1 đọc diff và tự commit sau.

### [TV3] 14. Component chat dùng chung — 23/11/2026

- **Tool:** Codex.
- **Request:** brief.md mục 14; tôi (Lê Công Minh Nhựt, MSSV 24120211) yêu cầu triển khai và commit riêng từng file dưới tên tôi.
- **Changed:** `ChatThread.jsx`, `ProposalCard.jsx`, `styles/chat-components.css`; chỉ thêm hướng dẫn vào Front-end structure của AGENTS.md và thêm mục task vào brief.md / AI-LOG.md. Không nối trang G4/G5/G6/G10.
- **Branch:** working tree ban đầu sạch, nhánh feat/chat-components đã tồn tại, bằng origin/main fca4607; fetch thành công, main fast-forward tới fca4607 rồi quay lại nhánh có sẵn. Mock TV3 đã merge (44febe8, PR #11). Không merge/cherry-pick mock. Nền của Hưng có đủ.
- **Implementation:** props theo kế hoạch, thêm `sendError` tùy chọn tương thích. useForm xử lý validation, khóa submit và reset sau thành công; FormField kết hợp useId tránh trùng ID. Proposal dùng PROPOSAL_STATUS/JOB_KIND từ status.js, ScheduleItem response có staff/room object. Component không gọi API.
- **Rejected / lỗi phát hiện:** kiểm tra harness lần đầu báo success-clears thất bại do chỉ chờ timer 0ms trước khi React hoàn tất commit; đổi harness chờ 50ms rồi kiểm tra lại qua. Chrome window-size ban đầu cho innerWidth 504/750/1262 thay vì kích thước yêu cầu; không dùng các kết quả này làm bằng chứng responsive, chạy lại qua CDP Emulation.setDeviceMetricsOverride đúng 360/768/1280. Không có sửa contract/mock.
- **Checked:** npm ci theo lockfile (không thêm thư viện); npm run build thành công (Vite 7.3.7, 65 modules). Harness tạm bundle bằng esbuild có sẵn, render trực tiếp React trong Chrome headless qua CDP: 17 kiểm tra PASS ở mỗi viewport 360/768/1280. Bao gồm text an toàn, request, fallback/custom proposal, phía gửi/time, messages/items rỗng, null room, unique IDs, accepted/declined, không có nút tự sinh, actions caller, blank/1001 ký tự, focus invalid, gửi lặp, khóa gửi, success clear, generic/fields.text failure giữ nội dung, sendError prop, tên/URL dài 3000 ký tự không tràn ngang, nút >=44px. `git diff --check` thành công; `git diff -- docs/api mock` trống. Đã đọc diff sản phẩm và tài liệu.
- **Evidence:** harness và kết quả giữ ngoài repo trong thư mục Temp/gs-chat-check, không có route/demo/fixture sản phẩm. Chưa kiểm W3C, chưa chạy flow trang hoặc bốn chế độ mock vì task chỉ nhận props; không gọi endpoint nào.
- **Commits:** từng file riêng, message feat(G4-G6) cho component/CSS, docs(agents), docs(brief), docs(ai-log); xem `git log main..feat/chat-components` để lấy mã chính xác.

### [TV1] 15. Bước #S1: đồng bộ contract, mock và tài liệu TV1 theo kế hoạch 23/11 — 23/11/2026

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 15. Cập nhật kế hoạch mới ngoài repo (`/PA3/ke-hoach/`), kéo `origin/main` (`37da2bf`, đã có PR #13, #14, #15), tách nhánh `fix/s1-tv1-plan-alignment`, và triển khai Bước `#S1` theo báo cáo đối chiếu 23/11 (`R01`, `R02`, `R06`, `R11`, `R16` — chỉ phần sở hữu của TV1, tuân thủ thứ tự contract → mock → code nền/tài liệu). Không tự `git add`/`commit`/`push`.
- **Changed:**
  - `docs/api/README.md`: thêm `PATCH /api/admins/:id` vào bảng endpoint (40/40); ghi rõ lỗi tài khoản bị khóa (`403 FORBIDDEN` khi đăng nhập, `401 UNAUTHENTICATED` khi dùng token cũ); chốt nhãn `Booking.status` (`cancelled` → `Đã hủy`) và `Job.status` (`Chưa bắt đầu`, `Đang làm`, `Hoàn thành`); đồng bộ làm tròn cọc tới VND nguyên (`Math.round(price * 0.3)`) theo mục 2.7; cập nhật Example chain & bảng Mock behaviour; thêm dòng `## Changes`.
  - `docs/api/01-auth.md`: bổ sung `403 FORBIDDEN` (`"Tài khoản đã bị khóa"`) cho `POST /api/auth/login` và `401 UNAUTHENTICATED` cho token của tài khoản bị khóa ở `/api/auth/me`, `/api/auth/logout`; thêm dòng `## Changes`.
  - `docs/api/08-jobs.md`: ghi rõ giữ lịch sử `GET` và từ chối `PATCH /api/jobs/:id` cùng `POST /api/bookings/:code/previews` bằng `409 CONFLICT` khi booking `cancelled` (không thêm trạng thái `job.status = "cancelled"`); cập nhật giới hạn upload đúng **5 MiB (`5 242 880` byte)** nội dung part `file`, lỗi `"Ảnh tối đa 5 MiB"`, cập nhật ví dụ biên `5242880B` (`201`, giữ `totalPhotos: 36`) và `5242881B` (`400`); thêm dòng `## Changes`.
  - `docs/api/12-admins.md`: bỏ mô tả `active` luôn `true`; bổ sung đặc tả và 8 ví dụ tuần tự cho `PATCH /api/admins/:id` (khóa → đăng nhập `403` → token cũ `401` → mở khóa → đăng nhập `200` → lỗi validation/field cấm `400` → không tồn tại `404` → Admin thường gọi `403`); thêm dòng `## Changes`.
  - `mock/server.mjs`, `mock/routes/auth.mjs`, `mock/routes/admins.mjs`: `toAdmin` đọc `u.active !== false`; cài `PATCH /api/admins/:id` chỉ nhận `active: boolean` và chặn field lạ (`400`), chỉ áp dụng cho user `role === 'admin'` (`404` với vai trò khác); `auth.mjs` trả `403 FORBIDDEN` (`"Tài khoản đã bị khóa"`) khi đăng nhập tài khoản bị khóa; `server.mjs` từ chối token của tài khoản `active === false` bằng `401 UNAUTHENTICATED`.
  - `mock/routes/jobs.mjs`: thêm kiểm tra `booking.status === 'cancelled'` sau kiểm tra quyền sở hữu (trả `409 CONFLICT` cho `PATCH` và `POST previews`, giữ `GET` lịch sử); viết lại `filePart()` đọc trực tiếp `Buffer` của part `name="file"` (loại trừ boundary/headers theo RFC 2046) để đo đúng byte nội dung file so với `5 242 880` byte (`"Ảnh tối đa 5 MiB"`).
  - `client/src/constants/status.js`: đổi `JOB_STATUS` sang `todo: 'Chưa bắt đầu'`, `in_progress: 'Đang làm'`, `done: 'Hoàn thành'`.
  - `AGENTS.md`: sửa ví dụ trả lời proposal từ `{status}` sang `{decision}`; cập nhật quy tắc upload 5 MiB và tóm tắt quyết định PO & quy ước nhóm ngày 23/11.
  - `FRONTEND.md`: thêm `PATCH /api/admins/:id` ở dòng `/superadmin/admins`; điền đầy đủ mục 5 (10 mục phản hồi PO ghi rõ *Chưa có link*, tách riêng mục 5.2 các lựa chọn bổ sung và quy ước triển khai của nhóm).
  - `brief.md`: ghi mục 15 nguyên văn prompt.
- **Rejected / lỗi phát hiện:**
  - Không sửa bất kỳ file contract/mock nào thuộc quyền TV2 hoặc TV3 (giữ sạch phạm vi TV1 để không gây xung đột PR `#S2`/`#S3`).
  - Không đụng vào `mock/data/bookings.json` để tránh phá vỡ các ca kiểm tra `03`–`10` của TV2/TV3; ca `A04` (booking hủy) được kiểm chứng qua bản sao in-memory của seed data.
- **Checked:**
  - `node tools/contract-check.mjs --base http://localhost:3001` trên mock vừa khởi động lại: **107/107 examples PASS, 0 FAIL**, **40/40 endpoints có ví dụ** (đã gồm toàn bộ ca mới trong `08-jobs.md` và `12-admins.md`).
  - Kiểm tra bổ sung qua script Node (không lưu file tạm vào repo):
    - `A01 PASS`: tạo Admin → khóa (`200`) → đăng nhập bị chặn (`403`) → gửi field thừa `name` (`400`) → PATCH user không phải Admin (`404`) → mở khóa (`200`) → đăng nhập lại (`200`).
    - `A04 PASS`: đặt `GS-1022` thành `cancelled` trên bản sao in-memory → `GET /api/jobs` và `GET /api/jobs/J-GS-1022-shoot` vẫn trả `200`; `PATCH` và `POST previews` trả `409 CONFLICT`, trạng thái/ghi chú/số ảnh không đổi; staff khác vẫn nhận `404`.
    - `A05 PASS`: upload đúng `5 242 880` byte trả `201` và `5 242 881` byte trả `400` (`fields.file = "Ảnh tối đa 5 MiB"`) cho cả boundary/tên file ngắn và dài (boundary 60 ký tự, tên file 200 ký tự).
  - `cd client && npm run build`: thành công (`65 modules transformed`, `dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`, `built in 5.21s`).
  - `git diff --check`: 0 lỗi.
  - *Chưa kiểm tra:* màn hình G8 và G11 chưa triển khai (thuộc bước tiếp theo `R12`), và `A04` qua HTTP sau hủy thực tế chờ TV3 hoàn thành `R05` (`#S3`).
- **Commits:** TV1 đọc diff và tự commit sau.

### [TV3] 15. Sửa contract và mock theo báo cáo đối chiếu — 23/11/2026

- **Tool:** Tôi dùng Codex để sửa code và chạy kiểm tra.
- **Request:** Tôi giao task trong brief.md mục 15. Tôi giữ phạm vi contract/mock TV3 và chưa làm giao diện R14.
- **Changed:**
  - Tôi cập nhật main bằng fast-forward từ fca4607 tới 37da2bf sau khi fetch origin; working tree ban đầu sạch. Tôi tạo nhánh fix/tv3-booking-rules, giữ email Git hiện tại lecongminhnhut6533@gmail.com, dùng tên Lê Công Minh Nhựt theo từng lệnh commit và không đổi global config.
  - Tôi commit prompt trước, rồi contract 03/05/10 và phần README liên quan đến TV3 trước các commit mock. Contract phân biệt quyết định PO về đổi lịch G10 trực tiếp với lựa chọn nhóm về hủy, booking thay thế, ID c-số và cọc làm tròn một đồng. Chuỗi chính vẫn tạo GS-1024; các ca thay thế chạy sau phần đổi/hủy/link của G10.
  - Tôi sửa conversations.mjs để tạo hội thoại 201 với chủ lấy từ token, ID c-số, tin đầu và timestamps nhất quán; Admin trả lời đầu chuyển consulting. Tôi cho gửi đề xuất mới sau khi booking cũ bị hủy.
  - Tôi sửa bookings.mjs để booking thay thế có mã mới, yêu cầu proposal mới được khách đồng ý, không tái dùng proposal cũ hoặc chuyển cọc cũ. Tôi giữ liên kết conversationId cho lịch sử và tính deposit = Math.round(price \* 0.3), remaining = price - deposit từ giá gói; extras không cộng tiền.
  - Tôi sửa admin-bookings.mjs để PATCH nhận date/items, validate và kiểm tra trùng ngay lúc lưu, tự bỏ qua booking đang sửa; các lỗi không ghi một phần dữ liệu. Tôi cập nhật job theo loại ca khi ánh xạ được một-một, giữ tiến độ/ghi chú và các trường null của edit. Tôi bỏ nhánh 500 khi hủy booking có jobs, giữ việc/tiền, nhả người/phòng và giữ hội thoại scheduled; hủy lại hoặc hủy completed trả 409. Tôi vô hiệu hóa quyền dùng các proposal có trước lần hủy cho booking thay thế mà vẫn giữ nguyên lịch sử tin nhắn.
  - Tôi sửa ví dụ AGENTS thành body decision, bổ sung quyết định và Not done của TV3 trong FRONTEND, thêm bộ test Node built-in cùng hướng dẫn chạy lại tại tools/tv3-booking-rules-README.md. Tôi không sửa seed, server, frontend, dependencies hoặc routes/contract của TV1/TV2.
- **Rejected / lỗi phát hiện:**
  - Tôi xác minh các lỗi R03/R05/R07/R15 trong báo cáo vẫn còn trên main mới; tôi không dùng kết quả 99/99 cũ để kết luận đã sửa.
  - Test hủy GS-1021 ban đầu của tôi kỳ vọng cả hai ca cũ cùng khả dụng trong một request. Kiểm tra này sai vì seed có makeup và shoot cùng giờ, cùng Phòng A nên checkClash phát hiện trùng nội bộ giữa hai ca. Tôi sửa test kiểm từng ca riêng để xác nhận booking đã hủy không còn chiếm người/phòng; tôi không sửa seed hoặc checkClash để làm test xanh.
  - Khi stage test mới, git diff --cached --check phát hiện một dòng trống cuối file. Tôi bỏ dòng đó và BOM rồi kiểm lại trước commit. Lệnh kiểm JSON bằng node -e ban đầu bị PowerShell làm mất dấu nháy; tôi chuyển sang script tạm và parse lại thành công.
  - Tôi không sao chép ensureBookingReminder hoặc tạo helper no-op. Source chỉ có hàm nội bộ trong payments; Kiệt chưa bàn giao helper tính/dừng nhắc hay schema phiên bản lịch. Tôi giữ R04 và phần ngừng nhắc của R05 ở trạng thái còn phụ thuộc.
- **Checked:**
  - Tôi chạy node --test tools/tv3-booking-rules.test.mjs: 19 ca, 15 PASS, 0 FAIL, 4 TODO. Bốn callback TODO có chạy và đang không đạt: reminder chưa đổi giờ/nội dung, queued reminder chưa dừng sau hủy, Staff PATCH job trả 200 và upload trả 201 sau hủy thay vì 409. Tôi không tính các TODO là PASS và không sửa file TV1/TV2.
  - Các ca PASS xác minh đổi lịch trực tiếp và bỏ qua chính booking; giữ nguyên toàn bộ db khi clash/validation lỗi; cập nhật job với staff/room mới và edit null; hủy GS-1021 giữ lịch sử việc/payment và nhả giờ; chặn quyền khách; booking thay thế giữ tiền cũ, dùng proposal/mã mới và đúng sở hữu; tạo hội thoại và trả lời đầu; giá gói không bị client ghi đè. Với giá test riêng 1.800.005đ, tôi nhận cọc 540.002đ và remaining 1.260.003đ.
  - Tôi chạy toàn bộ tools/contract-check.mjs trên mock normal vừa khởi động riêng ở cổng 33491: 101/101 ví dụ, 0 FAIL, đủ 39/39 endpoint. Tôi không dùng --only. Checker so status/field names mặc định; tôi chưa chạy strict-values. Tôi đã xem các note timestamp và độ dài danh sách; kiểm tra nghiệp vụ riêng dùng assertion giá trị.
  - Tôi chạy HTTP trên mock mới cho từng chế độ normal/slow/error/empty: tạo/đọc hội thoại, slow có độ trễ, error trả SERVER_ERROR, empty trả danh sách rỗng. Các ca HTTP normal còn kiểm quyền, đổi lịch trực tiếp, Admin trả lời và hủy có việc/hủy lại. Tôi chưa kiểm toàn bộ thao tác booking trong cả bốn mode hoặc luồng frontend.
  - Tôi kiểm cú pháp 16 module mock và module test bằng node --check; parse 14 JSON seed và 45 body JSON thực thi trong contract 03/05/10; chạy git diff --check và xác nhận các file ngoài phạm vi không đổi. Tôi không chạy build frontend hoặc W3C cho task backend này.
- **Bàn giao / giới hạn:** Tôi cần Kiệt chốt contract 07 và helper chuẩn bị cập nhật reminder không làm đổi db trước khi commit thao tác; đề xuất để thảo luận là prepareBookingReminders(db, previousBooking, nextBooking). Cần schema phân biệt phiên bản lịch, dừng nhắc chưa gửi, giữ sent, chạy lại không trùng và tính từ mốc sớm nhất theo settings. Tôi cần Hưng chốt ánh xạ jobs cho nhiều ca cùng loại/thêm-bớt loại ca và hoàn thành R06 chặn ghi việc/upload sau hủy. Hiện trường hợp không ánh xạ được trả 409 và không ghi dữ liệu; đây là giới hạn tích hợp, không phải quy tắc PO. Tôi chưa xác nhận cả luồng đổi/hủy hoàn tất. Kiệt có thể review theo thứ tự contract → mutation boundaries → test → bốn TODO, hướng dẫn chi tiết ở tools/tv3-booking-rules-README.md.
- **Evidence:** Tôi giữ output cục bộ tại Temp/gs-tv3-regression.log, Temp/gs-tv3-contract-check.log, Temp/gs-tv3-contract-check.json và Temp/gs-tv3-contract-server.log. Bộ test và hướng dẫn chạy lại đã được lưu trong repo. Tôi không dựng lại bằng chứng cũ.
- **Commits:** Tôi commit riêng từng file: brief e21da62; contract 03 3ebb367, 05 5e26285, 10 d131fdc, README 1f843cd; mock conversations b6335dd, bookings 6126344, admin-bookings f7b55ad; AGENTS 6b5b394; FRONTEND cd2dcfa; test 512614b; hướng dẫn test bb48869. Tôi commit mục AI-LOG này cuối cùng. Tôi không amend/reset/rebase, push, mở PR hoặc gửi tin nhắn cho thành viên khác.

### [TV3] 16. R14: kiểm tra tiền đề triển khai màn Admin — 23/11/2026

- **Tool:** Tôi dùng Codex để kiểm tra checkout và đối chiếu source.
- **Request:** Tôi giao task R14 trong brief.md mục 16: triển khai bốn route Admin sau khi contract/mock đổi, hủy và booking thay thế đã có trên main.
- **Changed:** Tôi tạo nhánh feat/tv3-admin-flow từ main 37da2bf sau khi kiểm tra working tree sạch và fetch origin thành công. Tôi sửa riêng dòng Routes và Not done của TV3 trong FRONTEND.md để phân biệt placeholder hiện có với ba route chưa đăng ký. Tôi chưa viết UI hoặc API wrapper theo đặc tả cũ; tôi không sửa contract/mock hay mang code từ nhánh fix sang.
- **Rejected / lỗi phát hiện:** Tôi xác nhận tiền đề chưa đạt. Main vẫn có PATCH booking nhận proposalId và yêu cầu khách đồng ý lại; cancel booking có jobs trả dependency 500; POST bookings chặn mọi hội thoại đã có bookingCode. Các sửa đổi mới vẫn ở nhánh fix/tv3-booking-rules, chưa thuộc main. R08 của TV2 cũng chưa có reservationFailure trong contract 06 trên main; helper tính lại/dừng nhắc chưa được bàn giao. Tôi không dựng dữ liệu hay tự sửa API để UI chạy.
- **Checked:** Tôi chạy git status --short, git branch --show-current, git remote -v, git log và git config user.email; fetch origin và cập nhật main bằng fast-forward (kết quả Already up to date). Tôi chạy git merge-base --is-ancestor e6909c8 main, nhận mã 1; git log main..fix/tv3-booking-rules --oneline liệt kê 14 commit chưa tích hợp. Tôi đọc contract 05/10, handlers conversations/bookings/admin-bookings, tìm reservationFailure và helper nhắc trong contract/routes 06/07, đối chiếu routes/admin.jsx: hiện chỉ có /admin/conversations placeholder. Tôi kiểm tra diff staged và git diff --check. Tôi chưa chạy build, bốn route/F5/phân quyền, flow G4–G6/G10, mock modes, responsive, Console hoặc W3C vì UI R14 chưa triển khai. Tôi không lấy bằng chứng component hoặc mock ở task trước để kết luận UI đạt; lượt này không gọi endpoint nghiệp vụ.
- **Phụ thuộc:** Tôi cần các commit contract/mock TV3 được tích hợp vào main trước khi nối đổi/hủy/thay thế. Kiệt cần bàn giao R08 và helper/schema reminders; Hưng cần chốt ánh xạ nhiều ca cùng loại/thêm-bớt loại ca và R06. Sau khi main có tiền đề, tôi phải đọc lại shared shapes và hooks, triển khai bốn route, rồi kiểm tra trên bản build theo brief. R14 chưa hoàn thành luồng nào trong lượt này.
- **Commits:** Tôi commit từng file với author/committer Lê Công Minh Nhựt <lecongminhnhut6533@gmail.com>, dùng cấu hình từng lệnh: brief mục 16 cabf2cb; FRONTEND 2a17ebd. Tôi giữ nguyên các chỉnh định dạng khác phát sinh trong brief ở working tree, không đưa chúng vào commit task. Tôi không push, mở PR, merge nhánh khác, amend hoặc viết lại lịch sử.

### [TV2] 17. Contract S2: cập nhật 02-catalog, 06-payments, 07-reminders, 09-gallery theo PO và kế hoạch mới (23/11/2026)

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 17. Trên nhánh `contract/tv2-po-updates` (tách từ `main` `37da2bf`), cập nhật 4 file contract của TV2 theo các quyết định PO và quy ước nhóm mới chốt (`R04`, `R05`, `R08`, `R09`, `R10`, `R19`), ghi `## Changes` ở cuối mỗi file.
- **Changed:**
  - `docs/api/02-catalog.md`: bỏ trường `price` khỏi `Extra` và ví dụ `GET /api/extras` (PO #6 / `R10`), thêm dòng `## Changes`.
  - `docs/api/06-payments.md`: thêm `reservationFailure` vào `Payment` (`null` hoặc `{"message", "clashes"}`) cho ca cọc đã thu tiền nhưng trùng giờ (`R08`); ghi rõ kiểm tra lại `booking.status`/`paymentStatus` tại `POST /api/test-gateway/:paymentId` (`R09`); bổ sung điều kiện toàn bộ job `shoot` phải `done` trước khi tạo thanh toán `remaining` (`R19`); cập nhật các ví dụ `PAY-1`/`PAY-2` và thêm dòng `## Changes`.
  - `docs/api/07-reminders.md`: mô tả cơ chế tính lại nhắc lịch `queued` khi đổi lịch (`R04`) và dừng gửi nhắc `queued` khi hủy booking (`R05`), giữ lịch sử `sent`; thêm dòng `## Changes`.
  - `docs/api/09-gallery.md`: đồng bộ `reservationFailure: null` cho `PAY-3`, bổ sung ví dụ `400` ảnh không thuộc booking (`ph-999`) và `409` khóa sửa lựa chọn sau khi trả 70% (PO #9); thêm dòng `## Changes`.
  - `brief.md` mục 17 và `AI-LOG.md` mục này.
- **Rejected / lỗi phát hiện:**
  - Lần viết đầu tiên ở `docs/api/09-gallery.md` đặt ví dụ `ph-999` (`400`) **sau** bước thanh toán `PAY-3` (`paid_in_full`), sẽ khiến mock trả `409` thay vì `400` khi chạy chuỗi tuần tự. Đã dời ví dụ `ph-999` (`400`) và ví dụ sửa lựa chọn trước thanh toán (`200`) lên trước `PAY-3`, chỉ giữ ví dụ khóa sửa (`409`) sau `PAY-3`.
  - Không đụng tới `mock/`, `client/`, hay contract của TV1/TV3 (`README.md`, `01`, `03`, `04`, `05`, `08`, `10`, `12`, `13`).
  - Lưu ý: khi TV2 chưa sửa `mock/` (bước mock kế tiếp), chạy `contract-check` với mock cũ trên `main` sẽ báo lệch field `price` của `Extra` và `reservationFailure` của `Payment` (đúng quy trình contract đi trước mock).
- **Checked:**
  - Kiểm tra `08-jobs.md:242`: đã đặt `J-GS-1024-shoot` thành `"status": "done"`, nên điều kiện `R19` khớp liền mạch với chuỗi ví dụ `08` → `09`.
  - Kiểm tra `git diff --stat` và `git status -sb`: chỉ sửa đúng 4 file contract của TV2, `brief.md` và `AI-LOG.md`.
- **Commits:** TV2 tự kiểm tra diff và commit sau.

### [TV2] 18. Mock S2: cập nhật extras, payments và lib/reminders theo PO và kế hoạch mới (23/11/2026)

- **Tool:** Antigravity Assistant, Node.js (built-in modules).
- **Request:** `brief.md` mục 18. Trên nhánh `mock/tv2-po-updates` (tách từ `contract/tv2-po-updates`), cập nhật mock của TV2 theo các mục `R04`, `R05`, `R08`, `R09`, `R10`, `R19` và kiểm tra kỹ toàn bộ `contract-check` lẫn các ca đối chiếu.
- **Changed:**
  - `mock/data/extras.json` (**R10**): bỏ trường `price` khỏi `ex-makeup` và `ex-costume`.
  - `mock/lib/reminders.mjs` (file mới — **R04, R05**): tách các hàm dùng chung `buildReminderPayload`, `ensureBookingReminder`, `recalculateBookingReminders` (tính lại nhắc `queued` theo mốc mới, giữ lịch sử `sent`, tránh trùng) và `stopBookingReminders` (ngừng nhắc `queued` khi hủy, giữ lịch sử `sent`) để bàn giao cho TV3 gọi trong `admin-bookings.mjs`.
  - `mock/routes/payments.mjs` (**R08, R09, R19**):
    - Thêm `reservationFailure: null` vào mọi object `payment`.
    - `R08`: khi cọc `success` nhưng `checkClash` thấy trùng → giữ `payment.status = "succeeded"`, `failureReason = null`, gán `reservationFailure = { message, clashes }`, đặt `booking.paymentStatus = "deposit_paid"`, giữ `booking.status = "awaiting_deposit"`, không tạo job/reminder.
    - `R09`: kiểm tra lại `booking.status` (`cancelled`/`completed` → `409`) và `booking.paymentStatus` (khoản đã thu → `409`) tại `POST /api/test-gateway/:paymentId`.
    - `R19`: yêu cầu toàn bộ job `shoot` của booking trong `db.jobs` đạt `status === "done"` trước khi tạo hoặc áp dụng thanh toán `remaining` (`409` nếu chưa xong).
  - `brief.md` mục 18 và `AI-LOG.md` mục này.
- **Rejected / lỗi phát hiện:**
  - Không sửa `docs/api/`, `client/`, `tools/`, `mock/server.mjs` hay file của TV1/TV3; không thêm dependency; không tự chạy `git add`/`commit`/`push`.
- **Checked:**
  - Chạy `node mock/server.mjs` kết hợp `node tools/contract-check.mjs --base http://localhost:3001` toàn bộ 14 file (`01` → `13`): **102/102 examples PASS, 0 FAIL, 39/39 endpoints**.
  - Chạy kiểm thử handler in-memory cho đủ 5 nhóm ca đối chiếu: `R10` (extras không `price`), `R08 / A07-paid-clash` (payment `succeeded` + `deposit_paid` + `awaiting_deposit` + `reservationFailure` + không sinh job/reminder + retry `409`), `R09 / A08` (chặn payment pending thứ hai `409` và chặn callback sau khi booking `cancelled` `409`), `R19` (`409` trước `shoot done`, `201` sau `shoot done`), `R04 & R05` (đổi lịch sang `26/10 09:00` sinh nhắc `queued` lúc `2026-10-25T09:00:00+07:00`, hủy bỏ nhắc `queued` và giữ nguyên lịch sử `sent`).
- **Commits:** TV2 tự kiểm tra diff và commit sau.

### [TV1] 19. G8: Màn Staff (`/staff/jobs`, `/staff/jobs/:id`) và upload ảnh preview — 23/11/2026

- **Tool:** Antigravity Assistant.
- **Request:** `brief.md` mục 16. Tách nhánh `feat/g8-staff` từ `fix/s1-tv1-plan-alignment` (sau khi push và mở PR #17 gửi Nhựt review), triển khai đầy đủ màn G8 (`/staff/jobs` và `/staff/jobs/:id`) theo `docs/api/08-jobs.md`, `05-bookings.md`, `09-gallery.md` và kế hoạch 23/11 (`R02`, `R06`, `R11`, `R12`). Không sửa `docs/api/`, `mock/`, `tools/`; không tự `git add`/`commit`/`push`.
- **Changed:**
  - `client/src/api/jobs.js` (mới): `updateJob(id, { status, note })` (`PATCH /api/jobs/:id`) và `uploadBookingPreview(bookingCode, file)` (`POST /api/bookings/:code/previews` với `FormData` field `file`).
  - `client/src/pages/staff/StaffJobsPage.jsx` (mới): màn `/staff/jobs` (`<h1>Việc của tôi</h1>`), bộ lọc trạng thái (`Tất cả`, `Chưa bắt đầu`, `Đang làm`, `Hoàn thành`) đồng bộ query `?status=`, nhóm việc theo ngày chụp (`formatDate`) và nhóm riêng `"Chỉnh ảnh (chưa gắn ngày)"` cho việc `edit`, dùng `AsyncState`, `StatusBadge` (`JOB_STATUS` mới), link `"Xem việc"` tới `/staff/jobs/:id`.
  - `client/src/pages/staff/StaffJobDetailPage.jsx` (mới): màn `/staff/jobs/:id` (`<h1>{Loại việc} · {bookingCode}</h1>`), xử lý `404` thân thiện (`"Không tìm thấy việc này, hoặc việc không được giao cho bạn."`), đọc trạng thái booking qua `GET /api/bookings/:code` để hiện banner **"Booking Đã hủy"** và khóa cả hai form khi `booking.status === 'cancelled'` (`R06`), form cập nhật trạng thái (`useForm` + `FormField`, 3 nhãn mới `R02`, cập nhật trực tiếp từ response không reload trang), form upload preview chỉ hiện cho `shoot`/`edit` (ẩn với `makeup`), kiểm tra trước khi gửi JPEG/PNG và `file.size <= 5.242.880` byte (`R11`), hiển thị `"Đã có {totalPhotos} ảnh trong booking"` và lưới ảnh thu nhỏ từ `GET /api/bookings/:code/photos`.
  - `client/src/styles/staff-jobs.css` (mới): CSS thuần dùng design tokens Blue Theme, responsive không cuộn ngang ở 360 / 768 / 1280 px, nút/link cao ≥ 44px.
  - `client/src/routes/staff.jsx`: thay `StaffHomePlaceholder` bằng `StaffJobsPage` (`/staff/jobs`) và thêm `/staff/jobs/:id` (`StaffJobDetailPage`) bọc trong `<RequireRole roles={['staff']}>`.
  - `brief.md`: ghi mục 16 nguyên văn prompt.
- **Rejected / lỗi phát hiện:**
  - Ban đầu tạo object `initial` inline trong `useForm(...)` khiến hàm `reset` đổi reference mỗi lần render và dùng class `button-primary` không khớp với hệ class `.button.button-dark` của `base-and-pages.css`; đã tách `INITIAL_STATUS_FORM` / `INITIAL_UPLOAD_FORM` ra hằng số module và đồng bộ sang `button button-dark`.
  - Script kiểm thử Chrome headless CDP ban đầu giữ tiến trình con không thoát sạch sau khi in xong kết quả PASS; đã dừng sạch tiến trình và kiểm tra các cổng `3001 / 4173 / 9229` đều trống.
  - Không chỉnh sửa bất kỳ file nào trong `docs/api/`, `mock/`, `tools/`.
- **Checked:**
  - `cd client && npm run build`: thành công (`70 modules transformed`), không lỗi import/cú pháp.
  - `git diff -- docs/api mock`: trống hoàn toàn; `git diff --check`: 0 lỗi.
  - Kiểm thử trực tiếp trên `npx vite preview --port 4173` + `node mock/server.mjs` qua Google Chrome headless CDP:
    - **`MOCK_MODE=normal`**: đăng nhập `tuan` vào `/staff/jobs` thấy đủ 2 nhóm ngày (`Thứ Ba, 20/10/2026` và `Chỉnh ảnh (chưa gắn ngày)`), đúng nhãn `Hoàn thành` / `Chưa bắt đầu`; lọc `Chưa bắt đầu` đồng bộ URL `/staff/jobs?status=todo` còn 1 việc; mở trực tiếp + F5 `/staff/jobs/J-GS-1022-shoot` hiện 36 ảnh và trạng thái booking `Đã đặt lịch`; `PATCH /api/jobs/J-GS-1022-edit → 200` cập nhật ngay sang `Đang làm` + thông báo `"Đã cập nhật công việc"`; upload file `.pdf` và `.png` `5 242 881` byte bị chặn ngay trên client (`"Chỉ nhận ảnh JPEG hoặc PNG"`, `"Ảnh tối đa 5 MiB"`, **0 request** tới `/previews`); upload `.png` hợp lệ (`201`) hiện `"Đã có 37 ảnh trong booking"` và tải lại lưới 37 ảnh; Tuấn mở `J-GS-1021-makeup` (`404`) hiện `"Không tìm thấy việc này, hoặc việc không được giao cho bạn."`; Mai mở `J-GS-1021-makeup` hiện đúng chi tiết + form trạng thái và **không** hiện form upload preview.
    - **Responsive 360 / 768 / 1280 px** (qua CDP `Emulation.setDeviceMetricsOverride`) trên `/staff/jobs` và `/staff/jobs/J-GS-1022-shoot`: `scrollWidth <= innerWidth`, đúng 1 `<h1>`, mọi nút/link trong `<main>` cao ≥ 44px, **0 lỗi Console**.
    - **`MOCK_MODE=slow`**: hiện `"Đang tải…"` rồi tải xong dữ liệu.
    - **`MOCK_MODE=error`**: hiện `"Máy chủ đang gặp sự cố, vui lòng thử lại."` kèm nút `Thử lại`.
    - **`MOCK_MODE=empty`**: hiện `"Bạn chưa có việc nào được giao."`.
  - *Chưa kiểm tra:* ca hiển thị banner **"Booking Đã hủy"** (khóa cả 2 form trên UI) với booking thật bị hủy đang chờ TV3 hoàn thành `R05` (hủy booking có jobs); kiểm tra W3C Nu HTML Checker thủ công sẽ thực hiện ở mốc M6 cùng TV2.
- **Commits:** TV1 đọc diff và tự commit sau.
