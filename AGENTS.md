# Project Rules — GradStudio PA#3 (React front end + API contract)

These rules apply to every assistant working in this repository. They are targets, not claims that a check has passed. The user's explicit, later instructions take precedence over this file. When sources disagree, the order is: PA#3 rubric → GradStudio final project brief → `docs/api/` → this file.

PA#3 builds the **whole main flow G1–G11 for four roles** (Customer, Admin, Staff, Superadmin) as a React app in `client/`. **Every piece of data comes from an API** that is written down first in `docs/api/` and answered by `mock/server.mjs`. In PA#4 an Express server replaces the mock on the same port without the front end changing.

## Repository layout

- `client/` — the only front end: React 19 + Vite 7. Built output `client/dist/` is not committed; it is built right before the zip is made.
- `docs/api/` — the API contract. `README.md` first (base path `/api`, `Authorization: Bearer <token>`, one error shape, status codes, the table of every endpoint). Then one file per resource, numbered in flow order (`01-auth.md`, `02-catalog.md`, …). Each file ends with a `## Changes` section.
- `mock/server.mjs` — mock API on port 3001 (`PORT`), Node built-in modules only, no `package.json`. Data from `mock/data/*.json`, kept in memory, reset on restart. `MOCK_MODE` = `normal` (~150 ms) | `slow` (2 s) | `error` (500 for everything except sign-in) | `empty` (every list `[]`). One log line per request: method, path, status.
- `tools/contract-check.mjs` — sends every example in `docs/api/*.md` to a freshly started mock and compares status and field names (see `tools/contract-check-README.md`).
- `FRONTEND.md` (team, how to run, demo accounts, routes, product-owner decisions, libraries, not done) · `brief.md` (verbatim prompts given for PA#3) · `AI-LOG.md` (entries under `## PA#3`) · `SELF_ASSESSMENT_REPORT.md`.
- PA#2 files at the root (`PROTOTYPE.md`, `design.md`, `Proposal.md`, `UI/`, `screenshots/`, `checks/`, `docs/pa1/`) are history. Read them for design reference; do not update them.

## Ownership — ask before editing a file another member owns

| Member | Steps | Contract (`docs/api/`) | Front end |
|---|---|---|---|
| TV1 Lê Quốc Hưng | G2, G8, G11, foundation | `README.md`, `01-auth`, `08-jobs`, `12-admins`, `13-settings` | `api/`, `auth/`, `hooks/`, shared `components/`, `constants/status.js`, `App.jsx`, `routes/staff.jsx`, `routes/superadmin.jsx`, `mock/server.mjs` |
| TV2 Đặng Hoàng Tuấn Kiệt | G1, G3, G6 (customer), G7, G9 | `02-catalog`, `06-payments`, `07-reminders`, `09-gallery`, `11-receive` | `routes/public.jsx`, `routes/customer.jsx`, `pages/public/`, `pages/customer/` |
| TV3 Lê Công Minh Nhựt | G4, G5, G6 (admin), G10 | `03-conversations`, `04-availability`, `05-bookings`, `10-admin-bookings` | `routes/admin.jsx`, `pages/admin/`, `components/chat/`, `mock/lib/clash.mjs` |

## Tech stack

- React 19 and Vite 7 in `client/`. Router: `react-router-dom` with `BrowserRouter`, single entry `client/index.html`.
- Plain CSS in `client/src/styles/`; no CSS framework, CDN or external runtime font.
- No form library: `src/hooks/useForm.js` + `src/components/FormField.jsx`.
- No other dependency, framework or library without asking the user first.

## Commands

- `node mock/server.mjs` — mock on port 3001. Modes: `MOCK_MODE=slow node mock/server.mjs` (`slow` | `error` | `empty`).
- `cd client && npm ci && npm run dev` — dev server; `/api` is proxied to `http://localhost:3001`.
- `cd client && npm run build && npx vite preview` — the build the lecturer marks, same proxy.
- `node tools/contract-check.mjs --base http://localhost:3001` — on a freshly restarted mock, every time.

## Front-end structure

- `src/api/client.js` — `apiFetch(path, { method, body, signal })` and `ApiError { status, code, message, fields, details }`: relative `/api/...` paths only, adds `Authorization: Bearer`, leaves `Content-Type` unset for `FormData`, handles 401.
- `src/hooks/useFetch.js` — `useFetch(path)` returns `{ data, error, loading, reload, setData }`, sends one request per mount/path change, aborts on unmount, skips when `path` is falsy.
- `src/components/AsyncState.jsx` — renders loading (`role="status"`), error with a **Thử lại** button (`role="alert"`), or `emptyMessage` when `isEmpty`.
- `src/hooks/useForm.js` + `src/components/FormField.jsx` — validates after first submit, maps API 400 `err.fields` onto fields, keeps entered values on error, blocks double submits via `submitting`, focuses first invalid field.
- `src/components/Layout.jsx`, `src/components/StatusBadge.jsx`, `src/components/Money.jsx` — shared shell, accessible text status badges, tabular VND amounts.
- `src/constants/status.js` — the ONLY place that turns status codes into Vietnamese labels, plus `formatMoney` and `formatDate`.
- `src/routes/{public,customer,admin,staff,superadmin}.jsx` — export arrays of `{ path, element }` merged by `src/App.jsx` (with `<Route path="*" element={<NotFoundPage />} />`).
- `src/auth/AuthContext.jsx` (`useAuth()`: `{ user, token, ready, signIn, signOut }`, `ROLE_HOME`, `canRoleAccessPath`) and `src/auth/RequireRole.jsx` (`<RequireRole roles={['admin']}>`). `Layout` reads `useAuth()` automatically.
- `src/pages/SignInPage.jsx` (`/sign-in`), `src/pages/ForbiddenPage.jsx`, `src/pages/NotFoundPage.jsx`.
- `src/data/fixtures.js` is PA#2 legacy: new code must not import it. Its story data lives in `mock/data/`.

### Using the shared hooks and components (for TV2/TV3)

#### Shared chat components (TV3 · 23/11/2026)

Import named exports (paths relative to `src/`):

```jsx
import { ChatThread } from './components/chat/ChatThread.jsx';
import { ProposalCard } from './components/chat/ProposalCard.jsx';
```

Both import `src/styles/chat-components.css` automatically; no extra stylesheet import
is needed. Keep the app's existing token stylesheet and `styles/foundation.css` loaded.
They have no API calls, page landmarks or headings. Parent screens own loading/error
states, authentication, API requests and replacing messages from responses.

- `ChatThread.messages: Message[] = []`: response objects from README / 03-conversations,
  including `author`, `from: 'customer' | 'studio'`, `at`, and type text/request/proposal.
- `viewerRole: 'customer' | 'admin'` is required: admin views the studio side.
- `onSend(text): Promise<void>` is required. Resolve only after successful sending and
  updating parent state from the API response. Reject on failure; do not swallow errors.
  The form clears only after resolution. Rejection retains text; `fields.text` appears
  beside the textarea, other `message` errors appear in an alert. Double submits are
  blocked by `useForm`; `sending: boolean = false` can also lock the form externally.
- `renderProposal?: (proposal: Proposal) => ReactNode`: omitted uses ProposalCard.
- Optional compatible extension `sendError: { fields?: { text?: string }, message?: string } | null = null`
  supports errors owned by the parent; parent must clear it on edit/retry/success as
  appropriate. For failure semantics, still reject `onSend` rather than resolving it.
- `ProposalCard.proposal: Proposal` is required: `{ id, status, date, items, note }`.
  Items are response ScheduleItem `{ kind, start, end, staff: {id,name}, room: {id,name} | null }`;
  empty items and null room are supported. Never pass request staffId/roomId here.
- `ProposalCard.actions: ReactNode = null`: caller owns all buttons, handlers and
  pending/error states; the card never changes status or creates buttons.
- Dependencies supplied by Hưng: `useForm`, `FormField`, `formatDate`, `JOB_KIND`,
  `PROPOSAL_STATUS`, `getStatusLabel` in `constants/status.js`. All exist on main.

Admin integration (inside a screen that already loaded `conversation`):

```jsx
<ChatThread messages={conversation.messages} viewerRole="admin"
  onSend={async (text) => {
    const result = await apiFetch(`/api/conversations/${conversation.id}/messages`, {
      method: 'POST', body: { text },
    });
    setConversation(current => ({ ...current, messages: [...current.messages, result.message] }));
  }} />
```

Customer integration: connect the components through `renderProposal`. Here
`reply(proposal, status)` belongs to the screen: it PATCHes the documented proposal
endpoint with `{status: 'accepted' | 'declined'}`, updates from the response, and
handles action failures; `replying` is its pending state. Only render actions when
the flow allows a reply; status text alone does not imply the slot is held.

```jsx
<ChatThread messages={conversation.messages} viewerRole="customer" onSend={sendMessage}
  renderProposal={proposal => <ProposalCard proposal={proposal}
    actions={proposal.status === 'pending' && <>
      <button type="button" disabled={replying} onClick={() => reply(proposal, 'accepted')}>Đồng ý</button>
      <button type="button" disabled={replying} onClick={() => reply(proposal, 'declined')}>Từ chối</button>
    </>} />} />
```

Use API response data directly (README example p-2 contains makeup 13:00–14:00
with staff object and null room, then shoot 14:00–16:00 with staff/room objects).
Test data belongs in a separate temporary harness, never in these components.

```jsx
// Data loading with AsyncState + StatusBadge + Money:
const { data, error, loading, reload, setData } = useFetch('/api/bookings');
const bookings = data?.bookings || [];
return (
  <Layout user={user} onSignOut={signOut}>
    <h1>Lịch chụp của tôi</h1>
    <AsyncState loading={loading} error={error} onRetry={reload} isEmpty={!bookings.length} emptyMessage="Bạn chưa có lịch chụp nào.">
      {bookings.map((b) => (
        <div key={b.code}>
          <StatusBadge map={BOOKING_STATUS} status={b.status} />
          <Money amount={b.price} />
        </div>
      ))}
    </AsyncState>
  </Layout>
);

// Forms with useForm + FormField:
const form = useForm({
  initial: { note: '' },
  validate: (v) => (!v.note.trim() ? { note: 'Vui lòng nhập ghi chú' } : {}),
  onSubmit: async (v) => {
    const res = await apiFetch('/api/...', { method: 'PATCH', body: v });
    setData(res);
  },
});
// <form onSubmit={form.handleSubmit} noValidate>
//   <FormField name="note" label="Ghi chú" value={form.values.note} error={form.errors.note} onChange={form.handleChange} />
//   <button type="submit" disabled={form.submitting}>Lưu</button>
// </form>
```

## Data and API rules

1. `docs/api/` is the specification. Call only the endpoints in the table of `docs/api/README.md`, with exactly the method, path, body and field names written there. If an endpoint or a field is missing, **stop and say so** — do not invent it.
2. Do not edit `docs/api/` or `mock/` unless the user asks for that change in the current request. Never "fix" a mismatch by changing the contract or the mock to match the code.
3. Front-end code calls only relative `/api/...` paths through `src/api/client.js`. Never `http://localhost…`.
4. Nothing the user sees on a main-flow screen is written into a component: packages, prices, conversations, messages, bookings, staff, rooms, photos, reminders, accounts and settings all come from the API. Fixed UI text (headings, labels, button text, help text, empty and error messages) may be in components.
5. Every screen that loads data uses `useFetch` + `AsyncState`: loading, error with **Thử lại** (works again without a page reload once the mock is back to normal), and an empty message for every list.
6. After an action (send a message, create a booking, pay, choose photos…) the screen updates from the API's answer, without a page reload.
7. The signed-in user and the token live in `AuthContext` and are read through `useAuth()`. Every request after sign-in carries `Authorization: Bearer <token>`. Signed out, a protected route sends the user to `/sign-in` and back to that route after sign-in; a role opening another role's route is turned away. Changing role is signing out and signing in.
8. Payments go through the test gateway route `/test-gateway/:paymentId`, labelled plainly as a test payment, offering success and failure. The result page reads the real status from `GET /api/payments/:id`, never from the query string.

## Forms

- Every input has a visible `<label>`; groups of checkboxes use `<fieldset>` + `<legend>`.
- Before sending, check what the contract requires. After the first submit attempt, show one message per field next to it, linked with `aria-describedby`; set `aria-invalid`; focus the first invalid field.
- A `400` from the API shows its `fields` messages on the matching fields. What the user typed stays after an error.
- The submit button cannot send twice while a request is out.
- The preview upload refuses a wrong type or a too-large file before sending, with the limits from the contract.
- Do not validate "the date must be in the future": the story date 24/10/2026 is already in the past.

## Design tokens & spacing scale (Blue Theme, kept from PA#2)

- Palette tokens in `:root`: `--primary: #2F6099`, `--primary-dark: #1D3E5C`, `--primary-light: #DFEEFC`, `--primary-hover: #244F80`, `--primary-soft: #EDF5FD`, `--paper: #DFEEFC`, `--surface: #FFFEFA`, `--ink: #242424`, `--muted: #66645F`, `--line: #D8DDE5`, `--coral / --accent: #B94D32`.
- Spacing scale: `--space-1: .25rem`, `--space-2: .5rem`, `--space-3: .75rem`, `--space-4: 1rem`, `--space-6: 1.5rem`, `--space-8: 2rem`, `--space-12: 3rem`, `--space-16: 4rem`. Use the tokens; no ad-hoc pixel values for spacing.
- Typography: Georgia for editorial display headings, system-ui for body and interface text; body copy at least 16px; tabular numerals for prices and times.
- Contrast: WCAG AA 4.5:1 for normal text, 3:1 for large text and interactive borders.
- New screens reuse the existing tokens, buttons, cards and badges so the three members' screens look like one product.

## Breakpoints & layout

- Every route works at **360px**, **768px** and **1280px** (and 1440px): no horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`), nothing cut off.
- Standalone links and buttons are at least 44px tall at 360px.
- Long Vietnamese names, package titles and booking codes wrap; resource and calendar labels are never truncated with `…`.
- The page has one scrollbar: no nested scroll container that hides the chat or the booking form.
- The chat lives in the page flow on its own route. Never a floating chat panel over the content (`position: fixed` chat), at any width.

## Semantic HTML & accessibility

- Landmarks `<header>`, `<nav>`, `<main>`, `<footer>` on every screen.
- Exactly one `<h1>` per screen; headings in order without skipping levels.
- Actions are `<button>`; moving between screens is a router `<Link>`/`<NavLink>` (renders `<a href>`). The browser Back button goes back.
- Images: descriptive `alt` for illustrative images, `alt=""` for decorative ones.
- A status, a clash or a selection is shown with text (and an icon if wanted), never by colour or hatching alone.
- `aria-label` only on interactive or landmark elements. `:focus-visible` on every focusable element; respect `prefers-reduced-motion`.
- 0 errors in the W3C Nu HTML Checker on the rendered HTML of the main screens (copy `<html>` from DevTools).
- No errors in the browser Console.

## Canonical story & names

- Linh (customer, display name "Linh") asks for Saturday 24/10/2026 at 09:00 with make-up. Make-up artist Mai is busy 08:00–12:00 (booking GS-1021).
- Agreed schedule: make-up 13:00–14:00 with Mai, shoot 14:00–16:00 with Tuấn in Phòng B. Admin Thảo creates booking **GS-1024**: `Tốt nghiệp cá nhân`, `Gói Tốt nghiệp Premium` (2 hours, 30 edited photos), 1.800.000đ, deposit 540.000đ, remaining 1.260.000đ.
- Conversation labels: `Chưa trả lời`, `Đang tư vấn`, `Đã chốt lịch`, `Hoàn thành`. Booking labels: `Chờ cọc 30%` (G7 may show `Đã thống nhất lịch · Chờ cọc 30%`), `Đã đặt lịch`, `Hoàn thành`. The API sends codes; `src/constants/status.js` maps them.
- The slot is held **only after the 30% deposit succeeds and resources are re-checked**. Never say "giữ lịch" at the agreement step.
- Button names follow the brief: `Tạo booking`, `Thanh toán cọc 30%`, `Nhận ảnh`.
- Images: the illustrations in `client/public/art/` are AI-generated (GPT) fictional people, source stated in `FRONTEND.md`; previews and samples are SVGs in `client/public/samples/`. No photos of real people.

## Verification gate — how "done" is checked

1. `cd client && npm run build` succeeds.
2. With the mock in `normal`, `slow`, `error` and `empty`: loading shown, error + **Thử lại** recovers without a page reload, every list shows an empty message.
3. Every route in the *Routes* table of `FRONTEND.md` opens directly after sign-in and after F5; a route that exists only after a step shows a message, not a blank screen.
4. At 360, 768 and 1280px: no horizontal scroll, tap targets ≥44px.
5. The mock's log shows only endpoints from the contract, no 404, no repeated requests (check on the build, not `npm run dev`).
6. `git diff -- docs/api mock` is empty unless the user asked for that change.
7. When the contract or the mock changed: `node tools/contract-check.mjs` on a freshly started mock shows 0 FAIL.

When done, list the files changed and the endpoints called. Report only checks you actually ran.

## NEVER

- Never run `git add`, `git commit` or `git push`; the member commits after reading the diff.
- Never edit `docs/api/` or `mock/` without an explicit request, and never change them to match the code.
- Never call an endpoint missing from `docs/api/README.md`, or an absolute URL.
- Never hard-code business data in a component, or import `src/data/fixtures.js` in new code.
- Never add a dependency, framework or CSS framework without asking.
- Never use `href="#"`, placeholder links, links that open nothing, or enabled controls with no outcome. A button may be disabled only where the flow itself disables it (`Tạo booking` before the customer agrees), with the reason visible next to it.
- Never add demo controls: `Màn 1 / Màn 2 / Màn 3`, reset-demo, simulated replies, fake payment modals, role switchers.
- Never float the chat over the page, put the chat or booking form in a nested scrollbar, truncate resource labels, or show a clash by colour alone.
- Never promise the slot is held before the deposit succeeds.
- Never use photos of real people.
- Never use `!important` to force a layout or hide overflow on page roots.
- Never mark an unrun test, W3C check, width check or mock-mode check as passed.
