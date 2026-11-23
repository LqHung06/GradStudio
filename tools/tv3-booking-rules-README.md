# TV3 booking rules regression — 23/11/2026

Run from the repository root, using Node built-in modules only:

```sh
node --test tools/tv3-booking-rules.test.mjs
```

The suite loads fresh copies of all seed JSON for each handler test and starts a
separate real mock for each HTTP mode. It never edits seed data, dependencies or
another member's routes. HTTP checks use ephemeral local ports; no existing mock
needs to be stopped. Child processes are closed after each case.

Observed result on this task: **19 cases: 15 PASS, 0 FAIL, 4 TODO**. TODO callbacks
actually run and currently fail their acceptance assertions; they are not passes.
They document missing handoffs and keep the independent TV3 suite runnable:

| Handoff | Observed | Required |
|---|---|---|
| TV2 R04 reminder recalculation | queued reminder still has old time/text | new earliest milestone minus settings lead time, updated staff/room text |
| TV2 R05 stop unsent reminder | queued reminder remains | cannot be sent after cancellation; sent history retained |
| TV1 R06 PATCH job after cancel | 200 | 409 and no mutation |
| TV1 R06 upload after cancel | 201 | 409 and no mutation |

Once a member delivers the corresponding contract/helper/handler, remove the
relevant TODO annotation, run that case as a required gate and record its result.
Do not change expected assertions to match the current failures.

R03 works for existing jobs that can be mapped one-to-one by kind. Repeated kinds
or a changed set of kinds with existing jobs return 409 atomically until TV1
specifies job identity/lifecycle mapping. This limitation is not a PO rule.
Without existing jobs, ordinary validated schedules are accepted and no jobs
are created by rescheduling. Reminder integration remains pending even when the
booking/job assertions pass.

The tested independent paths cover direct rescheduling, self-exclusion and full
database immutability on clash/validation failure; cancellation with job/payment
history and released resources; fresh accepted replacement and ownership; new
conversation IDs/first replies; package-only pricing with a private test price
of 1,800,005 VND (deposit 540,002, remaining 1,260,003).

The real HTTP checks cover new conversations/list in normal/slow/error/empty,
plus Admin/customer authorization, direct rescheduling and cancellation in
normal mode. They do not prove full frontend flow or all booking mutations in
all four modes.

For the whole ordered contract chain, start a fresh mock in one terminal:

```powershell
$env:PORT = '3001'
$env:MOCK_MODE = 'normal'
node mock/server.mjs
```

Then, in another terminal:

```sh
node tools/contract-check.mjs --base http://localhost:3001
```

Observed on a fresh normal mock (isolated port 33491 in this session):
**101/101 examples answered as written, 0 FAIL; endpoint coverage 39/39**.
This is the updated chain, including direct G10 changes and supplemental
replacement/new-conversation examples. The checker verifies status and field
names by default; strict values were not run. Timestamp/list-length notes from
existing contracts remain; the regression suite asserts the business values
separately. No old 99/99 result is used as evidence.

Other checks run: `node --check` for all 16 mock modules and this test module;
JSON parsing for all 14 seeds; `git diff --check`. No frontend build or W3C check
was run for this backend task.

TV2 handoff requested (interface to agree, not implemented here):
`prepareBookingReminders(db, previousBooking, nextBooking)` returns staged
changes without modifying db. Contract 07 must define version identity and how
to stop unsent reminders while preserving sent history and queued/sent/failed.
Acceptance must cover lead times 1/24/168, earliest makeup versus shoot, changed
staff/room, sent history plus a new schedule, reruns without duplication,
cancellation stopping unsent reminders, and no reminder for unreserved bookings.
No fake/no-op helper has been added. TV3 must integrate the delivered helper
before treating the complete change/cancel flow as done.

Review order for Kiệt: contract Changes and the G10 chain; conversations/bookings
replacement rules; admin schedule/cancel mutation boundaries; run this suite and
the complete fresh contract chain; review the four TODOs and pending schema
without treating them as approved implementation.
