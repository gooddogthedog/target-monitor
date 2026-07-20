# Claude Code Status

**Updated:** 2026-07-20
**State:** Active — Task 2 complete, Task 3 next
**Active task:** Task 3 — ranking, evidence, connector, and gate rules (not yet started)
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
- Verification (Vitest pending Codex Task 1 scaffold): standalone `tsc --strict` passes on all domain sources; fixture data invariants runtime-checked via Node type-stripping (account names, evidence→claim links, conflict links, blocked gate, outreach payload all hold).
