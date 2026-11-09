# Browser regression cases

Run after `npm run build` with `npm test`. The suite launches a private static server, tests real production pages, writes JSON results, and regenerates nine full-page PNGs. Each failure stops the suite and exits nonzero. The report records only cases actually executed.

| Case | Action | Expected |
| --- | --- | --- |
| R01–R09 | Open each route at 360 / 768 / 1280 | One h1 and each landmark; no page overflow; image assets load; visible links/buttons/summary targets >=44px |
| I01 | Filter gallery, reset, keyboard open/Escape, dispatch HTML drag payload | Matching image counts, enlarged region opens/closes |
| I02 | Open chat on every route; submit blank/nonblank message; close with Escape; navigate | Validation, transcript persists across routes in the same tab, Escape closes and restores focus |
| I03 | Select Khoa, reply, search and filter, reset and return to Linh | No Admin reply initially; only Khoa changes to consulting; counts match search; Linh remains agreed |
| I04 | Next/previous resource date | Heading and actual agenda change; conflict restored on 24/10 |
| I05 | Create Linh's booking | Navigates to booking.html, GS-1024 pending, payment disabled |
| I06 | Choose booked/completed/pending filters and selected-photo view | Correct record, selected week date, payment label and artwork booking code |
| I07 | Keyboard-open account menu, Escape, open account, close | Correct expanded state, demo account content and close behavior |
| I08 | Inspect all route links/anchors, buttons, inputs and images | Destinations respond 200, anchors exist in rendered destination, no unnamed buttons / unlabelled inputs / missing alt |
| I09 | Enable reduced motion, inspect captured errors | Smooth scroll disabled, no page exceptions or failed HTTP responses |

Corrections caught during implementation: tablet polaroid exceeded viewport; source-relative artwork URL broke in production. Both were fixed before the final run. Drag regression uses synthetic HTML drag/drop events with a real DataTransfer; it does not certify native touch dragging.

External W3C validation and assistive-technology speech testing have not been performed.

Motion regression also checks that hover produces visible elevation and that `prefers-reduced-motion` disables the transition and animation. The full-page captures include the new AI-generated group image.
