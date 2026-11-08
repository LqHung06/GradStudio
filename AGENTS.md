# Project Rules — GradStudio PA#2

These are team rules and acceptance targets. They must not be mistaken for claims that every check has already passed. The user’s explicit, later instructions take precedence over `design.md` where they conflict. Keep `PROTOTYPE.md`, `brief.md`, `AI-LOG.md`, and `SELF_ASSESSMENT_REPORT.md` consistent with the delivered behavior and evidence.

## Tech Stack

- React 19 and Vite 7, with three HTML entries: `index.html`, `studio.html`, `booking.html`. `npm run build` runs `vite build && node scripts/prerender.cjs`, writing `dist/` with all three pre-rendered HTML entries and assets; test through a local HTTP server with JavaScript enabled (pre-rendered HTML inside `#root` also ensures static fallback and direct W3C file validation). The course announcement explicitly allows React and requires submitting `dist/` and documenting page paths.
- Plain CSS organized sequentially in `src/styles/` (`base-and-pages.css`, `responsive-layout.css`, `chat-and-motion.css`, `studio-workspace.css`, `editorial-refinements.css`) and mirrored in `src/styles.css`; no CSS framework, external runtime font or CDN. React source is modularized into `src/data/fixtures.js`, `src/components/Layout.jsx`, `src/components/FloatingChat.jsx`, `src/pages/HomePage.jsx`, `src/pages/StudioPage.jsx`, `src/pages/BookingPage.jsx`, and `src/main.jsx`. Existing packages are in `package.json`; do not add dependencies or a framework unless needed and authorized.
- Shared header/footer; actual page navigation uses relative links such as `index.html`, `studio.html`, `booking.html` and real anchors such as `#dich-vu` and `#quy-trinh`. No new route without a requirement.
- Data and interaction are local prototype fixtures: no backend, authenticated account, real chat delivery, real reservation or payment gateway. Sending a demo message changes local state; customer chat persists in `sessionStorage` within the tab. “Tạo booking” navigates to an existing pending-deposit fixture, not a server write. No successful payment is simulated.
- The shared chat opens from a launcher on the three routes where it is rendered. On narrow screens, the chat panel must enter normal document flow rather than overlaying page content; on desktop it may remain a floating panel. Keep the visible demo notice, close control, Escape handling and focus restoration. On Studio, the conversation transcript and reply form must remain in normal page flow without a nested transcript scrollbar.

## Design Tokens & Spacing Scale (Blue Theme)

- Blue Theme palette tokens in `:root`:
  - `--primary: #2F6099` (Blue)
  - `--primary-dark: #1D3E5C` (Deep Navy Blue)
  - `--primary-light: #DFEEFC` (Light Pale Blue)
  - `--primary-hover: #244F80` (Darker Blue)
  - `--primary-soft: #EDF5FD` (Soft Blue)
  - `--paper: #DFEEFC` (Pale Blue Background)
  - `--surface: #FFFEFA` (Warm White Surface)
  - `--ink: #242424` (Dark Charcoal Text)
  - `--muted: #66645F` (Muted Gray Text)
  - `--line: #D8DDE5` (Soft Neutral Border)
  - `--coral / --accent: #B94D32` (Terracotta Accent)
- Spacing scale:
  - `--space-1: .25rem` (4px)
  - `--space-2: .5rem` (8px)
  - `--space-3: .75rem` (12px)
  - `--space-4: 1rem` (16px)
  - `--space-6: 1.5rem` (24px)
  - `--space-8: 2rem` (32px)
  - `--space-12: 3rem` (48px)
  - `--space-16: 4rem` (64px)
- Typography: Georgia for editorial display headings and system-ui for body/interface text. Target body copy of at least 16px; annotations and compact badges use clear proportional type. Tabular numerals for prices and times.
- Scroll Background: Single fixed, pointer-transparent layer with smooth transitions across document scroll progress. Reduced motion keeps the initial tone.
- Contrast: Target WCAG AA 4.5:1 for normal text and 3:1 for large text/interactive borders.

## Breakpoints & Layout

- Responsive thresholds: **360px** (mobile), **768px** (tablet), **1280px** (desktop), plus **1440px** (large desktop).
- No horizontal scrolling at any width (`document.documentElement.scrollWidth <= window.innerWidth`).
- Tap targets: standalone links, buttons, and form controls have a minimum height of 44px (or 43px margin) for touch accessibility.
- Long text wrapping: flexible flex/grid wrapping for Vietnamese names, service titles, and booking codes.

## Semantic HTML & Accessibility Rules

- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>` on every page.
- Exactly one `<h1>` per page with a logical heading outline (`<h1>` → `<h2>` → `<h3>`) without skipping levels.
- Interactive elements: Real `<button>` for state toggles and modals; real `<a href="...">` with relative destinations for page routing.
- Forms: Associated `<label for="...">` on every form input.
- Images: Descriptive `alt` attribute on every illustrative image; empty `alt=""` for purely decorative images.
- ARIA: `aria-label` used only on elements with interactive or landmark roles (`role="region"`, `role="group"`, `button`, etc.).
- W3C Nu HTML Checker: **0 errors and 0 warnings** across all three pre-rendered pages (`dist/index.html`, `dist/studio.html`, `dist/booking.html`), verified directly against `https://validator.w3.org/nu/?out=text` and saved in `checks/validator-{index,studio,booking}.txt`.
- Accessibility: `:focus-visible` styling on all keyboard-focusable elements; support for `prefers-reduced-motion`.

## Canonical Story & State

- Linh asks for 24/10/2026 at 09:00; makeup artist Mai is busy 08:00–12:00.
- Agreed schedule: Mai makeup 13:00–14:00, Tuấn photography 14:00–16:00 at Phòng B.
- GS-1024: `Tốt nghiệp cá nhân`, `Gói Tốt nghiệp Premium`, total 1.800.000đ, 30% deposit 540.000đ, remaining 1.260.000đ.
- Status: `Chờ cọc 30%`.
- Conversation statuses: `Chưa trả lời`, `Đang tư vấn`, `Đã chốt lịch`, `Hoàn thành`.
- Booking statuses: `Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`.
- Slot retention rule: The agreed slot is **not officially held** until the 30% deposit succeeds and resources are re-checked.

## Verification Gate

1. `npm run build`: Multi-page build writes `dist/` with `index.html`, `studio.html`, `booking.html`, CSS, and JS chunks.
2. `npm test`: Automated Chromium/Playwright suite (`tests/ui.test.cjs`) verifies all 31 test suites across 360px, 768px, 1280px, 1440px viewports, responsive overflow, tap targets, navigation, and saves results to `checks/ui-test-results.json`.
3. Screenshots: 9 responsive full-page screenshots saved under `screenshots/`: `<page>-{360,768,1280}.png`.
4. W3C Checker: Official Nu HTML Checker (`https://validator.w3.org/nu/?out=text`) outputs saved in `checks/validator-{index,studio,booking}.txt` with **0 errors and 0 warnings**.

## NEVER

- Never run `git add`, `git commit`, or `git push` (prohibited by execution environment rule).
- Never introduce real-person photos without verified rights and provenance, or misrepresent generated images as actual client work.
- Never add demo-control bars such as `Màn 1 / Màn 2 / Màn 3`, reset-demo controls, fake payment-success modals, or misleading claims of real service delivery.
- Never claim a slot is reserved on agreement alone, or enable real payment when no integration exists. Keep the disabled deposit control and adjacent explanation.
- Never create placeholder links, unlabeled icon-only controls, fake buttons or enabled controls without a visible outcome.
- Never put the Studio transcript/reply form inside a nested scrollbar, truncate essential resource labels, or show conflict by color alone.
- Never introduce overflow-hiding on page roots, unapproved UI frameworks, unnecessary dependencies or ordinary styling `!important` to force a layout.
- Never mark unrun tests, W3C validation, contrast, manual accessibility, browser coverage or implementation work as passed.
