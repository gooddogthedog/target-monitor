# Claude Code Status

**Updated:** 2026-07-20
**State:** Active — Tasks 2–5 complete (Claude domain track done); awaiting Codex Task 1 scaffold to run Vitest, then Task 10 safety review
**Active task:** None in progress — blocked on Codex Task 1 (root scaffold) to execute the domain test suite
**Claimed paths:**

- `src/domain/`
- `src/application/`
- `src/data/`
- `src/simulators/`
- `src/fixtures/`
- `tests/domain/`

## Handoff notes

- Acknowledged Codex handoff message `20260720-001`; reply written to `dev-com/gpt/new/reply:20260720-001.md` and the incoming message moved to `dev-com/claude/processed/`.
- Claimed paths above match the Claude-owned boundaries in the implementation plan and do not overlap Codex's paths.
- Not editing root config, the lockfile, `package.json`, or any Codex-owned UI path. Dependency requests will go through `dev-com/gpt/new/`.
- Contract changes to `src/domain/contracts.ts` will be announced to Codex through the mailbox before Codex consumes them.
- Outbound-safety invariant preserved: no send/publish/dispatcher access; the dispatcher simulator will import no network client and fail closed on any invalid, expired, reused, changed, disconnected, or ambiguous condition.
- Branch note: this workstream is committed to `claude/buddy-tihvt6` (not directly to `main`). Cross-agent mailbox delivery therefore depends on that branch reaching the shared base Codex reads.

## Completed

- Read `CLAUDE.md`, `dev-com/README.md`, both status files, the approved design spec/handoff, and the implementation plan.
- Acknowledged handoff `20260720-001`; replied and moved it to `dev-com/claude/processed/`.
- **Task 2** — `src/domain/types.ts`, `src/domain/contracts.ts`, `src/fixtures/demoData.ts`, `tests/domain/fixtures.test.ts`. All canonical types + `AppService` defined; three coherent account cases (RaceTrac, H-E-B with a blocked diagnostic gate, Bagel Brands) seeded with valid evidence→claim links. Notified Codex via `dev-com/gpt/new/20260720-002-domain-contract-ready.md`.
- **Task 3** — `src/domain/ranking.ts`, `src/domain/evidence.ts`, `src/domain/gates.ts`, `src/simulators/connectors.ts` + tests. Deterministic explainable ranking (pinned-first, then score), coverage rules that never turn absence into negative customer signals, evidence-earned gate advancement + accountable override, and an independent connector simulator.
- **Task 4** — `src/domain/approval.ts`, `src/simulators/dispatcher.ts` + tests. SHA-256 canonical payload hashing (Web Crypto), single-use authorization bound to payload hash + owner + action + expiry, and a network-free dispatcher whose only outputs are `completed` (demo) / `failed-closed` / `manual-review`. Every invalid condition (missing/expired/reused/changed/wrong-owner/missing-integration/outbound-disabled) fails closed; ambiguous → manual review, never retried.
- Verification (Vitest pending Codex Task 1 scaffold): standalone `tsc --strict` passes on all domain/simulator sources; logic runtime-validated by compiling to CJS and exercising against the seed graph — Task 3: 23/23, Task 4: 22/22 (full fail-closed matrix with `externalCalls === 0`, valid → completed demo, ambiguous → manual-review, idempotency replay denied).
- **Task 5** — `src/data/database.ts`, `src/data/dexieRepositories.ts`, `src/data/inMemoryStore.ts`, `src/application/appService.ts`, `src/application/demoAppService.ts` + `tests/domain/repositories.test.ts`, `tests/domain/app-service.test.ts`. Pure `createAppService(repos)` core over a storage-agnostic `RepositoryBundle`; `createDemoAppService` selects Dexie in the browser and a process-persistent in-memory driver elsewhere (lazy Dexie import, so jsdom tests need no `fake-indexeddb`). First-run seeding, explicit reset, append-only receipts/activity, and `PersistenceUnavailableError` on storage failure. Notified Codex via `dev-com/gpt/new/20260720-003-app-service-ready.md`.
- Files added beyond the plan's locked map, both within Claude-owned dirs: `src/application/appService.ts` (pure core) and `src/data/inMemoryStore.ts` (non-IndexedDB driver).
- Forbidden-capability scan over `src` (nodemailer/sendgrid/smtp/fetch/XHR/http(s)/sockets/social clients): **no matches** — no outbound or network surface exists.
- Verification (Vitest pending Codex Task 1): Task 5 facade runtime-validated against the in-memory driver — 22/22 (persistence across instances, ranked dashboard + brief deep links, blocked-gate→override→advance, full lock/confirm/dispatch→completed demo, edit invalidates auth, integration-down→fail-closed, wrong-owner rejected, replay→fail-closed, reset restores).

## Blocker / next

- **Blocked on Codex Task 1** (root `package.json`, Vitest/Vite/TS config). Once it lands I will run `pnpm test -- tests/domain` to turn the whole Claude suite green (currently validated via standalone tsc + CJS runtime harness only).
- Remaining Claude work: Task 10 Steps 5–6 domain/safety review when Codex requests it.
- Please confirm `dexie`, `vitest`, `jsdom` are in `package.json`.
