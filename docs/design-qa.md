# Design QA — Linq Action Command Center

**Date:** 2026-07-20  
**Browser:** Codex in-app Browser  
**Desktop viewport:** 1488 × 1058  
**Mobile viewport:** 390 × 844  
**Result:** Passed for the current local-only frontend scope

## Reference comparison ledger

| Flow | Approved reference | Result | Notes |
|---|---|---|---|
| Today | `04-approved-home.png` | Passed | Hierarchy, dominant next move, evidence chain, action preview, blocker, and follow-on queue match. The persistent safety header is an intentional product requirement. |
| RaceTrac account workspace | `05-approved-account-workspace.png` | Passed | Lifecycle rail, deal thesis, evidence classes, gate checklist, and next move match. The persistent safety header is intentional. |
| Portfolio progress | `08-approved-portfolio-progress.png` | Passed after correction | Initial QA found missing Active / Blocked / Needs review filters and an incomplete Account Thesis gate. Added working filters, named next moves, required artifacts, gate criteria, and explicit founder approval. |
| Exact-action approval safety | `07-approved-approval-safety.png` | Passed behaviorally | Verified exact payload locking, edit-driven invalidation, one-payload authorization, explicit presence confirmation, single-use local completion, and a receipt stating that no external provider was contacted. This approved reference is an architecture/safety contract rather than a pixel-level screen clone. |

## Interaction checks

- RaceTrac approval cannot complete before the exact payload is locked, explicitly approved, and founder presence is confirmed.
- Editing locked content invalidates approval and disables completion.
- A fresh unchanged payload produces a local-only receipt with its fingerprint and consumed authorization.
- H-E-B gate override remains disabled until reason, accountable owner, and risk acknowledgement are all supplied.
- Email and calendar can be unavailable independently; manual notes and tasks remain usable and missing sources are never interpreted as negative evidence.
- Pipeline filters work, and the Needs review filter narrows the account matrix to H-E-B and Bagel Brands.
- All ten primary routes render at 390 × 844 without horizontal overflow.
- Mobile navigation opens and closes through the menu and scrim.

## Technical verification

- `pnpm exec vitest run tests/ui`: 20 UI tests passed across 11 files.
- `pnpm build`: production build passed.
- Browser console: no application warnings or errors observed across the tested routes and flows.
- Outbound-capability scan: no email/social provider client, network send, or publish implementation exists in the frontend.
- Service integration: browser-verified a completed persisted local receipt with the email source connected, then a deterministic failed-closed result when that source was temporarily unavailable.

## Remaining integration risk

The frontend is integrated with Claude's local application service and IndexedDB/in-memory persistence. The merged shared suite currently has 80 of 81 tests passing; the remaining Claude-owned connector test rejects its own phrase `not a customer signal` because that phrase matches its prohibited-pattern regex. Claude has the owner-path fix and final safety-review request. This does not weaken the runtime fail-closed behavior, which passed browser and domain checks.
