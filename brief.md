# brief.md — GradStudio PA#3 (Front end in React)

> Mỗi mục dưới đây là prompt **nguyên văn** đã gửi cho assistant, xếp theo thời gian. Không tóm tắt lại sau.
> Brief của PA#2 vẫn nằm trong lịch sử git (`git log -- brief.md`).
> Từ các task viết code trở đi, mỗi phiên bắt đầu bằng khối ràng buộc chung của nhóm (kế hoạch PA#3, mục 9.4), dán nguyên văn trong mục của task đó.
> Ghi theo mẫu: `## <số>. [TV · ngày · công cụ] <bước>: <việc>`. Mỗi người chỉ viết thêm vào cuối file.

## 1. [TV1 · 19/11/2026 · Claude Code] Setup: chuyển repo sang PA#3

Tin nhắn 1:

```text
Hãy clone dự án hiện tại qua PA4 , và bạn hãy nói những gì cần sửa trước khi bắt đầu tôi làm trước với tứ cách thành viên 1, nhớ là làm trên 1 branch mới nhé
```

Assistant trả lời bằng danh sách 6 commit (`AI-LOG.md`, mục PA#3 số 1) và hỏi ai sẽ commit.

Tin nhắn 2:

```text
Tôi có dự định sẽ nộp trước bài này tầm 4,5 ngày, để dự phòng hãy sửa lại bản kế hoạch ở 3 file nhé. Tiếp theo là set up trên cho PA3 tôi đồng ý, commit thì vẫn là tôi nhưng cho phép bạn commit bằng tên tôi không kèm theo assisstant, 2 các ảnh đó đèu tạo bởi GPT và hoàn toàn là ảnh AI không cần lo , 3. Dùng theo những gì bạn cho là hợp lí nhé. Hãy triển khai giúp tôi, có bất cứ điều gì chưa rõ hãy hỏi tôi bằng trắc nghiệm
```

Trả lời trắc nghiệm của TV1: nộp bản chính T6 27/11 · Kiệt là TV2, Nhựt là TV3 · chỉ push branch, chưa mở PR.

## 2. [TV1 · 19/11/2026 · Claude Code] Contract: docs/api/README.md

Tin nhắn 1:

```text
Lên main check và nói những điều bạn sẽ làm trước và cần tôi duyệt với tư cách thành viên 1
```

Assistant đề xuất 2 PR: `contract/readme` (README, hạn 20/11 12:00) và `contract/tv1` (01-auth, 08-jobs, 12-admins, 13-settings), rồi hỏi bằng trắc nghiệm.

Trả lời trắc nghiệm của TV1: **chỉ làm PR 1 (README)**; phần mô tả trong contract viết **tiếng Anh**, còn message hiển thị cho người dùng viết tiếng Việt; giữ nguyên branch `chore/pa3-setup`.

Tin nhắn 2 (đặc tả giao việc cho README):

````text
Viết docs/api/README.md theo đúng mục 3.3, 3.4, 3.5 trong kế hoạch PA#3:
- Base path: /api, xác thực Authorization: Bearer token-<userId>.
- Một dạng lỗi duy nhất cho toàn API (code, message, fields, details).
- Bảng mã HTTP và quy ước dữ liệu (VND số nguyên, ISO datetime, list dạng object bọc ngoài, cấu trúc ổn định).
- Định nghĩa các đối tượng dùng chung: User, Booking, Message/Proposal, Job, Photo.
- Bảng 39 endpoints đủ các cột Method, Path, Roles, File theo phân công của 3 thành viên.
- Không dùng code block ```http trong README để tránh contract-check gửi nhầm thành ví dụ thật.
- Có mục ## Changes ở cuối file.
````

Đối chiếu README: header là `Authorization: Bearer <token>`; `token-<userId>` chỉ là định dạng token của mock, front end coi token là chuỗi mờ vì PA#4 dùng token thật. README là chuẩn. Kết quả: `docs/api/README.md` (commit `b780916`).

## 3. [TV1 · 19/11/2026 · Claude Code] Contract: 01-auth, 08-jobs, 12-admins, 13-settings

Tin nhắn 1:

```text
Tiếp PR2 có làm trên branch khác hay không?
```

Assistant đề xuất branch `contract/tv1`, với hai cách: A (chờ PR 1 merge) hoặc B (tách từ `contract/readme`).

Tin nhắn 2:

```text
Cách B nhé, bạn tôi có thể sẽ review sau
```

Tin nhắn 3 (đặc tả giao việc cho 4 file contract):

```text
Tách branch contract/tv1 từ contract/readme và viết 4 file contract của TV1:
- docs/api/01-auth.md: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout. Ví dụ POST login thành công của linh phải đặt ĐẦU TIÊN để contract-check lấy token. Bổ sung các ví dụ sai mật khẩu (401), thiếu field (400), đăng xuất (204).
- docs/api/08-jobs.md: GET /api/jobs (theo token staff), GET /api/jobs/:id, PATCH /api/jobs/:id, POST /api/bookings/:code/previews (upload multipart curl JPEG/PNG ≤ 5MB).
- docs/api/12-admins.md: GET /api/admins, POST /api/admins (chỉ superadmin gọi được, bắt lỗi EMAIL_TAKEN 409).
- docs/api/13-settings.md: GET /api/settings, PUT /api/settings (giờ mở cửa, reminderHoursBefore).
Các ví dụ request/response phải khớp với chuỗi ví dụ trong README. Mỗi file phải có mục ## Changes ở cuối.
```

Kết quả: `docs/api/01-auth.md`, `08-jobs.md`, `12-admins.md`, `13-settings.md` (commit `c4145c9`, `a847133`, `5236029`, `99ccd02`) và một dòng bổ sung trong `docs/api/README.md` (commit `2aa8e25`).

## 4. [TV1 · 20/11/2026 · Claude Code] Contract: đổi lịch cần khách đồng ý, Hân đăng nhập được

Bối cảnh: nhóm chốt câu 5 trong bộ câu hỏi Product Owner (đổi lịch phải được khách đồng ý trong chat). Kế hoạch TV3 (`10-admin-bookings`) đã sửa theo; phần README và tài khoản thuộc TV1.

Tin nhắn 1:

````text
Đây là prompt tôi soạn, bạn xem giúp


 Bạn hãy cập nhật đúng 3 file: `docs/api/README.md`, `docs/api/01-auth.md`, và `FRONTEND.md` theo các yêu cầu chi tiết dưới đây.

    ### RÀNG BUỘC NGHIÊM NGẶT:
    1. CHỈ sửa đúng 3 file trên. Tuyệt đối KHÔNG tạo hay sửa các file 03, 05, 10 (đó là file của TV3). KHÔNG chạm vào mock/, ke-hoach/, client/ hay bất kỳ
    file nào khác.
    2. Mọi phần mô tả kỹ thuật mới trong contract (README.md và 01-auth.md) viết bằng TIẾNG ANH, đồng nhất với văn phong toàn bộ contract.
    3. Trong `docs/api/README.md`, TUYỆT ĐỐI KHÔNG dùng code block ```http (giữ nguyên quy ước: block http chỉ dùng trong các file 01-13 để contract-check
    nhận diện ví dụ).
    4. README chỉ mô tả chuỗi ví dụ và quy tắc mock, không định nghĩa chi tiết body hay các mã lỗi thay cho file `10-admin-bookings.md`.
    5. KHÔNG tự ý chạy git commit. Sau khi sửa xong, hãy dừng lại để tôi kiểm tra git diff.

    ---

    ### CHI TIẾT CÁC ĐIỂM CẦN SỬA:

    #### A. File `docs/api/README.md` (8 vị trí)

    1. **Bảng Demo accounts** (khoảng dòng 77):
       Thêm dòng của tài khoản `han` vào bảng:
       ```markdown
       | `linh` | customer | `u-linh` |
       | `han` | customer | `u-han` |
       | `thao` | admin | `u-thao` |
       ```

    2. **Bảng Data the mock starts with, dòng Users** (khoảng dòng 419):
       Chuyển `u-han` (Lê Ngọc Hân) từ nhóm "Cannot sign in" sang nhóm "Can sign in":
       - Cũ: `Can sign in: u-linh (Linh), u-thao (Thảo), u-mai (Mai, make-up), u-tuan (Tuấn, photographer), u-superadmin.`
       - Mới: `Can sign in: u-linh (Linh), u-han (Lê Ngọc Hân), u-thao (Thảo), u-mai (Mai, make-up), u-tuan (Tuấn, photographer), u-superadmin.`
       - Trong nhóm "Cannot sign in", xóa bỏ `u-han (Lê Ngọc Hân)`.

    3. **Bảng Data the mock starts with, dòng Conversations** (khoảng dòng 424):
       Đổi trạng thái `c-han` từ `unanswered` thành `scheduled`, kèm ghi chú gắn với GS-1023:
       - Sửa `c-han` thành: `` `c-han` (`scheduled`, linked to `GS-1023`) ``

    4. **Bảng Data the mock starts with, dòng Bookings** (khoảng dòng 425):
       Cập nhật `GS-1023` để thể hiện `conversationId`:
       - Sửa `GS-1023` thành: `` `GS-1023` (Lê Ngọc Hân, `awaiting_deposit`, conversationId: `"c-han"`) ``

    5. **Mục ScheduleItemInput** (khoảng dòng 191):
       Bỏ `PATCH /api/bookings/:code` khỏi câu giới thiệu các endpoint sử dụng dạng này:
       - Cũ: `Used by POST /api/conversations/:id/proposals, POST /api/availability/check and PATCH /api/bookings/:code:`
       - Mới: `Used by POST /api/conversations/:id/proposals and POST /api/availability/check:`

    6. **Mục Chuỗi ví dụ (The example chain), bước 10 (`10-admin-bookings`)** (khoảng dòng 407):
       Thay thế nội dung của mục 10 bằng chuỗi 7 bước đổi lịch cần khách đồng ý:
       ```markdown
       10. **`10-admin-bookings`:**
           - Thảo proposes rescheduling GS-1023 to 24/10 09:00 with Mai in `c-han` → **409 `CLASH`**.
           - Thảo proposes 25/10 09:00 in `c-han` → **201**, proposal `p-3`.
           - Thảo sends `PATCH /api/bookings/GS-1023` with `{"proposalId": "p-3"}` before Hân accepts → **409 `CONFLICT`**.
           - Hân accepts `p-3` in `c-han`.
           - Thảo reapplies `PATCH /api/bookings/GS-1023` with `{"proposalId": "p-3"}` → **200**.
           - Thảo cancels GS-1023.
           - Thảo sets the final link of GS-1024.
       ```

    7. **Bảng Mock behaviour** (khoảng dòng 444):
       Thêm 1 dòng quy tắc vào bảng lenient của mock:
       ```markdown
       | Applying a reschedule before the customer accepted the proposal | `409` |
       ```

    8. **Mục ## Changes ở cuối file**:
       Thêm dòng thay đổi ngày 2026-11-20:
       ```markdown
       - 2026-11-20: rescheduling now requires customer agreement in chat first (brief: "Both sides settle a time in chat"): `c-han` is `scheduled` and
       linked to `GS-1023`, `han` can sign in (`han-demo`) to accept proposal `p-3`, and `PATCH /api/bookings/:code` takes `{"proposalId"}` after agreement.
       (TV1)
       ```

    ---

    #### B. File `docs/api/01-auth.md` (2 vị trí)

    1. **Bảng Starting data (`mock/data/users.json`)**:
       Tại dòng `u-han`: Đổi cột **Can sign in** từ `no` thành `yes, han-demo`.

    2. **Mục ## Changes ở cuối file**:
       Thêm dòng thay đổi ngày 2026-11-20:
       ```markdown
       - 2026-11-20: `u-han` can now sign in (`han-demo`) to accept rescheduling proposal `p-3` for `GS-1023`. (TV1)
       ```

    ---

    #### C. File `FRONTEND.md` (1 vị trí)

    1. **Mục 3. Demo accounts**:
       Thêm tài khoản `han` vào bảng:
       ```markdown
       | `han` | customer | `han@gradstudio.test` | `han-demo` |
       ```

    ---
    Sau khi cập nhật xong, hãy thông báo ngắn gọn các dòng đã sửa và hiển thị kết quả kiểm tra cú pháp (nếu có)

 , prompt quá dài thì bạn có thể ghi gọn lại trong brief và AI-log nhé, nhưng nội dung thì vẫn đảm bảo
````

Assistant rà prompt: brief phải ghi nguyên văn (chỉ AI-LOG được ghi gọn), và đề xuất 4 chỗ sửa: (1) thêm câu "a proposal refused with 409 gets no id" để `p-3` không phụ thuộc cách mock đánh số; (2) đổi "reapplies" thành "applies `p-3` again"; (3) nới ràng buộc 4 cho khớp A.6 và A.8; (4) thay câu kiểm tra cuối bằng danh sách kiểm tra cụ thể (`git diff --stat`, `han` khớp giữa 3 file, 0 block `http`, khối code đủ cặp, 39 endpoint, chưa chạy được contract-check vì chưa có mock).

Tin nhắn 2:

```text
Bạn tự dán prompt vào brief.md rồi làm luôn nhé
```

Assistant làm theo Tin nhắn 1, áp dụng thêm đề xuất (1), (2) và (4); `brief.md` là file thứ 4 trong diff.

## 5. [TV3 · 20/11/2026 · Codex] Contract: conversations, availability, bookings, admin-bookings

Tin nhắn 1:

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy thực hiện phần việc ngày 20/11/2026 của GradStudio PA#3: tạo nhánh và hoàn thiện 4 file contract để Kiệt review, nhóm merge trước 22:00 ngày 20/11.

Các file cần hoàn thiện:
- docs/api/03-conversations.md
- docs/api/04-availability.md
- docs/api/05-bookings.md
- docs/api/10-admin-bookings.md

Bạn cũng phải ghi brief.md và AI-LOG.md cho tôi, tuân thủ đúng cấu trúc đang có trong từng file.

1. Đọc tài liệu

Workspace:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

Trước khi sửa, đọc:
- GradStudio/AGENTS.md.
- ke-hoach/ke-hoach/TV3-chat-booking-admin.md, mục 2, 3, 5.1, 7, 8 và 9.
- GradStudio/docs/api/README.md, nhất là Shared objects, Endpoints, Example chain và Mock behaviour.
- GradStudio/docs/api/01-auth.md để theo cách trình bày hiện có.
- GradStudio/FRONTEND.md.
- Toàn bộ GradStudio/brief.md và phần PA#3 trong GradStudio/AI-LOG.md.
- contract-check-README.md và GradStudio/tools/contract-check.mjs.

Khi cần đối chiếu yêu cầu gốc, đọc hai PDF ở workspace:
- PA3-rubric-react-front-end.pdf
- GradStudio-final-project-brief.pdf

Nếu tài liệu khác nhau, ưu tiên:
rubric → final project brief → docs/api/ → AGENTS.md → kế hoạch.

2. Kiểm tra Git và tạo nhánh

Làm việc trong repository GradStudio.

Kiểm tra working tree, branch hiện tại, remote, git user.name và git user.email. Báo lại thông tin tác giả commit; không tự đổi cấu hình.

Không xóa, ghi đè hoặc tự stash thay đổi có sẵn.

Nếu working tree sạch, cập nhật main rồi tạo nhánh:
git switch main
git fetch origin
git merge --ff-only origin/main
git switch -c contract/tv3-chat-booking-admin

Nếu nhánh đã tồn tại, kiểm tra nội dung trước khi dùng tiếp; không reset hoặc xóa nhánh.

Nếu không truy cập được remote, báo rõ và tiếp tục từ main cục bộ khi an toàn. Không nói đã đồng bộ khi chưa làm được.

Nếu thay đổi có sẵn hoặc main phân kỳ khiến không thể chuyển nhánh an toàn, báo tình trạng cụ thể. Không dùng lệnh phá hủy để xử lý.

Nếu gặp dubious ownership, chỉ dùng safe.directory ở phạm vi từng lệnh cho repository này; không sửa cấu hình global.

Ngoài fast-forward main ở trên, không merge nhánh. Không git add, commit, push hoặc tạo PR. Tôi sẽ đọc diff và tự thực hiện các bước đó.

3. Phạm vi sửa file

Tôi cho phép tạo và chỉnh sửa:
- Bốn file contract của TV3 nêu trên.
- brief.md: chỉ bổ sung mục của task này vào cuối file.
- AI-LOG.md: chỉ bổ sung mục của task này trong phần PA#3, sau các mục hiện có.

Không sửa docs/api/README.md, contract TV1/TV2, AGENTS.md, mock/, client/, tools/contract-check.mjs hoặc tài liệu lịch sử PA#2.

Nếu cần thay đổi file dùng chung hoặc file của người khác, ghi đề xuất và lý do trong báo cáo bàn giao. Tiếp tục hoàn thành phần độc lập có thể làm được.

4. Ghi brief.md và AI-LOG.md

Đây là phần bắt buộc của task. Hãy trực tiếp ghi vào hai file, không chỉ đưa nội dung để tôi tự dán.

Trước khi viết, đọc cấu trúc và các mục gần nhất. Giữ nguyên tiêu đề, hướng dẫn, nội dung cũ, cách đánh số, cấp heading, tên trường, thứ tự trường và cách dùng Markdown của từng file. Không chuẩn hóa hoặc viết lại phần của thành viên khác.

brief.md:
- Ghi nguyên văn toàn bộ prompt tôi giao cho bạn trước khi sửa contract.
- Không rút gọn, diễn giải hoặc thay prompt bằng bản tóm tắt.
- Dùng đúng mẫu hiện có:
  ## <số tiếp theo>. [TV3 · 20/11/2026 · <công cụ thực tế>] Contract: conversations, availability, bookings, admin-bookings
- Tiếp tục số thứ tự chung của file, không đánh lại từ 1.
- Bên dưới dùng “Tin nhắn 1:” và khối code text theo mẫu.
- Chọn độ dài hàng rào code đủ để giữ nguyên các khối code bên trong prompt và không làm hỏng Markdown.
- Nếu có tin nhắn bổ sung cho cùng task, ghi tiếp “Tin nhắn 2:”, “Tin nhắn 3:” theo thứ tự thực tế.
- Nếu prompt này đã được lưu đầy đủ, không ghi trùng.

AI-LOG.md:
- Giữ nguyên toàn bộ lịch sử PA#2 và các mục PA#3 đã có.
- Không tạo thêm heading “## PA#3” nếu heading này đã tồn tại.
- Thêm mục TV3 theo đúng kiểu heading và cách đánh số đang dùng trong phần PA#3; xác định số tiếp theo từ nội dung thực tế.
- Giữ đúng thứ tự và cách viết các trường của mẫu hiện có:
  Tool
  Request
  Changed
  Rejected / lỗi phát hiện
  Checked
  Commits
- Tool: ghi đúng công cụ thực tế.
- Request: dẫn tới đúng số mục vừa thêm trong brief.md.
- Changed: ghi các file và nội dung thực sự đã thay đổi, gồm cả cập nhật tài liệu ghi nhận task.
- Rejected / lỗi phát hiện: chỉ ghi lỗi đã xảy ra, cách phát hiện và cách sửa. Nếu không có, ghi rõ không có; không dựng lỗi để đủ mẫu.
- Checked: ghi lệnh hoặc cách kiểm tra đã thực hiện, kết quả và giới hạn của kiểm tra.
- Commits: ghi rõ “TV3 commit sau khi đọc diff” nếu tôi chưa commit. Không bịa mã commit hoặc ghi commit dự kiến như đã có.

Sau khi hoàn thành, kiểm tra diff của cả hai file để bảo đảm chỉ thêm nội dung của task, đúng cấu trúc, không mất nội dung cũ và không hỏng khối code.

5. Quy ước viết contract

Chỉ dùng endpoint trong bảng Endpoints của README. Dùng nguyên các shared object Booking, Message, Proposal, ScheduleItemInput, ScheduleItem, Clash và Suggestion.

Không tự đổi tên field hoặc thêm field ngoài đặc tả. Nếu thiếu field cần thiết, chỉ ra chỗ thiếu. Với giới hạn validation chưa được chốt, đề xuất giá trị cụ thể và ghi cần nhóm xác nhận; không coi đó là quyết định đã được product owner duyệt.

Mỗi endpoint cần có:
- Vai trò được gọi.
- Path/query parameters.
- Body: kiểu dữ liệu, bắt buộc hay không và giới hạn từng field.
- Response thành công.
- Mọi lỗi áp dụng, gồm 400, 401, 403, 404, 409 khi có.

Dùng đúng error shape trong README: code, message, fields, details.

Mỗi endpoint có ít nhất một cặp request/response liên tiếp trong các khối code http:
- Request body phải là JSON gửi được, không có dấu “…”.
- Response có đủ field, kể cả field null; không dùng dấu “…” để bỏ qua phần chưa viết.
- Token dùng {{token:linh}}, {{token:thao}}, {{token:han}}.
- Cuối mỗi file có ## Changes, ghi ngày 2026-11-20, nội dung khởi tạo và người phụ trách TV3.
- Giữ cách trình bày nhất quán với 01-auth.md.

6. Nội dung từng file

03-conversations.md

Đặc tả đủ 6 endpoint:
- GET /api/conversations
- POST /api/conversations
- GET /api/conversations/:id
- POST /api/conversations/:id/messages
- POST /api/conversations/:id/proposals
- PATCH /api/conversations/:id/proposals/:proposalId

Bao gồm phân quyền customer chỉ xem hội thoại của mình, admin xem tất cả; lọc trạng thái; gửi text và booking request; đề xuất giờ; khách đồng ý hoặc từ chối.

Giữ chuỗi ví dụ chính:
- Linh gửi yêu cầu trong c-linh, Thảo trả lời.
- Đề xuất 09:00 trả 409 CLASH, không tiêu thụ ID.
- p-1: makeup 14:00–15:00, chụp 15:00–17:00; Linh từ chối.
- p-2: makeup 13:00–14:00, chụp 14:00–16:00; Linh đồng ý.

POST tạo hội thoại cũng phải có ví dụ nhưng không làm lệch chuỗi chính hoặc ID dự kiến.

04-availability.md

Đặc tả:
- GET /api/resources
- GET /api/schedule?date=2026-10-24
- POST /api/availability/check

Có ví dụ 09:00 trùng vì Mai bận 08:00–12:00 và ví dụ 13:00/14:00 không trùng. Kết quả phải có lý do bằng chữ và gợi ý giờ thay thế.

Kiểm tra availability không thay đổi dữ liệu. Lỗi CLASH ở các contract khác dùng cùng cấu trúc clashes/suggestions, đặt trong error.details.

05-bookings.md

Đặc tả:
- POST /api/bookings
- GET /api/bookings
- GET /api/bookings/:code

Ví dụ cần có:
- Tạo từ p-1 trả 409 vì khách chưa đồng ý.
- Tạo từ p-2 trả 201, sinh GS-1024.
- GS-1024 có status awaiting_deposit, paymentStatus unpaid.
- Không token trả 401.
- Linh xem GS-1022 của người khác trả 404.

Dùng đúng Booking trong README. Giá 1.800.000đ, cọc 540.000đ, còn lại 1.260.000đ.

awaiting_deposit chưa giữ chỗ. Chỉ khi cọc thành công và tài nguyên được kiểm tra lại, booking mới chuyển booked.

10-admin-bookings.md

Đặc tả:
- PATCH /api/bookings/:code
- POST /api/bookings/:code/cancel
- PUT /api/bookings/:code/final-link

Chuỗi đổi lịch:
- Admin gửi đề xuất vào c-han bằng endpoint conversations.
- Giờ 24/10 09:00 với Mai trả 409 CLASH.
- Đề xuất hợp lệ ngày 25/10 tạo p-3.
- PATCH GS-1023 với p-3 trước khi Hân đồng ý trả 409.
- Hân đồng ý p-3.
- PATCH lại thành công và cập nhật công việc liên quan.
- Khi áp dụng, kiểm tra trùng lại và bỏ qua chính booking đó.

Sau đó hủy GS-1023 với lý do dài 5–500 ký tự, rồi lưu link https:// cho GS-1024 ở trạng thái được phép.

Đặt các ví dụ gọi endpoint conversations của chuỗi đổi lịch trong file 10 để giữ đúng thứ tự chạy toàn bộ ví dụ.

7. Kiểm tra trước khi bàn giao

- Đối chiếu đủ 15 endpoint TV3 với README.
- Kiểm tra mỗi request có response đi kèm.
- Kiểm tra cú pháp JSON, HTTP status, error shape và field của shared object.
- Rà tuần tự Example chain:
  03 → 04 → 05 → các bước TV2/TV1 → 10.
- Bảo đảm ví dụ lỗi không đổi state hoặc tiêu thụ ID.
- Không thêm ví dụ thành công làm lệch p-1/p-2/p-3, GS-1024 hoặc dữ liệu các file sau.
- Chạy git diff --check và đọc toàn bộ diff.
- Rà lại cấu trúc brief.md, AI-LOG.md và đối chiếu số mục tham chiếu giữa hai file.

Nếu chưa có mock, không tạo mock trong task này. Ghi rõ chưa chạy được contract-check với mock; không báo 0 FAIL hoặc runtime đã đạt. Không chạy kiểm tra frontend không liên quan.

8. Bàn giao

Khi hoàn thành, báo ngắn gọn:
- Nhánh đang làm và tình trạng cập nhật từ remote.
- Các file đã sửa.
- Bảng 15 endpoint và file chứa ví dụ.
- Số mục đã thêm trong brief.md và AI-LOG.md.
- Kiểm tra đã chạy, kết quả và phần chưa kiểm tra được.
- Những điểm cần Hưng, Kiệt hoặc product owner xác nhận.
- Tóm tắt Booking, Message và Proposal để bàn giao cho Kiệt.
- Commit message và nội dung PR đề xuất.

PR dự kiến:
Title: contract(tv3): define conversations, availability and booking APIs
Reviewer: Kiệt, TV2.
```

## 6. [TV2 · 20/11/2026 · Antigravity Assistant] Contract: 02-catalog, 06-payments, 07-reminders, 09-gallery, 11-receive

Tin nhắn 1 (tìm hiểu yêu cầu PA#3 và quy trình làm việc):

```text
đọc mấy file ko nằm trong file được theo dõi (4 file) rồi cho biết bài tập nhóm lần này là làm gì
```

Tin nhắn 2:

```text
vậy giờ t muốn test thử làm cá nhân để hiểu quy trình thì giờ làm gì trước, và nó sẽ có gì, t chuwa hiểu lắm, làm mỗi frontend chứ ko backend à (và frontend mà cũng có API à), t thắc mắc
```

Tin nhắn 3 (kiểm tra kế hoạch nhóm và bộ câu hỏi Product Owner):

```text
đọc file kế hoạch, cùng 2 file pdf và 2 file md mà cái chưa được theo dõi á, để check xem phần làm việc của của cả 3 thành viên đã hợp lý với yêu cầu PA3 và nội dung đồ án hay chưa, và cái ở dưới là cái nhóm t tính hỏi á
...
```

Tin nhắn 4 (rà lại 9 câu hỏi PO theo kế hoạch mới sửa):

```text
Chào các bạn Product Owner, nhóm [24120184 - 24120211 - 24120354] có 9 câu muốn hỏi thêm về những chỗ cần làm rõ. Nhóm có ghi kèm bước G1-G11 tương ứng để các bạn dễ theo dõi: ... đây là những câu hỏi nhóm t muốn hỏi product owner để rõ hơn về đồ án, check theo ke-hoach t mới sửa, và yêu cầu PA3, hãy coi xem còn cần hỏi thêm gì để rõ hơn nữa không
```

Tin nhắn 5 (chỉ định dọn test cũ, kéo main, tạo branch và viết 5 file contract của TV2):

```text
vậy dọn file test cũ, kéo main về, tạo nhánh, sau đó viết contract cho tôi đi, ghi những cái tôi trò chuyện vô AI log và brief theo cái có sẵn đi
```

## 7. [TV1 · 21/11/2026 · Claude Code] Mock: khung server.mjs, users.json và auth.mjs

Tin nhắn:

```text
[KHỐI RÀNG BUỘC CHUNG — MOCK]
- Bạn đang làm việc trong repo GradStudio (PA#3).
- Chỉ sử dụng các module có sẵn của Node.js: `node:http`, `node:fs`, `node:path`, `node:url`.
- Tuyệt đối KHÔNG tạo `package.json`, KHÔNG dùng `npm install` hay bất kỳ thư viện ngoài nào trong thư mục `mock/`.
- KHÔNG sửa bất kỳ file nào trong `docs/api/`, `client/`, `tools/` hay `ke-hoach/`. Không sửa contract để khớp với code mock.
- Phạm vi task này: CHỈ làm khung `mock/server.mjs`, dữ liệu `mock/data/users.json` và route `mock/routes/auth.mjs`. Các tài nguyên khác (jobs, admins, settings...) sẽ làm ở task sau.

---

[YÊU CẦU KỸ THUẬT CHI TIẾT]

1. File `mock/server.mjs` (Khung máy chủ và Router động):
- Khởi động: Lắng nghe ở cổng `process.env.PORT || 3001`. Đọc `process.env.MOCK_MODE || 'normal'`. Khi khởi động in console: `Mock server listening on port <PORT> (mode: <MODE>)`. Nếu MOCK_MODE không thuộc `['normal', 'slow', 'error', 'empty']`, in thông báo lỗi và thoát process (`process.exit(1)`).
- Nạp dữ liệu tự động: Đọc toàn bộ file `.json` trong `mock/data/` vào đối tượng bộ nhớ `db`, tên thuộc tính là tên file bỏ đuôi `.json` (ví dụ `users.json` -> `db.users`). Dữ liệu này chỉ lưu trong RAM và tự reset khi restart server.
- Nạp Route động: Tự động import tất cả các file `.mjs` trong thư mục `mock/routes/`. Mỗi file export default một mảng các route: `{ method, path, roles, handler }`.
- Khớp Route (Path matching & Ưu tiên):
  * Hỗ trợ path param dạng `:param` (ví dụ: `/api/bookings/:code`).
  * ⚠️ QUY TẮC ĐỘ ƯU TIÊN: Route có đoạn cố định (static segment) PHẢI thắng route có `:param` khi cùng pattern (ví dụ `/api/bookings/export` phải khớp trước `/api/bookings/:code`), không phụ thuộc vào thứ tự import file.
- Phân quyền (roles):
  * `roles: null` -> Route công khai (public).
  * `roles: 'signed-in'` -> ⚠️ Bất kỳ người dùng nào đã đăng nhập hợp lệ đều truy cập được.
  * `roles: ['admin', ...]` -> Chỉ người dùng có role trong mảng mới được truy cập.
- Xác thực (Auth middleware):
  * Đọc header `Authorization: Bearer <token>`. Token mock có dạng `token-<userId>`. Tìm user tương ứng trong `db.users`.
  * Nếu route yêu cầu đăng nhập (`roles` khác null) mà thiếu token, sai định dạng hoặc không tìm thấy user: trả mã 401 `UNAUTHENTICATED` kèm message: "Vui lòng đăng nhập để tiếp tục", `fields: {}`.
  * Nếu user không có role hợp lệ: trả mã 403 `FORBIDDEN` kèm message: "Bạn không có quyền thực hiện thao tác này", `fields: {}`.
- Đối tượng `ctx` truyền vào handler:
  * `{ params, query, body, rawBody, headers, user, db, fail }`.
  * `params`: object các tham số từ URL (`{ code: 'GS-1024' }`).
  * `query`: object các query param từ URL (hỗ trợ phân tích query string đơn giản).
  * `body`: JSON parsed object. Nếu body gửi lên rỗng thì coi là `{}`. Nếu JSON hỏng thì trả ngay 400 `VALIDATION` với message "Dữ liệu chưa hợp lệ", `fields: {}`.
  * `rawBody`: Buffer dữ liệu thô (cho multipart sau này).
  * `user`: object User hiện tại từ `db.users` hoặc `null`.
  * `fail(status, code, message, fields = {}, details = null)`: hàm tiện ích trả về lỗi theo đúng chuẩn:
    `{ status, body: { error: { code, message, fields, details } } }`.
- Xử lý Response:
  * Handler có thể là `async` và trả về `{ status, body }`.
  * Nếu `status === 204`: gửi response rỗng (không gửi Content-Type và body).
  * Các status khác: set header `Content-Type: application/json; charset=utf-8` và serialize `JSON.stringify(body)`.
  * Xử lý lỗi ngoại lệ: Nếu handler ném exception, catch lại và in stack trace ra console, đồng thời trả 500 `SERVER_ERROR` đúng format lỗi chung.
- Xử lý 4 chế độ `MOCK_MODE`:
  * `normal`: delay ngẫu nhiên ~150ms trước khi trả lời.
  * `slow`: delay 2000ms.
  * `error`: MỌI request (NGOẠI TRỪ `POST /api/auth/login`) đều bị chặn và trả ngay 500 `SERVER_ERROR` với body:
    `{"error": {"code": "SERVER_ERROR", "message": "Máy chủ đang gặp sự cố, vui lòng thử lại.", "fields": {}, "details": null}}`. Kể cả route không tồn tại (404) cũng phải trả về 500 ở chế độ này.
  * `empty`: Với các response thành công (`status < 400`), đệ quy biến MỌI mảng (`Array`) thành `[]` (kể cả mảng lồng trong object). Tuyệt đối KHÔNG làm thay đổi dữ liệu gốc trong `db`. Các object đơn lẻ (như user hay booking) và response lỗi giữ nguyên.
- Không tìm thấy route: Trả mã 404 `NOT_FOUND` đúng cấu trúc error chung.
- Logging: Mỗi request in đúng 1 dòng ra terminal: `${method} ${url} → ${status}` (in cả query string nếu có, ví dụ `GET /api/jobs?status=done → 200`).

---

2. File `mock/data/users.json` (10 User theo contract `01-auth.md`):
⚠️ Contract yêu cầu đủ 10 người dùng mẫu, không phải 6 người:
- 6 người đăng nhập được (password là `<name>-demo`):
  * `u-linh` (Linh, role: "customer", email: "linh@gradstudio.test", password: "linh-demo")
  * `u-han` (Lê Ngọc Hân, role: "customer", email: "han@gradstudio.test", password: "han-demo")
  * `u-thao` (Thảo, role: "admin", email: "thao@gradstudio.test", password: "thao-demo", createdAt: "2026-09-01T08:00:00+07:00")
  * `u-mai` (Mai, role: "staff", email: "mai@gradstudio.test", password: "mai-demo")
  * `u-tuan` (Tuấn, role: "staff", email: "tuan@gradstudio.test", password: "tuan-demo")
  * `u-superadmin` (Superadmin, role: "superadmin", email: "superadmin@gradstudio.test", password: "superadmin-demo")
- 4 người trong câu chuyện nhưng KHÔNG được đăng nhập (`password: null`):
  * `u-ha` (Hà, role: "staff", email: "ha@gradstudio.test", password: null)
  * `u-khoa` (Trần Minh Khoa, role: "customer", email: "khoa@gradstudio.test", password: null)
  * `u-bao` (Hồ Gia Bảo, role: "customer", email: "bao@gradstudio.test", password: null)
  * `u-anh` (Phạm Hoàng Anh, role: "customer", email: "anh@gradstudio.test", password: null)

Lưu ý: Khi trả về thông tin user trong API, CHỈ trả `{ id, name, role }`, tuyệt đối không để lộ `email` hay `password`.

---

3. File `mock/routes/auth.mjs` (Xử lý xác thực):
Export default mảng chứa 3 route:

a. `POST /api/auth/login` (roles: null - public):
- Body gồm `email` và `password`.
- Validation:
  * `email`: trim khoảng trắng, không phân biệt hoa thường, bắt buộc, định dạng email hợp lệ, tối đa 120 ký tự.
  * `password`: bắt buộc, độ dài 1 đến 100 ký tự.
  * Thông báo lỗi chi tiết theo contract:
    - Thiếu/trống email: `fields.email = "Vui lòng nhập email"`
    - Sai format email: `fields.email = "Email không đúng định dạng"`
    - ⚠️ Email quá 120 ký tự: `fields.email = "Email tối đa 120 ký tự"`
    - Thiếu/trống password: `fields.password = "Vui lòng nhập mật khẩu"`
    - ⚠️ Password quá 100 ký tự: `fields.password = "Mật khẩu tối đa 100 ký tự"`
  * Nếu có lỗi validation -> trả 400 `VALIDATION` ("Dữ liệu chưa hợp lệ", kèm `fields`).
- Kiểm tra tài khoản:
  * So khớp email và password. Nếu không tìm thấy, sai mật khẩu hoặc user có `password === null` -> trả mã 401 `INVALID_CREDENTIALS` kèm message "Email hoặc mật khẩu không đúng", `fields: {}`.
- Thành công: Trả 200:
  `{ token: "token-" + user.id, user: { id: user.id, name: user.name, role: user.role } }`.

b. `GET /api/auth/me` (roles: 'signed-in'):
- Trả 200: `{ user: { id: ctx.user.id, name: ctx.user.name, role: ctx.user.role } }`.

c. `POST /api/auth/logout` (roles: 'signed-in'):
- Trả status 204 (không có body).
- Lưu ý: Không vô hiệu hóa token trong bộ nhớ vì `contract-check` sẽ tái sử dụng token này cho các kiểm thử sau.

---

[TIÊU CHÍ NGHIỆM THU — TỰ KIỂM TRƯỚC KHI BÁO CÁO]
1. Chạy `node mock/server.mjs`: server chạy trơn tru, log đúng định dạng.
2. Chạy `node tools/contract-check.mjs --only 01-auth.md`: ĐẠT 0 FAIL cho toàn bộ 12 ví dụ của `01-auth.md`.
3. Kiểm tra với `MOCK_MODE=error`: `POST /api/auth/login` vẫn trả 200, trong khi `GET /api/auth/me` trả 500 đúng cấu trúc JSON error.
4. Kiểm tra với `MOCK_MODE=slow`: thời gian phản hồi khoảng 2s.
5. Kiểm tra với `MOCK_MODE=empty`: login và auth/me vẫn trả về object bình thường.
6. Gửi request đến route không tồn tại (vd: `GET /api/not-found`) trả 404 đúng format error.
7. Gửi body JSON hỏng vào login trả 400 `VALIDATION`.
8. Kiểm tra `git diff -- docs/api client tools` -> PHẢI hoàn toàn trống.

---

[QUY ĐỊNH COMMIT VÀ PHẢN HỒI]
Sau khi kiểm tra đạt tất cả các tiêu chí trên, hãy tạo 2 commit riêng bằng tiếng Anh:
1. `mock(core): server.mjs framework, dynamic router, 4 modes, auth middleware` (chứa mock/server.mjs)
2. `mock(auth): users seeded data, login, me, and logout handlers` (chứa mock/data/users.json và mock/routes/auth.mjs)

Báo cáo lại danh sách file đã tạo, kết quả của từng bước kiểm tra nghiệm thu, và ghi nhận rõ các phần chưa kiểm tra được (ví dụ mã 403 cần chờ task chiều).
```

## 7. [TV1 · 21/11/2026 · Claude Code] Mock: khung server.mjs, users và auth

Tin nhắn 1:

```text
Hiện tại tôi cần làm gì tieps theo
```

Assistant trả lời: việc tiếp theo là khung mock và auth, merge trước 12:00 ngày 21/11 (kế hoạch mục 5.3).

Tin nhắn 2:

```text
Bạn hãy nêu chi tiết công việc để tôi viết brief cho bạn
```

Assistant liệt kê chi tiết phạm vi, yêu cầu của `server.mjs`, `users.json`, `auth.mjs`, tiêu chí XONG và 3 điểm cần chốt (`roles: 'signed-in'`, 10 user theo contract thay vì 6, câu báo lỗi khi quá dài).

Tin nhắn 3 (prompt giao việc):

```text
[KHỐI RÀNG BUỘC CHUNG — MOCK]
- Bạn đang làm việc trong repo GradStudio (PA#3).
- Chỉ sử dụng các module có sẵn của Node.js: `node:http`, `node:fs`, `node:path`, `node:url`.
- Tuyệt đối KHÔNG tạo `package.json`, KHÔNG dùng `npm install` hay bất kỳ thư viện ngoài nào trong thư mục `mock/`.
- KHÔNG sửa bất kỳ file nào trong `docs/api/`, `client/`, `tools/` hay `ke-hoach/`. Không sửa contract để khớp với code mock.
- Phạm vi task này: CHỈ làm khung `mock/server.mjs`, dữ liệu `mock/data/users.json` và route `mock/routes/auth.mjs`. Các tài nguyên khác (jobs, admins,
settings...) sẽ làm ở task sau.

---

[YÊU CẦU KỸ THUẬT CHI TIẾT]

1. File `mock/server.mjs` (Khung máy chủ và Router động):
- Khởi động: Lắng nghe ở cổng `process.env.PORT || 3001`. Đọc `process.env.MOCK_MODE || 'normal'`. Khi khởi động in console: `Mock server listening on port
<PORT> (mode: <MODE>)`. Nếu MOCK_MODE không thuộc `['normal', 'slow', 'error', 'empty']`, in thông báo lỗi và thoát process (`process.exit(1)`).
- Nạp dữ liệu tự động: Đọc toàn bộ file `.json` trong `mock/data/` vào đối tượng bộ nhớ `db`, tên thuộc tính là tên file bỏ đuôi `.json` (ví dụ `users.json` ->
`db.users`). Dữ liệu này chỉ lưu trong RAM và tự reset khi restart server.
- Nạp Route động: Tự động import tất cả các file `.mjs` trong thư mục `mock/routes/`. Mỗi file export default một mảng các route: `{ method, path, roles,
handler }`.
- Khớp Route (Path matching & Ưu tiên):
  * Hỗ trợ path param dạng `:param` (ví dụ: `/api/bookings/:code`).
  * ⚠️ QUY TẮC ĐỘ ƯU TIÊN: Route có đoạn cố định (static segment) PHẢI thắng route có `:param` khi cùng pattern (ví dụ `/api/bookings/export` phải khớp trước
  `/api/bookings/:code`), không phụ thuộc vào thứ tự import file.
- Phân quyền (roles):
  * `roles: null` -> Route công khai (public).
  * `roles: 'signed-in'` -> ⚠️ Bất kỳ người dùng nào đã đăng nhập hợp lệ đều truy cập được.
  * `roles: ['admin', ...]` -> Chỉ người dùng có role trong mảng mới được truy cập.
- Xác thực (Auth middleware):
  * Đọc header `Authorization: Bearer <token>`. Token mock có dạng `token-<userId>`. Tìm user tương ứng trong `db.users`.
  * Nếu route yêu cầu đăng nhập (`roles` khác null) mà thiếu token, sai định dạng hoặc không tìm thấy user: trả mã 401 `UNAUTHENTICATED` kèm message: "Vui lòng
  đăng nhập để tiếp tục", `fields: {}`.
  * Nếu user không có role hợp lệ: trả mã 403 `FORBIDDEN` kèm message: "Bạn không có quyền thực hiện thao tác này", `fields: {}`.
- Đối tượng `ctx` truyền vào handler:
  * `{ params, query, body, rawBody, headers, user, db, fail }`.
  * `params`: object các tham số từ URL (`{ code: 'GS-1024' }`).
  * `query`: object các query param từ URL (hỗ trợ phân tích query string đơn giản).
  * `body`: JSON parsed object. Nếu body gửi lên rỗng thì coi là `{}`. Nếu JSON hỏng thì trả ngay 400 `VALIDATION` với message "Dữ liệu chưa hợp lệ", `fields:
  {}`.
  * `rawBody`: Buffer dữ liệu thô (cho multipart sau này).
  * `user`: object User hiện tại từ `db.users` hoặc `null`.
  * `fail(status, code, message, fields = {}, details = null)`: hàm tiện ích trả về lỗi theo đúng chuẩn:
    `{ status, body: { error: { code, message, fields, details } } }`.
- Xử lý Response:
  * Handler có thể là `async` và trả về `{ status, body }`.
  * Nếu `status === 204`: gửi response rỗng (không gửi Content-Type và body).
  * Các status khác: set header `Content-Type: application/json; charset=utf-8` và serialize `JSON.stringify(body)`.
  * Xử lý lỗi ngoại lệ: Nếu handler ném exception, catch lại và in stack trace ra console, đồng thời trả 500 `SERVER_ERROR` đúng format lỗi chung.
- Xử lý 4 chế độ `MOCK_MODE`:
  * `normal`: delay ngẫu nhiên ~150ms trước khi trả lời.
  * `slow`: delay 2000ms.
  * `error`: MỌI request (NGOẠI TRỪ `POST /api/auth/login`) đều bị chặn và trả ngay 500 `SERVER_ERROR` với body:
    `{"error": {"code": "SERVER_ERROR", "message": "Máy chủ đang gặp sự cố, vui lòng thử lại.", "fields": {}, "details": null}}`. Kể cả route không tồn tại
    (404) cũng phải trả về 500 ở chế độ này.
  * `empty`: Với các response thành công (`status < 400`), đệ quy biến MỌI mảng (`Array`) thành `[]` (kể cả mảng lồng trong object). Tuyệt đối KHÔNG làm thay
  đổi dữ liệu gốc trong `db`. Các object đơn lẻ (như user hay booking) và response lỗi giữ nguyên.
- Không tìm thấy route: Trả mã 404 `NOT_FOUND` đúng cấu trúc error chung.
- Logging: Mỗi request in đúng 1 dòng ra terminal: `${method} ${url} → ${status}` (in cả query string nếu có, ví dụ `GET /api/jobs?status=done → 200`).

---

2. File `mock/data/users.json` (10 User theo contract `01-auth.md`):
⚠️ Contract yêu cầu đủ 10 người dùng mẫu, không phải 6 người:
- 6 người đăng nhập được (password là `<name>-demo`):
  * `u-linh` (Linh, role: "customer", email: "linh@gradstudio.test", password: "linh-demo")
  * `u-han` (Lê Ngọc Hân, role: "customer", email: "han@gradstudio.test", password: "han-demo")
  * `u-thao` (Thảo, role: "admin", email: "thao@gradstudio.test", password: "thao-demo", createdAt: "2026-09-01T08:00:00+07:00")
  * `u-mai` (Mai, role: "staff", email: "mai@gradstudio.test", password: "mai-demo")
  * `u-tuan` (Tuấn, role: "staff", email: "tuan@gradstudio.test", password: "tuan-demo")
  * `u-superadmin` (Superadmin, role: "superadmin", email: "superadmin@gradstudio.test", password: "superadmin-demo")
- 4 người trong câu chuyện nhưng KHÔNG được đăng nhập (`password: null`):
  * `u-ha` (Hà, role: "staff", email: "ha@gradstudio.test", password: null)
  * `u-khoa` (Trần Minh Khoa, role: "customer", email: "khoa@gradstudio.test", password: null)
  * `u-bao` (Hồ Gia Bảo, role: "customer", email: "bao@gradstudio.test", password: null)
  * `u-anh` (Phạm Hoàng Anh, role: "customer", email: "anh@gradstudio.test", password: null)

Lưu ý: Khi trả về thông tin user trong API, CHỈ trả `{ id, name, role }`, tuyệt đối không để lộ `email` hay `password`.

---

3. File `mock/routes/auth.mjs` (Xử lý xác thực):
Export default mảng chứa 3 route:

a. `POST /api/auth/login` (roles: null - public):
- Body gồm `email` và `password`.
- Validation:
  * `email`: trim khoảng trắng, không phân biệt hoa thường, bắt buộc, định dạng email hợp lệ, tối đa 120 ký tự.
  * `password`: bắt buộc, độ dài 1 đến 100 ký tự.
  * Thông báo lỗi chi tiết theo contract:
    - Thiếu/trống email: `fields.email = "Vui lòng nhập email"`
    - Sai format email: `fields.email = "Email không đúng định dạng"`
    - ⚠️ Email quá 120 ký tự: `fields.email = "Email tối đa 120 ký tự"`
    - Thiếu/trống password: `fields.password = "Vui lòng nhập mật khẩu"`
    - ⚠️ Password quá 100 ký tự: `fields.password = "Mật khẩu tối đa 100 ký tự"`
  * Nếu có lỗi validation -> trả 400 `VALIDATION` ("Dữ liệu chưa hợp lệ", kèm `fields`).
- Kiểm tra tài khoản:
  * So khớp email và password. Nếu không tìm thấy, sai mật khẩu hoặc user có `password === null` -> trả mã 401 `INVALID_CREDENTIALS` kèm message "Email hoặc
  mật khẩu không đúng", `fields: {}`.
- Thành công: Trả 200:
  `{ token: "token-" + user.id, user: { id: user.id, name: user.name, role: user.role } }`.

b. `GET /api/auth/me` (roles: 'signed-in'):
- Trả 200: `{ user: { id: ctx.user.id, name: ctx.user.name, role: ctx.user.role } }`.

c. `POST /api/auth/logout` (roles: 'signed-in'):
- Trả status 204 (không có body).
- Lưu ý: Không vô hiệu hóa token trong bộ nhớ vì `contract-check` sẽ tái sử dụng token này cho các kiểm thử sau.

---

[TIÊU CHÍ NGHIỆM THU — TỰ KIỂM TRƯỚC KHI BÁO CÁO]
1. Chạy `node mock/server.mjs`: server chạy trơn tru, log đúng định dạng.
2. Chạy `node tools/contract-check.mjs --only 01-auth.md`: ĐẠT 0 FAIL cho toàn bộ 12 ví dụ của `01-auth.md`.
3. Kiểm tra với `MOCK_MODE=error`: `POST /api/auth/login` vẫn trả 200, trong khi `GET /api/auth/me` trả 500 đúng cấu trúc JSON error.
4. Kiểm tra với `MOCK_MODE=slow`: thời gian phản hồi khoảng 2s.
5. Kiểm tra với `MOCK_MODE=empty`: login và auth/me vẫn trả về object bình thường.
6. Gửi request đến route không tồn tại (vd: `GET /api/not-found`) trả 404 đúng format error.
7. Gửi body JSON hỏng vào login trả 400 `VALIDATION`.
8. Kiểm tra `git diff -- docs/api client tools` -> PHẢI hoàn toàn trống.

---

[QUY ĐỊNH COMMIT VÀ PHẢN HỒI]
Sau khi kiểm tra đạt tất cả các tiêu chí trên, hãy tạo 2 commit riêng bằng tiếng Anh:
1. `mock(core): server.mjs framework, dynamic router, 4 modes, auth middleware` (chứa mock/server.mjs)
2. `mock(auth): users seeded data, login, me, and logout handlers` (chứa mock/data/users.json và mock/routes/auth.mjs)

Báo cáo lại danh sách file đã tạo, kết quả của từng bước kiểm tra nghiệm thu, và ghi nhận rõ các phần chưa kiểm tra được (ví dụ mã 403 cần chờ task chiều).
```

## 8. [TV1 · 21/11/2026 · Claude Code] Mock: sửa câu 403, time helper, settings, admins, jobs

Các tin nhắn sau mục 7, theo thứ tự:

Tin nhắn 1 (kèm nội dung mục 8 của `AI-LOG.md`, đã ghi nguyên văn trong file đó):

```text
Tôi đã test kỹ toàn bộ code mock và auth bạn vừa làm: contract-check đạt 12/12 PASS và cả 4 chế độ mock đều chạy rất chuẩn. Giờ bạn cập nhật giúp tôi mục số 8
vào cuối file AI-LOG.md nhé.
[...nội dung mục 8...]
Cập nhật xong bạn kiểm tra lại diff đảm bảo chỉ thay đổi đúng file AI-LOG.md rồi tạo commit giúp tôi:
`docs(ai-log): entry 8, mock core and auth`
 , bạn hãy rà soát lại tôi kiểm tra có đúng chưa
```

Tin nhắn 2:

```text
commit không cần sửa đâu
```

Tin nhắn 3:

```text
Bạn hãy mở PR giúp tôi , có title và description
```

Tin nhắn 4:

```text
Hãy kiểm tra tinh trạng PR giúp tôi và nêu công việc kế tiếp
```

Tin nhắn 5:

```text
Có, nêu chi tiết 3 file để tôi viết brief
```

Assistant liệt kê chi tiết 3 file và báo lỗi câu 403 trong `server.mjs` khác contract ("thực hiện thao tác này" thay vì "truy cập chức năng này").

Tin nhắn 6 (prompt giao việc):

```text
[KHỐI RÀNG BUỘC CHUNG — MOCK]
- Bạn đang làm việc trong repo GradStudio (PA#3), vai trò TV1.
- Chỉ dùng các module có sẵn của Node.js: node:http, node:fs, node:path, node:url. Không package.json, không npm install.
- KHÔNG sửa docs/api/, client/, tools/. Chỉ thao tác trong thư mục mock/.
- Các quyết định kỹ thuật đã chốt:
  1. previewCount tính động dựa trên số ảnh cùng bookingCode trong db.photos (nếu chưa có thì là 0).
  2. Bước kiểm tra quyền upload preview chỉ đọc db.jobs, không phụ thuộc vào db.bookings.
  3. Lần upload đầu tiên cho booking chưa có ảnh sẽ sinh 36 ảnh ph-01..ph-36, totalPhotos là 36.
  4. Cho phép tạo mock/lib/time.mjs với hàm nowIso() trả ISO string múi giờ +07:00.

---

[CÁC BƯỚC THỰC HIỆN VÀ COMMIT]

Bước 0. Sửa lỗi 403 trên mock/core:
- Trong mock/server.mjs, sửa câu báo 403 thành đúng nguyên văn contract: "Bạn không có quyền truy cập chức năng này".
- Commit ngay trên mock/core:
  `fix(mock): 403 message matches contract`

Bước 1. Tách nhánh mock/tv1-routes từ mock/core:
- Chạy: git checkout -b mock/tv1-routes

Bước 2. Helper thời gian (mock/lib/time.mjs):
- Viết mock/lib/time.mjs export hàm nowIso(): trả về thời gian hiện tại theo định dạng ISO kèm múi giờ +07:00 (ví dụ: "2026-11-21T10:00:00+07:00").
- Commit: `mock(lib): time helper with +07:00 timezone`

Bước 3. Settings (13-settings.md - 2 endpoint):
- Tạo mock/data/settings.json: {"openingHours": {"open": "08:00", "close": "20:00"}, "reminderHoursBefore": 24}. Giữ nguyên tên field.
- Tạo mock/routes/settings.mjs:
  * GET /api/settings: roles ['superadmin'], trả 200 {"settings": ...}.
  * PUT /api/settings: roles ['superadmin'], nhận body ghi đè settings.
    - Validate openingHours.open: bắt buộc, định dạng HH:mm (00:00-23:59), lỗi: fields['openingHours.open'] = "Giờ không đúng định dạng HH:mm".
    - Validate openingHours.close: bắt buộc, định dạng HH:mm, phải sau open, lỗi: fields['openingHours.close'] = "Giờ đóng cửa phải sau giờ mở cửa".
    - Validate reminderHoursBefore: số nguyên từ 1 đến 168, lỗi: fields.reminderHoursBefore = "Chọn từ 1 đến 168 giờ".
    - Chỉ lưu đúng 3 field hợp lệ vào db.settings, trả 200 {"settings": ...}.
- Commit: `mock(settings): settings data, GET and PUT handlers`

Bước 4. Admins (12-admins.md - 2 endpoint):
- Tạo mock/routes/admins.mjs (dữ liệu dùng chung db.users, lọc user có role === 'admin'):
  * GET /api/admins: roles ['superadmin'], trả danh sách admin dạng {id, name, email, active: true, createdAt}, không trả password, sắp xếp theo createdAt tăng
  dần.
  * POST /api/admins: roles ['superadmin'].
    - Validate name: trim, 2-80 ký tự (lỗi: "Tên từ 2 đến 80 ký tự").
    - Validate email: trim, bắt buộc, định dạng email, tối đa 120 ký tự (lỗi tương tự login).
    - Validate password: 8-100 ký tự (lỗi: "Mật khẩu ít nhất 8 ký tự", nếu bỏ trống thì "Vui lòng nhập mật khẩu", nếu >100 thì "Mật khẩu tối đa 100 ký tự").
    - Kiểm tra email trùng với bất kỳ ai trong db.users (không phân biệt hoa thường) -> trả 409 EMAIL_TAKEN với fields.email = "Email này đã được dùng".
    - Sinh admin mới: id dạng "u-admin-<n>" (n tăng dần), role: "admin", active: true, createdAt: nowIso(). Lưu vào db.users và trả 201 {"admin": ...}.
- Commit: `mock(admins): list and create admin handlers`

Bước 5. Jobs & Previews (08-jobs.md - 4 endpoint):
- Tạo mock/data/jobs.json: chứa 4 job khởi tạo (J-GS-1021-makeup, J-GS-1021-shoot, J-GS-1022-shoot, J-GS-1022-edit) đầy đủ các field theo mục 3 trong thảo
luận.
- Tạo mock/routes/jobs.mjs:
  * GET /api/jobs: roles ['staff']. Lọc job của user hiện tại (staff.id === user.id). Lọc theo ?status= (nếu status không thuộc todo|in_progress|done thì 400
  fields.status: "Trạng thái không hợp lệ"). Sắp xếp: có ngày trước (theo date, start), không có ngày (edit) xếp cuối theo bookingCode. previewCount tính động
  từ db.photos.
  * GET /api/jobs/:id: roles ['staff']. Không tìm thấy hoặc không phải việc của mình -> 404 "Không tìm thấy việc này".
  * PATCH /api/jobs/:id: roles ['staff']. Cùng luật 404. Cập nhật status (bắt buộc, lỗi 400 nếu sai/trống) và note (tối đa 500 ký tự, rỗng thì xóa, bỏ qua thì
  giữ nguyên). Trả 200 {"job": ...}.
  * POST /api/bookings/:code/previews: roles ['staff'], nhận multipart:
    1. Kiểm tra db.jobs: nếu user không có việc nào trong bookingCode -> 404 "Không tìm thấy booking này".
    2. Nếu user chỉ có việc kind === "makeup" trong booking đó -> 403 "Chỉ thợ chụp hoặc chỉnh ảnh của booking này được đăng ảnh xem trước".
    3. Đọc rawBody dạng latin1: tìm part name="file". Không có -> 400 fields.file = "Vui lòng chọn ảnh".
    4. Kiểm tra Content-Type của part: chỉ nhận image/jpeg hoặc image/png -> 400 "Chỉ nhận ảnh JPEG hoặc PNG".
    5. Kiểm tra Content-Length > 5MB + 64KB -> 400 "Ảnh tối đa 5 MB".
    6. Tạo ảnh: url "/samples/preview-NN.svg", alt "Ảnh xem trước số N (minh họa)", uploadedBy {id, name}, uploadedAt: nowIso().
       Nếu booking chưa có ảnh nào trong db.photos, thêm ảnh tải lên thành ph-01 và tự sinh thêm ph-02..ph-36 (tổng 36 ảnh, totalPhotos: 36). Nếu đã có ảnh thì
       thêm tiếp ph-37...
       Lưu vào db.photos và trả 201 {"photo": ..., "totalPhotos": ...}.
- Commit: `mock(jobs): jobs data, list, update and preview upload handlers`

---

[TIÊU CHÍ NGHIỆM THU]
1. Chạy `node tools/contract-check.mjs --only 13-settings.md` đạt 5/5 PASS (kể cả với cờ --strict-values).
2. Chạy `node tools/contract-check.mjs --only 12-admins.md` đạt 8/8 PASS (kể cả admin mới tạo đăng nhập được).
3. Với 08-jobs.md: Thử nghiệm trên bản mock tạm có thêm 3 job của GS-1024 để xác nhận 12/12 PASS (không commit dữ liệu tạm này).
4. MOCK_MODE=empty: {"jobs": []}, {"admins": []}, còn settings vẫn trả object.
5. `git diff main -- docs/api client tools` hoàn toàn trống.
```

## 9. [TV3 · 21/11/2026 · Codex] Mock: chat, kiểm tra trùng lịch và booking

Tin nhắn 1:

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy làm mock cho phần chat, kiểm tra trùng lịch và booking của GradStudio PA#3 theo kế hoạch ngày 21–22/11/2026.

Ưu tiên hoàn thành mock/lib/clash.mjs trước vì Kiệt cần dùng khi xử lý thanh toán cọc. Mốc bàn giao hàm này là 18:00 ngày 21/11; phần mock TV3 cần đạt 0 FAIL trước 12:00 ngày 22/11.

Tôi cho phép bạn git add và git commit phần việc này dưới tên tôi, mỗi file một commit. Đây là ngoại lệ được tôi cho phép đối với quy định không commit trong AGENTS.md. Không sửa AGENTS.md và không tự push, mở PR hoặc merge nhánh.

1. Đọc tài liệu và kiểm tra trạng thái

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

Đọc trước khi sửa:
- AGENTS.md.
- ../ke-hoach/ke-hoach/TV3-chat-booking-admin.md, nhất là mục 2, 3, 5.2 và 7.
- docs/api/README.md.
- docs/api/03-conversations.md.
- docs/api/04-availability.md.
- docs/api/05-bookings.md.
- docs/api/10-admin-bookings.md.
- docs/api/02-catalog.md, 06-payments.md và 08-jobs.md để hiểu dữ liệu dùng chung.
- docs/api/13-settings.md để hiểu openingHours.
- mock/server.mjs và mock/routes/auth.mjs.
- tools/contract-check-README.md và tools/contract-check.mjs.
- brief.md và phần PA#3 của AI-LOG.md.

Kiểm tra git status, branch hiện tại, lịch sử commit và các file mock đã có. Không xóa, ghi đè, stash hoặc commit thay đổi có sẵn của người khác.

Nếu đang ở mock/tv3 và nhánh phù hợp với task, tiếp tục dùng nhánh đó. Nếu phải tạo nhánh mới, tạo mock/tv3 từ main đã cập nhật bằng fast-forward khi working tree sạch. Không reset, rebase hoặc force push.

Nếu không truy cập được remote, báo rõ và tiếp tục phần có thể làm an toàn trên checkout hiện tại.

2. Phạm vi được sửa

Các file TV3:
- mock/lib/clash.mjs
- mock/data/conversations.json
- mock/data/resources.json
- mock/data/bookings.json
- mock/routes/conversations.mjs
- mock/routes/resources.mjs
- mock/routes/bookings.mjs
- mock/routes/admin-bookings.mjs

Được cập nhật brief.md và AI-LOG.md theo mục 7.

Không sửa docs/api/, client/, tools/, AGENTS.md, mock/server.mjs hoặc file của TV1/TV2.

Khung server đã tự nạp mock/data/*.json và mock/routes/*.mjs. Hãy dùng cơ chế hiện có, không viết lại server.

Nếu thiếu dữ liệu hoặc có mâu thuẫn cần sửa ở phần của người khác, nêu rõ file, field và ảnh hưởng. Tiếp tục phần độc lập; không tự sửa contract cho khớp code.

Chỉ dùng module có sẵn của Node.js. Không thêm package.json, dependency hoặc chạy npm install cho mock.

3. Tích hợp với khung mock

Đọc đúng giao diện của server:
- Mỗi file routes export default một mảng route.
- Route có method, path, roles và handler.
- handler nhận ctx gồm params, query, body, rawBody, headers, user, db, fail.
- handler trả { status, body }.
- Dùng ctx.fail theo error shape chung.
- Dữ liệu được nạp vào db theo tên file JSON.

Tận dụng middleware có sẵn cho xác thực, vai trò, delay, log và các chế độ mock. Không xử lý lặp các chức năng này trong từng route.

Mọi thay đổi nghiệp vụ ở trong bộ nhớ. Khởi động lại server phải trở về dữ liệu seed.

4. Làm checkClash trước

Giao diện cần bàn giao cho Kiệt:
checkClash(db, date, items, { ignoreBooking } = {})
→ { available, clashes, suggestions }

Yêu cầu:
- Kiểm tra trùng theo staffId và roomId.
- Trong các trạng thái booking hiện có, chỉ booked chiếm lịch; awaiting_deposit, cancelled và completed không chặn giờ.
- Tính cả khoảng bận cố định nếu dữ liệu tài nguyên có khai báo theo đặc tả.
- Bỏ qua booking có mã ignoreBooking khi kiểm tra đổi lịch.
- Hai khoảng [a,b) và [c,d) trùng khi a < d và c < b.
- Hai ca nối tiếp tại cùng thời điểm không bị tính là trùng.
- Không thay đổi db hoặc items đầu vào.
- Trả reason bằng tiếng Việt và đúng cấu trúc Clash/Suggestion.
- Gợi ý giữ nguyên thời lượng, thứ tự các ca và tuân thủ giờ mở cửa trong db.settings.openingHours.
- Bảo đảm tình huống mẫu: Mai bận 08:00–12:00 ngày 24/10/2026; 09:00 trùng, makeup 13:00–14:00 và chụp 14:00–16:00 hợp lệ.

Không thêm ignoreBooking vào body API vì contract không có field đó. Route đề xuất và đổi booking phải suy ra mã booking cần bỏ qua ở phía server.

Nếu settings chưa được TV1 bàn giao, chỉ ra phụ thuộc này; không tự tạo cấu hình mặc định ngoài đặc tả.

5. Dữ liệu và routes

Seed:
- Đủ 5 hội thoại c-linh, c-khoa, c-han, c-bao, c-anh, thể hiện đủ 4 trạng thái.
- c-linh có câu hỏi của Linh và phản hồi ban đầu của studio.
- c-han gắn GS-1023.
- Nhân sự, phòng và trang phục theo contract.
- Booking GS-1020 đến GS-1023, đủ field của Booking.
- GS-1021 có ca của Mai 08:00–12:00, là nguồn gây trùng.
- GS-1024 chỉ được tạo ở G6, không có sẵn trong seed.

Routes:
- conversations.mjs: đủ 6 endpoint của file 03.
- resources.mjs: resources, schedule và availability/check của file 04.
- bookings.mjs: tạo, danh sách, chi tiết booking của file 05.
- admin-bookings.mjs: đổi lịch, hủy, final-link của file 10.

Tuân thủ nguyên văn method, path, body, phân quyền, validation, status HTTP và cấu trúc response trong contract.

Các điểm cần giữ đúng:
- Customer chỉ truy cập dữ liệu được phép.
- Request lỗi không thay đổi dữ liệu hoặc tiêu thụ ID.
- p-1 bị khách từ chối, p-2 được đồng ý.
- Tạo booking từ p-1 trả 409; tạo từ p-2 sinh GS-1024.
- Booking mới là awaiting_deposit/unpaid; không giữ chỗ hoặc sinh job ở bước này.
- Tiền được lấy và tính theo contract, không tin số tiền do client gửi.
- Đổi lịch cần đề xuất thuộc đúng hội thoại và đã được khách đồng ý.
- Kiểm tra trùng lại ngay trước khi áp dụng; nếu lỗi, không cập nhật dở dang booking hoặc jobs.
- Giữ nguyên trạng thái thanh toán, số tiền và tiến độ công việc khi đổi lịch.
- Hủy và final-link tuân thủ điều kiện của file 10.
- Không chặn ngày trong quá khứ vì dữ liệu mẫu dùng 24/10/2026.

File 10 đang nêu khoảng trống về cách xử lý jobs khi hủy booking đã có việc. Không tự thêm Job.status=cancelled hoặc chọn xóa/lưu trữ job khi chưa có quyết định. Báo rõ phần cần Hưng xác nhận; vẫn hoàn thành các trường hợp đã có đặc tả, gồm GS-1023 chưa có jobs.

6. Kiểm tra

Thực hiện kiểm tra phù hợp trước khi commit:
- node --check với các file .mjs.
- Parse các file JSON.
- Kiểm tra checkClash: trùng nhân sự, trùng phòng, hai ca nối tiếp, ignoreBooking, awaiting_deposit không chiếm lịch và đầu vào không bị thay đổi.
- Kiểm tra phân quyền, validation và các hành động chính qua HTTP.
- Kiểm tra normal, slow, error, empty; token vẫn dùng được sau khi khởi động lại server.
- Xác nhận restart khôi phục dữ liệu seed.
- Chạy git diff --check và đọc diff.

Chạy contract-check theo đúng chuỗi trên mock vừa khởi động:
- File 03 tạo trạng thái cần cho file 05.
- File 10 còn phụ thuộc thanh toán/gallery và phần của TV1/TV2.
- Khi chạy từng file bằng --only, phải thực hiện các bước tiền đề trên cùng instance trước đó.
- Không khởi động lại giữa các bước của cùng chuỗi, không chạy lại chuỗi trên dữ liệu đã bị thay đổi.

Nếu đủ phần của các thành viên, chạy toàn bộ contract-check trên server mới khởi động.

Nếu còn thiếu phần TV1/TV2, ghi rõ ví dụ nào bị chặn và vì sao. Không sửa file người khác, không commit fixture tạm và không tuyên bố toàn bộ đạt 0 FAIL khi chưa kiểm chứng được.

Chỉ dừng các tiến trình server do bạn tạo cho task này.

7. Báo cáo bàn giao

Khi xong, báo:
- Nhánh đang làm.
- Các file đã hoàn thành và phần còn thiếu.
- Bảng commit gồm hash, file, message, author và committer.
- Kết quả kiểm tra thực tế, số PASS/FAIL nếu đã chạy contract-check.
- Các phụ thuộc cần Hưng/Kiệt xử lý.
- Cách import và gọi checkClash để Kiệt tích hợp.
- Số mục đã ghi trong brief.md và AI-LOG.md.
- Git status cuối cùng.

Không push, mở PR hoặc gửi tin nhắn cho người khác.
```

## 10. [TV2 · 21/11/2026 · Antigravity Assistant] Mock: data, SVG samples và 5 route files của TV2

Tin nhắn 1:

```text
xong r, giờ làm gì tiếp (mà có 9 file đang untrack ấy, có sợ bị ảnh hưởng gì khi dùng các lệnh pull push,....này nọ ko, các file đó chủ yếu cho agent đọc được context)
```

Tin nhắn 2:

```text
hãy triển khai phần mock của TV2 theo đúng hợp đồng docs/api/ (02, 06, 07, 09, 11) và kế hoạch TV2-khach-hang.md. Không tự ý chạy lệnh ảnh hưởng trên github, làm xong thì dừng lại để tôi check trước khi commit
```

## 11. [TV1 · 22/11/2026 · Antigravity Assistant] Nền front end: router, api client, hooks, Layout, status

Tin nhắn 1 (yêu cầu triển khai sau khi rà tiến độ và review PR #12 `mock/tv2`):

```text
Bối cảnh: GradStudio PA#3, front end React + Vite trong client/. Trước khi viết code, đọc AGENTS.md, FRONTEND.md (mục Demo accounts, Routes), docs/api/README.md và mục 2.4, 3.6, 5.4 trong
    ke-hoach/TV1-nen-tang-staff-superadmin.md.

    Ràng buộc bắt buộc:
    1. docs/api/ là đặc tả duy nhất. Chỉ gọi endpoint có trong bảng của docs/api/README.md, đúng method, path, body và tên field. Nếu cần một endpoint hoặc field chưa có thì DỪNG LẠI và báo tôi, không
    tự thêm.
    2. KHÔNG sửa bất kỳ file nào trong docs/api/, mock/, tools/ và ke-hoach/.
    3. Chỉ gọi đường dẫn tương đối /api/... thông qua client/src/api/client.js. Không viết http://localhost.
    4. Không viết cứng dữ liệu (gói, giá, booking, tên người, tin nhắn...) trong component. Mọi thứ người dùng thấy đều lấy từ API.
    5. Màn nào tải dữ liệu thì dùng useFetch + <AsyncState>, có đủ: đang tải, lỗi kèm nút "Thử lại", và danh sách rỗng. Mỗi thứ chỉ gửi một request; sau một hành động thì cập nhật màn hình từ câu trả
    lời của API, không reload trang.
    6. Điều hướng dùng <Link>/<NavLink>, hành động dùng <button>. Không có href="#", không có nút demo hay mô phỏng.
    7. Được phép cài duy nhất gói `react-router-dom` trong client/ (đã chốt ở FRONTEND.md). Không thêm thư viện nào khác. CSS thuần đặt trong client/src/styles/.
    8. Semantic và responsive: mỗi màn đúng một <h1>, không nhảy cấp heading, dùng landmark header/nav/main/footer, mọi input có <label>, nút và link đứng riêng cao ít nhất 44px ở 360px, không cuộn
    ngang ở 360/768/1280px, trạng thái không thể hiện chỉ bằng màu.
    9. Form dùng useForm + <FormField>: kiểm tra theo giới hạn ghi trong contract; sau lần submit đầu thì hiện lỗi cạnh từng field (aria-describedby, aria-invalid); lỗi 400 từ API gắn đúng vào field;
    giữ nguyên giá trị đã nhập khi lỗi; khóa nút trong lúc đang gửi; focus vào field lỗi đầu tiên.
    10. Tên trạng thái lấy từ client/src/constants/status.js.
    11. Không dùng ảnh người thật; không import src/data/fixtures.js (dữ liệu PA#2) trong code mới.
    12. KHÔNG tự chạy git add, git commit hay git push.

    ---

    Yêu cầu chi tiết (Bước #11 — Nền front end, CHƯA làm màn hình nghiệp vụ và chưa cần AuthContext/Sign-in thật ở task này):

    1. Chuyển client/ sang SPA một entry với BrowserRouter:
       - Cài `react-router-dom` trong `client/`.
       - Xóa `client/studio.html`, `client/booking.html` và bỏ phần `build.rollupOptions.input` trong `client/vite.config.js` (giữ nguyên proxy `/api` và `base: '/'`).
       - KHÔNG xóa các file tham khảo của PA#2: `client/src/pages/HomePage.jsx`, `StudioPage.jsx`, `BookingPage.jsx`, `components/FloatingChat.jsx`, `data/fixtures.js`.

    2. Tạo các module nền trong `client/src/`:
       - `api/client.js`: export `ApiError` (`{ status, code, message, fields, details }`) và `apiFetch(path, { method, body, signal })`. Chỉ nhận `path` bắt đầu bằng `/api/`. Tự gắn `Authorization:
       Bearer <token>` (đọc qua callback/setter token đăng ký từ bên ngoài, mặc định đọc từ storage an toàn với try/catch để chưa có AuthContext vẫn hoạt động). Body thường gửi JSON; body là `FormData`
       thì không tự đặt `Content-Type`. Gặp 401 (trừ khi caller truyền cờ bỏ qua như lúc đăng nhập) thì gọi handler `onUnauthorized` đã đăng ký.
       - `hooks/useFetch.js`: `useFetch(path)` trả `{ data, error, loading, reload, setData }`. Mỗi lần mount hoặc đổi `path` chỉ gửi 1 request, có `AbortController` hủy khi unmount/đổi `path`. Hỗ trợ
       `path` là `null`/`undefined` (không gọi API).
       - `components/AsyncState.jsx`: nhận `{ loading, error, onRetry, isEmpty, emptyMessage, children }`. Đang tải: `<p role="status">Đang tải…</p>`. Lỗi: `<div role="alert">` gồm thông báo và
       `<button type="button" onClick={onRetry}>Thử lại</button>`. Rỗng: `<p>` với `emptyMessage`.
       - `hooks/useForm.js`: `useForm({ initial, validate, onSubmit })` trả `{ values, errors, submitting, handleChange, handleSubmit, setServerErrors, reset }`. Chỉ hiện lỗi sau lần submit đầu; khi
       `ApiError` 400 ném từ `onSubmit` có `err.fields` thì tự gắn vào đúng field; giữ nguyên giá trị đã nhập khi lỗi; `submitting` khóa nút; focus vào field lỗi đầu tiên theo thứ tự DOM/field.
       - `components/FormField.jsx`: render `<label htmlFor>`, control (hoặc children/inputProps), và `<p id="<name>-error" className="field-error">` khi có lỗi; gắn `aria-invalid` và
       `aria-describedby`.
       - `constants/status.js`: nơi duy nhất đổi toàn bộ mã trạng thái ở bảng mục 2.4 (`CONVERSATION_STATUS`, `BOOKING_STATUS`, `PAYMENT_STATUS`, `PAYMENT_ITEM_STATUS`, `PROPOSAL_STATUS`, `JOB_STATUS`,
       `JOB_KIND`, `REMINDER_EMAIL_STATUS`) sang nhãn tiếng Việt; kèm `formatMoney(amount)` (ví dụ `1800000` -> `"1.800.000đ"`) và `formatDate(isoDate)` (ví dụ `"2026-10-24"` -> `"Thứ Bảy,
       24/10/2026"`).
       - `components/StatusBadge.jsx` và `components/Money.jsx`: badge luôn có chữ tiếng Việt (không chỉ chấm màu), Money dùng `tabular-nums`.
       - `components/Layout.jsx`: viết lại dựa trên CSS/design tokens Blue Theme trong `client/src/styles/`, KHÔNG import `fixtures.js`, bỏ menu cứng (`Linh`, `Thảo`, badge `3`, "Đăng xuất chưa khả
       dụng") và bỏ nút/ghi chú demo. Có link "Bỏ qua tới nội dung chính" (`#main`), `<header>` với logo `<Link to="/">`, `<nav aria-label="Chính">` render menu theo `user?.role` (khách vãng lai /
       customer / admin / staff / superadmin theo `FRONTEND.md`), tên user + nút `<button>Đăng xuất</button>` khi đã đăng nhập hoặc `<Link to="/sign-in">Đăng nhập</Link>` khi chưa đăng nhập; `<main
       id="main">`; `<footer className="site-footer">` chỉ có chữ và tên thương hiệu (không link chết).
       - Tạo sẵn các file khung route rỗng: `routes/public.jsx`, `routes/customer.jsx`, `routes/admin.jsx`, `routes/staff.jsx`, `routes/superadmin.jsx` (mỗi file export mảng route hoặc JSX `<Route>` để
       các thành viên tự điền).
       - `App.jsx` + `main.jsx`: dùng `<BrowserRouter>`, ghép các file `routes/`, có route `*` hiển thị màn *Không tìm thấy trang* (đúng một `<h1>`, có `<Link>` về trang chủ). Tạm thời giữ một route
       `/` đơn giản trong `App.jsx` (hoặc `routes/public.jsx`) dùng `Layout` + `useFetch('/api/services')` + `<AsyncState>` để test 4 chế độ mock và nút `Thử lại` (sẽ thay bằng G1 của TV2 ở bước sau).
       - Thêm CSS nền cho `FormField`, `AsyncState`, `StatusBadge`, skip-link, màn `NotFound`, đảm bảo tap target ≥ 44px ở 360px và không cuộn ngang.

    3. Cập nhật `AGENTS.md`:
       - Sửa câu trong mục Tech stack đang ghi "(added in the front-end foundation step; until then the three PA#2 HTML entries remain)" vì bước nền đã bỏ `studio.html` và `booking.html`.
       - Bổ sung hướng dẫn ngắn kèm ví dụ cách TV2/TV3 dùng `useFetch`, `AsyncState`, `useForm`, `FormField`, `StatusBadge`, `Money`, `constants/status.js` và `routes/*.jsx`.

    Kiểm tra sau khi xong:
    - Chạy `cd client && npm run build` thành công.
    - Mở `npx vite preview` kiểm tra không có lỗi Console, route lạ hiện màn *Không tìm thấy trang*, không cuộn ngang ở 360/768/1280px.
    - Kiểm tra `git diff -- docs/api mock tools` hoàn toàn trống.
    - Liệt kê các file đã tạo/sửa và kết quả các lệnh kiểm tra đã chạy thật. , bạn tạo nhánh giúp tôi luôn nhé làm cho phần này , phần code được merge thì pull về nhé rồi chỉnh sửa sau
```

## 12. [TV1 · 22/11/2026 · Antigravity Assistant] G2: AuthContext, RequireRole, màn đăng nhập /sign-in

Tin nhắn 1 (triển khai Bước #12 — G2 trên `feat/g2-auth`):

```text
Bối cảnh: GradStudio PA#3, front end React + Vite trong client/ (trên nhánh feat/g2-auth tách từ feat/core-foundation). Trước khi viết code, đọc AGENTS.md, FRONTEND.md (mục Demo accounts, Routes), docs/api/01-auth.md và mục 5.4, 5.5, P3 trong ke-hoach/TV1-nen-tang-staff-superadmin.md.

Ràng buộc bắt buộc:
1. Chỉ gọi 3 endpoint trong docs/api/01-auth.md (`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`) thông qua `client/src/api/client.js`. Không sửa `docs/api/`, `mock/`, `tools/`, `ke-hoach/`.
2. Không thêm thư viện mới; dùng `useForm` + `FormField`, CSS thuần trong `client/src/styles/foundation.css`.
3. Mỗi màn đúng một `<h1>`, mọi input có `<label>`, điều hướng dùng `<Link>`/`<NavLink>`, hành động dùng `<button>`. Không hiển thị danh sách tài khoản demo hay nút chuyển vai trò lên giao diện.
4. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu chi tiết (Bước #12 — G2):
1. `client/src/api/auth.js`: bọc `login({ email, password })`, `fetchMe({ signal })`, `logout()`.
2. `client/src/auth/AuthContext.jsx`:
   - Cung cấp `AuthProvider` và hook `useAuth()` trả `{ user, token, ready, signIn, signOut }`, cùng `ROLE_HOME` và `canRoleAccessPath(role, pathname)`.
   - Lưu token vào `localStorage` (bọc `try/catch`) để F5 không mất phiên; đăng ký handler lấy token (`Authorization: Bearer <token>`) và handler 401 (`onUnauthorized`) với `api/client.js`.
   - Khi khởi động nếu đã có token thì gọi `GET /api/auth/me` trước khi đặt `ready = true` (401 thì xóa phiên; giữ phiên cache nếu gặp 500 ở `MOCK_MODE=error` để màn dữ liệu vẫn hiển thị lỗi + Thử lại).
   - `signOut` gọi `POST /api/auth/logout`, xóa token/user ở context và `localStorage`, rồi chuyển về `/`.
3. `client/src/auth/RequireRole.jsx` và `client/src/pages/ForbiddenPage.jsx`:
   - Chờ `ready`; chưa đăng nhập → `<Navigate to="/sign-in" replace state={{ from: location }} />`.
   - Sai vai trò → màn `<h1>Không có quyền truy cập</h1>` có link về trang chủ của vai trò đang đăng nhập.
4. `client/src/pages/SignInPage.jsx` (`/sign-in`):
   - `<h1>Đăng nhập</h1>`, dùng `useForm` + `FormField` với đúng 1 ô E-mail, 1 ô Mật khẩu và 1 nút submit.
   - Validate trước khi gửi theo `01-auth.md` (email bắt buộc, đúng định dạng, ≤ 120 ký tự; password bắt buộc, 1–100 ký tự).
   - Lỗi `401` (`Email hoặc mật khẩu không đúng`) hiện `<p role="alert">` phía trên nút submit; khi gửi khóa nút thành `"Đang đăng nhập…"`.
   - Đăng nhập thành công: quay về `state.from` nếu vai trò hiện tại được phép truy cập route đó, ngược lại chuyển về `ROLE_HOME[user.role]` (`/my-bookings`, `/admin/conversations`, `/staff/jobs`, `/superadmin/admins`).
5. Nối `Layout.jsx` tự đọc `useAuth()`, bọc `App.jsx` bằng `<AuthProvider>`, đặt 4 route trang chủ tạm có `<RequireRole>` trong `routes/{customer,admin,staff,superadmin}.jsx` để test G2, cập nhật `AGENTS.md`.
```

Tin nhắn 2 (sửa lỗi banner 401 không tự ẩn khi nhập lại trên `/sign-in`):

```text
Khi kiểm thử màn `/sign-in` (client/src/pages/SignInPage.jsx), sau khi submit sai tài khoản và nhận lỗi 401 ("Email hoặc mật khẩu không đúng"), banner lỗi vẫn giữ nguyên khi người dùng nhấp chuột (focus) hoặc gõ sửa lại vào ô E-mail hoặc Mật khẩu. Hãy cập nhật `client/src/hooks/useForm.js` và `SignInPage.jsx`:
- Trong `useForm`, thêm `clearSubmitError` và tự xóa `submitError` khi người dùng thay đổi giá trị bất kỳ ô nhập nào (`setFieldValue`), nhưng giữ nguyên toàn bộ giá trị đã nhập.
- Trong `SignInPage`, gắn `onFocus: form.clearSubmitError` cho cả 2 ô `email` và `password` để banner lỗi 401 biến mất ngay khi người dùng nhấp vào nhập lại.
- Không sửa `docs/api/` hay `mock/`. Chạy lại `cd client && npm run build` và `git diff --check`.
```

## 14. [TV3 · 23/11/2026 · Codex] Component chat dùng chung

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy thực hiện phần việc tiếp theo sau mock: làm hai component chat dùng chung để Kiệt tích hợp vào màn khách hàng, còn tôi dùng cho màn Admin.

Công việc ngày 23/11/2026:
- client/src/components/chat/ChatThread.jsx
- client/src/components/chat/ProposalCard.jsx

Hãy triển khai, kiểm tra, ghi tài liệu và commit từng file dưới tên tôi theo các yêu cầu dưới đây.

1. Đọc tài liệu và kiểm tra code

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

Đọc:
- AGENTS.md.
- ../ke-hoach/ke-hoach/TV3-chat-booking-admin.md, mục 3, 5.3, 5.4, 7 và 9.
- docs/api/README.md, phần Message, Proposal và ScheduleItem.
- docs/api/03-conversations.md.
- FRONTEND.md.
- brief.md và phần PA#3 của AI-LOG.md.
- Các component, CSS và design tokens hiện có trong client/src/.
- Các phần nền frontend của Hưng nếu đã có: status.js, useForm, FormField và các component dùng chung.

Dùng đúng cấu trúc dữ liệu từ contract. Không sửa contract hoặc mock để phục vụ component.

2. Tạo nhánh

Kiểm tra git status, branch hiện tại và remote. Giữ nguyên thay đổi có sẵn, không tự stash hoặc ghi đè.

Nếu working tree sạch:
- Chuyển sang main.
- Fetch origin và cập nhật main bằng fast-forward.
- Tạo nhánh feat/chat-components.

Nếu nhánh đã tồn tại, kiểm tra trước khi tiếp tục; không reset hoặc xóa nhánh.

Nếu mock/tv3 chưa được merge, báo rõ. Hai component chỉ nhận props nên hãy xác định phần có thể làm độc lập, không tự merge nhánh mock hoặc mang cả thay đổi mock sang nhánh frontend.

Nếu không kết nối được remote, ghi rõ đang dùng checkout cục bộ. Nếu không thể chuyển nhánh an toàn, báo nguyên nhân.

3. Phạm vi sửa

Được tạo hoặc sửa:
- client/src/components/chat/ChatThread.jsx
- client/src/components/chat/ProposalCard.jsx
- client/src/styles/chat-components.css nếu cần.
- AGENTS.md: chỉ bổ sung hướng dẫn sử dụng hai component trong mục Front-end structure.
- brief.md và AI-LOG.md: chỉ thêm mục của task này theo cấu trúc có sẵn.

Không sửa docs/api/, mock/, package.json, lockfile, router, các trang hoặc phần nền do Hưng phụ trách.

Chưa làm G4, G5, G6 hoặc G10 trong task này. Không thay thế màn PA#2 hoặc xóa FloatingChat lúc này.

Không thêm thư viện.

4. ChatThread.jsx

Giữ giao diện props theo kế hoạch:
- messages
- viewerRole
- onSend(text)
- sending
- renderProposal(proposal)

Yêu cầu:
- Component chỉ nhận dữ liệu và callback, không gọi API.
- Không đọc token, localStorage hoặc dữ liệu fixtures.
- Không tự sinh phản hồi, tin nhắn hoặc dữ liệu nghiệp vụ.
- Render tin nhắn bằng danh sách ol, dùng message.id làm key.
- Hiện người gửi, thời điểm bằng thẻ time có dateTime và nội dung tin.
- Dùng viewerRole để phân biệt tin của phía đang xem; không chỉ dựa vào màu.
- Tin type=text hiển thị nội dung.
- Tin type=request hiển thị loại chụp, tên gói, ngày giờ mong muốn và dịch vụ thêm từ dữ liệu request.
- Tin type=proposal hiển thị qua renderProposal.
- Nếu không truyền renderProposal, vẫn hiển thị đề xuất đầy đủ bằng ProposalCard.
- messages rỗng hiện “Chưa có tin nhắn nào.”
- Nội dung người dùng được render an toàn như văn bản, không dùng dangerouslySetInnerHTML.

Form gửi tin:
- Có label hiển thị “Tin nhắn”.
- Mỗi instance có ID riêng, tránh trùng ID khi render nhiều khung chat.
- Nút “Gửi” dùng submit, khóa trong lúc sending.
- Chặn tin chỉ có khoảng trắng và kiểm tra giới hạn 1–1000 ký tự theo contract.
- Sau lần submit đầu, hiện lỗi cạnh ô nhập; liên kết bằng aria-describedby và aria-invalid.
- Không gửi hai lần khi callback đang xử lý.
- Chỉ xóa nội dung sau khi onSend thành công.
- Giữ nguyên nội dung và hiện lỗi khi gửi thất bại, gồm lỗi fields.text từ API do phía gọi truyền hoặc ném lại.

Nếu cần thêm prop cho lỗi, hãy bổ sung theo cách tương thích với các props đã chốt và ghi rõ trong hướng dẫn. Không đổi tên hoặc bỏ prop hiện có.

5. ProposalCard.jsx

Props:
- proposal
- actions: ReactNode, không bắt buộc.

Hiển thị:
- Ngày đề xuất.
- Từng ca: loại việc, giờ bắt đầu/kết thúc, tên nhân sự và phòng nếu có.
- Ghi chú.
- Trạng thái bằng chữ: Chờ khách trả lời, Khách đã đồng ý, Khách đã từ chối.
- Các nút do phía gọi truyền qua actions.

Component không tự thêm nút Đồng ý/Từ chối, không gọi API và không tự đổi trạng thái proposal.

Tên người, phòng và thời gian phải lấy từ proposal. Không viết cứng Mai, Tuấn, Phòng B hoặc lịch mẫu trong component.

Tên trạng thái lấy từ client/src/constants/status.js theo quy ước repo. Nếu phần nền này chưa có sau khi cập nhật main, báo rõ phụ thuộc; không tạo bản sao status.js hoặc tự đặt một bảng trạng thái ở chỗ khác.

Đọc đúng ScheduleItem: response dùng staff và room dạng object, không phải staffId và roomId như request.

Xử lý room=null và danh sách items rỗng mà không crash.

6. Bố cục và khả năng truy cập

Dùng design tokens và phong cách hiện có của dự án.

- Chat nằm trong luồng trang, cuộn theo trang.
- Không position: fixed, không đặt chiều cao cố định hoặc overflow riêng cho danh sách tin.
- Không tạo khung cuộn lồng nhau che form.
- Tên dài, tin nhắn dài và URL dài phải xuống dòng.
- Dùng được ở 360, 768 và 1280px, không tràn ngang.
- Nút đứng riêng cao ít nhất 44px ở 360px.
- Có trạng thái focus rõ.
- Trạng thái và phía gửi phải nhận biết được bằng chữ.
- Hai component không tự tạo h1 hoặc landmark của cả trang.
- CSS có phạm vi riêng, không làm thay đổi component hoặc màn hình khác.

Dùng useForm và FormField của Hưng nếu đã có và phù hợp. Nếu chưa có, không tự triển khai lại nền form dùng chung. Hoàn thành phần độc lập, ghi rõ phần còn chờ tích hợp và không báo task đã xong toàn bộ.

7. Hướng dẫn bàn giao

Chỉ bổ sung vào mục Front-end structure trong AGENTS.md:
- Đường dẫn và cách import component/CSS.
- Các props, kiểu dữ liệu và giá trị mặc định.
- onSend trả Promise như thế nào; thành công và thất bại được xử lý ra sao.
- Ví dụ phía Admin dùng ChatThread.
- Ví dụ phía khách truyền nút Đồng ý/Từ chối qua ProposalCard.actions.
- Cách renderProposal nối hai component.
- Các phụ thuộc vào phần nền của Hưng.

Ví dụ dữ liệu lấy theo contract. Dữ liệu dùng để kiểm tra phải tách khỏi code sản phẩm.

8. Kiểm tra

Chạy kiểm tra phù hợp bằng công cụ hiện có, không cài thêm thư viện:
- Render đủ text, request và proposal.
- Danh sách messages/items rỗng.
- room=null.
- Nội dung dài và nhiều instance không trùng ID.
- Tin rỗng, quá giới hạn, đang gửi, thành công và thất bại.
- Callback gửi không bị gọi hai lần.
- Lỗi gửi giữ nguyên nội dung.
- actions hiển thị đúng và component không tự tạo hành động.

Chạy build nếu môi trường cho phép. Build thành công chưa chứng minh component mới đã được render, nên phải kiểm tra trực tiếp hai component bằng cách phù hợp.

Có thể dùng trang hoặc script kiểm tra tạm, nhưng không để lại nút demo, route demo hoặc fixture trong sản phẩm.

Kiểm tra bố cục ở 360/768/1280px nếu có trình duyệt. Nếu không thực hiện được, ghi rõ chưa kiểm tra; không báo đã đạt.

Chạy git diff --check, đọc diff và xác nhận docs/api/ cùng mock/ không bị sửa.
```

## 15. [TV1 · 23/11/2026 · Antigravity Assistant] Bước #S1: đồng bộ contract, mock và tài liệu TV1 theo kế hoạch 23/11

```text
Bối cảnh: GradStudio PA#3, tách nhánh `fix/s1-tv1-plan-alignment` từ `main` mới nhất (đã có PR #13, #14, #15). Thực hiện Bước #S1 theo kế hoạch cập nhật ngày 23/11/2026 và báo cáo đối chiếu (R01, R02, R06, R11, R16 — phần thuộc quyền TV1).

Ràng buộc bắt buộc:
1. Tuân thủ thứ tự contract → mock → code nền/tài liệu. Chỉ sửa các file thuộc quyền sở hữu của TV1 (`docs/api/README.md`, `01-auth.md`, `08-jobs.md`, `12-admins.md`, `mock/server.mjs`, `mock/routes/auth.mjs`, `mock/routes/jobs.mjs`, `mock/routes/admins.mjs`, `client/src/constants/status.js`, `AGENTS.md`, `FRONTEND.md`). KHÔNG sửa file contract/mock thuộc TV2 hoặc TV3.
2. Mọi thay đổi contract phải ghi rõ dòng trong mục `## Changes` (ngày, nội dung, lý do). Không làm vỡ chuỗi ví dụ `contract-check` hiện có (`01`–`13`).
3. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu chi tiết (Bước #S1 — TV1):
1. R01 (Khóa/mở khóa Admin & chặn tài khoản bị khóa):
   - Contract (`README.md`, `01-auth.md`, `12-admins.md`): thêm `PATCH /api/admins/:id` (role `superadmin`, body `{"active": boolean}`, chỉ cập nhật `active`, không sửa tên/email/mật khẩu, không xóa); ghi rõ `active` là trạng thái thật; thêm ví dụ liên tiếp tạo Admin → khóa → đăng nhập bị từ chối → mở khóa → đăng nhập thành công; ghi rõ lỗi đăng nhập/phiên của tài khoản bị khóa.
   - Mock (`mock/routes/admins.mjs`, `mock/routes/auth.mjs`, `mock/server.mjs`): `toAdmin` đọc `u.active !== false`, cài `PATCH /api/admins/:id` (400 nếu `active` không phải boolean hoặc gửi field cấm, 404 nếu không có Admin đó), `auth.mjs` từ chối đăng nhập tài khoản `active === false`, `server.mjs` từ chối token thuộc tài khoản `active === false`.
2. R02 (Tên trạng thái việc):
   - Đổi nhãn `todo` → `Chưa bắt đầu`, `in_progress` → `Đang làm`, `done` → `Hoàn thành` trong `docs/api/README.md` và `client/src/constants/status.js`; xóa ghi chú chờ PO xác nhận. Giữ nguyên mã API.
3. R06 (Chặn Staff ghi dữ liệu khi booking đã hủy):
   - Contract (`08-jobs.md`): ghi rõ `GET /api/jobs` và `GET /api/jobs/:id` vẫn trả lịch sử khi booking `cancelled`; `PATCH /api/jobs/:id` và `POST /api/bookings/:code/previews` trả `409 CONFLICT` và không sửa dữ liệu. Không thêm `job.status = "cancelled"`.
   - Mock (`mock/routes/jobs.mjs`): kiểm tra trạng thái booking trong `db.bookings` sau khi kiểm tra quyền sở hữu (404/403); nếu `booking.status === 'cancelled'` thì trả `409 CONFLICT`.
4. R11 (Giới hạn upload preview đúng 5 MiB = 5.242.880 byte nội dung file):
   - Contract (`08-jobs.md`): sửa ngưỡng từ 5 MB + 64 KB sang đúng 5 MiB (5.242.880 byte) nội dung part `file`, lỗi `fields.file = "Ảnh tối đa 5 MiB"`. Cập nhật ví dụ biên `5242880B` (201) và `5242881B` (400) mà không làm lệch `totalPhotos: 36` của GS-1024.
   - Mock (`mock/routes/jobs.mjs`): parse đúng byte nội dung phần `name="file"` trong multipart body (không dùng `Content-Length` tổng), từ chối 400 nếu `> 5242880`.
5. R16 (Đồng bộ tài liệu hướng dẫn):
   - `AGENTS.md`: sửa ví dụ trả lời proposal từ `{status}` sang `{decision}`; bổ sung tóm tắt các quyết định PO & quy ước nhóm mới liên quan.
   - `FRONTEND.md`: điền mục 5 (*Product owner decisions*) đầy đủ 10 ý PO (ghi rõ chưa có link bài PO) và tách riêng bảng các lựa chọn bổ sung của nhóm (khóa Admin, việc/hội thoại/booking thay thế sau hủy, 4a–4e).
6. Kiểm tra sau khi sửa:
   - Khởi động mock mới và chạy `node tools/contract-check.mjs` đảm bảo 0 FAIL.
   - Chạy kiểm tra bổ sung cho các ca TV1: A01 (khóa/mở khóa + đăng nhập bị chặn + token cũ bị chặn), A04 (PATCH job và upload preview khi booking `cancelled` trả 409), A05 (upload đúng 5.242.880 byte trả 201, 5.242.881 byte trả 400).
   - Chạy `cd client && npm run build` và `git diff --check`.
```

## 16. [TV3 · 23/11/2026 · Codex] Sửa contract và mock theo báo cáo đối chiếu

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy sửa phần contract và mock của TV3 theo báo cáo đối chiếu và kế hoạch vừa cập nhật.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

Mục tiêu của lượt này:
- R03: đổi lịch trực tiếp, không cần khách đồng ý lại.
- R04: đồng bộ nhắc lịch khi đổi lịch, tích hợp phần TV2 bàn giao.
- R05: hủy booking có việc, giữ lịch sử và tiền đã thu.
- R07: tạo booking thay thế trong cùng hội thoại sau hủy.
- R15: hoàn thiện tạo hội thoại mới.
- Phần tài liệu R16/R17 liên quan trực tiếp đến các thay đổi trên.

Chưa triển khai giao diện R14 trong lượt này.

1. Đọc và đối chiếu trước khi sửa

Đọc:
- AGENTS.md.
- ../bao-cao-doi-chieu-ke-hoach-ma-nguon.md, gồm chi tiết lỗi, bằng chứng, thứ tự bàn giao và phần đang đúng cần giữ.
- ../lo-trinh-PA3.html.
- ../ke-hoach/ke-hoach/TV3-chat-booking-admin.md, nhất là mục 2.5–2.8, 4.1, 5.1, 5.2 và 5.9.
- Phần bàn giao tương ứng trong kế hoạch TV1 và TV2.
- docs/api/README.md và các contract 03, 04, 05, 10.
- Contract 06, 07, 08 để hiểu thanh toán, nhắc lịch và jobs.
- mock/routes/conversations.mjs, resources.mjs, bookings.mjs, admin-bookings.mjs.
- mock/lib/clash.mjs.
- Phần payments, reminders, jobs, receive và dữ liệu seed liên quan.
- brief.md và phần PA#3 trong AI-LOG.md.

Kiểm tra lại từng lỗi trên source hiện tại. Báo cáo mô tả checkout cũ; nếu lỗi đã được sửa thì xác minh và giữ nguyên phần đúng, không sửa lại theo suy đoán.

Kế hoạch mới yêu cầu:
- G6 tạo booking mới vẫn cần khách đồng ý giờ.
- G10 đổi lịch trực tiếp bằng date/items, không cần proposalId hoặc khách đồng ý lại.
- Hủy giữ lịch sử việc, khoản đã thu và trạng thái hội thoại scheduled.
- Sau hủy, được chốt giờ mới và tạo booking khác trong cùng hội thoại.
- Chỉ kiểm tra trùng người/phòng, không kiểm số lượng trang phục.
- Cọc tính 30%, làm tròn tới một đồng; remaining = price - deposit.

Những quy tắc mới chưa có trong contract phải được ghi vào contract trước khi sửa mock. Không sửa contract chỉ để hợp thức hóa code cũ.

2. Git và phạm vi

Kiểm tra working tree, branch, remote và lịch sử commit. Không ghi đè, xóa, stash hoặc commit thay đổi có sẵn của người khác.

Khi working tree sạch, cập nhật main bằng fast-forward rồi tạo:
fix/tv3-booking-rules

Nếu nhánh đã tồn tại, kiểm tra trước khi tiếp tục. Không reset, rebase hoặc viết lại lịch sử. Nếu remote không truy cập được, ghi rõ trạng thái và tiếp tục phần an toàn trên checkout hiện có.

Được sửa:
- docs/api/03-conversations.md
- docs/api/04-availability.md nếu cần làm rõ hành vi kiểm tra lịch
- docs/api/05-bookings.md
- docs/api/10-admin-bookings.md
- mock/routes/conversations.mjs
- mock/routes/resources.mjs nếu cần
- mock/routes/bookings.mjs
- mock/routes/admin-bookings.mjs
- mock/lib/clash.mjs nếu phát hiện lỗi liên quan
- Kiểm tra hồi quy cho phần TV3, dùng công cụ có sẵn
- brief.md, AI-LOG.md

Với README, AGENTS và FRONTEND, chỉ sửa nội dung TV3 cần đồng bộ trong task này, giữ nguyên phần người khác. Ví dụ AGENTS hướng dẫn trả lời proposal phải dùng {decision}, không phải {status}.

Không tự sửa payments, reminders, jobs hoặc contract của TV1/TV2. Không đổi shared shape Payment/Reminder khi chưa có bàn giao. Không sửa server, frontend, dependency hoặc tài liệu lịch sử PA2.

3. Sửa contract trước

Cập nhật các quy tắc và ví dụ thực thi:
- PATCH booking nhận date/items theo ScheduleItemInput.
- Bỏ điều kiện proposal accepted và chuỗi Hân đồng ý lại ở G10.
- Hủy chỉ từ awaiting_deposit/booked; cancelled/completed trả 409.
- Hủy không xóa jobs, không đổi tiến độ việc hoặc khoản đã thu.
- Cho đề xuất mới và booking thay thế sau khi booking hiện tại cancelled.
- Booking thay thế phải dùng proposal mới được khách đồng ý và chưa dùng cho booking trước.
- POST conversations hợp lệ có ví dụ 201 với ID c-số.
- Cọc làm tròn tới một đồng, thay quy định cũ làm tròn tới 1.000đ.
- Mô tả tác động đổi/hủy tới reminders theo phần đã thống nhất với TV2.

Mỗi file có Changes ghi ngày thực hiện, nội dung và căn cứ là quyết định PO hay lựa chọn nhóm.

Giữ câu chuyện GS-1024 và thứ tự ví dụ chính. Không để ca kiểm tra bổ sung làm lệch ID hoặc thay trạng thái mà các file sau đang cần.

Commit contract trước các commit mock sử dụng đặc tả mới.

4. R03: đổi lịch trực tiếp

Sửa PATCH /api/bookings/:code:
- Nhận date và items, dùng validateSchedule và toScheduleItems đang có.
- Chỉ Admin được gọi.
- Từ chối booking cancelled/completed.
- Kiểm tra trùng ngay trước khi lưu bằng checkClash, bỏ qua chính booking đang sửa.
- Không thêm ignoreBooking vào request body.
- Trùng trả 409 CLASH với lý do và suggestions đúng error shape.
- Giữ trạng thái booking, thanh toán, số tiền, lựa chọn ảnh và dữ liệu không thuộc lịch.
- Cập nhật ngày/giờ/người/phòng của jobs liên quan, giữ tiến độ và ghi chú.
- Edit jobs vẫn có date/start/end/room null theo contract.
- Không sinh jobs cho booking chưa cọc.

Chuẩn bị đầy đủ thay đổi trước khi ghi. Validation hoặc clash thất bại phải giữ nguyên booking, jobs, reminders và payments.

Nếu gặp trường hợp nhiều ca cùng loại hoặc thay đổi loại ca chưa có quy tắc ánh xạ job, nêu rõ điểm cần TV1 thống nhất. Không âm thầm chọn ca đầu tiên hoặc trả 500 cho trường hợp hợp lệ đã được đặc tả.

5. R04 và tác động nhắc lịch khi hủy

Kiểm tra TV2 đã bàn giao hàm tính lại/dừng nhắc lịch hay chưa.

Khi đã có:
- Dùng chung helper, không sao chép logic ensureBookingReminder hiện tại.
- Tính từ mốc sớm nhất của lịch mới và settings.reminderHoursBefore.
- Cập nhật nhắc chưa gửi cùng nội dung giờ/người/phòng liên quan.
- Giữ lịch sử sent.
- Phân biệt lịch nhắc của phiên bản lịch mới theo contract để chạy lại không tạo trùng.
- Hủy không để nhắc chưa gửi tiếp tục được gửi.
- Không thêm trạng thái e-mail ngoài queued/sent/failed.
- Không tạo reminder cho booking awaiting_deposit chưa được giữ chỗ.

Nếu helper hoặc schema chưa được bàn giao:
- Ghi rõ phần thiếu, chữ ký hàm/dữ liệu cần nhận và các ca nghiệm thu.
- Tiếp tục các lỗi TV3 độc lập.
- Không tạo implementation giả, không dùng helper no-op rồi đánh dấu R04 hoàn thành.
- Không tuyên bố cả luồng đổi/hủy đã đạt khi tác động nhắc lịch còn thiếu.

6. R05: hủy booking đã có việc

Bỏ nhánh dependency 500 đang chặn booking có jobs.

Hành vi cần có:
- awaiting_deposit hoặc booked chuyển cancelled.
- Hủy lại hoặc hủy completed trả 409.
- Giữ nguyên jobs và trạng thái việc.
- Giữ nguyên payments, paymentStatus, giá và khoản đã thu.
- Không thêm trạng thái hoàn tiền hoặc tự chuyển tiền.
- Hội thoại giữ scheduled.
- Tài nguyên được nhả vì cancelled không còn được tính là bận.
- Ngừng nhắc theo phần TV2 bàn giao.

Việc chặn Staff PATCH job và upload sau hủy thuộc R06 của TV1. Kiểm tra tích hợp và báo kết quả, nhưng không tự sửa file TV1 hoặc đánh dấu R06 đã xong thay TV1.

7. R07: booking thay thế

Sửa conversations/bookings để thực hiện:
hủy booking cũ → đề xuất giờ mới → khách đồng ý → tạo booking mới.

Yêu cầu:
- Chỉ cho tạo thêm khi booking hiện tại của hội thoại đã cancelled.
- Booking chưa hủy vẫn chặn bằng 409.
- Không tái dùng proposal đã tạo booking cũ.
- Không dùng proposal thuộc hội thoại khác.
- Mã booking mới lấy số lớn nhất cộng một.
- conversation.bookingCode trỏ tới mã mới.
- Booking cũ giữ conversationId, dữ liệu và lịch sử thanh toán.
- Booking mới bắt đầu awaiting_deposit/unpaid, không nhận cọc cũ tự động.
- GET bookings vẫn trả được cả hai booking đúng quyền sở hữu.
- G6 tiếp tục yêu cầu khách đồng ý proposal mới.

Không thêm field lịch sử vào response khi chưa cần; dùng liên kết conversationId đã có.

8. R15: tạo hội thoại

Hoàn thiện POST /api/conversations:
- Text hợp lệ trả 201.
- Chủ hội thoại lấy từ token.
- ID c-1, c-2… theo số lớn nhất trong các ID dạng c-số; không đụng c-linh/c-han.
- Tạo unanswered, bookingCode=null, acceptedProposalId=null.
- Có tin nhắn đầu của khách, lastMessage và updatedAt nhất quán.
- Admin trả lời lần đầu tự chuyển consulting.
- Lỗi không tiêu thụ ID hoặc thay dữ liệu.
- Kiểm tra quyền sở hữu và text 1–1000 ký tự.
- Không tự đặt thêm giới hạn mỗi khách chỉ có một hội thoại.

9. Kiểm tra và lưu bằng chứng

Thêm kiểm tra hồi quy có thể chạy lại bằng công cụ hiện có, ưu tiên Node built-in. Không thêm dependency.

Phải kiểm tra:
- Đổi lịch trực tiếp thành công, không cần thao tác khách.
- Đổi sang giờ trùng trả 409 và toàn bộ dữ liệu giữ nguyên.
- Không tự trùng lịch với chính booking đang sửa.
- Booking/jobs/reminders cùng lịch mới khi đủ bàn giao.
- Hủy GS-1021 có jobs thành công; giữ việc/tiền; giờ cũ trống.
- Hủy lại và hủy completed trả 409; customer gọi bị chặn.
- Booking thay thế dùng mã mới, proposal mới; booking/tiền cũ không đổi.
- Tái dùng proposal hoặc tạo thêm khi booking chưa hủy bị chặn.
- Hội thoại mới trả 201; Admin trả lời chuyển consulting.
- Giá lấy từ gói, extras không cộng tiền, client không sửa được tiền.
- Cọc làm tròn tới một đồng với một giá không tròn nghìn trong dữ liệu test riêng.

Dữ liệu test được tạo trên bản sao bộ nhớ hoặc môi trường kiểm tra riêng, không sửa seed chỉ để test xanh.

Chạy contract-check trên mock mới khởi động theo đúng toàn bộ chuỗi. --only không tự tạo state tiền đề. Ghi số PASS/FAIL thật và tách lỗi TV3 khỏi lỗi phần bàn giao.

Kiểm tra normal/slow/error/empty, JSON, cú pháp module và git diff --check.

Không lấy 99/99 PASS của contract cũ làm bằng chứng đã sửa nghiệp vụ mới.

10. Nhật ký và commit

Ghi prompt này nguyên văn vào cuối brief.md trước khi sửa, đúng mẫu heading, số mục tiếp theo, ngày thực tế, TV3 và tên công cụ. Không rút gọn hoặc sửa mục cũ.

Thêm mục PA#3 vào AI-LOG.md theo cấu trúc hiện có:
Tool, Request, Changed, Rejected / lỗi phát hiện, Checked, Commits.
Giữ các trường bổ sung nếu mẫu hiện tại đang dùng. Request dẫn đúng mục brief. Chỉ ghi lỗi và kiểm tra có thật.

Tôi cho phép git add và git commit từng file trong task này.
- Author/committer: Lê Công Minh Nhựt.
- Giữ email Git hiện tại của tôi; kiểm tra trước khi dùng.
- Dùng cấu hình từng lệnh, không đổi global config.
- Mỗi commit chỉ một file, stage bằng đường dẫn cụ thể.
- Đọc diff staged trước commit.
- Commit brief trước; contract trước mock; AI-LOG cuối.
- Không amend, reset hoặc viết lại lịch sử.
- Không push, mở PR, merge hoặc gửi tin nhắn cho người khác.

Bàn giao:
- Bảng R03/R04/R05/R07/R15: đã sửa, còn phụ thuộc hay chưa kiểm chứng.
- File và commit tương ứng.
- Lệnh kiểm tra, kết quả và giới hạn.
- Phần cần Hưng/Kiệt bàn giao.
- Hướng dẫn review cho Kiệt và git status cuối.
```

Bổ sung trong phiên:

```text
AI_log viết ngôi thứ nhất $humanizer:humanizer
```

## 17. [TV3 · 23/11/2026 · Codex] R14: triển khai màn Admin — kiểm tra tiền đề

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy triển khai các màn Admin còn thiếu trong R14 của bao-cao-doi-chieu-ke-hoach-ma-nguon.md, theo kế hoạch mới đã cập nhật.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

1. Kiểm tra tiền đề

Đọc:
- AGENTS.md và FRONTEND.md.
- ../bao-cao-doi-chieu-ke-hoach-ma-nguon.md.
- ../lo-trinh-PA3.html.
- Kế hoạch TV3, mục 2.5–2.8, 4.1, 5.4–5.6 và 5.9.
- Contract 03/04/05/10 cùng shared objects.
- API thanh toán/nhắc lịch liên quan và hướng dẫn dùng hooks.
- ChatThread, ProposalCard, Layout, RequireRole, useFetch, useForm, AsyncState, FormField và status.js.

Xác nhận contract và mock mới cho đổi/hủy/thay thế đã nằm trên main. Nếu chưa, báo đúng phần thiếu; không viết UI gọi đặc tả cũ hoặc tự sửa mock trong lượt này.

Khi working tree sạch, cập nhật main bằng fast-forward rồi tạo:
feat/tv3-admin-flow

Không ghi đè thay đổi có sẵn, không reset, stash hoặc tự merge nhánh khác.

2. Phạm vi

Được sửa:
- client/src/routes/admin.jsx.
- client/src/pages/admin/.
- Các API wrapper TV3 trong client/src/api/.
- Component phụ trợ Admin và CSS riêng nếu cần.
- Component chat chỉ khi có lỗi tích hợp thực tế; giữ tương thích props Kiệt đang dùng.
- Dòng Routes, quyết định và Not done thuộc TV3 trong FRONTEND.md.
- brief.md, AI-LOG.md và bằng chứng kiểm tra phần TV3.

Không sửa docs/api/, mock/, phần nền của Hưng hoặc trang Customer của Kiệt. Nếu API thiếu dữ liệu, báo chỗ thiếu; không tự thêm field hoặc endpoint.

3. Hoàn thiện bốn route

/admin/conversations:
- Danh sách hội thoại, lọc đủ trạng thái và số lượng.
- Link tới chi tiết, trạng thái có chữ.
- Có loading, error với Thử lại và empty.

/admin/conversations/:id:
- Dùng ChatThread để trả lời.
- Làm mới hội thoại bằng reload của hook, không reload trang.
- Form kiểm tra ngày, ca, người, phòng từ API.
- Hiện lý do trùng bằng chữ, gợi ý có nút dùng giờ.
- Lịch tài nguyên đọc được đầy đủ, không cắt nhãn.
- Gửi đề xuất giờ và cập nhật chat từ response.
- Form tạo booking chỉ dùng proposal khách đã đồng ý; khóa Tạo booking kèm lý do khi chưa đủ điều kiện.
- Sau hủy, vẫn cho đi qua đề xuất mới và tạo booking thay thế theo contract.
- Hiện riêng trạng thái hội thoại và booking.
- Hiện lịch sử booking cũ/mới dựa trên conversationId; không tự thêm endpoint.

/admin/bookings:
- Danh sách và lọc booking.
- Có trạng thái booking, thanh toán và link xem.
- Bố cục dùng được trên điện thoại.

/admin/bookings/:code:
- Thông tin booking, gói, ca, người/phòng, tiền và thanh toán từ API.
- Đổi lịch trực tiếp bằng date/items, không cần proposalId hoặc khách đồng ý lại.
- PATCH là bước kiểm tra trùng cuối cùng. Không chặn lưu sai vì bước xem trước tự tính booking đang sửa là trùng với chính nó.
- Hiện lỗi CLASH và gợi ý; giữ dữ liệu nhập khi thất bại.
- Hủy có xác nhận, chỉ ở trạng thái được phép.
- Sau hủy hiện Đã hủy; tiền cũ còn nguyên, hoàn tiền do studio xử lý ngoài hệ thống.
- Lưu final-link HTTPS.
- GS-1024 chưa được tạo thì hiện thông báo không tìm thấy và link về danh sách.

Không hoàn thành booking bằng việc lưu link; Nhận ảnh vẫn thuộc luồng Customer.

4. Hiển thị tiền theo quyết định mới

Không suy ra “chưa nhận tiền” chỉ từ awaiting_deposit.

Nếu TV2 đã bàn giao R08:
- Hiện đúng trường hợp awaiting_deposit/deposit_paid.
- Phân biệt khoản đã nhận với tình trạng chưa giữ được chỗ.
- Dùng reservationFailure theo contract để giải thích.
- Không mời trả cọc lần nữa và không tự chuyển cọc sang booking thay thế.

Nếu shape chưa được bàn giao, ghi rõ phụ thuộc; không dựng dữ liệu hoặc sửa API để UI chạy được.

5. Quy ước UI

- Mọi dữ liệu nghiệp vụ lấy từ API qua api/client.js.
- Dùng useFetch + AsyncState, useForm + FormField và status.js.
- Sau hành động cập nhật từ response, không reload trang.
- Link điều hướng dùng router Link; hành động dùng button.
- Mỗi trang một h1; label và lỗi field đầy đủ.
- Khóa gửi lặp, giữ dữ liệu khi lỗi.
- Chat/form cuộn theo trang, không nổi hoặc bị cắt.
- Không import fixtures.js hoặc nối nguyên trang StudioPage PA2 vào router.
- Không thêm thư viện, nút demo hoặc thao tác giả.
- Không có link menu dẫn tới placeholder hay Not found.

6. Kiểm tra và ghi nhận

Kiểm tra trên bản build:
- Bốn route mở trực tiếp và F5.
- Chưa đăng nhập quay về đúng route sau sign-in; sai vai trò bị chặn.
- G4 → G5 → G6 và G10 đi được bằng link/nút.
- G6 vẫn cần khách đồng ý; G10 không cần đồng ý lại.
- Đổi trùng, hủy, tạo thay thế và giữ lịch sử.
- normal/slow/error/empty; Thử lại phục hồi khi mock trở về normal.
- 360/768/1280px, không tràn ngang, nút/link đứng riêng tối thiểu 44px.
- Không lỗi Console, request ngoài contract hoặc request lặp khi đứng yên.
- W3C trên HTML render nếu công cụ cho phép.

Không dùng kết quả kiểm tra component riêng hoặc bằng chứng PA2 để kết luận toàn bộ màn PA3 đạt. Build thành công cũng chưa đủ chứng minh luồng đã chạy.

Ghi lệnh, kết quả và kiểm tra chưa thực hiện được.

7. Tài liệu và commit

Trực tiếp ghi:
- brief.md: prompt nguyên văn, nối mục theo đúng cấu trúc có sẵn.
- AI-LOG.md: mục PA#3 đúng mẫu, Request trỏ đúng brief, chỉ ghi việc và kiểm tra có thật.
- FRONTEND.md: Routes khớp router và Not done cụ thể cho TV3. Không sửa tự chấm toàn nhóm hoặc tuyên bố R18 hoàn thành thay TV1.
- Ghi bằng chứng kiểm tra có thể tái lập để bàn giao cho phần harness R17; không tự thêm bộ formatter/linter/CI hoặc dependency của nhóm.

Tôi cho phép commit từng file dưới tên Lê Công Minh Nhựt, giữ email Git hiện tại của tôi. Cấu hình theo từng lệnh; không sửa global config.

Stage từng đường dẫn, kiểm tra diff staged, mỗi commit một file. Không commit thay đổi của người khác, không amend hoặc viết lại lịch sử.

Không push, mở PR, merge hoặc gửi tin nhắn cho người khác.

Khi xong, báo:
- R14 đã hoàn thành những luồng nào, còn thiếu gì.
- File và commit.
- Bằng chứng kiểm tra thực tế.
- Phụ thuộc TV1/TV2.
- Mục brief/AI-LOG đã thêm và git status cuối.
```

## 18. [TV2 · 23/11/2026 · Antigravity Assistant] Contract S2: cập nhật 02, 06, 07, 09 theo quyết định PO và nhóm

Tin nhắn 1 (đọc kế hoạch mới và báo cáo đối chiếu):

```text
Hiện tại nhóm vừa họp lại, và dựa theo những yêu cầu, những câu trả lời của nhóm Product Owner mà sửa lại kế hoạch và time line, đọc kĩ các file và cho biết công việc hiện tại tôi phải làm
```

Tin nhắn 2:

```text
nghĩa là sao, đọc cái báo cáo đối chiếu kế hoạch mã nguồn nó bảo lỗi gì hay sao
```

Tin nhắn 3 (sau khi tự kéo `main`, cài `npm ci` và tạo nhánh `contract/tv2-po-updates`):

```text
Giờ hãy đưa ra lệnh để tôi tự chạy terminal đi
```
*(Đã chạy thành công trên nhánh `contract/tv2-po-updates` và gửi kết quả terminal để assistant triển khai cập nhật 4 file contract `S2`).*

## 19. [TV2 · 23/11/2026 · Antigravity Assistant] Mock S2: cập nhật extras, payments và lib/reminders theo PO và kế hoạch mới

Tin nhắn 1:

```text
Triền khai phần mock theo đúng yêu cầu đề và kế hoạch mà nhóm đã đưa ra, tự chạy lệnh kiểm tra kĩ lại và đối chiếu lại xem mock có bị lệch hay thiếu hay dư so với yêu cầu PA3 và kế hoạch nhóm hay không
```

## 20. [TV1 · 23/11/2026 · Antigravity Assistant] G8: Màn Staff (`/staff/jobs`, `/staff/jobs/:id`) và upload ảnh preview

```text
Bối cảnh: GradStudio PA#3, front end React 19 + Vite 7 trong `client/`. Nhánh làm việc `feat/g8-staff` (tách từ sau Bước #S1 đã có `JOB_STATUS` mới, chặn việc sau hủy 409, và giới hạn upload 5 MiB = 5.242.880 byte). Trước khi viết code, đọc kỹ `AGENTS.md`, `docs/api/08-jobs.md`, `docs/api/05-bookings.md` (GET `/api/bookings/:code`), `docs/api/09-gallery.md` (GET `/api/bookings/:code/photos`) và mục 5.5 (G8) trong `ke-hoach/TV1-nen-tang-staff-superadmin.md`.

Ràng buộc bắt buộc:
1. Chỉ gọi đúng 6 endpoint đã có trong contract thông qua `client/src/api/client.js` (relative `/api/...`):
   - `GET /api/jobs` (có query tùy chọn `?status=todo|in_progress|done`)
   - `GET /api/jobs/:id`
   - `PATCH /api/jobs/:id`
   - `POST /api/bookings/:code/previews` (`multipart/form-data`, field `file`)
   - `GET /api/bookings/:code` (để đọc `booking.status` kiểm tra booking Đã hủy theo R06)
   - `GET /api/bookings/:code/photos` (hiển thị lưới ảnh preview đã có)
   KHÔNG sửa `docs/api/`, `mock/`, `tools/`, hay file của TV2/TV3. Không thêm thư viện mới; dùng CSS thuần theo design tokens Blue Theme trong `client/src/styles/`.
2. Tái sử dụng toàn bộ nền đã có: `Layout`, `RequireRole` (`roles={['staff']}`), `useFetch`, `AsyncState`, `useForm`, `FormField`, `StatusBadge`, `JOB_STATUS`, `JOB_KIND`, `BOOKING_STATUS`, `formatDate`. Không hard-code dữ liệu nghiệp vụ, không import `src/data/fixtures.js`.
3. Tuân thủ accessibility & responsive: mỗi màn đúng một `<h1>`, heading không nhảy cấp, mọi ô nhập có `<label>`, điều hướng dùng `<Link>`, hành động dùng `<button>`, không cuộn ngang ở 360 / 768 / 1280 px, nút/link đứng riêng cao ≥ 44px ở 360px, trạng thái luôn hiển thị bằng chữ (không chỉ màu).
4. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu chi tiết (Bước G8 — Staff):
1. `client/src/api/jobs.js`:
   - `updateJob(id, { status, note })` gọi `PATCH /api/jobs/:id`.
   - `uploadBookingPreview(bookingCode, file)` tạo `FormData` gắn field `file` và gọi `POST /api/bookings/:code/previews` (không tự set `Content-Type`).
2. `client/src/pages/staff/StaffJobsPage.jsx` (`/staff/jobs`):
   - `<h1>Việc của tôi</h1>`, có bộ lọc trạng thái (`Tất cả`, `Chưa bắt đầu`, `Đang làm`, `Hoàn thành` — đồng bộ query `?status=` gọi `GET /api/jobs` hoặc `GET /api/jobs?status=...`).
   - Nhóm danh sách việc theo ngày chụp (`formatDate(job.date)`), riêng các việc `edit` (`date: null`) đặt ở nhóm riêng (ví dụ `"Chỉnh ảnh (chưa gắn ngày)"`) ở cuối giống thứ tự API.
   - Mỗi thẻ/mục việc hiển thị rõ: loại việc (`JOB_KIND`), khung giờ (`start–end` nếu có), phòng (`room?.name` nếu có), khách hàng (`customer.name`), mã booking (`bookingCode`), tên gói (`packageName`), số ảnh preview (`previewCount`), trạng thái bằng `StatusBadge` với `JOB_STATUS` (**Chưa bắt đầu / Đang làm / Hoàn thành**), và `<Link>` **"Xem việc"** tới `/staff/jobs/:id`.
   - Dùng `AsyncState` cho loading, lỗi kèm nút **Thử lại**, và trạng thái rỗng: `"Bạn chưa có việc nào được giao."` (khi lọc rỗng báo rõ không có việc ở trạng thái đó).
3. `client/src/pages/staff/StaffJobDetailPage.jsx` (`/staff/jobs/:id`):
   - Link quay lại `/staff/jobs`. Tải `GET /api/jobs/:id` bằng `useFetch`.
   - Nếu API trả `404` (việc không tồn tại hoặc của nhân viên khác): hiện rõ `"Không tìm thấy việc này, hoặc việc không được giao cho bạn."` kèm link về `/staff/jobs` (không hiện màn trắng).
   - Khi có `job`:
     - `<h1>` dạng `"{Loại việc} · {bookingCode}"` (ví dụ `"Chụp ảnh · GS-1024"`).
     - Gọi `GET /api/bookings/:code` để đọc trạng thái booking; gọi `GET /api/bookings/:code/photos` (khi `job.kind === 'shoot' || job.kind === 'edit'`) để hiển thị ảnh xem trước hiện có.
     - Khối chi tiết: khi nào (ngày, giờ hoặc chỉnh ảnh sau chọn), ở đâu (phòng hoặc chưa xếp phòng), làm gì (loại việc, gói dịch vụ), với ai (khách hàng, mã booking), trạng thái hiện tại của việc và của booking.
     - **Chặn thao tác khi booking Đã hủy (R06):** nếu `booking?.status === 'cancelled'`, giữ nguyên thông tin lịch sử việc, hiển thị thông báo nổi bật **"Booking Đã hủy"** kèm lý do lịch sử chỉ đọc, và khóa toàn bộ form cập nhật trạng thái và form upload preview.
     - **Form Cập nhật trạng thái** (dùng `useForm` + `FormField`): `<select>` có `<label>` với đúng 3 lựa chọn `todo` (*Chưa bắt đầu*), `in_progress` (*Đang làm*), `done` (*Hoàn thành*), và `<textarea>` ghi chú (≤ 500 ký tự). Gửi `PATCH /api/jobs/:id`, cập nhật trực tiếp từ response `res.job` (không reload trang), hiển thị `<p role="status">Đã cập nhật công việc</p>`, hiển thị lỗi 400 theo field hoặc 409 bằng `role="alert"`.
     - **Form Thêm ảnh preview** (CHỈ hiển thị khi `job.kind === 'shoot' || job.kind === 'edit'`; ẩn hoàn toàn với việc `makeup`):
       + `<input type="file" accept="image/jpeg,image/png">` có `<label>` rõ ràng, dòng hướng dẫn `"Chỉ nhận ảnh JPEG hoặc PNG, tối đa 5 MiB (5.242.880 byte)."`
       + Kiểm tra **trước khi gửi**: bắt buộc chọn file (`"Vui lòng chọn ảnh"`), đúng loại `image/jpeg` hoặc `image/png` (`"Chỉ nhận ảnh JPEG hoặc PNG"`), đúng ngưỡng `file.size <= 5242880` (`"Ảnh tối đa 5 MiB"`). Lỗi hiển thị ngay cạnh ô nhập (`aria-describedby`, `aria-invalid`).
       + Nếu API trả 400 (`err.fields.file`) hoặc 409 (booking đã hủy), hiển thị đúng lỗi; khóa nút trong khi đang tải lên.
       + Upload thành công (`201`): hiển thị `<p role="status">Đã có {totalPhotos} ảnh trong booking</p>`, cập nhật `previewCount` trên `job` và tải lại `GET /api/bookings/:code/photos` để hiện lưới ảnh thu nhỏ (mỗi `<img>` có `alt` từ `photo.alt`).
4. `client/src/routes/staff.jsx`: thay `StaffHomePlaceholder` bằng `StaffJobsPage` (`/staff/jobs`) và thêm route `/staff/jobs/:id` (`StaffJobDetailPage`), cả hai bọc trong `<RequireRole roles={['staff']}>`.
5. Kiểm tra sau khi viết xong:
   - `cd client && npm run build` và `git diff --check` (0 lỗi), xác nhận `git diff -- docs/api mock` trống hoàn toàn.
   - Kiểm tra thực tế trên `vite preview` + mock ở cả 4 chế độ (`normal`, `slow`, `error`, `empty`) với tài khoản `tuan@gradstudio.test` (`J-GS-1022-shoot`, `J-GS-1022-edit`, mở thử việc của `mai` nhận thông báo 404) và `mai@gradstudio.test` (`J-GS-1021-makeup` không hiện form upload), mở trực tiếp `/staff/jobs/J-GS-1022-shoot` và F5.
```

## 21. [TV1 · 23/11/2026 · Antigravity Assistant] G11: Màn Superadmin (`/superadmin/admins`, `/superadmin/settings`, khóa/mở khóa Admin)

```text
Bối cảnh: GradStudio PA#3, front end React 19 + Vite 7 trong `client/`. Nhánh làm việc `feat/g11-superadmin`. Contract và mock cho G11 đã hoàn thiện trên `main` (đã có `PATCH /api/admins/:id` từ Bước #S1). Trước khi viết code, đọc kỹ `AGENTS.md`, `docs/api/12-admins.md`, `docs/api/13-settings.md`, `docs/api/01-auth.md` và mục 5.2, 5.5 (G11), 5.10 (R01) trong `ke-hoach/TV1-nen-tang-staff-superadmin.md`.

Ràng buộc bắt buộc:
1. Chỉ gọi đúng 5 endpoint trong contract thông qua `client/src/api/client.js` (relative `/api/...`):
   - `GET /api/admins`
   - `POST /api/admins`
   - `PATCH /api/admins/:id` (body `{"active": boolean}`)
   - `GET /api/settings`
   - `PUT /api/settings`
   KHÔNG sửa `docs/api/`, `mock/`, `tools/`, hay file của TV2/TV3. Không thêm thư viện mới; dùng CSS thuần theo design tokens Blue Theme trong `client/src/styles/`.
2. Tái sử dụng toàn bộ nền đã có: `Layout`, `RequireRole` (`roles={['superadmin']}`), `useFetch`, `AsyncState`, `useForm`, `FormField`, `StatusBadge`. Không hard-code dữ liệu nghiệp vụ, không import `src/data/fixtures.js`.
3. Tuân thủ accessibility & responsive: mỗi màn đúng một `<h1>`, heading không nhảy cấp, mọi input có `<label>`, bảng có `<caption>` và `<th scope="col">`, điều hướng dùng `<Link>`, hành động dùng `<button>`, không cuộn ngang ở 360 / 768 / 1280 px, nút/link đứng riêng cao ≥ 44px ở 360px, trạng thái luôn hiển thị bằng chữ.
4. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu chi tiết (Bước G11 — Superadmin):
1. `client/src/api/superadmin.js`:
   - `createAdmin({ name, email, password })` gọi `POST /api/admins`.
   - `setAdminActive(id, active)` gọi `PATCH /api/admins/:id` với `{ active }`.
   - `saveSettings(settings)` gọi `PUT /api/settings`.
2. `client/src/pages/superadmin/SuperadminAdminsPage.jsx` (`/superadmin/admins`):
   - `<h1>Tài khoản Admin</h1>`.
   - Tải danh sách bằng `useFetch('/api/admins')` + `AsyncState` (`emptyMessage="Chưa có tài khoản Admin nào."`).
   - Bảng danh sách `<table>` có `<caption>Danh sách tài khoản Admin</caption>` và `<th scope="col">` (Họ tên, E-mail, Ngày tạo, Trạng thái, Thao tác). Ở màn hình nhỏ (≤ 767px / 360px), dùng CSS chuyển bảng sang dạng thẻ (mỗi hàng thành card có nhãn `data-label`) để **không cuộn ngang**.
   - Mỗi dòng hiển thị trạng thái bằng chữ (`Đang hoạt động` / `Đã khóa` qua `StatusBadge`) và nút **Khóa** (khi `active === true`) hoặc **Mở khóa** (khi `active === false`) gọi `PATCH /api/admins/:id`. Khóa nút riêng của dòng đang xử lý, cập nhật trực tiếp dòng đó từ response `{ admin }` (không reload toàn danh sách), báo `<p role="status">` hoặc `role="alert"` nếu lỗi. **Không** thêm sửa thông tin hoặc xóa Admin.
   - Form **Tạo Admin** (`useForm` + `FormField`): gồm `Họ tên` (`name`: trim 2–80 ký tự), `E-mail` (`email`: đúng định dạng, ≤ 120 ký tự), `Mật khẩu` (`password`: 8–100 ký tự).
   - Khi submit thành công (`201`): thêm ngay `res.admin` vào cuối bảng (qua `setData`), xóa trắng form (`reset`) và hiện `<p role="status">Đã tạo tài khoản Admin mới</p>`. Khi API trả `409 EMAIL_TAKEN` có `err.fields` (hoặc `400`), gắn thông báo lỗi ngay dưới ô **E-mail** qua `setServerErrors(err.fields)` và giữ nguyên giá trị đã nhập.
3. `client/src/pages/superadmin/SuperadminSettingsPage.jsx` (`/superadmin/settings`):
   - `<h1>Cài đặt hệ thống</h1>`.
   - Tải `GET /api/settings` bằng `useFetch` + `AsyncState`.
   - Form chỉnh sửa đồng bộ giá trị từ API khi tải xong (`useForm` + `FormField`):
     + 2 ô `<input type="time">` có `<label>`: **Giờ mở cửa** (`open`, định dạng `HH:mm`) và **Giờ đóng cửa** (`close`, phải sau giờ mở cửa).
     + 1 ô `<input type="number" min={1} max={168} step={1}>` có `<label>`: **Gửi nhắc lịch trước (giờ)** (`reminderHoursBefore`, số nguyên từ `1` đến `168`, mặc định `24`), kèm ghi chú rõ nhắc lịch gửi qua cả e-mail và tài khoản.
   - Validate trước khi gửi đúng theo `13-settings.md` và map chính xác lỗi `400` từ API (`openingHours.open`, `openingHours.close`, `reminderHoursBefore`) vào đúng `FormField`.
   - Lưu thành công (`200`): cập nhật state từ `res.settings` và hiện đúng `<p role="status">Đã lưu cài đặt</p>`.
4. `client/src/styles/superadmin.css`: CSS thuần dùng design tokens Blue Theme cho bảng→thẻ 360px, form tạo Admin và form cài đặt.
5. `client/src/routes/superadmin.jsx`: thay `SuperadminHomePlaceholder` bằng `SuperadminAdminsPage` (`/superadmin/admins`) và đăng ký `/superadmin/settings` (`SuperadminSettingsPage`), cả hai bọc trong `<RequireRole roles={['superadmin']}>`.
6. Kiểm tra sau khi viết xong:
   - `cd client && npm run build`, `git diff -- docs/api mock` trống, `git diff --check` 0 lỗi.
   - Kiểm tra trực tiếp trên `vite preview` + `node mock/server.mjs` cả 4 chế độ (`normal`, `slow`, `error`, `empty`), responsive 360 / 768 / 1280 px (0 cuộn ngang, tap target ≥ 44px, 0 lỗi Console):
     + Đăng nhập `superadmin@gradstudio.test` mở `/superadmin/admins` và `/superadmin/settings` (F5 + mở trực tiếp).
     + Test luồng **R01**: tạo Admin mới → thử tạo trùng email (`409` hiện dưới ô E-mail) → bấm **Khóa** → đăng xuất → thử đăng nhập bằng Admin vừa khóa (bị từ chối `403 "Tài khoản đã bị khóa"`) → đăng nhập lại Superadmin → bấm **Mở khóa** → đăng xuất → đăng nhập lại bằng Admin mới (thành công `200`).
     + Test `/superadmin/settings`: thử sai giờ đóng/mở và `0`/`169`/`24.5` giờ (báo lỗi tại field), lưu hợp lệ `07:30–21:00` và `48` giờ (hiện `"Đã lưu cài đặt"`, F5 vẫn còn giá trị mới).
```

## 22. [TV2 · 23/11/2026 · Antigravity Assistant] Front end #14b: G1 (Trang chủ, Chi tiết gói) và G3 + G6 phía khách (/chat)

Tin nhắn 1:

```text
vậy làm tiếp đi
```
*(Tiếp nối sau khi đối chiếu ảnh lộ trình `#14b` ngày 23/11: triển khai G1 nối API và G3/G6 phía khách dùng `ChatThread` & `ProposalCard` trên nhánh `feat/g1-g3-customer`.)*

## 23. [TV1 · 24/11/2026 · Antigravity Assistant] Bước #S4: kiểm tra tích hợp hợp nhất trên `main` (`735807d`)

```text
Bối cảnh: GradStudio PA#3, sau khi cả 3 nhánh cập nhật theo kế hoạch 23/11 (#S1 TV1, #S2 TV2, #S3 TV3) cùng các màn G1, G2, G3, G8, G11 đã merge vào `main` (`735807d`). Thực hiện Bước `#S4` (kiểm tra tích hợp hợp nhất trên `main` mới nhất ngày 24/11/2026).

Ràng buộc bắt buộc:
1. Đây là phiên kiểm tra & nghiệm thu tích hợp: KHÔNG tự ý sửa `docs/api/`, `mock/`, `client/` hay `tools/`. Nếu phát hiện lỗi/FAIL, báo cáo nguyên văn kèm file, endpoint và người phụ trách (TV1/TV2/TV3) để nhóm xử lý đúng quy trình.
2. Không bịa kết quả, không bỏ qua ca lỗi; dọn sạch mọi tiến trình nền (`mock`, `vite preview`, Chrome) sau khi chạy xong.
3. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu kiểm tra chi tiết (Bước #S4 — TV1 chủ trì):
1. Đồng bộ `main` local: `git switch main && git pull origin main` (xác nhận working tree sạch).
2. Kiểm tra hợp đồng toàn bộ (`contract-check`): khởi động `node mock/server.mjs` mới và chạy `node tools/contract-check.mjs --base http://localhost:3001` trên toàn bộ 14 file (`01`–`13`). Ghi nhận chính xác số ví dụ PASS/FAIL và số endpoint đã phủ.
3. Chạy bộ kiểm tra hồi quy nghiệp vụ `node --test tools/tv3-booking-rules.test.mjs` để xác nhận trạng thái PASS/FAIL/TODO sau khi cả TV1, TV2, TV3 đã merge.
4. Nghiệm thu tích hợp **R05 + R06** (phần trước đây của G8 còn chờ TV3 hoàn thành hủy booking có jobs):
   - Chạy `cd client && npm run build` để kiểm tra bản build hợp nhất (G1 + G2 + G3 + G8 + G11).
   - Chạy `npx vite preview --port 4173` cùng `node mock/server.mjs` (`MOCK_MODE=normal`) mới:
     + Admin (`thao`) gọi `POST /api/bookings/GS-1022/cancel` hủy booking đã có việc (`200`).
     + Mở trực tiếp `/staff/jobs/J-GS-1022-shoot` bằng tài khoản `tuan` trên Chrome headless CDP: xác nhận lịch sử việc vẫn đọc được (`GET /api/jobs`, `GET /api/jobs/J-GS-1022-shoot` → `200`), giao diện hiện banner **"Booking Đã hủy"**, cả 2 form (cập nhật trạng thái và thêm ảnh preview) đều bị khóa (`disabled`).
     + Gọi trực tiếp `PATCH /api/jobs/J-GS-1022-shoot` và `POST /api/bookings/GS-1022/previews` sau khi hủy: xác nhận API trả `409 CONFLICT` và dữ liệu không đổi.
5. Kiểm tra nhanh các route đang chạy trên `main` (`/`, `/packages/pkg-tn-premium`, `/sign-in`, `/chat`, `/staff/jobs`, `/superadmin/admins`, `/superadmin/settings`) không có lỗi runtime Console khi tải.
6. Tổng hợp báo cáo kết quả `#S4` rõ ràng (kèm danh sách FAIL/TODO nếu có và tin nhắn ngắn gọn để TV1 gửi vào group chat báo TV2/TV3, đồng thời ghi nhận đề xuất chốt ngắn gọn cho TV3 về quy tắc ánh xạ `jobs` khi đổi lịch).
```

## 24. [TV1 · 24/11/2026 · Antigravity Assistant] R17: Verification Gates, GitHub Actions CI và `HARNESS.md`

```text
Bối cảnh: GradStudio PA#3, tách nhánh `chore/r17-ci-and-harness` từ `main` mới nhất. Thực hiện mục `R17` trong báo cáo đối chiếu và mục 4.1 kế hoạch 23/11 (chuẩn bị bộ Verification Gates tự động, GitHub Actions CI và hồ sơ `HARNESS.md` từ dữ liệu lịch sử thật để phục vụ PA#3 và tích lũy bằng chứng nhiều mốc cho PA#5).

Ràng buộc bắt buộc:
1. KHÔNG thêm bất kỳ dependency nào vào `client/package.json` hay `client/package-lock.json` (chỉ dùng Node built-in `node:test`, `node --check` và các lệnh có sẵn để không gây xung đột với PR G7/G9 của TV2 và G4–G6/G10 của TV3).
2. KHÔNG sửa `docs/api/`, `mock/`, `client/src/` hay `tools/tv3-booking-rules.test.mjs`. Không viết lại, chỉnh sửa hay dựng lại lịch sử commit/log cũ.
3. Mọi mốc thời gian, commit hash và kết quả kiểm tra ghi trong `HARNESS.md` phải đối chiếu trực tiếp từ `git log` và output chạy thật trong phiên này.
4. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu chi tiết (R17 — Phương án A):
1. `tools/tv1-rules.test.mjs` (Node built-in `node:test`, không phụ thuộc thư viện ngoài):
   - Viết bộ kiểm tra hồi quy cho các quy tắc TV1 đã chốt ở `#S1`:
     + `R01`: `PATCH /api/admins/:id` khóa/mở khóa Admin, từ chối đăng nhập tài khoản bị khóa (`403`), từ chối token cũ của tài khoản bị khóa (`401`), chặn field lạ (`400`) và user không phải Admin (`404`).
     + `R06`: booking `cancelled` vẫn đọc được `GET /api/jobs` và `GET /api/jobs/:id` (`200`), chặn `PATCH /api/jobs/:id` và `POST /api/bookings/:code/previews` bằng `409 CONFLICT` không làm đổi dữ liệu, giữ `404` với nhân viên khác.
     + `R11`: upload đúng `5 242 880` byte (5 MiB) nhận `201`, vượt đúng 1 byte (`5 242 881` byte) trả `400` (`fields.file = "Ảnh tối đa 5 MiB"`) cho cả boundary/tên file ngắn và dài.
   - Không sửa file JSON seed trên đĩa; dùng bản sao dữ liệu trong bộ nhớ hoặc mock trên cổng tạm (ephemeral port) và đóng tiến trình sạch sau khi chạy.
2. `.github/workflows/ci.yml` (GitHub Actions CI):
   - Kích hoạt trên `push` tới `main` và mọi `pull_request` vào `main`.
   - Dùng Node 20, chạy các gate rõ ràng, tái lập được ở máy local:
     + **Gate 1 (Syntax & JSON):** `node --check` cho mọi file `mock/**/*.mjs` và `tools/*.mjs`; kiểm tra parse hợp lệ cho mọi `mock/data/*.json`.
     + **Gate 2 (Contract check):** khởi động `node mock/server.mjs` trên cổng tạm và chạy `node tools/contract-check.mjs` (yêu cầu 0 FAIL, 40/40 endpoints).
     + **Gate 3 (Regression tests):** chạy `node --test tools/tv1-rules.test.mjs tools/tv3-booking-rules.test.mjs`.
     + **Gate 4 (Client build):** `cd client && npm ci && npm run build`.
     + **Gate 5 (Repo hygiene):** kiểm tra không còn conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) trong source/docs.
3. `HARNESS.md` (tại gốc repo):
   - Trình bày ngắn gọn, có bằng chứng:
     + **Mục tiêu & cấu trúc Harness:** cách repo dùng `AGENTS.md`, `brief.md`, `AI-LOG.md`, `docs/api/`, `tools/` và CI làm vòng kiểm chứng.
     + **Timeline phát triển `AGENTS.md` (Rules):** bảng trích trực tiếp từ `git log --date=short -- AGENTS.md` (commit thật, ngày, tác giả, thay đổi và lý do thực tế).
     + **Danh sách Verification Gates:** bảng ánh xạ từng gate (lệnh chạy local = lệnh trong `.github/workflows/ci.yml`, điều kiện fail, phạm vi kiểm tra).
     + **Phần chưa bật & kế hoạch chuyển tiếp PA#4/PA#5:** ghi rõ linter/formatter (`eslint`/`prettier`) chưa thêm trong PA#3 để tránh xung đột nhánh cuối kỳ và sẽ chốt với cả nhóm ở mốc tiếp theo; sang PA#4 áp dụng test đỏ trước code xanh cho R1–R9/S1–S5.
4. `AGENTS.md`: bổ sung 1 dòng tham chiếu tới `tools/tv1-rules.test.mjs`, `.github/workflows/ci.yml` và `HARNESS.md` trong mục *Verification gate* (sẽ tách commit riêng `docs(agents): …`).
5. Kiểm tra thực tế trước khi kết thúc:
   - Chạy lần lượt toàn bộ lệnh giống hệt trong `.github/workflows/ci.yml` trên máy local (Gate 1 → Gate 5) và ghi nguyên văn kết quả vào `AI-LOG.md`.
   - Xác nhận `git diff -- docs/api mock client` trống hoàn toàn và `git diff --check` 0 lỗi.
```

## 25. [TV3 · 24/11/2026 · Codex] R14: triển khai Admin G4/G5/G6 (tiếp mục 17)

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy tiếp tục triển khai giao diện Admin R14, ưu tiên hoàn thành G4/G5/G6 trong ngày 24/11/2026 theo kế hoạch M4.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

1. Đọc lại trạng thái hiện tại

Đọc:
- AGENTS.md.
- FRONTEND.md, đặc biệt phần trạng thái R14 sau PR #18.
- ../bao-cao-doi-chieu-ke-hoach-ma-nguon.md.
- ../ke-hoach/ke-hoach/TV3-chat-booking-admin.md:
  mục 2.5–2.8, 4.1, 5.3–5.5 và 5.9.
- ../lo-trinh-PA3.html.
- docs/api/README.md và contract 03/04/05/10.
- ChatThread.jsx, ProposalCard.jsx.
- api/client.js, useFetch, useForm, AsyncState, FormField,
  Layout, RequireRole và constants/status.js.
- brief.md mục 16 và mục AI-LOG tương ứng.

PR #18 đã được merge vào main tại deb7884 và được tích hợp vào nhánh feat/tv3-admin-flow. Hãy kiểm tra lại bằng Git và source hiện tại.

Không dùng kết luận “contract/mock chưa merge” trong nhật ký cũ để dừng công việc nếu tiền đề đó đã được giải quyết.

Những phần còn chờ:
- R08/reservationFailure và helper/schema reminders của Kiệt.
- Quy tắc ánh xạ jobs cho nhiều ca cùng loại hoặc thêm/bớt loại ca của Hưng.

Các phần này không chặn việc triển khai danh sách hội thoại, chat, kiểm tra lịch, đề xuất giờ và tạo booking theo contract hiện có. Hoàn thành các phần độc lập, ghi rõ giới hạn còn lại.

2. Git và phạm vi

Kiểm tra working tree, branch, remote và lịch sử commit.

Nếu đang ở feat/tv3-admin-flow, tiếp tục nhánh này sau khi kiểm tra. Không tạo lại nhánh, reset, xóa hoặc ghi đè thay đổi có sẵn. Fetch origin để đối chiếu khi có thể; không tự merge nhánh khác hoặc viết lại lịch sử.

Được tạo/sửa:
- client/src/routes/admin.jsx.
- client/src/pages/admin/.
- API wrapper của TV3 trong client/src/api/.
- Component phụ trợ Admin và CSS riêng.
- ChatThread/ProposalCard chỉ khi có lỗi tích hợp thực tế;
  giữ tương thích props Kiệt đang dùng.
- Các dòng Routes và Not done thuộc TV3 trong FRONTEND.md.
- brief.md, AI-LOG.md.
- Kiểm tra và bằng chứng có thể chạy lại cho phần vừa làm.

Không sửa docs/api/, mock/, tools/contract-check.mjs,
phần nền của Hưng hoặc trang Customer của Kiệt.

Không thêm dependency. Nếu API thiếu dữ liệu cần thiết,
báo rõ endpoint/field thiếu; không tự sửa API hoặc dựng dữ liệu.

3. G4: danh sách hội thoại

Thay placeholder /admin/conversations bằng trang thật:
- Dùng Layout và RequireRole roles=['admin'].
- Tải GET /api/conversations bằng useFetch.
- Lọc Tất cả, Chưa trả lời, Đang tư vấn, Đã chốt lịch,
  Hoàn thành; nút có aria-pressed.
- Số lượng phải lấy từ dữ liệu, không viết cứng.
- Mỗi hội thoại có tên khách, chủ đề, tin cuối, thời gian,
  trạng thái có chữ và Link tới trang chi tiết.
- Có loading, error kèm Thử lại và thông báo danh sách rỗng.

4. G4: chi tiết và trả lời

Đăng ký /admin/conversations/:id:
- Tải chi tiết theo params, không phụ thuộc việc đã bấm
  từ trang danh sách.
- Dùng ChatThread có sẵn.
- Gửi tin qua endpoint messages đúng contract.
- Cập nhật messages và summary từ response.
- onSend phải reject khi lỗi để ChatThread giữ nội dung.
- Có nút Làm mới hội thoại dùng reload của hook để thấy
  khách đã trả lời proposal; không reload cả trang.
- Có thông báo 404 và link về danh sách.
- Không mô phỏng khách trả lời hoặc tự chuyển trạng thái.

5. G5: kiểm tra và đề xuất giờ

Trong trang chi tiết hội thoại:
- Tải nhân sự/phòng từ GET /api/resources.
- Tải lịch ngày từ GET /api/schedule?date=...
- Form gồm ngày, từng ca makeup/chụp, giờ bắt đầu/kết thúc,
  nhân sự, phòng và ghi chú.
- Dùng useForm và FormField.
- Kiểm tra theo contract; không chặn ngày quá khứ.
- Nút Kiểm tra trùng lịch gọi POST /api/availability/check.
- Hiện lý do trùng bằng chữ và suggestions từ response.
- Mỗi suggestion có nút Dùng giờ này để điền form.
- Hiện lịch tài nguyên bằng danh sách/bảng có chữ đầy đủ,
  không cắt nhãn hoặc chỉ thể hiện bằng màu.
- Nút Đề xuất giờ này cho khách gọi endpoint proposals.
- Thành công thì đề xuất hiện trong chat từ dữ liệu API.
- Lỗi 400 hiện đúng field; 409 CLASH hiện lý do/gợi ý,
  giữ dữ liệu nhập.

Không tự tính lịch trống trên client hoặc thêm ignoreBooking
vào request body.

6. G6 phía Admin: tạo booking

Thêm phần Booking mới:
- Khách lấy từ hội thoại.
- Gói và extras lấy từ API.
- Ngày/giờ/người/phòng lấy từ proposal đã được khách đồng ý.
- Giá hiển thị trước lấy từ gói; cọc 30% làm tròn tới VND nguyên.
- Extras không cộng phụ phí; không có sửa giá/giảm giá.
- Số tiền chính thức sau tạo lấy từ response booking.

Nút có đúng tên Tạo booking:
- Khi chưa có proposal hợp lệ được đồng ý, disabled và có
  lý do bên cạnh, liên kết bằng aria-describedby.
- Khi đang gửi, không gửi được lần hai.
- Thành công hiện mã, Chờ cọc 30%, giá/cọc/còn lại từ API.
- Không nói lịch đã được giữ khi mới tạo booking.

Với hội thoại đã có booking:
- Booking chưa hủy: hiện thông tin và điều hướng phù hợp,
  không cho tạo thêm.
- Booking đã hủy: cho đề xuất mới, khách đồng ý và tạo
  booking thay thế theo contract.
- Hiện riêng trạng thái hội thoại và booking.
- Giữ lịch sử cả booking cũ và mới theo conversationId.
- Không tái dùng proposal cũ hoặc chuyển tiền sang mã mới.

Không tạo Link dẫn tới route chưa triển khai. Nếu cần mở
chi tiết booking ngay sau tạo, triển khai route đích thật
trong phạm vi Admin hoặc hiển thị kết quả tại chỗ và ghi
phần điều hướng còn thiếu vào Not done.

7. Phân biệt phần đang làm và phần còn chờ

G6 tạo booking mới vẫn cần khách đồng ý.
G10 đổi lịch dùng date/items trực tiếp, không cần đồng ý lại.

Lượt này ưu tiên G4/G5/G6. Không đánh dấu toàn bộ R14 hoặc G10
hoàn thành nếu mới làm ba bước này.

Không tự triển khai reservationFailure trước contract TV2.
Không lấy awaiting_deposit để suy ra chắc chắn chưa nhận tiền.
Không thêm helper reminders giả hoặc sửa mock để UI chạy.

8. Kiểm tra

Chạy build và kiểm tra trực tiếp trên bản build:
- Danh sách và chi tiết hội thoại mở thẳng/F5 được.
- Chưa đăng nhập chuyển sign-in, sau đăng nhập quay lại đúng route.
- Vai trò khác bị chặn.
- Gửi tin thành công/lỗi, giữ nội dung khi lỗi, chặn gửi lặp.
- Kiểm tra 09:00 có lý do Mai bận 08:00–12:00.
- Dùng gợi ý, gửi proposal, khách đồng ý qua API thật hoặc
  màn Customer nếu đã có, rồi Admin làm mới và tạo booking.
- Nút Tạo booking khóa đúng lúc và mở đúng lúc.
- Booking mới đúng trạng thái và số tiền.
- normal/slow/error/empty; Thử lại phục hồi khi mock về normal.
- 360/768/1280px không tràn ngang; nút/link đứng riêng >=44px.
- Không lỗi Console, request lặp khi đứng yên hoặc endpoint
  ngoài contract.

Dữ liệu chuẩn bị cho kiểm tra phải tách khỏi sản phẩm.
Không thêm nút demo hoặc fixture vào component.

Ghi rõ bước nào kiểm qua HTTP, bước nào kiểm qua UI.
Nếu Customer UI chưa có, không tuyên bố đã đi hết luồng
nhiều vai trò bằng giao diện.

Không lấy build thành công hoặc kết quả component cũ
làm bằng chứng các trang mới đã đạt.

9. Tài liệu và commit

Trước khi sửa, nối prompt này nguyên văn vào brief.md theo
đúng cấu trúc hiện có, số mục tiếp theo, TV3, ngày thực tế
và tên công cụ. Đây là lượt tiếp tục mục 16; dẫn lại mục đó
nhưng không sửa nội dung lịch sử.

Thêm mục AI-LOG PA#3 đúng cấu trúc hiện có:
Tool, Request, Changed, Rejected / lỗi phát hiện, Checked,
Commits và các trường bổ sung theo mẫu khi cần.
Chỉ ghi sự việc, kiểm tra và commit thật.

FRONTEND:
- Routes phải khớp router thực tế.
- Not done ghi rõ G10, R04/R08 và giới hạn còn lại.
- Không xóa các giới hạn chỉ vì đã build được.

Tôi cho phép git add và git commit từng file trong task này:
- Author và committer: Lê Công Minh Nhựt.
- Email: lecongminhnhut6533@gmail.com.
- Cấu hình theo từng lệnh, không sửa global config.
- Mỗi commit một file, stage bằng đường dẫn cụ thể.
- Đọc diff staged trước commit.
- Commit brief trước triển khai, AI-LOG cuối.
- Không commit thay đổi có sẵn của người khác.
- Không amend, reset hoặc viết lại lịch sử.

Không push, mở PR, merge hoặc gửi tin nhắn cho người khác.

Khi xong, báo:
- G4/G5/G6 đã chạy được gì và phần còn thiếu.
- Các file và commit.
- Kiểm tra đã chạy, kết quả và giới hạn.
- Phụ thuộc cần Hưng/Kiệt bàn giao.
- Số mục brief/AI-LOG và git status cuối.
```

## 26. [TV3 · 24/11/2026 · Codex] Tích hợp R04/R05 và nghiệm thu G4/G5/G6

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy hoàn tất phần việc còn lại ngày 24/11/2026: tích hợp reminders R04/R05 và bổ sung nghiệm thu G4/G5/G6.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

Không triển khai lại các màn đã có. Chưa mở rộng sang G10 trong task này.

1. Kiểm tra trạng thái mới

Đọc:
- AGENTS.md.
- Kế hoạch TV3 mục 2.5–2.8, 4.1 và 5.9.
- Báo cáo đối chiếu, phần R04/R05/R14.
- docs/api/07-reminders.md và 10-admin-bookings.md.
- mock/lib/reminders.mjs.
- mock/routes/admin-bookings.mjs.
- tools/tv3-booking-rules.test.mjs.
- tools/tv3-admin-build-check.mjs.
- Các trang Admin, trang CustomerChatPage và nhật ký gần nhất.

Source hiện có:
- recalculateBookingReminders(db, booking).
- stopBookingReminders(db, bookingCode).
- reservationFailure trong contract/mock payments.
- Màn /chat của Customer.

Không tiếp tục coi các phần trên là chưa được TV2 bàn giao nếu checkout hiện tại đã có.

Chạy kiểm tra ban đầu để xác nhận lỗi trước khi sửa. Hiện bộ hồi quy TV3 có 17 PASS và 2 TODO về reminders; TODO không được tính là PASS.

2. Git và phạm vi

Kiểm tra working tree và nhánh hiện tại feat/tv3-admin-flow.
Giữ nguyên thay đổi và các commit UI đã có. Không reset,
stash, ghi đè hoặc tự merge nhánh khác.

Được sửa:
- mock/routes/admin-bookings.mjs.
- tools/tv3-booking-rules.test.mjs.
- Công cụ kiểm tra Admin hiện có nếu cần bổ sung nghiệm thu.
- docs/api/10-admin-bookings.md để đồng bộ mô tả tích hợp,
  có Changes khi thay đổi đặc tả.
- File UI TV3 nếu kiểm tra phát hiện lỗi thực tế.
- FRONTEND.md, brief.md và AI-LOG.md trong phạm vi TV3.

Không tự sửa helper reminders, payments, Customer UI hoặc
file sở hữu TV1/TV2. Nếu helper bàn giao có lỗi, mô tả ca tái
hiện và phần cần chủ file xử lý; không sao chép helper sang
một implementation riêng.

Không thêm dependency hoặc endpoint.

3. Hoàn thành R04

Trong PATCH /api/bookings/:code:
- Dùng recalculateBookingReminders của TV2 sau khi lịch mới
  đã được validate và kiểm tra trùng.
- Tính nhắc theo mốc sớm nhất mới và reminderHoursBefore.
- Cập nhật queued theo lịch mới; giữ lịch sử sent.
- Chạy lại cùng lịch không sinh thêm reminder trùng.
- Booking awaiting_deposit chưa giữ chỗ không được sinh nhắc.
- Giữ nguyên tiền, trạng thái booking và tiến độ jobs.

Các helper hiện có thay đổi db trực tiếp. Hãy bảo đảm không
ghi một phần dữ liệu: chuẩn bị thay đổi trên bản sao phù hợp,
chỉ áp dụng khi toàn bộ kiểm tra thành công.

Validation/clash hoặc ánh xạ job thất bại phải giữ nguyên
booking, jobs, reminders và payments.

Không quay lại yêu cầu proposalId hoặc khách đồng ý lại G10.

4. Hoàn thành R05

Trong POST /api/bookings/:code/cancel:
- Gọi stopBookingReminders cho đúng booking.
- Dừng nhắc queued, giữ lịch sử sent.
- Giữ jobs, trạng thái việc, payments và khoản đã thu.
- Giữ hội thoại scheduled.
- Hủy lại hoặc hủy completed vẫn trả 409.
- Request bị từ chối không làm đổi dữ liệu.

Giữ nguyên kiểm tra R06 đã có: Staff không sửa việc hoặc
upload sau hủy, nhưng vẫn xem được lịch sử.

5. Đóng hai TODO bằng kiểm tra thật

Bỏ đánh dấu TODO khi implementation đã làm ca kiểm tra đạt.
Không xóa assertion, đổi kỳ vọng theo code lỗi hoặc chuyển
sang skip để có kết quả xanh.

Bổ sung các ca:
- Đổi lịch cập nhật đúng sendAt và nội dung nhắc.
- Đổi lịch có queued và sent: cập nhật queued, giữ sent.
- Chạy lại cùng lịch không tạo trùng.
- Hủy dừng queued, giữ sent và tiền/việc.
- Trùng lịch hoặc body sai giữ nguyên toàn bộ dữ liệu.
- awaiting_deposit không sinh reminder.
- Hành vi tương ứng qua HTTP trên mock riêng.

Chạy toàn bộ hồi quy TV3 và contract-check trên mock mới.
Ghi đúng số PASS/FAIL/TODO; không dùng kết quả cũ.

6. Bổ sung nghiệm thu G4/G5/G6

Màn Customer đã có, nên kiểm tra lại luồng nhiều vai trò
bằng giao diện:
- Admin đề xuất giờ.
- Customer đăng nhập /chat, đồng ý.
- Admin đăng nhập lại, làm mới hội thoại và tạo booking.
- Kiểm tra trạng thái, số tiền và chống gửi hai lần.

Bổ sung kiểm tra lỗi 400 ánh xạ đúng từng field, liên kết
aria-describedby, focus lỗi và giữ giá trị nhập. Nếu dùng
phản hồi mô phỏng trong harness để kiểm tra mapping, ghi rõ;
không đưa mô phỏng vào code sản phẩm.

Chạy build, kiểm tra UI và hồi quy trên source mới nhất.
Nếu build mặc định bị EPERM, có thể dùng configLoader runner
và outDir tạm để chẩn đoán; ghi rõ đây không thay thế build
đóng gói cuối cùng.

Nếu Chrome không chạy được do môi trường, báo chính xác
phần chưa kiểm chứng. Không ghi UI PASS từ kết quả cũ.
Không sửa cấu hình sản phẩm chỉ để vượt lỗi môi trường.

7. Cập nhật tài liệu

- FRONTEND.md: bỏ ghi chú đã lỗi thời về việc TV2 chưa bàn
  giao helper/reservationFailure; giữ các giới hạn còn thật.
- Contract 10: cập nhật phần “Not yet integrated” sau khi
  thực sự tích hợp và kiểm tra, không xóa lịch sử Changes.
- brief.md: ghi nguyên văn prompt trước khi sửa.
- AI-LOG.md: thêm mục theo đúng cấu trúc hiện có, dẫn đúng
  brief, chỉ ghi sự việc và kiểm tra thực tế.
- Không sửa lại nhật ký cũ; ghi diễn biến mới trong mục mới.

8. Commit và bàn giao

Tôi cho phép commit từng file:
Author và committer: Lê Công Minh Nhựt
Email: lecongminhnhut6533@gmail.com

Dùng cấu hình từng lệnh, không sửa global config.
Stage từng đường dẫn, mỗi commit một file, đọc diff staged.
Commit brief trước, AI-LOG cuối. Không amend hoặc viết lại
lịch sử; không commit thay đổi có sẵn của người khác.

Không push, mở PR, merge hoặc gửi tin nhắn cho người khác.

Khi xong, báo:
- R04/R05 đã đóng hay còn thiếu gì.
- Kết quả hồi quy, contract-check và nghiệm thu UI.
- Giới hạn môi trường hoặc phụ thuộc còn lại.
- File/commit và git status.
- Phần việc ngày 24/11 đã đủ điều kiện nghiệm thu chưa.
```


## 27. [TV2 · 24/11/2026 · Antigravity Assistant] Front end #15b: G7 Lịch chụp của tôi, chi tiết booking, cổng thanh toán thử nghiệm và kết quả thanh toán

Tin nhắn 1:

```text
vậy làm tiếp thôi
```
*(Tiếp nối sau khi kiểm tra tiến độ `#15b` ngày 24/11 và kéo `main` mới nhất `cfca1b7`: triển khai 4 màn G7 `/my-bookings`, `/my-bookings/:code`, `/test-gateway/:paymentId`, `/payments/:paymentId/result` trên nhánh `feat/g7-bookings-deposit`.)*


## 28. [TV2 · 24–25/11/2026 · Antigravity Assistant] Front end #18: G7 Nhắc lịch (/notifications) và G9 Gallery chọn ảnh, trả 70%, Nhận ảnh (/my-bookings/:code/gallery)

Tin nhắn 1:

```text
vậy giờ làm cái tiếp theo 
```
*(Triển khai `#18` trên nhánh `feat/g9-gallery-notifications` tách từ `feat/g7-bookings-deposit`: hoàn thiện `/notifications` và `/my-bookings/:code/gallery`, đồng thời tách sẵn các commit nhỏ theo quy tắc mục 8.2/8.5.)*

Tin nhắn 2 (25/11/2026 — kiểm thử toàn diện các trường hợp biên, 4 chế độ MOCK_MODE và Chrome DevTools trên nhánh `feat/g9-gallery`):

````text
Kiểm tra kỹ toàn bộ nhánh hiện tại `feat/g9-gallery` (`#18`: `/notifications` và `/my-bookings/:code/gallery`) trên bản build (`cd client && npm run build && npx vite preview --port 4173`) kết hợp `node mock/server.mjs`, tự mở Chrome DevTools chạy test thực tế:

1. Phạm vi & cổng cơ bản:
- Chạy `npm run build`, `node --test tools/tv1-rules.test.mjs tools/tv3-booking-rules.test.mjs`, `node tools/contract-check.mjs` trên mock mới.
- Xác nhận `git diff -- docs/api mock` trống, 0 `localhost`, 0 `fixtures.js`, 0 `!important`, 0 `href="#"`.

2. Test trực tiếp Chrome DevTools cho `/notifications` (G7):
- Tài khoản chưa có nhắc (`linh`): hiện đúng empty message.
- Tài khoản có nhắc (`han` sau cọc `GS-1023`): hiện đúng thời gian, kênh `E-mail, Tài khoản`, badge trạng thái (`Chờ gửi / Đã gửi / Gửi lỗi`), nội dung và link tới booking.
- Bấm F5 giữ nguyên dữ liệu, 0 lỗi Console.

3. Test trực tiếp Chrome DevTools cho `/my-bookings/:code/gallery` (G9) + các ca biên dễ sai:
- Mở trước G6 (`/my-bookings/GS-1024/gallery`): hiện 404 thân thiện, không trắng màn.
- Booking chưa có ảnh preview: hiện thông báo trống, nút trả 70% và `Nhận ảnh` bị khóa kèm lý do rõ ngay bên cạnh.
- Booking có ảnh preview (36 ảnh):
  * Tick ảnh hiện `✓ Đã chọn` (không chỉ màu), bộ đếm `aria-live="polite"` nhảy đúng.
  * Chọn đến ảnh thứ 31 bị chặn + báo giới hạn gói.
  * Lưu lựa chọn (`PUT .../selection`), sửa lại lựa chọn trước khi trả 70%, thử bấm trả 70% khi chưa lưu / khi còn thay đổi chưa lưu / khi job `shoot` chưa `done` (R19 `409`).
  * Sau khi trả đủ 70% (`paid_in_full`): toàn bộ checkbox và nút `Lưu lựa chọn` khóa kèm lý do; nút `Nhận ảnh` khóa khi chưa có `finalLink`, và khi có `finalLink` bấm `Nhận ảnh` chuyển sang `Hoàn thành` không cần reload.
- Ca biên đặc biệt: đổi giữa 2 mã booking `:code` không dính state cũ; booking `cancelled` chỉ cho xem lịch sử và khóa trả 70% / `Nhận ảnh`; ca cọc trùng giờ R08 (`awaiting_deposit` + `deposit_paid`) hiện cảnh báo + link `/chat`, không mời cọc lại.

4. 4 chế độ `MOCK_MODE` (`normal`, `slow`, `error`, `empty`) & Responsive trên 2 màn này:
- `slow` hiện đang tải; `error` hiện lỗi + nút **Thử lại** phục hồi không cần F5 khi mock về `normal`; `empty` không crash.
- Kiểm tra `360px`, `768px`, `1280px`: không tràn ngang, không cắt chữ, nút cao ≥ 44px, 0 lỗi Console.

Báo bảng PASS/FAIL từng ca (chỉ báo PASS ca đã chạy thật); nếu thấy lỗi thì chỉ rõ file + dòng, sửa dứt điểm, test lại đến khi PASS và cập nhật `AI-LOG.md`. Không tự `git add`/`commit`/`push`.
````


## 29. [TV2 · 25/11/2026 · Antigravity Assistant] Fix mock/lib/reminders.mjs: sinh ID theo max(rm-<n>) + 1 tránh trùng sau khi xóa nhắc queued

Tin nhắn 1:

```text
1 lỗi nhỏ trong mock/lib/reminders.mjs (TV3 Nhựt đã note ở FRONTEND.md):
Hiện sinh ID theo rm-${db.reminders.length + 1} → nếu hủy xóa 1 nhắc queued rồi tạo mới có thể trùng ID với rm-* đang tồn tại.
Nên sửa ở 1 nhánh riêng fix/mock-reminder-id tách từ main (đổi sang max id + 1 + test nhỏ), không trộn vào PR #28. lỗi này là task nào, và giờ sửa luôn dc o
```

Tin nhắn 2:

```text
làm luôn
```

Tin nhắn 3:

```text
oke giờ test thât kĩ các biên và chuẩn theo yêu cầu, bật dev tools chrome lên test chặt vào
```


## 30. [TV1 · 25/11/2026 · Antigravity Assistant] CI Gate 3 & Harness: bổ sung `tools/tv2-reminders-id.test.mjs` (31/31 test)

Tin nhắn 1:

```text
Bối cảnh: GradStudio PA#3, tách nhánh `chore/ci-include-tv2-tests` từ `main` mới nhất (`cf2ccf2`, sau khi PR #28 và PR #29 đã merge). Bổ sung bộ kiểm thử `tools/tv2-reminders-id.test.mjs` vào Gate 3 của CI và đồng bộ tài liệu Harness/Rules để CI tự động chạy đủ 31/31 test hồi quy của cả 3 thành viên (TV1 + TV2 + TV3).

Ràng buộc bắt buộc:
1. KHÔNG sửa `docs/api/`, `mock/`, `client/` hay bất kỳ file test nào trong `tools/`. KHÔNG thêm dependency.
2. Mọi lệnh chạy kiểm tra ghi vào `AI-LOG.md` phải là kết quả chạy thật trong phiên này, không bịa số liệu.
3. Không tự chạy `git add`, `git commit`, `git push` (sau khi xong, gợi ý cách tách commit rõ ràng, giữ `AGENTS.md` thành commit riêng theo quy ước PA#5).

Yêu cầu chi tiết:
1. `.github/workflows/ci.yml` (Gate 3, dòng 49–50):
   - Cập nhật lệnh `node --test` thành:
     `node --test tools/tv1-rules.test.mjs tools/tv2-reminders-id.test.mjs tools/tv3-booking-rules.test.mjs`
2. `HARNESS.md`:
   - Cập nhật dòng **Verification scripts** (mục 1) và **Gate 3 — Business Rules Tests** (mục 3) cho khớp chính xác lệnh mới (thêm `tools/tv2-reminders-id.test.mjs`).
   - Bổ sung dòng mốc commit `1c2073b` vào bảng Timeline `AGENTS.md` nếu cần giữ khớp `git log -- AGENTS.md` (đối chiếu trực tiếp từ `git log`, không viết lại các mốc cũ).
3. `AGENTS.md` (mục *Verification gate*, dòng 222):
   - Cập nhật lệnh tham chiếu `node --test` thêm `tools/tv2-reminders-id.test.mjs` cho đồng bộ với CI và `HARNESS.md`.
4. Kiểm tra thực tế trước khi kết thúc:
   - Chạy toàn bộ 5 gate giống hệt `.github/workflows/ci.yml` trên máy local (Gate 1 → Gate 5), xác nhận Gate 3 đạt **31/31 PASS, 0 FAIL, 0 TODO**.
   - Xác nhận `git diff -- docs/api mock client tools` trống hoàn toàn và `git diff --check` 0 lỗi.
   - Ghi mục mới tiếp theo vào `brief.md` và `AI-LOG.md` (nối vào cuối file).
```

Tin nhắn 2:

```text
Rà soát kỹ toàn bộ diff trên nhánh `chore/ci-include-tv2-tests` (.github/workflows/ci.yml, HARNESS.md, AGENTS.md, brief.md, AI-LOG.md). Sửa lại lỗi dư dòng trống trước mục 30 ở cuối `brief.md` và `AI-LOG.md` về đúng 2 dòng trống đồng nhất với mục 28/29, rồi kiểm tra lại `git diff --check` và xác nhận không còn tiến trình nền. Không tự commit/push
```

## 31. [TV3 · 26/11/2026 · Codex] G10: danh sách, chi tiết và thao tác booking Admin

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy hoàn thiện G10, phần việc theo kế hoạch ngày 25/11 còn thiếu.

Ngày thực hiện hiện tại là 26/11/2026. Ghi ngày thực tế vào nhật ký, không ghi lùi ngày để khớp kế hoạch.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

1. Đọc tài liệu và kiểm tra tiền đề

Đọc:
- AGENTS.md, FRONTEND.md và HARNESS.md.
- ../ke-hoach/ke-hoach/TV3-chat-booking-admin.md:
  mục 2.5–2.8, 4.1, 5.4, 5.5 và 5.9.
- ../bao-cao-doi-chieu-ke-hoach-ma-nguon.md:
  R03/R04/R05/R07/R08/R14 và phần đang đúng cần giữ.
- docs/api/README.md, 04-availability.md,
  05-bookings.md và 10-admin-bookings.md.
- Contract 06/07/08 để hiểu thanh toán, nhắc lịch và jobs.
- Các trang Admin, component chat, hooks và API client hiện có.
- tools/tv3-booking-rules.test.mjs.
- tools/tv3-admin-build-check.mjs.
- Các mục brief/AI-LOG gần nhất của TV3.

Kiểm tra source thực tế trước khi kết luận.
G4/G5/G6 đã được triển khai; không làm lại.
Mock đã tích hợp tính lại/dừng reminders và sửa ID nhắc lịch.
Không tiếp tục dùng ghi chú “chờ TV2” đã lỗi thời để dừng task.

2. Tạo nhánh làm việc

Kiểm tra git status, branch, remote và lịch sử commit.

Nếu working tree sạch:
git fetch origin
git switch main
git merge --ff-only origin/main
git switch -c feat/g10-admin-bookings

Main cục bộ có thể đang cũ; không tạo nhánh từ main chưa cập nhật.

Xác nhận base đã có G4/G5/G6 và các sửa mock mới. Nếu thiếu,
báo commit/phần thiếu; không tự cherry-pick hoặc merge nhánh
khác để bỏ qua quy trình review.

Nếu nhánh đã tồn tại, kiểm tra trước khi tiếp tục.
Không reset, xóa nhánh, stash hoặc ghi đè thay đổi có sẵn.
Nếu fetch thất bại, ghi rõ trạng thái và phần có thể làm an toàn.

3. Phạm vi được sửa

Được tạo/sửa:
- client/src/pages/admin/.
- client/src/routes/admin.jsx.
- API wrapper của TV3 trong client/src/api/.
- Component phụ trợ Admin và CSS liên quan.
- Công cụ kiểm tra G10 và hồi quy Admin.
- Các dòng Routes, quyết định và Not done thuộc TV3
  trong FRONTEND.md.
- brief.md và AI-LOG.md.

Không sửa docs/api/, mock/, helper TV2, trang Customer,
phần nền TV1 hoặc dependency trong task frontend này.

Nếu API thiếu dữ liệu, chỉ ra endpoint/field thiếu.
Không thêm endpoint, đoán payment ID hoặc dựng dữ liệu.

4. Hoàn thiện danh sách booking

Nâng cấp /admin/bookings:
- Dữ liệu từ GET /api/bookings.
- Lọc theo trạng thái booking.
- Hiện mã, khách, ngày giờ, gói, trạng thái booking
  và trạng thái thanh toán.
- Mỗi booking có Link tới /admin/bookings/:code.
- Giữ link tới hội thoại liên quan.
- Có loading, error + Thử lại và empty.
- Hiển thị được cả booking cũ đã hủy và booking thay thế.
- Ở 360px không cuộn ngang; tái sử dụng BookingSummary
  và thiết kế hiện có.

5. Trang chi tiết booking

Đăng ký /admin/bookings/:code, bọc RequireRole admin.

Tải dữ liệu theo params; mở trực tiếp/F5 phải hoạt động.
Dùng Layout, useFetch, AsyncState, StatusBadge và Money.

Hiện:
- Mã, khách, loại chụp, gói và extras.
- Ngày, từng ca, nhân sự và phòng.
- Giá gói, cọc, phần còn lại và trạng thái thanh toán.
- Link hội thoại và danh sách booking.
- finalLink nếu đã có.

Không coi remaining là “số tiền còn nợ” khi đã paid_in_full:
đây là phần 70% theo giá gói, còn tiến độ thu tiền đọc từ API.

Với awaiting_deposit + deposit_paid, giải thích đã nhận cọc
nhưng chưa giữ được chỗ; không mời thanh toán cọc lại.
Chỉ hiển thị lý do chi tiết nếu endpoint được phép gọi thực sự
cung cấp dữ liệu đó.

Booking không tồn tại hoặc GS-1024 chưa được tạo:
hiện thông báo rõ và Link về danh sách.

6. Đổi lịch trực tiếp

Form có ngày, các ca, giờ bắt đầu/kết thúc, nhân sự và phòng.
Điền dữ liệu hiện tại từ booking; danh mục lấy từ API resources.

- Dùng useForm và FormField.
- Validate đúng contract, không chặn ngày trong quá khứ.
- Nút Áp dụng lịch mới gửi PATCH /api/bookings/:code
  với date/items dạng staffId/roomId.
- Không gửi proposalId hoặc bắt khách đồng ý lại.
- Không thêm ignoreBooking vào request.
- PATCH là bước kiểm tra trùng cuối cùng và bỏ qua chính booking.
- Nếu có kiểm tra xem trước, không để kết quả tự trùng
  với booking đang sửa chặn một lần lưu hợp lệ.
- 409 CLASH hiện lý do và gợi ý bằng chữ.
- Lỗi 400 gắn đúng field; giữ dữ liệu nhập khi lỗi.
- Thành công cập nhật ngay từ response, không reload trang.
- Khóa gửi lặp.

Backend hiện có giới hạn ánh xạ nhiều ca cùng loại hoặc
thêm/bớt loại ca khi đã có jobs. Hiện lỗi 409 rõ ràng từ API,
không tự ánh xạ trên client hoặc ghi thành quyết định PO.

7. Hủy booking

- Chỉ cho hủy awaiting_deposit hoặc booked.
- Lý do bắt buộc 5–500 ký tự.
- Có bước xác nhận với Xác nhận hủy và Không hủy.
- Gửi POST /api/bookings/:code/cancel.
- Thành công cập nhật Đã hủy từ response.
- Giữ thông tin tiền, lịch sử việc và link hội thoại.
- Giải thích studio xử lý hoàn tiền ngoài hệ thống.
- Không thêm thao tác hoàn tiền hoặc chuyển cọc.
- Booking cancelled/completed không gửi lại yêu cầu hủy.

Kiểm tra tác động thật: giờ được nhả, queued reminders dừng,
sent giữ nguyên và Staff không sửa việc/upload sau hủy.
Không sửa backend nếu ca này lỗi; báo bằng chứng cho chủ phần.

8. Lưu link ảnh hoàn chỉnh

- Ô có label, type=url.
- HTTPS hợp lệ, tối đa 500 ký tự theo contract.
- PUT /api/bookings/:code/final-link.
- Giữ giá trị khi lỗi, hiện lỗi cạnh field và chặn gửi lặp.
- Thành công hiện link từ response.
- Chỉ thao tác khi trạng thái cho phép.
- Không tự chuyển booking sang completed.

Nhận ảnh vẫn thuộc Customer. Sau khi Admin lưu link,
kiểm tra Customer có thể Nhận ảnh khi đã đủ điều kiện,
booking và hội thoại mới chuyển Hoàn thành.

9. Kiểm tra

Tái sử dụng harness hiện có, bổ sung G10 thay vì chỉ kiểm build.

Kiểm tra:
- Danh sách/chi tiết mở trực tiếp và F5.
- Chưa đăng nhập quay lại đúng route sau sign-in.
- Customer/Staff không vào được màn Admin.
- Đổi giờ trống thành công, không cần khách thao tác.
- Giờ trùng trả 409, lịch cũ giữ nguyên.
- Booking, jobs và reminders đồng bộ khi đổi.
- Hủy giữ lịch sử và tiền, nhả tài nguyên, dừng nhắc queued.
- Lý do hủy sai, URL sai và lỗi 400 hiển thị đúng field.
- Lưu finalLink, sau đó Customer Nhận ảnh qua UI.
- Booking đã hủy vẫn xem được; chốt giờ mới và tạo booking
  thay thế trong cùng hội thoại vẫn hoạt động.
- normal/slow/error/empty; Thử lại phục hồi không reload trang.
- 360/768/1280px, không tràn ngang; nút/link đứng riêng >=44px.
- Không lỗi Console, endpoint ngoài contract hoặc request lặp.

Chạy các gate theo AGENTS.md/HARNESS.md hiện tại:
syntax/JSON, contract-check trên mock mới, bộ hồi quy,
client build và kiểm tra conflict markers.

Không dùng số PASS cũ làm kết quả mới. Nếu tăng ca kiểm tra,
báo đúng tổng hiện tại.

Nếu môi trường bị EPERM hoặc Chrome GPU, ghi rõ phần
chưa kiểm chứng; không sửa cấu hình sản phẩm chỉ để né lỗi.
Có thể build ra TEMP để chẩn đoán, nhưng phân biệt với
bản build đóng gói cuối cùng.

10. Tài liệu và commit

Trước khi sửa, ghi toàn bộ prompt này nguyên văn vào brief.md,
đúng cấu trúc và số mục tiếp theo, ngày thực tế và công cụ.

AI-LOG.md:
- Thêm mục PA#3 theo mẫu hiện có.
- Request dẫn đúng brief.
- Ghi thay đổi, lỗi, kiểm tra và commit thật.
- Không sửa lại lịch sử.

FRONTEND.md:
- Thêm route chi tiết và endpoint thực sự gọi.
- Ghi G10 đã hoàn thành đến đâu.
- Gỡ ghi chú đã lỗi thời sau khi xác minh, gồm lỗi ID reminder
  đã được TV2 sửa.
- Giữ nguyên giới hạn còn thật và phần của thành viên khác.

Tôi cho phép git add và git commit từng file:
Author/committer: Lê Công Minh Nhựt
Email: lecongminhnhut6533@gmail.com

Dùng cấu hình từng lệnh, không sửa global config.
Stage từng đường dẫn; mỗi commit một file; đọc diff staged.
Commit brief trước triển khai, AI-LOG cuối.
Không amend, reset hoặc commit thay đổi có sẵn của người khác.

Không push, mở PR, merge hoặc gửi tin nhắn cho người khác.

Báo cáo cuối:
- G10 đã hoàn thành những thao tác nào.
- File/commit tương ứng.
- Kết quả kiểm tra và phần chưa kiểm chứng.
- Phụ thuộc hoặc lỗi cần phối hợp.
- Git status và đề xuất nội dung PR cho Kiệt review.
```


## 32. [TV1 · 27/11/2026 · Antigravity Assistant] QA8: Giờ mở cửa 2 khung (T2–T6 / T7–CN, B4.4) và quy tắc khóa việc Staff (B4.8, B4.11, B2.1)

Tin nhắn 1:

```text
Bối cảnh: GradStudio PA#3, tách nhánh `feat/qa8-settings-and-job-locks` từ `main` mới nhất (`effea64`). Thực hiện trọn phần việc **QA8 của TV1** theo bản kế hoạch cập nhật 27/11/2026 (`B4.4`, `B4.8`, `B4.11`, `B2.1`) để bàn giao sáng 28/11 cho TV3 và TV2.

Ràng buộc bắt buộc:
1. Đúng thứ tự bắt buộc: sửa contract (`docs/api/`) trước → mock (`mock/`) → UI (`client/`) → test (`tools/tv1-rules.test.mjs`).
2. KHÔNG sửa file thuộc TV2 (`02`, `06`, `07`, `09`, `11`, `payments.mjs`, `reminders.mjs`, `gallery.mjs`, `pages/customer/`) và KHÔNG sửa logic nghiệp vụ của TV3 (`03`, `04`, `05`, `10`, `pages/admin/`), NGOẠI TRỪ cập nhật tối thiểu đoạn đọc `db.settings.openingHours` trong `mock/lib/clash.mjs` sang dùng helper `getOpeningHoursForDate` mới để `contract-check` (`04-availability.md`) và CI không bị gãy khi tách 2 khung giờ.
3. KHÔNG thêm dependency vào `client/package.json`. KHÔNG tự chạy `git add`, `git commit`, `git push` (khi xong gợi ý cách tách commit chuẩn contract → mock → UI → test → AI-LOG).
4. Mọi kết quả kiểm tra ghi vào `AI-LOG.md` phải là kết quả chạy thật trong phiên này, dọn sạch mọi tiến trình nền sau khi test.

Yêu cầu chi tiết (QA8 — TV1):
1. **G11 · Giờ mở cửa tách T2–T6 & T7–CN (`B4.4`):**
   - `docs/api/13-settings.md`: đổi cấu trúc `openingHours` sang 2 khung:
     `{"openingHours": {"weekday": {"open": "08:00", "close": "20:00"}, "weekend": {"open": "08:00", "close": "20:00"}}, "reminderHoursBefore": 24}`
     (bắt buộc seed cuối tuần bao được `09:00–16:00` ngày Thứ Bảy `24/10/2026`). Cập nhật bảng field, validation (`openingHours.weekday.open/close`, `openingHours.weekend.open/close`), các ví dụ `GET`/`PUT` (`200`, `400`, `403`) và mục `## Changes`.
   - `mock/data/settings.json`: cập nhật seed theo đúng schema mới.
   - `mock/lib/opening-hours.mjs` (file mới): xuất helper `getOpeningHoursForDate(settings, dateStr)` (T2–T6 dùng `weekday`, T7–CN dùng `weekend`, có fallback an toàn nếu nhận object legacy `{open, close}`) để bàn giao cho TV3 dùng ở G5/G6/G10.
   - `mock/routes/settings.mjs`: cập nhật `validateSettings` kiểm tra đủ `HH:mm` và `close > open` cho cả `weekday` và `weekend`, giữ nguyên `reminderHoursBefore` (nguyên 1–168).
   - `mock/lib/clash.mjs`: chỉ đổi đoạn đọc `db.settings?.openingHours` sang gọi `getOpeningHoursForDate(db.settings, candidateDate)` để `04-availability.md` và `tv3-booking-rules.test.mjs` vẫn PASS 100%.
   - `client/src/pages/superadmin/SuperadminSettingsPage.jsx` (và `superadmin.css` nếu cần): cập nhật form dùng `useForm` + `FormField` với 2 nhóm rõ ràng **Ngày thường (T2–T6)** (Giờ mở cửa / Giờ đóng cửa) và **Cuối tuần (T7–CN)** (Giờ mở cửa / Giờ đóng cửa), map lỗi 400 từng field từ API, giữ responsive 360/768/1280px.

2. **G8 · Quy tắc khóa/mở trạng thái việc Staff (`B4.8`, `B4.11`, `B2.1`):**
   - `docs/api/08-jobs.md`:
     * Cập nhật mô tả: Staff được đổi trạng thái việc của mình theo thứ tự bất kỳ (kể cả lùi trạng thái) khi chưa bị khóa; giữ nguyên quyền đọc lịch sử `GET` và quy tắc upload preview hiện tại; ghi rõ việc `edit` do Admin phân công khi tạo booking (đồng bộ với `B4.11`).
     * Bổ sung đủ 4 điều kiện trả `409 CONFLICT` cho `PATCH /api/jobs/:id`:
       (a) Booking `cancelled` (giữ nguyên);
       (b) Việc `makeup` hoặc `shoot` khi booking đã `paid_in_full` hoặc `completed`;
       (c) Việc `edit` khi booking chưa có danh sách ảnh đã lưu (`!(booking.selection?.selectedCount > 0)`) HOẶC chưa `paid_in_full`;
       (d) Việc `edit` khi booking đã có `finalLink` hoặc đã `completed`.
     * Bổ sung ví dụ `PATCH /api/jobs/J-GS-1024-edit` trả `409` trong chuỗi `08-jobs.md` (hợp lệ ngay trong chuỗi `contract-check` vì lúc `08` chạy, `GS-1024` chưa chọn ảnh & chưa trả 70%) và ghi mục `## Changes`.
   - `mock/routes/jobs.mjs`: triển khai chính xác 4 điều kiện khóa `409` trên trong `PATCH /api/jobs/:id` (không thay đổi dữ liệu khi từ chối); giữ nguyên `GET /api/jobs`, `GET /api/jobs/:id` và `POST /api/bookings/:code/previews`.
   - `client/src/pages/staff/StaffJobDetailPage.jsx`: ngoài trạng thái `cancelled`, tính `statusLockReason` theo `job.kind` và trạng thái `booking` (`paymentStatus`, `selection.selectedCount`, `finalLink`, `status`); khi bị khóa thì disable form cập nhật trạng thái và hiện rõ lý do bằng chữ gắn `aria-describedby` vào nút **Lưu cập nhật**; khi chưa bị khóa vẫn cho đổi bất kỳ kể cả lùi trạng thái.

3. **Kiểm thử hồi quy & nghiệm thu thực tế:**
   - `tools/tv1-rules.test.mjs`: bổ sung test cho `B4.4` (`GET`/`PUT` 2 khung giờ, validate lỗi từng khung, `getOpeningHoursForDate` cho ngày thường và T7 `24/10/2026` / CN `25/10/2026`) và `B4.8`/`B4.11` (lùi trạng thái `done → todo` khi còn mở; khóa `makeup`/`shoot` sau `paid_in_full`; khóa `edit` khi chưa chọn ảnh hoặc chưa `paid_in_full`; mở `edit` khi đủ cả hai; khóa `edit` khi đã có `finalLink`; vẫn đọc được và chặn `409` khi `cancelled`).
   - Chạy đủ 5 gate giống hệt `.github/workflows/ci.yml`:
     * Gate 1: `node --check` + parse 14 JSON.
     * Gate 2: mock mới + `node tools/contract-check.mjs --base http://127.0.0.1:3001` (yêu cầu 0 FAIL, 40/40 endpoints).
     * Gate 3: `node --test tools/tv1-rules.test.mjs tools/tv2-reminders-id.test.mjs tools/tv3-booking-rules.test.mjs` (0 FAIL).
     * Gate 4: `cd client && npm run build`.
     * Gate 5: 0 conflict markers và `git diff --check` 0 lỗi.
   - Kiểm tra nhanh trên bản build (`npx vite preview --port 4173` + `mock/server.mjs`) cho `/superadmin/settings` (lưu 2 khung giờ + F5) và `/staff/jobs/J-GS-1022-shoot` / `/staff/jobs/J-GS-1022-edit` (xác nhận `shoot` còn mở và lùi trạng thái được, `edit` bị khóa kèm lý do rõ, 0 lỗi Console).
   - Ghi mục tiếp theo vào `brief.md` và `AI-LOG.md` (nối cuối file).


## 33. [TV3 · 27/11/2026 · Codex] QA10 hội thoại và booking Admin

```text
Tiếp tục PA#3 GradStudio trên checkout hiện tại. Tôi là Lê Công Minh Nhựt, TV3. Lượt này xử lý QA10 trong phạm vi hội thoại, đề xuất giờ, tạo booking phía Admin, đổi/hủy lịch và giao link ảnh.

Đọc bản cập nhật ngày 27/11 trong:
- ke-hoach/ke-hoach/TV3-chat-booking-admin.md
- lo-trinh-PA3.html
- GradStudio_PO_QA.md

Đọc thêm rubric PA#3, brief dự án và GradStudio/AGENTS.md, rồi đối chiếu với contract, mock, React và test hiện tại. Nếu hai câu trả lời PO điều chỉnh cùng một quy tắc, áp dụng câu mới hơn và ghi rõ căn cứ.

Kiểm tra Git và giữ nguyên thay đổi có sẵn. Làm trên checkout hiện tại, dừng ở diff để tôi review. Không commit hoặc push.

1. Phạm vi và thứ tự thực hiện

Tôi cho phép sửa contract, mock, React và test thuộc phần TV3. Thực hiện theo thứ tự contract → mock → React → kiểm thử; rà lại từng phần trước khi chuyển bước tiếp theo.

Với file thuộc TV1/TV2, ghi rõ dữ liệu, hàm hoặc thay đổi cần bàn giao. Tiếp tục phần TV3 có thể hoàn thành độc lập. Không tự sửa file của thành viên khác hoặc tạo implementation giả để che phụ thuộc.

2. Hội thoại và đề xuất giờ
(B2.2–3, B2.5, B3.2–3, B4.5–6)

Mỗi hội thoại gắn tối đa một booking:
- Sau hủy, giữ trạng thái Đã chốt lịch, mã booking cũ và toàn bộ lịch sử.
- Đặt lại phải qua yêu cầu mới.
- Bỏ hành vi tạo booking thay thế trong cùng hội thoại cũ khỏi contract, mock, UI và các test liên quan.

Chọn hội thoại khi khách gửi từ trang dịch vụ:
- Ưu tiên hội thoại chưa Hoàn thành và chưa có booking.
- Nếu có nhiều hội thoại mẫu phù hợp, chọn theo thời điểm tin nhắn mới nhất.
- Kiểm tra riêng chat thường, yêu cầu mới và trường hợp khách gửi từ hội thoại đã chọn.
- API trả ID hội thoại đích để TV2 nối giao diện.
- Mô tả rõ request/response trong contract trước khi sửa handler.

Chỉ đề xuất mới nhất được phản hồi:
- Khi Admin gửi giờ mới, đề xuất đang chờ hoặc đã được đồng ý trước đó chuyển sang Đã bị thay thế.
- Nếu chưa tạo booking, hội thoại về Đang tư vấn.
- Khóa Tạo booking đến khi khách đồng ý đề xuất mới.
- API phải kiểm tra lại tính hợp lệ khi khách phản hồi hoặc Admin tạo booking, kể cả request từ tab cũ.
- UI hiển thị đúng trạng thái thay thế và lý do không thể tiếp tục.

3. Kiểm giờ và đổi/hủy lịch
(B4.1–4, B4.7, BS.1)

Giờ mở cửa:
- Kiểm tra khi kiểm lịch, gửi đề xuất, tạo booking và đổi lịch.
- Dùng khung ngày thường/cuối tuần do TV1 bàn giao; không tự đặt giờ mặc định khác.
- Cho phép hai ca liền giờ.
- Giữ ngày mẫu 24/10/2026.
- Giờ khách gửi trong yêu cầu là giờ mong muốn, chưa phải lịch được xác nhận.
- Khi cọc, chỉ kiểm lại nhân sự và phòng theo quy tắc PO mới.

Giao dịch đang chờ:
- Khi giao dịch cọc hoặc 70% còn trong hạn 15 phút, đổi/hủy trả 409 kèm thời điểm có thể thử lại.
- Dùng dữ liệu và quy tắc hết hạn do TV2 bàn giao.
- UI hiện lý do và thời điểm thử lại từ API, không tự suy ra trạng thái giao dịch.

Khóa đổi lịch khi:
- Việc chụp đã Đang làm hoặc Hoàn thành.
- Booking đã thanh toán đủ.

Booking đã nhận cọc nhưng chưa giữ được chỗ vì trùng lịch:
- Cho đổi sang giờ trống trên cùng mã booking.
- Giữ nguyên gói và khoản cọc đã thu.
- Sau khi đổi hợp lệ, dùng bước xác nhận booking do TV2 bàn giao để xác nhận và tạo việc/nhắc lịch đúng một lần.
- Nếu giờ mới vẫn trùng, trả lỗi và giữ nguyên toàn bộ dữ liệu.
- Không yêu cầu khách trả cọc lại hoặc tự chuyển tiền sang booking khác.

Chuẩn bị đầy đủ thay đổi trước khi ghi. Validation, clash hoặc điều kiện nghiệp vụ thất bại không được để booking, jobs, reminders hay payments bị cập nhật một phần.

4. Phân công chỉnh ảnh và giao link
(B4.11)

Khi tạo booking:
- Admin chọn người chỉnh ảnh.
- Ghi dữ liệu phân công vào contract và bàn giao cho phần sinh việc khi xác nhận booking.
- Luồng mẫu GS-1024 gán Tuấn chỉnh ảnh.
- Không tự mặc định người chỉnh ảnh luôn là người chụp.

Khi lưu link ảnh:
- Chỉ mở thao tác khi khách đã thanh toán đủ và việc chỉnh ảnh đã Hoàn thành.
- API kiểm tra lại cả hai điều kiện, trả 409 kèm lý do nếu chưa đủ.
- UI hiện lý do khóa và cập nhật từ response.
- Lưu link không tự hoàn thành booking; giữ đúng bước Nhận ảnh của khách.

5. Contract và kiểm thử

Cập nhật ví dụ contract, ghi Changes với ngày thực hiện và căn cứ PO. Sửa các test cũ đang kỳ vọng tạo lại booking trong hội thoại đã có booking.

Bổ sung hoặc điều chỉnh kiểm tra cho:
- Chọn đúng hội thoại đích và giữ hội thoại khách đã chọn.
- Đề xuất bị thay thế; phản hồi và tạo booking từ tab cũ.
- Giờ ngày thường/cuối tuần, ca liền giờ và ngày mẫu.
- Giao dịch còn hạn, hết hạn và thời điểm được thử lại.
- Khóa đổi lịch theo trạng thái việc chụp hoặc thanh toán.
- Đổi giờ cho booking đã nhận cọc nhưng trùng lịch.
- Không cập nhật một phần, không tạo trùng việc/nhắc lịch.
- Phân công người chỉnh ảnh.
- Lưu link trước và sau khi đủ hai điều kiện.

Chạy:
- contract-check trên mock mới khởi động, đúng thứ tự ví dụ.
- Ba bộ hồi quy hiện có theo AGENTS.md/HARNESS.md.
- Build React.

Nếu chạy được trình duyệt, kiểm tra luồng Admin và các điểm bàn giao liên vai trò. Ghi rõ ca chạy qua HTTP, qua UI hoặc bằng dữ liệu kiểm tra riêng. Không dùng kết quả cũ hoặc build thành công để thay cho nghiệm thu nghiệp vụ mới.

Nếu thiếu phần bàn giao hoặc môi trường không chạy được, ghi đúng ca chưa kiểm chứng. Không đổi test thành skip/TODO chỉ để che lỗi.

6. Nhật ký và bàn giao

Trước khi sửa, ghi nguyên văn prompt này vào brief.md. Sau khi làm, cập nhật AI-LOG.md.

Tuân thủ cấu trúc hiện có của cả hai file: tiếp tục số mục, dùng ngày thực tế, giữ tên/thứ tự các trường và toàn bộ lịch sử. Chỉ ghi thay đổi, lỗi và kiểm tra đã xảy ra; không bịa kết quả hoặc mã commit.

Dùng Humanizer để viết phần mô tả ngắn, tự nhiên, giữ đúng dữ kiện. Prompt trong brief.md vẫn phải được lưu nguyên văn.

Báo cáo cuối gồm:
- Các quy tắc QA10 đã xử lý và căn cứ PO.
- File đã sửa.
- Lệnh kiểm tra và kết quả thực tế.
- Ca chưa chạy hoặc chưa đạt.
- Phần cần TV1/TV2 bàn giao, kèm dữ liệu hoặc giao diện hàm cụ thể.
- Các giới hạn còn lại và Git status.

Dừng ở diff để tôi review. Không commit hoặc push.
```


## 34. [TV3 · 27/11/2026 · Codex] QA10 rà tích hợp sau QA8

```text
1. Đọc và xác minh lại

Đọc:
- Phần cập nhật 27/11 trong kế hoạch TV3 và lo-trinh-PA3.html.
- GradStudio_PO_QA.md, ưu tiên câu trả lời mới hơn khi cùng điều chỉnh một quy tắc.
- AGENTS.md, FRONTEND.md và các mục QA10 mới nhất trong brief.md/AI-LOG.md.
- Contract 03/05/06/08/10.
- mock/lib/admin-booking-rules.mjs.
- mock/routes/admin-bookings.mjs, bookings.mjs và payments.mjs.
- Các helper, dữ liệu và test liên quan.

Kết quả kiểm tra tại checkout c5dead9:
- Ba bộ hồi quy: 37/37 PASS.
- Contract-check: 112/112 PASS, đủ 40 endpoint.
- Build thành công khi xuất ra thư mục tạm.
- Tuy nhiên, ca khôi phục booking đã nhận cọc vẫn trả 409;
  payment mới chưa có expiresAt; sinh việc chỉnh chưa dùng
  db.bookingEditors mà vẫn lấy người chụp.

Kiểm tra lại trên source hiện tại, không coi kết quả này là
bằng chứng cho một checkout đã thay đổi.

2. Phạm vi và phối hợp

Tôi cho phép sửa contract, mock, UI và test thuộc TV3.

Với phần TV2, hãy xác định bàn giao đã có hay chưa:
- Hạn giao dịch dùng chung cho cả cọc và 70%.
- Bước xác nhận booking, sinh jobs/reminders đúng một lần.
- Cách phần sinh việc đọc người chỉnh do Admin chọn.

Nếu đã có bàn giao, tích hợp vào TV3.
Nếu chưa có, mô tả chính xác hàm, dữ liệu, hành vi và ca
nghiệm thu cần TV2 cung cấp; tiếp tục phần TV3 độc lập.

Không tự sửa file TV1/TV2, sao chép logic thanh toán hoặc
tạo helper giả để báo hoàn thành.

Giữ working tree và lịch sử hiện có. Không reset, stash,
đổi nhánh hoặc merge khi chưa cần cho công việc.

3. B4.1: khôi phục trên cùng mã booking

Hoàn thiện trường hợp:
booking awaiting_deposit + paymentStatus deposit_paid,
đã nhận tiền nhưng chưa giữ được chỗ.

Theo contract và bước xác nhận TV2 bàn giao:
- Admin đổi sang giờ hợp lệ trên chính mã booking đó.
- Giữ gói, giá, khoản cọc và lịch sử thanh toán.
- Kiểm giờ hiện tại và trùng người/phòng.
- Xác nhận sang booked, sinh jobs/reminders đúng một lần.
- Không tạo giao dịch cọc mới hoặc booking thay thế.
- Request lặp không sinh trùng việc/nhắc hoặc ghi nhận tiền lại.
- Giờ trùng, lỗi validation hoặc lỗi xác nhận giữ nguyên
  booking, jobs, reminders và payments.

Ca test “trả 409 vì chưa có confirmation” chỉ là kiểm tra
giới hạn tạm thời. Khi đã tích hợp, bổ sung ca thành công
đúng yêu cầu PO; không giữ kỳ vọng tạm làm tiêu chí hoàn tất.

4. B4.2–3/BS.1: khóa theo hạn thanh toán thật

Tích hợp hạn do TV2 cung cấp cho cả deposit và remaining:
- Pending còn hạn: đổi/hủy trả 409 và thời điểm thử lại.
- Kiểm trước, đúng và sau hạn bằng đồng hồ kiểm thử.
- Sau hạn áp dụng đúng trạng thái và quy tắc TV2 bàn giao.
- Admin hiển thị thời điểm từ API.
- Không tự tạo một cách tính 15 phút riêng ở frontend
  hoặc giả expiresAt trong test rồi coi luồng thật đã đạt.

Phân biệt rõ phần kiểm tra bằng dữ liệu riêng với vòng đời
payment thực sự được tạo qua API.

5. B4.11: dùng đúng người chỉnh đã chọn

TV3 hiện lưu người chỉnh vào db.bookingEditors.
Phần sinh việc hiện vẫn lấy shootItem.staff cho job edit.

Phối hợp để thống nhất:
- Dữ liệu phân công đi từ POST booking tới bước xác nhận.
- Chọn Hà chỉnh, Tuấn chụp thì job edit thuộc Hà.
- Đổi lịch/người chụp không tự đổi người chỉnh.
- Chỉ nhân sự được phân công có quyền thao tác job.
- Luồng mẫu GS-1024 vẫn gán Tuấn chỉnh.
- Giao link tiếp tục yêu cầu paid_in_full và edit done.

Kiểm tra qua bước xác nhận thật, không chỉ đặt sẵn một job
đúng người trong fixture rồi kết luận phân công đã hoạt động.

6. Rà tích hợp sau QA8

Cấu hình weekday/weekend của TV1 đã có trên checkout.
Kiểm tra bằng dữ liệu cấu hình thực:
- Kiểm lịch, đề xuất, tạo và đổi booking dùng đúng khung.
- Cho phép ca liền giờ và ngày mẫu 24/10/2026.
- Đổi cấu hình không tự sửa booking cũ.
- Khi cọc chỉ kiểm lại người/phòng theo quy tắc mới.

Giữ các quy tắc QA10 đã làm:
- Một hội thoại tối đa một booking, kể cả sau hủy.
- Đặt lại qua yêu cầu mới.
- Đề xuất cũ bị thay thế không được phản hồi hoặc tạo booking.
- Tab cũ không vượt được kiểm tra API.

7. Kiểm tra và tài liệu

Thêm kiểm tra cho các ca còn thiếu rồi chạy:
- Ba bộ hồi quy hiện có.
- Contract-check trên mock mới.
- Build React.
- Luồng Admin/liên vai trò trên trình duyệt nếu chạy được.

Ghi riêng kết quả handler, HTTP và UI. Không dùng test xanh
của giới hạn tạm thời để tuyên bố luồng nghiệp vụ đã hoàn tất.

Cập nhật tài liệu TV3:
- FRONTEND.md: bỏ mô tả booking thay thế trong hội thoại cũ,
  cập nhật đúng điều kiện giao link và phần còn phụ thuộc.
- Contract: sửa đặc tả trước implementation, thêm Changes.
- brief.md: nối prompt này nguyên văn theo cấu trúc hiện có.
- AI-LOG.md: thêm mục mới ghi kết quả sau tích hợp; giữ nguyên
  nhật ký cũ, kể cả kết quả 34/35 của lượt trước.

Báo cáo cuối bằng bảng:
quy tắc QA10 → file xử lý → kiểm tra thực tế → trạng thái
đạt/chưa đạt/phụ thuộc → phần cần TV1/TV2 bàn giao.

Không đánh dấu QA10 hoàn tất khi B4.1, hạn giao dịch hoặc
phân công chỉnh ảnh mới chỉ được kiểm bằng fixture.
Dừng ở diff, không commit hoặc push.
```


## 35. [TV2 · 27/11/2026 · Antigravity Assistant] QA9: Hạn giao dịch 15 phút, xác nhận cọc dùng chung, nhắc lịch đến hạn và đồng bộ giao diện khách

```text
merge xong rồi, bạn hãy kéo main mới nhất về và triển khai thật kĩ phần QA9, chạy các TH biên kĩ
```


## 36. [TV3 · 27/11/2026 · Codex] QA10 khôi phục booking đã nhận cọc

```text
Nhánh đề xuất: fix/qa10-paid-deposit-recovery.

Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy hoàn tất mảnh tích hợp B4.1 còn lại của QA10: đổi sang giờ trống trên booking đã nhận cọc nhưng chưa giữ được chỗ.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

QA8, QA9 và phần lớn QA10 đã lên main. TV2 đã bàn giao:
confirmBookingReservation(db, booking)
trong mock/lib/booking-confirmation.mjs.

1. Cập nhật và tạo nhánh

Kiểm tra git status, branch và remote. Giữ nguyên thay đổi có sẵn; không tự stash, reset hoặc ghi đè.

Khi working tree sạch:
git fetch origin
git switch main
git merge --ff-only origin/main
git switch -c fix/qa10-paid-deposit-recovery

Commit 3572675 là mốc đã có bàn giao. Nếu origin/main mới hơn, dùng bản mới nhất; không đưa main về commit cũ.

Xác nhận helper và các cập nhật QA9 thực sự có trong base. Nếu nhánh đã tồn tại, kiểm tra trước khi tiếp tục.

2. Đọc trước khi sửa

Đọc:
- AGENTS.md và FRONTEND.md §7.
- Phần QA10 trong kế hoạch TV3.
- GradStudio_PO_QA.md, nhất là B4.1–4, B4.7 và B4.11.
- docs/api/05-bookings.md, 06-payments.md và 10-admin-bookings.md.
- mock/lib/booking-confirmation.mjs.
- Luồng gọi helper từ payments để hiểu cách bàn giao.
- mock/routes/admin-bookings.mjs.
- Các helper khóa giao dịch, kiểm lịch và reminders.
- Test TV3, test QA9 và harness Admin hiện có.

Không triển khai lại phần TV2 đã bàn giao hoặc giữ ghi chú
“chưa có helper” từ checkout cũ.

3. Tích hợp PATCH booking

Trong PATCH /api/bookings/:code, hoàn thiện trường hợp:
status = awaiting_deposit
paymentStatus = deposit_paid

Thay nhánh đang trả 409 “Chưa thể xác nhận lịch mới cho khoản cọc đã nhận” bằng tích hợp helper dùng chung.

Yêu cầu:
- Giữ các kiểm tra quyền, trạng thái booking, tiến độ chụp,
  giao dịch đang chờ, validation và giờ mở cửa hiện có.
- Kiểm tra trùng người/phòng theo lịch mới, bỏ qua chính booking.
- Dùng date/items mới khi gọi xác nhận.
- Helper là async: chuyển handler sang async và await kết quả.
- Kiểm tra kết quả ok trước khi trả thành công.
- Giữ nguyên mã booking, hội thoại, gói, giá, khoản cọc,
  payments và người chỉnh đã phân công.
- Thành công chuyển booked và sinh jobs/nhắc lịch qua helper
  đúng một lần.
- Không tạo payment mới, thu cọc lại hoặc tạo booking khác.

Bảo đảm tính nguyên vẹn của thao tác:
- Giờ trùng, validation lỗi, helper từ chối hoặc ném lỗi
  không được để lịch mới, jobs hay reminders được ghi một phần.
- Đọc rõ helper thay đổi db/booking như thế nào trước khi tích hợp.
- Chuẩn bị thay đổi trên bản sao phù hợp nếu cần, rồi áp dụng
  sau khi mọi bước thành công.
- Không gọi helper trên lịch cũ rồi mới đổi ngày/giờ.
- Không tự đánh dấu booked trước khi helper kiểm tra.
- Trả lỗi đúng contract và giữ lý do trùng bằng chữ.

Giữ nguyên hành vi đổi lịch của booking booked và chưa thu cọc.
Không làm yếu các khóa pending payment, paid_in_full,
shoot in_progress/done, cancelled hoặc completed.

4. Phạm vi

Được sửa:
- mock/routes/admin-bookings.mjs.
- Contract TV3 nếu cần cập nhật mô tả hoặc ví dụ B4.1.
- Test TV3 và harness Admin liên quan.
- FRONTEND.md, brief.md và AI-LOG.md trong phạm vi task.

Không tự sửa helper xác nhận, payments hoặc file TV1/TV2.
Nếu helper có lỗi, ghi ca tái hiện và phần cần bàn giao;
không sao chép logic của helper vào route.

Nếu thay đặc tả, sửa contract và Changes trước mock.
Không thêm endpoint, field hoặc dependency ngoài phạm vi.

5. Kiểm tra hồi quy

Thêm ca thành công thay cho giới hạn tạm “helper chưa có”:
- Tạo ca cọc thật đã thành công nhưng trùng lịch qua API.
- Đổi sang giờ trống trên cùng mã: trả 200, status booked,
  giữ deposit_paid và khoản đã thu.
- Jobs đúng ca, người/phòng và người chỉnh đã chọn.
- Nhắc lịch đúng mốc sớm nhất và cấu hình hiện tại.
- Gọi lại không sinh trùng jobs/reminders hoặc ghi nhận tiền lại.
- Đổi sang giờ vẫn trùng: 409 CLASH, toàn bộ dữ liệu giữ nguyên.
- Thiếu quyền, giờ ngoài khung và giao dịch còn hạn vẫn bị chặn.
- Các luồng đổi lịch/hủy/giao link hiện có không bị hồi quy.

Không chỉ đặt sẵn trạng thái fixture rồi kết luận đã kiểm đủ
luồng cọc → trùng → đổi lịch → xác nhận.

Chạy các gate trong AGENTS.md/HARNESS.md hiện tại:
- Syntax và seed JSON.
- Contract-check trên mock mới khởi động.
- Các bộ hồi quy được CI sử dụng, gồm TV1/TV2/TV3 và test QA9
  nếu đã được bổ sung.
- Build React.
- Conflict markers và git diff --check.

Nếu chạy được trình duyệt, kiểm tra thao tác đổi giờ của Admin
từ awaiting_deposit/deposit_paid sang booked, cập nhật trực tiếp
từ response và không phát sinh yêu cầu cọc lại.

Ghi kết quả mới; không dùng số PASS từ nhật ký cũ.

6. Tài liệu và giới hạn còn lại

FRONTEND.md §7:
- Chỉ gỡ B4.1 khỏi Not done sau khi kiểm tra thành công.
- Với đổi lịch thêm/bớt/lặp loại ca, nếu nhóm không mở rộng
  trong PA#3 thì ghi rõ giới hạn hiện tại và phản hồi 409.
- Không ghi giới hạn này thành quy tắc PO hoặc tự mở rộng
  ánh xạ jobs trong task B4.1.

Ghi prompt nguyên văn vào brief.md trước khi sửa.
Cập nhật AI-LOG.md đúng cấu trúc có sẵn, ngày thực tế,
kết quả kiểm tra và giới hạn. Giữ nguyên lịch sử.

7. Commit và mở PR

Tôi cho phép commit, push nhánh task và mở PR vào main.
Đây là ngoại lệ đối với quy định không commit/push trong AGENTS.md.

Author/committer:
Lê Công Minh Nhựt
lecongminhnhut6533@gmail.com

Dùng cấu hình từng lệnh, không sửa global config.
Commit từng file, stage đường dẫn cụ thể và đọc diff staged.
Không amend, force push hoặc commit thay đổi của người khác.

PR:
- Base: main.
- Reviewer: Kiệt – TV2.
- Tiêu đề đề xuất:
  fix(qa10): confirm paid bookings after clash-free rescheduling
- Mô tả hành vi trước/sau, kiểm tra đã chạy và giới hạn còn lại.

Không push trực tiếp main. Chỉ merge sau khi review được
chấp thuận và các gate bắt buộc đạt; dùng Create a merge commit.
Nếu chưa đủ điều kiện, bàn giao link PR và lý do còn chờ.

Báo cáo cuối:
- File và commit.
- Kết quả kiểm tra B4.1 và các gate.
- Link PR, trạng thái review/CI/merge.
- Nội dung Not done còn lại.
- Git status cuối.
```


### [TV1] 37. QA11 — Cập nhật CI Gate 3 và nghiệm thu bản build `client/dist/` (27/11/2026)

```text
Bối cảnh: GradStudio PA#3, tách nhánh `chore/qa11-ci-gate3-and-verification` từ `main` mới nhất (`c6e51b6`, sau khi QA8 PR #32, QA9 PR #35 và QA10 PR #33/#34/#36 đều đã merge). Thực hiện trọn phần Chặng 2 (QA11 — phần của TV1) theo kế hoạch PA#3 để chốt bằng chứng nghiệm thu trước khi bước sang QA12.

1. Cập nhật `.github/workflows/ci.yml` Gate 3 bổ sung `tools/tv2-qa9.test.mjs` để chạy đủ cả 4 bộ hồi quy (`tv1-rules`, `tv2-reminders-id`, `tv2-qa9`, `tv3-booking-rules`).
2. Chạy trọn 5 Gate tự động trên commit ứng viên (`c6e51b6` + thay đổi Gate 3): cấu trúc/cú pháp/14 seed JSON, `contract-check`, 4 bộ `node --test`, `client` production build, `git diff --check` & quét conflict markers.
3. Nghiệm thu bản production build (`client/dist/` + SPA fallback + `/api` proxy -> mock server) bằng Chrome headless:
   - Phân quyền 4 vai trò (RBAC) + khách chưa đăng nhập.
   - G11 Superadmin (danh sách Admin, cài đặt giờ mở cửa tách T2–T6 / T7–CN).
   - Đi trọn luồng `GS-1024` qua 4 vai trò (`linh` -> `thao` -> `tuan` -> `linh`, kiểm tra `B4.8` khóa/mở `shoot` và `edit`, G10 gắn link cuối, G9 *Nhận ảnh* -> `completed`).
   - Đối soát toàn bộ log `/api` với `docs/api/`, kiểm Console 0 lỗi JS / 0 5xx.
4. Ghi nhận kết quả chạy thật vào `brief.md` và `AI-LOG.md` (không tự chạy `git add`/`commit`/`push`).
```


## 38. [TV3 · 28/11/2026 · Codex] Rà phần TV3 trước khi nộp PA#3

```text
Phần TV3 nên ưu tiên: sửa route Admin trong tài liệu, rà Changes, dọn mã PA#2 thuộc TV3 và kiểm tra vùng bấm Admin. Lưu ý: .admin-extras label hiện đã có chiều cao tối thiểu 44px; cần đo vùng nhãn thực tế trước khi sửa CSS.

Nhánh đề xuất: fix/tv3-submission-readiness.

Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy xử lý các nhận xét trước nộp thuộc phạm vi TV3, đồng thời lập bàn giao rõ ràng cho TV1/TV2.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

Đọc AGENTS.md, rubric PA#3, FRONTEND.md, kế hoạch QA mới,
contract, router, source Admin và nhật ký hiện tại trước khi sửa.

Kiểm tra Git và giữ nguyên thay đổi có sẵn. Nếu tạo nhánh mới,
dùng fix/tv3-submission-readiness từ main đã cập nhật, sau khi
xác nhận phần B4.1 mới nhất đã được tích hợp. Không tự reset,
stash, cherry-pick hoặc merge nhánh khác.

Lượt này dừng ở diff để tôi review, không commit hoặc push.

1. Sửa bảng Routes thuộc TV3

Trong FRONTEND.md:
- Đổi path ví dụ /admin/bookings/:code thành
  /admin/bookings/GS-1023.
- Ghi rõ đăng nhập thao để xem route Admin này.
- Giữ nguyên :code trong cột endpoint và trong router;
  chỉ thay path ví dụ mà giám khảo sẽ mở.
- Rà các dòng Admin khác để bảo đảm dùng ID có sẵn trong seed.
- Các route chỉ có dữ liệu sau một bước phải ghi đúng after Gx.
- Mở trực tiếp và F5 các route Admin bằng đúng tài khoản;
  không chỉ kiểm tra bằng cách bấm từ trang trước.

GS-1023 thuộc Hân. Không thay chủ sở hữu seed hoặc nới quyền
để Linh xem được booking này.

Với phần Customer, soạn các dòng Routes đề xuất cho TV2:
- /my-bookings và /my-bookings/GS-1023 khi đăng nhập han.
- Luồng tạo thanh toán cọc từ booking của Hân.
- Route test gateway và kết quả, ghi rõ chỉ có sau khi tạo
  payment và dùng ID thực sự được API trả về.

Không mô tả payment là dữ liệu có sẵn sau khi restart mock.
Không thêm lại tài khoản han nếu bảng Demo accounts đã có.
Chưa sửa trang Customer hoặc dòng Routes của TV2 trong task này.

2. Rà Changes cho phần TV3

Đọc git log và diff các commit sửa docs/api/ hoặc mock/ của TV3
sau khi frontend bắt đầu sử dụng endpoint tương ứng.

Lập bảng:
commit → file thay đổi → hành vi ảnh hưởng → contract liên quan
→ dòng Changes đã có hay còn thiếu.

Rà ít nhất:
- conversations và quy tắc chọn hội thoại.
- proposal bị thay thế và chặn tab cũ.
- tạo booking, editorId và một booking cho mỗi hội thoại.
- kiểm giờ mở cửa.
- đổi/hủy, reminders và B4.1.
- điều kiện giao link.

Bổ sung Changes còn thiếu trong contract TV3, ghi ngày cập nhật
thực tế, dẫn commit gốc và giải thích thay đổi. Không ghi lùi
ngày hoặc làm như dòng này đã tồn tại từ trước.

Không amend, rebase hoặc viết lại lịch sử để che thiếu sót.
Bổ sung truy vết không có nghĩa tự khẳng định đã đáp ứng thứ tự
lịch sử nếu thực tế chưa đáp ứng.

Commit 84a9c34 và contract 07-reminders thuộc TV2:
xác minh nhận xét rồi ghi vào bàn giao cho Kiệt, không tự sửa.
Không coi đây là commit duy nhất cần rà.

3. Dọn mã PA#2 thuộc phần TV3

Kiểm tra toàn bộ import tĩnh, import động, entry HTML,
vite.config.js, script và công cụ kiểm tra trước khi xóa.

Được xóa hai file sau nếu xác nhận không còn dùng:
- client/src/pages/StudioPage.jsx
- client/src/components/FloatingChat.jsx

Không xóa:
- client/src/pages/public/HomePage.jsx.
- Các component chat PA#3 đang dùng.
- CSS dùng chung, ảnh hoặc bằng chứng lịch sử PA#2.

Các file HomePage.jsx, BookingPage.jsx ở thư mục pages cũ
và data/fixtures.js cần phối hợp TV2. Ghi rõ import còn lại
và đề xuất xóa theo nhóm; không xóa fixtures khi các trang
chưa được dọn vẫn import nó.

Không sửa dữ liệu nghiệp vụ hoặc giao diện đang chạy chỉ vì
phát hiện dữ liệu cứng trong một file PA#2 không được sử dụng.

Sau khi xóa, build và kiểm lại các màn Admin để phát hiện
import hoặc phụ thuộc gián tiếp còn sót.

4. Kiểm tra vùng bấm Admin

Trên /admin/conversations/c-linh ở 360/768/1280px:
- Đo input checkbox và label bao quanh riêng biệt.
- Kiểm tra label thực sự gắn với checkbox và bấm vào chữ
  cũng thay đổi lựa chọn.
- Đo vùng bấm của label, không dùng riêng chiều cao ô checkbox
  để kết luận không đạt.
- Rà thêm button và link đứng riêng, yêu cầu tối thiểu 44px.

Source hiện có .admin-extras label với min-block-size: 44px.
Nếu vùng bấm thực tế đã đạt, ghi bằng chứng và giữ nguyên CSS.
Nếu chưa đạt, sửa trong phạm vi CSS/component Admin.
Không dùng CSS toàn cục phóng mọi input hoặc làm vỡ bố cục.

Ô input nhỏ trên /chat thuộc TV2: ghi selector, kích thước input,
kích thước label và cách tái hiện để Kiệt xử lý.

5. Tài liệu và bằng chứng TV3

Cập nhật Not done của TV3 theo code và kiểm tra hiện tại:
- Gỡ phụ thuộc đã giải quyết sau khi xác minh.
- Ghi rõ giới hạn đổi lịch thêm/bớt/lặp loại ca nếu còn.
- Không giữ mô tả tạo booking thay thế trong hội thoại cũ
  trái quy tắc QA10 hiện hành.
- Không dùng kết quả kiểm tra PA#2 làm bằng chứng PA#3.

Chuẩn bị bằng chứng TV3 để Hưng viết SELF_ASSESSMENT_REPORT:
- G4/G5/G6 Admin/G10 đã chạy được gì.
- File, route, test, commit hoặc output chứng minh.
- Phần chưa đạt và kiểm tra chưa chạy.
- Các nội dung phù hợp cho “what we did not manage”.

Không tự chấm điểm toàn nhóm hoặc ghi đè báo cáo PA#2.
Bàn giao cho Hưng yêu cầu thay bằng 9 tiêu chí PA#3,
cộng tổng đúng và khớp tên zip. Không mặc định giữ 97/100.

6. Các nhận xét chung cần bàn giao

Lập danh sách ngắn, có chủ xử lý và bằng chứng:
- TV1: báo cáo tự chấm PA#3; bỏ trạng thái “đang làm” khi chốt
  bản nộp; tổng hợp Not done và bảng Routes.
- TV2: các dòng Routes cho Hân, nhãn test payment không có
  chữ PA#3 trên UI, vùng bấm /chat và Changes của reminders.
- TV1 cùng nhóm: bổ sung link PO thật nếu có. Không bịa link
  hoặc lấy link kế hoạch nội bộ thay cho bài trả lời PO.
- Tài liệu: liệt kê file:///home/hungj2020/... và đường dẫn
  tương đối có thể thay thế sau khi kiểm tra đích tồn tại.
  Không sửa PROTOTYPE.md hoặc các mục nhật ký cũ ngoài phạm vi.
- Danh tính Git: kiểm tra user.name/user.email hiện tại,
  đề xuất tên đầy đủ thống nhất cho các commit sau.
  Không đổi tên tác giả commit cũ hoặc global Git config.

Được tạo docs/qa-reference.md để giải thích ngắn các mã
đang xuất hiện trong tài liệu TV3:
- B2.x/B3.x/B4.x/BS.1: tham chiếu câu hỏi và trả lời PO.
- R01…: mục trong báo cáo đối chiếu.
- QA8…QA11: đầu việc trong kế hoạch QA.

Đọc nguồn trước khi mô tả và giữ đúng từng hệ mã.
Không gộp R01 của báo cáo với R1 của rubric PA#4.
Nếu nguồn tham chiếu nằm ngoài repo, ghi rõ tình trạng đó;
không tạo link tương đối bị hỏng hoặc tự chép toàn bộ tài liệu
của nhóm vào repo.

7. Kiểm tra và nhật ký

Với sửa tài liệu, kiểm tra link, path và tính nhất quán.
Với xóa source hoặc sửa UI, chạy build và kiểm tra các màn
Admin bị ảnh hưởng bằng công cụ hiện có.

Chạy gate phù hợp trong AGENTS.md/HARNESS.md; nếu contract/mock
có thay đổi thì chạy contract-check trên mock mới.
Không thêm dependency hoặc viết test chỉ để kiểm tra một
chuỗi văn bản vừa sửa.

Ghi prompt nguyên văn vào brief.md trước khi sửa.
Thêm mục AI-LOG.md theo đúng cấu trúc có sẵn, dùng ngày thực tế.
Không sửa prompt nguyên văn hoặc dựng lại bằng chứng cũ.

Báo cáo cuối:
- Nhận xét nào TV3 đã xử lý.
- Nhận xét nào đã kiểm tra và không cần sửa.
- File thay đổi, kết quả kiểm tra và phần chưa kiểm chứng.
- Bảng Changes còn thiếu.
- Danh sách bàn giao TV1/TV2.
- Git status và diff để tôi review.

Không commit, push, mở PR hoặc gửi tin nhắn cho người khác.
```


## 39. [TV3 · 28/11/2026 · Codex] QA11 nghiệm thu bốn chế độ mock trên toàn ứng dụng

```text
Tôi là Lê Công Minh Nhựt, TV3, MSSV 24120211. Hãy hoàn tất phần QA11 của TV3 trong ngày 28/11: kiểm normal/slow/error/empty và nút Thử lại trên toàn bộ ứng dụng.

Phần sửa trước nộp đã nằm trên nhánh fix/tv3-submission-readiness. Lượt này bổ sung nghiệm thu toàn app, không làm lại riêng các màn Admin đã kiểm.

Repository:
F:\CSC_HCMUS\Chuyên ngành\Web\New folder\GradStudio

1. Đọc và xác định phạm vi

Đọc:
- AGENTS.md và HARNESS.md.
- FRONTEND.md, nhất là Routes và Not done.
- Kế hoạch TV3 cập nhật 27/11, phần QA11.
- Các file routes Public, Customer, Admin, Staff, Superadmin.
- Công cụ kiểm tra và nhật ký mới nhất của nhóm.

Kiểm tra working tree, branch, HEAD và chênh lệch với origin/main.
Giữ nguyên các commit đã có. Không reset, stash, cherry-pick
hoặc tự merge nhánh khác.

Dùng nhánh hiện tại nếu phù hợp. Nếu phát hiện thay đổi có sẵn,
không ghi đè hoặc đưa chúng vào phần việc của mình.

2. Lập ma trận kiểm tra

Liệt kê toàn bộ route thực tế, đối chiếu với FRONTEND.md.
Mỗi ca ghi:
- Route cụ thể, không dùng :id/:code làm URL truy cập.
- Tài khoản và vai trò.
- Dữ liệu tiền đề.
- Chế độ mock.
- Kết quả mong đợi, thực tế và PASS/FAIL/chưa chạy.

Dùng dữ liệu seed và đúng chủ sở hữu:
- thao cho các màn Admin.
- han cho GS-1023 của Hân.
- tuan/mai cho việc thực sự được giao.
- superadmin cho G11.

Với route after G6/G7:
- Chuẩn bị dữ liệu qua API trên mock kiểm tra riêng khi cần.
- Dùng ID thật API trả về.
- Kiểm cả trạng thái mở sớm: có thông báo rõ, không trắng màn.
- Mock restart làm mất dữ liệu runtime; không nhầm dữ liệu mất
  sau restart với lỗi UI hoặc dùng nhầm ID của lần chạy trước.

Không sửa seed sản phẩm để tạo bằng chứng.

3. Kiểm trên production build

Build source hiện tại rồi chạy preview với proxy API đúng.
Không dùng kết quả từ npm run dev để thay cho nghiệm thu build.

Với mỗi màn tải dữ liệu:

normal:
- Hiện dữ liệu API hoặc thông báo rỗng hợp lệ.
- Không có request ngoài contract, 404 ngoài dự kiến,
  request lặp khi đứng yên hoặc lỗi Console.

slow:
- Thấy Đang tải trước khi dữ liệu xuất hiện.
- Không có khoảng trắng thay cho loading hoặc dữ liệu cứng
  làm che trạng thái tải.

error:
- Đăng nhập vẫn thực hiện được theo quy tắc mock.
- Màn hiển thị lỗi và nút Thử lại.
- Giữ nguyên trang và phiên đăng nhập, đưa mock về normal,
  bấm Thử lại phải phục hồi dữ liệu mà không F5.
- Kiểm từng vùng dữ liệu có nút retry riêng nếu trang tải
  nhiều resource.

empty:
- Mọi danh sách và danh sách lồng nhau có trạng thái rỗng.
- Không crash, không trắng màn, không hiện dữ liệu fixtures.
- Form thiếu danh mục có thông báo phù hợp, không tạo request
  sai vì options rỗng.

Kiểm cả Public, Customer, Admin, Staff và Superadmin.
Không lấy kết quả Admin đại diện cho toàn app.

4. Công cụ và bằng chứng

Ưu tiên mở rộng công cụ hiện có hoặc tạo harness QA11 riêng,
dùng dependency đã có. Không cài thêm thư viện.

Lưu bằng chứng có thể chạy lại trong repo:
- Ma trận kết quả.
- Lệnh chạy và cách chuẩn bị dữ liệu.
- Commit/source được kiểm.
- Log hoặc ảnh cần thiết để giải thích lỗi và phục hồi.

Phân biệt kiểm qua UI, HTTP và dữ liệu chuẩn bị riêng.
Không tái sử dụng output cũ như kết quả lượt này.

Chỉ dừng các tiến trình do task tạo. Không chiếm hoặc tắt server
của người khác. Dọn tiến trình kiểm tra sau khi kết thúc.

Nếu Chrome hoặc build bị chặn bởi môi trường, ghi nguyên nhân
và ca chưa chạy. Build ra TEMP có thể dùng để chẩn đoán,
nhưng không coi đó là bản client/dist đóng gói cuối cùng.

5. Xử lý lỗi phát hiện

- Lỗi thuộc TV3: sửa trong phạm vi Admin/component TV3,
  rồi chạy lại ca lỗi và các ca hồi quy liên quan.
- Lỗi thuộc TV1/TV2: ghi route, tài khoản, mode, bước tái hiện,
  kết quả mong đợi/thực tế và bằng chứng để bàn giao.
- Không tự sửa file của thành viên khác.
- Tiếp tục kiểm các ca độc lập, không dừng toàn bộ vì một lỗi.
- Không thay contract/mock cho khớp UI, tắt assertion hoặc
  chuyển ca lỗi sang skip để báo xanh.

Không mở rộng chức năng đổi lịch thêm/bớt/lặp loại ca.
Giữ giới hạn PA#3 đã công bố trong Not done.

6. Chạy lại các gate phù hợp

Theo lệnh hiện tại trong AGENTS.md/HARNESS.md:
- Syntax và seed JSON.
- Contract-check trên mock mới.
- Bốn bộ hồi quy TV1/TV2/QA9/TV3.
- Build React.
- Conflict markers và git diff --check.

Ghi tổng kết quả thực tế, không mặc định giữ số 46/46.

7. Nhật ký và bàn giao

Trước khi sửa, nối prompt này nguyên văn vào brief.md,
đúng cấu trúc, số mục tiếp theo và ngày thực tế.

Thêm mục AI-LOG.md theo mẫu hiện có:
- Request trỏ đúng brief.
- Ghi phần đã kiểm, lỗi thật, cách xử lý và phần chưa chạy.
- Giữ nguyên các mục lịch sử.

Cập nhật Not done thuộc TV3 nếu kết quả mới làm thay đổi
tình trạng đã công bố. Không tự đánh dấu W3C, responsive
toàn app hoặc báo cáo tự chấm của TV1/TV2 đã hoàn thành.

Báo cáo cuối:
- Đã kiểm bao nhiêu route/ca trong từng mode.
- Số PASS, FAIL và chưa chạy.
- Các lỗi còn lại cùng người phụ trách.
- QA11 phần TV3 đã đủ điều kiện bàn giao chưa.
- File thay đổi và Git status.
- Các commit đang chưa vào main.
- Đề xuất tiêu đề/nội dung PR cho Kiệt review, gồm bằng chứng
  QA11 và phần sửa trước nộp đã có trên nhánh.

Dừng ở diff để tôi review. Không commit, push, mở PR,
merge hoặc gửi tin nhắn cho người khác.
```

## 40. [TV3 · 28/11/2026 · Codex] Xử lý ba điểm còn lại của QA11

```text
Hoàn tất ba điểm còn lại của QA11 trên checkout hiện tại. Giữ nguyên diff chưa stage, không ghi đè ma trận, harness hoặc nhật ký.

Tôi cho phép sửa các file dùng chung/TV1/TV2 chỉ trong phạm vi:
1. Sửa 404 favicon: dùng icon hợp lệ và khai báo đúng trong client/index.html. Kiểm bằng Chrome profile mới; không tạo file rỗng hoặc bỏ qua lỗi trong harness để báo PASS.
2. FRONTEND.md: bổ sung GET /api/bookings/:code cho route chi tiết việc Staff.
3. FRONTEND.md: bổ sung GET /api/extras cho route chi tiết gói.

Đọc AGENTS.md và xác minh endpoint thực tế trước khi sửa. Không đổi nghiệp vụ, contract, mock hoặc mở rộng chức năng.

Build lại và chạy lại ca favicon trong normal: đăng nhập linh, mở /my-bookings/GS-1024 trước G6. Trang vẫn phải hiện đúng thông báo booking chưa được tạo, không còn request icon 404. Chạy lại các kiểm tra liên quan; nếu chạy toàn bộ ma trận thì cập nhật đúng số liệu mới.

Cập nhật docs/qa11-tv3.md, brief.md và AI-LOG.md đúng cấu trúc hiện có. Giữ nguyên bằng chứng cũ, ghi riêng kết quả kiểm lại; không tự đổi 123/124 thành 124/124 nếu chưa chạy đủ.

W3C Nu, responsive toàn app, F5 mọi route và toàn chuỗi chọn ảnh → trả 70% → nhận ảnh vẫn ghi chưa kiểm nếu chưa thực hiện. Giữ giới hạn đổi lịch trong Not done.

Kết thúc bằng danh sách file sửa, kết quả kiểm tra và phần còn thiếu. Dừng ở diff để tôi review, không stage, commit, push hoặc mở PR.
```


## 41. [TV1 · 27–28/11/2026 · Antigravity Assistant] Chuẩn bị & đồng bộ bản nháp PA#3 `SELF_ASSESSMENT_REPORT.md`, mục 5 `FRONTEND.md` và dọn đường dẫn cục bộ (`62c2d63`)

Tin nhắn 1:

```text
Bối cảnh: GradStudio PA#3, tách nhánh `docs/qa12-pa3-report-draft` từ `main` mới nhất (`a8236fd`, sau khi PR #32 QA8 của TV1 đã merge). Chuẩn bị trước bản nháp hồ sơ PA#3 (`SELF_ASSESSMENT_REPORT.md`) và cập nhật mục 5 (`Product owner decisions`) của `FRONTEND.md` theo bản kế hoạch 27/11/2026 để sẵn sàng chốt số liệu cuối vào mốc `QA11–QA12` (CN 29/11).

Ràng buộc bắt buộc:
1. KHÔNG sửa bất kỳ file code/contract/mock/test nào (`docs/api/`, `mock/`, `client/`, `tools/`). Chỉ sửa `SELF_ASSESSMENT_REPORT.md`, `FRONTEND.md`, `brief.md`, `AI-LOG.md`.
2. KHÔNG bịa điểm tự chấm cuối cùng, KHÔNG bịa link bài đăng PO, KHÔNG đánh dấu "đã pass" những mục chưa chạy (`QA9`, `QA10`, `QA11`, W3C Nu HTML Validator, kiểm thử zip cuối). Mọi chỗ còn chờ `QA11` ngày 29/11 phải ghi rõ nhãn `[CHỜ CHỐT QA11]`.
3. Mọi bằng chứng (commit hash, số endpoint, số ví dụ contract, số test `node:test`, số module build, số mục `brief.md` / `AI-LOG.md`, danh sách route) phải đối chiếu trực tiếp từ `main` (`a8236fd`) và `git log`.
4. Không tự chạy `git add`, `git commit`, `git push`.

Yêu cầu chi tiết:
1. **`SELF_ASSESSMENT_REPORT.md`** (ghi đè bản PA#2 cũ bằng khung hoàn chỉnh cho **PA#3 — Front end in React**, ghi rõ ở đầu file: `Trạng thái: BẢN NHÁP tại commit a8236fd — chờ chốt điểm & bằng chứng cuối sau QA11 ngày 29/11`):
   - Thông tin học phần, đồ án PA#3, danh sách 3 thành viên + MSSV (`24120184`, `24120211`, `24120354`) và mẫu tên file zip `24120184-24120211-24120354_<tổng>.zip` (`[CHỜ CHỐT QA11]`).
   - Bảng tự đánh giá đủ **9 tiêu chí theo rubric PA#3** (tổng 100 điểm):
     1. Toàn bộ luồng G1–G11 bằng React (25đ)
     2. Routing, đăng nhập, shared state (10đ)
     3. Dữ liệu từ API: loading / error / empty (10đ)
     4. Forms (10đ)
     5. Contract và mock (15đ)
     6. Responsive, semantic, valid (5đ)
     7. `brief.md` và file rules `AGENTS.md` (10đ)
     8. `AI-LOG.md` (10đ)
     9. Lịch sử commit (5đ)
   - Mỗi tiêu chí có cột: Điểm tối đa | Điểm tự chấm (`[CHỜ CHỐT QA11]`) | Bằng chứng cụ thể hiện có tại `a8236fd` (file, route, contract, test, CI, commit hash) | Phần chưa xong / cần chốt ở `QA11` (*What we did not manage*).
   - Mục 2 **What We Did Not Manage / Known Limitations**: liệt kê trung thực các phần đang chờ tích hợp `QA9`/`QA10`, W3C Nu HTML Validator, và các giới hạn đã biết theo phạm vi PA#3 (cổng thanh toán thử nghiệm thay sandbox thật, nhắc lịch mô phỏng thay SMTP, kiểm tra chữ ký file upload chuyển sang PA#4).

2. **`FRONTEND.md` (cập nhật mục 5 — *Product owner decisions*):**
   - Giữ nguyên mục 5.1 (10 quyết định PO ngày 23/11) và ghi chú rõ các điểm được cập nhật/thay thế bởi đợt QA mới 27/11 (ví dụ `B2.2` thay thế quy ước cũ cho tạo booking thay thế cùng hội thoại).
   - Bổ sung mục **5.2 (hoặc 5.3) — Đợt QA bổ sung của Product Owner (cập nhật 27/11/2026)**: bảng tóm tắt đầy đủ các quyết định `B2.1–B2.5`, `B3.1–B3.3`, `B4.1–B4.13`, `BS.1`, người phụ trách và trạng thái triển khai trung thực tại `a8236fd` (`QA8` đã xong trên `main`; `QA9` & `QA10` đang triển khai). Không tự tạo URL bài đăng PO.
   - Rà nhẹ mục 5.2 (quy ước nhóm 23/11): đánh dấu rõ dòng *Hội thoại & booking thay thế sau hủy* đã được thay bằng `B2.2` (mỗi hội thoại tối đa 1 booking, kể cả đã hủy) để tránh mâu thuẫn trong cùng tài liệu.
   - Chưa xóa các ghi chú trạng thái của TV3 trong mục 7 (*Not done*) cho đến khi `QA10` merge xong.

3. **Kiểm tra & ghi log:**
   - Xác nhận `git diff -- docs/api mock client tools` trống hoàn toàn và `git diff --check` 0 lỗi, 0 conflict markers.
   - Ghi mục tiếp theo (mục 33) vào cuối `brief.md` và `AI-LOG.md`.
```
