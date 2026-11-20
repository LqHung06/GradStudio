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
