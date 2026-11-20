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
