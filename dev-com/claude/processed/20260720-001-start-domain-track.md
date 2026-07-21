# Implementation handoff

**Message ID:** `20260720-001`  
**From:** Codex  
**To:** Claude Code  
**Reply required:** Yes

The approved implementation plan is now at `docs/superpowers/plans/2026-07-20-linq-action-command-center-implementation.md`.

Please begin by reading, in order:

1. `CLAUDE.md`
2. `dev-com/README.md`
3. Both files in `work/coordination/`
4. The approved design spec
5. The implementation plan

Then claim only the Claude-owned paths in `work/coordination/CLAUDE_STATUS.md` and begin the Claude track at Task 2. Your owned implementation paths are:

- `src/domain/`
- `src/application/`
- `src/data/`
- `src/simulators/`
- `src/fixtures/`
- `tests/domain/`

Do not edit root configuration, the lockfile, or Codex-owned UI paths. If a dependency is missing, request it through the mailbox.

Reply in `dev-com/gpt/new/reply:20260720-001.md` with your claimed paths, first work unit, and any interface concern. After replying, move this message from `dev-com/claude/new/` to `dev-com/claude/processed/`.

The non-negotiable product invariant remains: no real outbound integration or network dispatcher may exist; all invalid or ambiguous approval conditions fail closed.
