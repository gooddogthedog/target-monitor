# Claude Code + Codex Coordination

This workspace is shared by Claude Code and Codex. Prevent overlapping edits by following this protocol before changing any file.

## Source of truth

Read these first:

1. `docs/superpowers/specs/2026-07-20-linq-action-command-center-design.md`
2. `outputs/CLAUDE-CODE-HANDOFF.md`
3. Both files under `work/coordination/`

The approved design spec controls product behavior. Do not silently change its safety requirements or scope.

## Ownership protocol

Each agent writes only its own status file:

- Codex: `work/coordination/CODEX_STATUS.md`
- Claude Code: `work/coordination/CLAUDE_STATUS.md`

Before editing project files:

1. Read both status files.
2. List the exact files or narrow directories you intend to modify in your own status file.
3. Confirm the other agent has not claimed an overlapping path. A directory claim includes all descendants.
4. Only then begin edits.

If ownership overlaps, do not edit. Narrow the work, leave a request in your own status file, or ask the user to resolve ownership.

## While working

- Never edit the other agent's status file.
- Never make opportunistic changes outside your claimed paths.
- Prefer additive, isolated modules over shared-file edits.
- Record interface assumptions when another agent will consume your work.
- Do not reformat, rename, or reorganize another agent's files.
- Re-read both status files before expanding scope.

## Agent mailbox protocol

Read and follow `dev-com/README.md`. It defines the asymmetric file mailboxes used for direct Codex/Claude communication.

- **Codex reads:** `dev-com/gpt/new/`
- **Codex writes to Claude:** `dev-com/claude/new/`
- **Claude reads:** `dev-com/claude/new/`
- **Claude writes to Codex:** `dev-com/gpt/new/`

After replying to or fully handling an incoming message, each agent moves that message from its own `new` directory into its own `processed` directory. Replies use `reply:<original-unique-id>.md`. Check the respective incoming directory at task start, before new claims, after tests, and before ending a session.

If the agents run in separate Git clones, mailbox delivery additionally requires Git synchronization. Follow the cross-clone procedure in `dev-com/README.md`: commit and push each message or processed move, refresh `origin/main` before checking mail, and never force-push.

## Handoff

When a work item is complete, update your status file with:

- Completed work.
- Files changed.
- Tests or checks run.
- Interfaces or assumptions the other agent must know.
- Any remaining blocker.

Then clear the active path claims. Do not claim a task complete without fresh verification.

## Hard safety invariant

No implementation may add real outbound email or social execution to the MVP. The LLM must have no outbound credentials, send/publish tools, or direct dispatcher path. All simulated approval behavior must fail closed exactly as defined in the approved spec.

## Current state

The design is approved. The implementation plan defines the initial Codex/Claude work split. Each agent must still claim its assigned paths in its own status file before implementation begins.
