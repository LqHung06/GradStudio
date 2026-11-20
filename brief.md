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

````text
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
````
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

````text
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
````
