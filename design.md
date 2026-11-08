# GradStudio — Design & Interaction Spec

## 1. Mục tiêu và nguồn quyết định

### Dùng tài liệu này với Google Stitch

Có thể dùng `design.md` làm design brief/context cho Stitch. Hãy đưa nội dung vào prompt hoặc đính kèm nếu giao diện Stitch hỗ trợ file; nếu giới hạn độ dài, gửi lần lượt các phần **Hợp đồng tuân thủ**, **Visual identity**, **Routes/screens**, và **Completion gate**. Đính kèm ảnh tham khảo do người dùng cung cấp để giải thích tương tác của màn Studio, không yêu cầu sao chép nguyên pixel. Stitch là công cụ tạo thiết kế/khung UI: kết quả phải được đối chiếu lại từng mục MUST bên dưới, đặc biệt là control map, trạng thái cuộc hội thoại, header chung và responsive. Không xem output của Stitch là bằng chứng tự động rằng đã tuân thủ.

Xây dựng prototype React gồm ba màn theo luồng PA#2: **dịch vụ và câu hỏi → Admin xử lý xung đột, chốt booking → khách xem lịch và cọc**. Bố cục, nội dung trình bày và màu sắc là thiết kế mới, không sao chép pixel từ prototype Figma. Tất cả yêu cầu nghiệp vụ, tên trạng thái và danh sách “Fix these” trong `../docs/GradStudio-final-project-brief.pdf` là chuẩn. Thông báo PA#2 mới cho phép React; nộp `dist/` và khai báo đường dẫn từng màn trong `PROTOTYPE.md`.

Proposal: `Proposal.md`. Prototype tham khảo về nội dung/luồng: https://proxy-swept-63177389.figma.site/#dich-vu . Chỉ dùng để hiểu câu chuyện và chức năng, không tái sử dụng bố cục/thành phần y nguyên.

## 2. Hợp đồng tuân thủ thiết kế (BẮT BUỘC — đọc trước khi code)

Phần này là tiêu chuẩn nghiệm thu, không phải gợi ý. Agent phải đọc toàn bộ `design.md` và `Proposal.md` trước khi tạo/sửa UI. Các từ **MUST / MUST NOT / SHOULD** tương ứng với bắt buộc / cấm / khuyến nghị. Nếu yêu cầu PA#2 hoặc nội dung đã được người dùng phê duyệt xung đột với lựa chọn thẩm mỹ, yêu cầu PA#2/người dùng được ưu tiên.

### Quy tắc không được tự ý vi phạm

1. **Không thêm control cho đẹp.** Trước khi tạo bất kỳ `<a>`, `<button>`, input, tab, icon tương tác hoặc card có vẻ bấm được nào, xác định trong code và audit: nhãn truy cập được, loại control, đích/hành vi, kết quả nhìn thấy và trạng thái lỗi/disabled nếu có. Không xác định được đủ các trường này thì không tạo control.
2. **Không dùng action giả.** Cấm `href="#"`, `javascript:`, click handler rỗng, `onClick` chỉ log, nút không có phản hồi, form không có submit đích, điều hướng tới route chưa tồn tại, nút enabled nhưng không làm gì. Không dùng `div`/`span` giả làm nút.
3. **Không giả lập tính năng ngoài phạm vi.** Gửi tin, thanh toán thật, giữ slot, gửi email, đăng nhập, map chỉ đường, giao ảnh không được tuyên bố là đã thực hiện. Nếu không triển khai trong prototype: bỏ control, hoặc disabled thật và đặt giải thích nhìn thấy ngay cạnh control. Không modal giả thành công.
4. **Header phải là một component dùng chung.** Cả ba route dùng cùng một component và cùng thứ tự/kích thước/spacing/kiểu chữ/điểm breakpoint. Chỉ nội dung role/CTA được đổi theo trang. Không tạo thêm header phụ, toolbar hoặc hàng nav thứ hai nếu không được phê duyệt. Header tối đa: logo, tối đa hai link điều hướng hữu ích, một CTA ngữ cảnh. Logo luôn về trang dịch vụ. Mobile không được giấu menu sau nút cần JavaScript.
5. **Không làm trang thành bài luận.** Giữ đoạn văn ngắn; loại bỏ nội dung lặp; một section phục vụ một mục tiêu. Thông tin phụ được đưa vào accordion inline. Nhưng không giấu dữ liệu bắt buộc của brief (xung đột và lý do, lịch đã thống nhất, trạng thái booking, giá/cọc/còn lại).
6. **Chỉ một tương tác nổi bật mỗi trang.** Index: duyệt artwork/gallery 2D. Studio: hiểu xung đột và tiếp tục tạo booking (không kéo thả lịch). Booking: đọc lịch và số tiền. Không thêm carousel tự chạy, parallax, nhiều animation, drag-and-drop bổ sung hay hiệu ứng làm phân tán CTA.
7. **Không tự thay đổi đặc tả.** Không thêm route, thư viện, màu chủ đạo, thành phần điều hướng, nội dung nghiệp vụ, trạng thái, data, hay pattern tương tác ngoài tài liệu này. Khi thiếu yêu cầu, chọn giải pháp đơn giản nhất tương thích; nếu ảnh hưởng flow/nhận diện/thao tác, hỏi người dùng trước khi code.
8. **Không hoàn tất khi chưa audit.** Trước khi báo xong, so sánh từng trang với checklist ở mục 9. Bất kỳ mục MUST nào fail thì phải sửa, không ghi là “known issue” để lờ đi.

### Quy trình bắt buộc cho Agent

- **Trước code:** ghi ngắn gọn hiểu biết về routes, shared header, CTA chính từng trang, tương tác được phép và những gì bị cấm. Lập control map (label → type → destination/effect → visible result) trước khi implement.
- **Trong khi code:** triển khai từng màn theo spec; dùng shared header, tokens và spacing scale. Không tạo control mới ngoài control map. Giữ thay đổi trong scope PA#2.
- **Sau code:** chạy build, mở đủ ba route trực tiếp, kiểm thử tất cả control, responsive 360/768/1280, overflow, keyboard/focus, contrast và accessibility. Cập nhật control map/`PROTOTYPE.md` để đúng với giao diện thực tế.
- **Nếu spec conflict/thiếu:** không đoán theo prototype Figma hoặc thêm giải pháp sáng tạo làm thay đổi flow. Báo câu hỏi cụ thể và chờ xác nhận. Ngoại lệ duy nhất là lỗi nhỏ về spacing/implementation không ảnh hưởng thiết kế/hành vi.

## 3. Hướng thiết kế riêng: “Editorial film / Contact sheet”

- Cảm giác: tạp chí ảnh tốt nghiệp đương đại, nhịp điệu biên tập, đơn giản và có một điểm nhấn tương tác rõ ở mỗi màn; tránh dashboard template và trang dài đặc chữ.
- Bảng màu: nền giấy trắng ngà lạnh `#F5F4F0`, mực than `#20201E`, xanh mực `#244B45`, điểm nhấn cam san hô `#C45B3D`, đường kẻ `#D8D6CF`. Màu trạng thái luôn đi cùng chữ/icon, không chỉ dựa vào màu.
- Typography: `Georgia` cho tiêu đề display; `system-ui` cho nội dung tiếng Việt. Chữ nội dung tối thiểu 16px; số tiền/giờ dùng tabular numerals.
- Thành phần nhận diện: số thứ tự nhỏ `01/02/03`, đường kẻ biên tập có tiết chế, nhãn ngắn, khối “contact sheet” trừu tượng bằng CSS/SVG tự tạo. Không dùng ảnh nhận diện người thật. Mỗi màn một điểm nhấn: artwork/ảnh mẫu tương tác trên dịch vụ; agenda xung đột dễ đọc ở Studio; phiếu lịch gọn ở Booking.
- Tương tác 2D chính nằm ở gallery dịch vụ trên `index.html`: người dùng có thể kéo/chọn một thẻ ảnh mẫu để xem artwork lớn hơn; thao tác click/tap và bàn phím phải là phương án thay thế cho kéo. Đây chỉ là duyệt ảnh mẫu, không giả lập chọn ảnh cần chỉnh cho booking. Có hướng dẫn ngắn, trạng thái focus và nút đóng/quay lại rõ ràng; không cản CTA tư vấn.
- Không thêm hiệuект 2D khác chỉ để trang trí. Mọi chuyển động nhẹ phải có mục đích, không cản đọc/thao tác và tôn trọng reduced motion.
- Không giống Figma: không dùng chat nổi đè trang, không dựng lại bố cục ba cột theo tỷ lệ mẫu, không dùng menu/nút chuyển màn demo; dùng bố cục editorial, khoảng trắng, thông tin theo nhóm và thứ bậc rõ.

### Nguyên tắc điều hướng và mật độ nội dung

1. **Mọi control có đích đến/hành vi cụ thể.** Link phải mở route/điểm neo hợp lệ; button phải đổi trạng thái hiển thị rõ ràng hoặc được disabled kèm lý do. Không có nút trang trí, `href="#"`, hay click không phản hồi.
2. **Header dùng chung, gọn và nhất quán trên cả ba trang.** Chỉ gồm wordmark (về trang dịch vụ), tối đa 2–3 mục điều hướng cần thiết và một CTA nổi bật theo ngữ cảnh. Không lặp nhiều thanh điều hướng/breadcrumb; mobile dùng cùng cấu trúc gọn, không phụ thuộc JS để lộ nội dung.
3. **Progressive disclosure để tránh dồn chữ.** Dùng accordion inline để mở/đóng chi tiết phụ bằng nút có nhãn rõ (ví dụ “Xem chi tiết gói”); nội dung mở ngay bên dưới, hoạt động bằng bàn phím/screen reader. Tránh modal/drawer cho thông tin thông thường. Không giấu dữ liệu thiết yếu như lý do xung đột, giờ đã chốt, trạng thái cọc hay giá.
4. **Giữ sự gọn gàng.** Chia nội dung thành các nhóm ngắn, giới hạn đoạn văn, tránh lặp lại cùng thông tin ở hero, card, timeline và footer. Không ép toàn bộ quy trình sản phẩm vào một màn; ưu tiên liên kết sang màn tiếp theo.
5. **Chuyển trang mượt nhưng không đánh đổi khả năng dùng.** Dùng CSS transition nhẹ cho hover/focus/accordion và `@view-transition` nếu trình duyệt hỗ trợ; điều hướng vẫn là link thật, hoạt động khi hiệu ứng không hỗ trợ. Tôn trọng `prefers-reduced-motion`; không dùng animation làm chậm việc đọc hoặc chặn thao tác.

### Tokens

Dùng CSS thuần và một spacing scale thống nhất:

```css
:root {
  --paper: #f5f4f0;
  --surface: #fffefa;
  --ink: #20201e;
  --muted: #56564f;
  --line: #d8d6cf;
  --forest: #244b45;
  --coral: #a9432b;
  --warning-bg: #fff0e9;
  --success-bg: #e8f1eb;
  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
}
```

Body text `>=16px`; no `!important`; no fixed-width content that causes horizontal overflow. Buttons/standalone links minimum height 44px. Respect `prefers-reduced-motion`.

## 3. Story and fixed sample data

Use one story consistently on all screens:

- Customer: Nguyễn Hoàng Phương Linh (Linh); Admin Thảo; makeup artist Mai; photographer Tuấn; Phòng B.
- Linh initially asks for Saturday 24/10/2026 at 09:00; Mai is busy 08:00–12:00.
- Agreed alternative: makeup 13:00–14:00, shoot 14:00–16:00. Screen 2 shows Linh has agreed.
- Booking `GS-1024`, shoot type `Tốt nghiệp cá nhân`, package `Gói Tốt nghiệp Premium` (2 hours, 30 edited photos).
- Total 1.800.000đ; 30% deposit 540.000đ; remaining 1.260.000đ due after the shoot/photo selection.
- Service catalogue on Screen 1: Kỷ yếu lớp từ 350.000đ/người; Tốt nghiệp từ 1.800.000đ; Chân dung/CV từ 690.000đ.

Canonical conversation statuses: `Chưa trả lời`, `Đang tư vấn`, `Đã chốt lịch`, `Hoàn thành`. Booking statuses: `Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`. Never call a pending deposit “Đã đặt lịch” or claim the time is held before successful deposit and resource recheck.

## 4. Routes and screen requirements

Use three actual HTML entry routes/pages, served locally by Vite and emitted to `dist/`:

| URL/file | Screen | Purpose |
| --- | --- | --- |
| `/` (`index.html`) | 01 — Dịch vụ & tư vấn | Customer discovers packages; show Linh's question and studio response. |
| `/studio.html` | 02 — Điều phối studio | Admin Thảo sees the agreed conversation, booking form and readable resource availability/conflict. |
| `/booking.html` | 03 — Lịch của Linh | Customer reviews GS-1024 and pending deposit. |

All cross-page links are relative (`studio.html`, `booking.html`, `index.html`) so the built output can be served from a subfolder. Each page has semantic `header`, `nav`, `main`, `footer`, one `h1`, logical heading hierarchy, visible labels and accessible focus states.

### Screen 01 — `index.html`

- Dùng shared compact header. Wordmark → `index.html`; tối đa một mục anchor `Dịch vụ` → `#dich-vu`, một mục `Quy trình` → `#quy-trinh`, và `Lịch của tôi` → `booking.html`.
- Header/hero có một nút `Chat với studio`. Khi bấm, nút mở/đưa focus tới chat panel ngay trên trang (không chuyển route, không chat nổi che nội dung); có thể đóng/thu gọn bằng nút có nhãn rõ. Khi mở, đưa focus hợp lý tới tiêu đề chat hoặc ô nhập; khi thu gọn, giữ ngữ cảnh và khả năng keyboard.
- Editorial hero có một CTA `Xem dịch vụ` → `#dich-vu`; không lặp CTA cùng đích.
- Ba dịch vụ trình bày súc tích với giá tham khảo. CTA duy nhất cho Tốt nghiệp `Tiếp tục tư vấn gói này` → `studio.html`, kèm role cue “Studio tiếp tục xử lý câu hỏi của Linh”.
- Gallery có filter pills theo `Tất cả`, `Kỷ yếu`, `Tốt nghiệp`, `Chân dung`, `Gia đình`, `Cặp đôi` (hoặc đúng các category thực tế đang có). Mỗi filter phải cập nhật tập ảnh hiển thị theo category; ảnh và nhãn phải phù hợp filter, số lượng/empty state cập nhật đúng. Tab đang chọn có trạng thái semantic (`aria-pressed`/tab pattern hợp lệ), đổi được bằng bàn phím; có nút `Tất cả` để quay về đầy đủ. Không chỉ đổi màu nút trong khi giữ nguyên ảnh.
- Gallery interaction cho phép bấm/chạm hoặc kéo ảnh mẫu để mở artwork/ảnh lớn trong vùng xem trên trang; nút đóng/Quay lại khôi phục gallery. Keyboard support bắt buộc. Dùng artwork/ảnh có quyền phù hợp; nếu dùng demo ảnh, ghi nguồn theo yêu cầu `PROTOTYPE.md`.
- Chat panel nằm trong luồng trang, không fixed/floating. Câu hỏi và trả lời cần nhìn thấy; lịch sử/giải thích phụ có thể thu gọn. Dùng initials/abstract art, không dùng ảnh nhận diện chưa rõ quyền.
- Nút `Chat với studio` mở/đưa tới panel chat; composer là demo hoạt động: gửi tin không rỗng thêm tin của Linh và phản hồi demo của studio theo state, rồi hiển thị ngay trong transcript. Nếu chỉ phục vụ chuyển sang màn Studio, CTA `Tiếp tục tư vấn gói này` vẫn mở `studio.html`; ghi rõ đây là luồng demo. Không để composer có vẻ nhập được nhưng không gửi được.
- Quy trình hiển thị ngắn gọn, nói rõ lịch chỉ được giữ sau khi cọc thành công và kiểm tra lại tài nguyên.

### Screen 02 — `studio.html`

- Dùng đúng shared compact header, với role cue `Studio · Thảo` và một link rõ về `index.html`.
- Bố cục tham chiếu từ ảnh người dùng: **danh sách hội thoại bên trái → cuộc trò chuyện ở giữa → lịch tài nguyên bên phải** trên desktop. Có thể tái cấu trúc responsive, nhưng phải giữ ba chức năng và thứ tự ưu tiên; không sao chép nguyên xi kiểu chữ, palette hay chi tiết visual của ảnh.
- Danh sách hội thoại có ô tìm kiếm và các tab/lọc `Tất cả`, `Chưa trả lời`, `Đang tư vấn`; cả tìm kiếm lẫn lọc đều phải hoạt động thật bằng React state. Tìm kiếm theo tên khách và nội dung/tóm tắt yêu cầu (không cần tìm theo mọi metadata); cập nhật kết quả ngay khi gõ, không cần nút submit. Tìm kiếm và status filter phải kết hợp được; số lượng trên filter phải khớp số kết quả tương ứng. Trạng thái không có kết quả phải có thông báo và thao tác xóa từ khóa rõ ràng. Mỗi hàng khách là control tương tác thực sự. Khi chọn khách, phần header, tin nhắn, trạng thái, booking panel và thông tin xung đột/lịch liên quan phải cập nhật đồng bộ theo khách đó, không chỉ đổi highlight tên.
- Seed ít nhất ba hội thoại demo riêng biệt, với nội dung khác nhau và bịa hợp lý được phép vì là demo. Dữ liệu phải phân biệt rõ:
  - **Chưa trả lời:** khách đã gửi tin; chưa có tin trả lời từ Admin. Thread chỉ hiện tin khách và nhãn `Chưa trả lời`; composer có thể cho nhập/gửi demo nếu triển khai thật bằng React state. Nếu gửi được, tin Admin phải được thêm vào thread, status đổi thành `Đang tư vấn`, và kết quả hiển thị ngay. Nếu không triển khai gửi, composer disabled kèm ghi chú — không để input giả hoạt động.
  - **Đang tư vấn:** có ít nhất một tin Admin trả lời sau tin khách; hiển thị cả hai phía theo trình tự thời gian, nhãn `Đang tư vấn`. Chọn thread phải tải đúng lịch sử, tên và yêu cầu của khách đó.
  - **Đã chốt lịch (Linh):** hiển thị câu hỏi ban đầu, lý do xung đột, đề xuất giờ và câu Linh đã đồng ý. Đây là trạng thái được dùng cho hành động tạo booking GS-1024.
- Trạng thái phải dựa trên dữ liệu thread, không hard-code một badge bất kể chọn khách nào. Mẫu dữ liệu mỗi conversation tối thiểu gồm `id`, `customerName`, `status`, `lastMessage`, `messages[]` với `sender`, `text`, `time`, và chi tiết booking/conflict nếu có. Dùng React state để chuyển thread/lọc; cập nhật phải nhất quán trong danh sách, chat header, transcript và booking panel.
- Conversation list có thể rút gọn thành tên + preview tin cuối + trạng thái; selected row dễ nhận ra cả bằng màu lẫn `aria-current`/semantic state. Tên dài `Nguyễn Hoàng Phương Linh` phải wrap và đọc đủ.
- Với Linh, giữ dữ liệu canonical: Mai bận 08:00–12:00; makeup 13:00–14:00; shoot 14:00–16:00 với Tuấn tại Phòng B; Linh đã đồng ý. Với khách demo khác, dùng yêu cầu/tin nhắn riêng phù hợp status, không gán nhầm thông tin booking GS-1024 cho họ.
- “Booking mới” đặt sau thread trong luồng trang, không có nested scroll cắt nội dung. Chỉ hiển thị form/CTA tạo GS-1024 khi hội thoại Linh đã `Đã chốt lịch`; với khách chưa chốt, hiện trạng thái phù hợp như `Chưa có booking` và hướng dẫn trả lời/tư vấn trước. Nhóm chi tiết phụ có thể dùng accordion, nhưng khách/gói/ngày/giờ/nhân sự/phòng/giá và điều kiện tạo booking phải dễ tìm.
- Resource agenda ghi rõ từng lịch bằng chữ. Xung đột 09:00 nêu `Xung đột: Mai bận 08:00–12:00`; màu/họa tiết chỉ hỗ trợ, không thay cho thông tin văn bản. Khi chọn conversation demo khác, agenda phải nói rõ đây là lịch tham khảo chung hoặc cập nhật theo khách; không khiến người xem nghĩ conflict của Linh thuộc khách khác.
- Resource calendar có nút ngày trước/ngày sau hoạt động thật. Bấm nút cập nhật heading ngày và toàn bộ các booking/availability/conflict trong agenda theo ngày mới; nút ngày trước/sau không chỉ đổi tiêu đề. Tạo dữ liệu demo cho ít nhất ngày 24/10/2026 (có booking và xung đột Linh) và ngày kế tiếp (ví dụ Chủ Nhật 25/10/2026, lịch trống hoặc dữ liệu khác); điều hướng hai chiều phải khôi phục đúng dữ liệu mỗi ngày. Nút phải có accessible name như `Ngày trước` / `Ngày sau`; nếu có giới hạn ngày thì disabled thật kèm lý do.
- `Tạo booking` là CTA chính chỉ trong thread Linh đã chốt, mở `booking.html` với GS-1024 ở trạng thái chờ cọc. Đây là demo điều hướng, không tuyên bố có backend/payment thật.
- Khu vực ngoài phạm vi không được giả dạng button/link; hoặc ghi chú văn bản “Chưa có trong prototype”, hoặc bỏ khỏi giao diện.

### Screen 03 — `booking.html`

- Customer-facing `Lịch chụp của tôi`, shared header and link back to `index.html`; optional Admin handoff `Mở góc nhìn Studio` → `studio.html`, có ghi rõ đổi vai trò.
- Header có account trigger hiển thị avatar chữ cái/initials và `Linh`; click/keyboard activation mở menu tài khoản anchored bên cạnh trigger (không phải hover-only). Trigger cập nhật `aria-expanded` và menu có thể đóng bằng Escape, click ngoài, hoặc chọn mục; focus management hợp lý.
- Mục menu trong scope phải hoạt động và đổi nội dung tương ứng: `Lịch chụp của tôi` hiển thị trang/list booking và là mục active tại đây; `Ảnh đã chọn` mở một panel/section ngay trong cùng route với bộ ảnh demo đã chọn (gắn đúng booking, badge/ảnh thay đổi theo booking hiện được chọn); `Tài khoản của tôi` mở panel thông tin tài khoản demo trong cùng route. Mỗi panel có heading, nội dung demo cụ thể, nút quay lại/đóng hoạt động.
- `Đăng xuất` không giả vờ đăng xuất thật vì không có authentication. Hoặc bỏ mục này trong PA#2, hoặc hiển thị disabled với ghi chú `Đăng xuất chưa khả dụng trong prototype`; không để menu item trông hoạt động nhưng không có kết quả.
- Trên menu chỉ dùng dữ liệu minh họa/artwork không có ảnh người thật chưa rõ quyền. Menu phải hoạt động ở desktop/mobile và không bị cắt khỏi viewport.
- Có đúng bốn filter hoạt động: `Tất cả`, `Chờ cọc`, `Đã đặt lịch`, `Hoàn thành`. Mỗi filter đổi danh sách booking thực tế và số lượng; không chỉ đổi kiểu active.
- Seed demo bookings để cả ba nhóm trạng thái đều có nội dung nhìn thấy được: tối thiểu một booking `Chờ cọc 30%` (Linh, `GS-1024`), một booking `Đã đặt lịch` (cọc đã thành công trong dữ liệu demo, không mô phỏng thao tác thanh toán), và một booking `Hoàn thành`. `Tất cả` hiển thị tất cả; từng filter chỉ hiển thị đúng nhóm. Nhãn/chi tiết của booking khớp trạng thái. Bộ đếm phải được tính từ dataset; không hard-code sai số.
- Khi chọn booking trong filter, phần lịch tuần/timeline/summary bên dưới phải đổi theo đúng booking đã chọn (ngày, giờ, tên, mã, gói, thanh toán). Không được giữ ảnh/lịch Linh trong khi tab đang hiển thị booking khác. Nếu nhóm trạng thái có nhiều booking, cung cấp lựa chọn booking rõ; nếu chỉ một booking thì chọn nó tự động.
- Dữ liệu `Đã đặt lịch` và `Hoàn thành` là fixture demo để trình bày các trạng thái sản phẩm; ghi rõ “Dữ liệu minh họa” khi cần để tránh ngụ ý giao dịch thật.
- Hiển thị thứ Bảy 24/10/2026 và timeline súc tích: 09:00 bị từ chối vì xung đột; makeup 13:00–14:00 với Mai; chụp 14:00–16:00 với Tuấn tại Phòng B. Chi tiết phụ có thể thu gọn, nhưng hai mốc đã thống nhất phải luôn hiện.
- Booking `GS-1024`, trạng thái `Đã thống nhất lịch · Chờ cọc 30%`, gói/loại, tổng giá, cọc và khoản còn lại. Tổ chức kiểu phiếu/invoice, không lặp dữ liệu vô ích.
- `Thanh toán cọc 30%` disabled, kèm lý do rõ: gateway thật không thuộc PA#2. Không modal/thành công giả. Nêu rằng lịch chưa được giữ cho đến khi cọc thành công và tài nguyên được kiểm tra lại. Không tạo nút “Xem đường đi” nếu chưa có đích.

## 5. Interaction contract — no ambiguous controls

Every visible interactive element must have exactly one clear outcome. Before adding any control, classify it:

1. **Navigation:** `<a href="...">` goes to an existing route or valid in-page section. Use meaningful labels; no `href="#"`. Header logo → `index.html`; service CTA → `#dich-vu`; customer-to-studio handoff → `studio.html`; studio create-booking → `booking.html`; booking return → `index.html`.
2. **Local functional action:** a real button updates visible React state and provides feedback (e.g. a status filter changes the displayed booking list; accordion expands/collapses). Provide accessible name and keyboard behavior.
3. **Out-of-scope action:** render as a genuinely disabled button/control plus a short adjacent visible reason. No click handler and no visual promise of functionality. Examples: send chat message, real deposit payment, map directions, photo delivery.
4. **Decorative/informational item:** do not style as a button/link.

Required button/link audit before done: list every interactive element in `PROTOTYPE.md` with label, destination/effect, and page. No placeholder links, `onClick` with no visible effect, form with missing action, or controls that pretend to perform real payment.

### Required demo state behavior

- Initial app state represents the required Linh moments coherently: index chat shows Linh's initial inquiry and studio acknowledgement of checking; Studio contains multiple selectable customer threads and selects Linh's `Đã chốt lịch` thread by default; booking shows GS-1024 waiting for deposit.
- Include demo examples for both `Chưa trả lời` (customer message only; no Admin reply exists) and `Đang tư vấn` (customer message followed by at least one Admin reply). Selecting each conversation must update its transcript and status together. Do not show the same one-message transcript under every customer.
- Composer is a working demo interaction. Submitting a non-empty message adds an Admin message to the selected thread, clears the input and moves only that thread from `Chưa trả lời` to `Đang tư vấn`; the conversation preview, filter counts and status badge update immediately. Validate empty input (do not append blank message; show a short accessible hint). Do not alter Linh's agreed thread or booking when another customer is selected. A reply to a `Đang tư vấn` thread appends another Admin message and keeps its status `Đang tư vấn`.
- Conversation search is live and matches customer name plus request/message text. Search combines with status filters; counts, results and empty state stay correct.
- Replying in a `Chưa trả lời` conversation adds an Admin message and changes only that conversation to `Đang tư vấn`; the list preview/counts and selected transcript update. Replying in `Đang tư vấn` appends without reverting status.
- Resource date controls move backward/forward and render the correct date-specific fixture, agenda, conflicts and availability (including 24/10 and 25/10 examples).
- Gallery category filters change the visible image data and selected image; reset via `Tất cả` works.
- Home `Chat với studio` opens/scrolls to the in-flow chat panel and can close it; it does not create a floating overlay.
- Booking filters show matching demo bookings and computed counts for all four tabs. Selecting each booking updates the displayed calendar/timeline/summary to that record; fixture data covers pending, booked and completed.
- “Tạo booking” goes to the booking route; booking is still `Chờ cọc 30%`.
- `booking.html` does not simulate transaction success. Deposit remains disabled with explanatory note, because real gateway is out of scope for this milestone.
- Reloading any route directly must render that screen (Vite fallback/local server). Links must work from every route.

## 6. Responsive behavior

Mobile-first breakpoints: `>=48rem` tablet, `>=64rem` desktop. Verify at 360, 768, 1280 CSS pixels.

- 360: one column; navigation wraps or scrolls without page overflow; chat stays in document flow; package blocks stack; Studio agenda/form stack; booking deposit summary appears before long timeline.
- 768: two-column editorial/service and booking layouts where content fits; Studio list/agenda can reorganize into two columns while retaining readable form.
- 1280: use bounded centered content and deliberate whitespace; index hero/content + chat in asymmetric columns; Studio can use a three-region layout, but not copy the reference's exact dashboard composition; booking summary and timeline in two columns.
- All grids/flex children allow shrink (`min-width:0`); long Vietnamese names/package labels wrap. Images/SVGs max-width 100%. No `overflow-x:hidden` to conceal layout bugs.
- At 360px, standalone links/buttons minimum 44px height. Text remains legible without zoom.

## 7. Technology and accessibility

- React with Vite; CSS is plain CSS unless existing team repository establishes another framework. No new UI dependency without approval. Current `GradStudio/` folder contains no package manifest, so set up the smallest Vite React app in this folder.
- Use actual anchors for navigation; React state only for interactions that visibly update local content. No backend, authentication, real gateway, chat delivery or resource locking.
- Use semantic landmarks, one `h1` per route, proper labels, descriptive `alt` (empty alt for decorative artwork), accessible names for icon controls, visible focus, and status text not color alone.
- Verify contrast for body text and buttons against WCAG AA 4.5:1; honor reduced-motion preferences.

## 9. Completion gate — nghiệm thu bắt buộc trước khi báo hoàn tất

### A. Tuân thủ thiết kế

- [ ] Cả ba route dùng cùng shared header; tối đa logo + 2 link + 1 CTA, không thêm toolbar/header thứ hai.
- [ ] Mỗi trang có một CTA chính dễ nhận biết; nội dung phụ được rút gọn/accordion, không có đoạn dài hoặc dữ liệu bị lặp không cần thiết.
- [ ] Không sao chép bố cục Figma; đúng phong cách editorial đã định nghĩa, không tự thêm màu/kiểu visual system khác.
- [ ] Tương tác 2D chỉ ở gallery index; hỗ trợ kéo và click/tap/keyboard. Không kéo thả lịch hoặc thêm hiệu ứng gây nhiễu.
- [ ] Dữ liệu, tên trạng thái, giờ và tiền nhất quán với mục 3 và brief.

### B. Audit từng control

Tạo bảng kiểm thực tế, không chỉ bảng dự định. Mỗi control nhìn thấy trên UI phải có một dòng:

| Trang | Label accessible | Element | Đích/hành vi cụ thể | Kết quả nhìn thấy | Kết quả test |
| --- | --- | --- | --- | --- | --- |
| studio.html | Tên khách + trạng thái | Button/list item | Chọn conversation id cụ thể | Thread, status, booking/context cập nhật theo cùng khách | Pass/Fail |

- [ ] Tất cả link mở đúng route/anchor tồn tại; mọi route tải trực tiếp được.
- [ ] Tất cả button có handler với phản hồi nhìn thấy hoặc `disabled` thật kèm ghi chú luôn hiển thị.
- [ ] Studio có tối thiểu ba cuộc hội thoại demo thuộc ít nhất hai trạng thái; click từng khách cập nhật transcript, tên, badge, preview và booking/context đồng bộ.
- [ ] Search hoạt động ngay khi nhập, tìm tên + nội dung yêu cầu; phối hợp được với các filter và có empty state/xóa search.
- [ ] `Chưa trả lời` thực sự không có message từ Admin; `Đang tư vấn` có message Admin sau message khách; không chỉ đổi badge.
- [ ] Gửi câu trả lời trong thread `Chưa trả lời` thêm message Admin và chuyển đúng thread sang `Đang tư vấn`; preview/counts cập nhật; thread khác không đổi. Reply thread đang tư vấn giữ status.
- [ ] Calendar có nút ngày trước/sau; heading, bookings, conflict và availability đều đổi đúng dữ liệu theo ngày, không chỉ đổi tiêu đề.
- [ ] Gallery filter đổi ảnh/category thực, nút `Tất cả` reset; mở ảnh hỗ trợ chuột/chạm/bàn phím.
- [ ] Nút Chat trên trang chủ mở/đưa tới panel chat in-flow; không che nội dung.
- [ ] Menu tài khoản mở/đóng bằng pointer và keyboard, cập nhật aria state; `Tài khoản của tôi`, `Lịch chụp của tôi`, `Ảnh đã chọn` mở đúng nội dung demo tương ứng; đăng xuất bị bỏ hoặc disabled có lý do.
- [ ] Booking có fixture cho chờ cọc/đã đặt lịch/hoàn thành; bốn tab đổi danh sách và count đúng; chọn lịch đổi toàn bộ chi tiết hiển thị theo booking tương ứng.
- [ ] Không có `href="#"`, link hỏng, button rỗng, icon không nhãn, hoặc element trông bấm được nhưng không tương tác.
- [ ] Không có thanh toán thành công giả, lời hứa giữ lịch trước cọc, hoặc giao dịch/backend giả.
- [ ] Accordion/gallery dùng được bằng bàn phím; focus nhìn thấy; trạng thái mở/đóng hoặc chọn ảnh được thông báo phù hợp.

### C. Responsive/accessibility/build

- [ ] `npm run build` thành công; `dist/` có ba route entry/assets cần thiết.
- [ ] Chạy từ local server; trực tiếp tải `/`, `/studio.html`, `/booking.html`; kiểm mọi link/button.
- [ ] 360/768/1280: không tràn ngang, không cắt/chồng nội dung; chuỗi tên dài wrap; control độc lập cao ít nhất 44px ở 360.
- [ ] Có semantic landmarks, một `h1`/trang, nhãn input, alt ảnh, keyboard/focus; không dựa riêng vào màu để truyền trạng thái.
- [ ] Kiểm tra contrast body/button WCAG AA 4.5:1; kiểm `prefers-reduced-motion`.
- [ ] Chụp đủ 9 ảnh full-page theo rubric; nếu yêu cầu W3C áp dụng cho artifact build, chạy checker và lưu kết quả.
- [ ] `PROTOTYPE.md` khớp UI thật: hướng dẫn chạy, ba route, control map đầy đủ, `dist/` paths, khác biệt brief và tính năng ngoài phạm vi.

**Không được báo hoàn tất nếu bất kỳ checkbox bắt buộc nào chưa đạt.** Nếu công cụ kiểm thử không khả dụng, phải nêu rõ mục nào chưa xác minh và không được tự nhận là đã pass.
