# HARNESS.md — Quy trình kiểm chứng & kỷ luật AI (GradStudio)

Tài liệu này mô tả hệ thống **Harness Engineering** của dự án GradStudio từ PA#2 qua PA#3 và lộ trình tích lũy bằng chứng nhiều mốc cho PA#4 / PA#5. Mọi mốc lịch sử và lệnh kiểm tra dưới đây đều dựa trên `git log` và công cụ có thật trong repository.

---

## 1. Cấu trúc Harness trong repository

| Thành phần | File / Thư mục | Vai trò trong vòng lặp làm việc với AI |
| :--- | :--- | :--- |
| **Rules (luật dự án)** | `AGENTS.md` | Quy ước cấu trúc, phân quyền sở hữu file (TV1/TV2/TV3), design tokens, accessibility, verification gates và danh sách `NEVER`. |
| **Contract-first spec** | `docs/api/README.md`, `01`–`13` | Hợp đồng API viết trước mock và UI; mọi thay đổi đều ghi vào mục `## Changes`. |
| **Prompt log** | `brief.md` | Lưu nguyên văn prompt theo thứ tự thời gian trước khi triển khai từng bước. |
| **Execution & Verification log** | `AI-LOG.md` | Ghi các file đã sửa, lỗi phát hiện/từ chối và bằng chứng kiểm tra thực tế sau mỗi task. |
| **Verification scripts** | `tools/contract-check.mjs`, `tools/tv1-rules.test.mjs`, `tools/tv2-reminders-id.test.mjs`, `tools/tv2-qa9.test.mjs`, `tools/tv3-booking-rules.test.mjs` | Kiểm tra tự động hợp đồng (40 endpoints) và các quy tắc nghiệp vụ cốt lõi (TV1, TV2, TV3) không cần phụ thuộc ngoài. |
| **Automated CI** | `.github/workflows/ci.yml` | Chạy tự động 5 Verification Gates trên mọi `push` và `pull_request` vào `main`. |

---

## 2. Timeline phát triển `AGENTS.md` (Rules)

Trích trực tiếp từ `git log --date=short --format="%h | %ad | %an | %s" -- AGENTS.md`:

| Ngày | Commit | Tác giả | Thay đổi & Lý do thực tế |
| :--- | :---: | :--- | :--- |
| `2026-11-08` | `384b437` | Lê Quốc Hưng | Khởi tạo `AGENTS.md` cho PA#2 với cấu trúc Vite multi-page và quy chuẩn giao diện Blue Theme. |
| `2026-11-19` | `8e5c4f5` | Lê Quốc Hưng | Viết lại toàn bộ `AGENTS.md` cho PA#3: quy tắc contract-first (`docs/api/`), bảng phân quyền TV1/TV2/TV3, checklist Verification Gate và danh sách `NEVER`. |
| `2026-11-22` | `3f1dc48` | Lê Quốc Hưng | Bổ sung hướng dẫn sử dụng nền front end (`useFetch`, `AsyncState`, `useForm`, `FormField`, `status.js`) và bỏ ghi chú 3 entry HTML cũ của PA#2. |
| `2026-11-22` | `cc07b27` | Lê Quốc Hưng | Cập nhật mô tả `AuthContext`, `RequireRole` và route bảo vệ vai trò sau khi hoàn thành G2 (`/sign-in`). |
| `2026-11-23` | `bb72a2b` | Lê Công Minh Nhựt | Tài liệu hóa props và mẫu tích hợp cho shared chat components (`ChatThread`, `ProposalCard`). |
| `2026-11-23` | `9c14d5b` | Lê Quốc Hưng | Sửa lỗi ví dụ payload proposal trong `AGENTS.md` từ `{status}` sang `{decision}` (R16), cập nhật giới hạn upload 5 MiB (`5 242 880` byte) và tóm tắt quyết định PO / quy ước nhóm 23/11. |
| `2026-11-24` | `1c2073b` | Lê Quốc Hưng | Bổ sung tham chiếu tới bộ kiểm thử hồi quy `node:test`, 5 gates trong `.github/workflows/ci.yml` và tài liệu `HARNESS.md` (R17). |

*(Lịch sử commit tiếp theo trên `AGENTS.md` tiếp tục được theo dõi trực tiếp qua `git log -- AGENTS.md`.)*

---

## 3. Danh sách Verification Gates (Local = CI)

Toàn bộ 5 gate dưới đây chạy tự động trong `.github/workflows/ci.yml` (Node 20) và tái lập y hệt trên máy thành viên trước khi mở PR:

| Gate | Mục tiêu | Lệnh chạy local (= CI) | Điều kiện FAIL |
| :--- | :--- | :--- | :--- |
| **Gate 1 — Syntax & Seed JSON** | Chặn lỗi cú pháp ES module mock/tools và file JSON seed hỏng | `for f in mock/server.mjs mock/lib/*.mjs mock/routes/*.mjs tools/*.mjs; do node --check "$f"; done` + `JSON.parse` mọi `mock/data/*.json` | Bất kỳ file `.mjs` lỗi cú pháp hoặc `.json` không parse được. |
| **Gate 2 — API Contract Check** | Đảm bảo 100% endpoint/ví dụ trong `docs/api/` khớp câu trả lời thật của mock | Khởi động `node mock/server.mjs` mới + `node tools/contract-check.mjs --base http://127.0.0.1:3001` | Có ví dụ lệch status / thiếu field, hoặc bảng endpoint `README.md` chưa đủ ví dụ. |
| **Gate 3 — Business Rules Tests** | Kiểm tra các quy tắc nghiệp vụ trọng yếu bằng `node:test` | `node --test tools/tv1-rules.test.mjs tools/tv2-reminders-id.test.mjs tools/tv2-qa9.test.mjs tools/tv3-booking-rules.test.mjs` | Bất kỳ assertion nghiệp vụ nào thất bại (`FAIL`). *(Ca `TODO` ghi rõ bàn giao còn chờ được giữ tách biệt, không ngụy tạo thành pass.)* |
| **Gate 4 — Client Production Build** | Đảm bảo ứng dụng React/Vite đóng gói sạch từ `package-lock.json` | `cd client && npm ci && npm run build` | Lỗi import, cú pháp JSX hoặc đóng gói Vite thất bại. |
| **Gate 5 — Repo Hygiene** | Chặn sót conflict markers sau khi merge chéo giữa các thành viên | `git grep -n -E '^(<<<<<<<|=======$|>>>>>>>)' -- client docs mock tools '*.md' '*.yml'` | Xuất hiện marker xung đột Git chưa xử lý ở bất kỳ file nào. |

**Kiểm tra giao diện thủ công / bán tự động theo từng màn hình (không thay bằng CI):**
- `npx vite preview --port 4173` kèm 4 chế độ `MOCK_MODE` (`normal`, `slow`, `error`, `empty`), mở trực tiếp URL và F5.
- Responsive tại `360px`, `768px`, `1280px` (0 cuộn ngang, tap target ≥ 44px) và W3C Nu HTML Checker.

---

## 4. Phần chưa bật ở PA#3 & Lộ trình sang PA#4 / PA#5

1. **Linter / Formatter (`eslint`, `prettier`):**
   - Trong PA#3, nhóm chọn **Phương án A** (chưa thêm `eslint` / `prettier` vào `client/package.json`) vì TV2 (G7/G9) và TV3 (G4–G6/G10) đang phát triển song song trước mốc M5; thêm dependency và reformat diện rộng lúc này dễ gây xung đột file chéo và sai quy tắc `AGENTS.md` về việc thống nhất trước khi thêm thư viện.
   - **Mốc bật tiếp theo:** Ngay sau khi hoàn tất tích hợp M5/M6 của PA#3 (hoặc ở commit thiết lập đầu PA#4), TV1 cùng TV2/TV3 thống nhất cấu hình ESLint + Prettier, ghi vào `FRONTEND.md` mục *Libraries*, và bổ sung **Gate Lint / Format** vào `.github/workflows/ci.yml`.
2. **Chuyển tiếp sang PA#4 (Express Back-end):**
   - Áp dụng quy trình **test đỏ commit trước code làm test xanh** cho các quy tắc nghiệp vụ `R1`–`R9` và bảo mật `S1`–`S5` (upload magic bytes, xác thực sandbox thanh toán, dữ liệu bền vững, SMTP).
   - Giữ nguyên bộ `contract-check` và CI từ PA#3, thay đầu cuối kiểm thử từ `mock/server.mjs` sang máy chủ Express thật để bảo toàn lịch sử tiến hóa qua nhiều mốc cho hồ sơ **PA#5**.
