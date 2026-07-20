# Codex ↔ Claude File Mailboxes

This directory is the asynchronous communication channel between Codex and Claude Code. It complements, but does not replace, the ownership rules in `CLAUDE.md` and the status files in `work/coordination/`.

## Mailbox map

| Agent | Reads incoming messages from | Writes replies and new messages to | Moves handled incoming messages to |
|---|---|---|---|
| Codex / GPT | `dev-com/gpt/new/` | `dev-com/claude/new/` | `dev-com/gpt/processed/` |
| Claude Code | `dev-com/claude/new/` | `dev-com/gpt/new/` | `dev-com/claude/processed/` |

The direction is intentionally asymmetric. Never write a message into your own `new` directory.

## Message filenames

Every new conversation starts with a unique ID in its filename:

```text
20260720-001-short-topic.md
```

Use a timestamp plus a sequence or random suffix when creating later IDs so filenames cannot collide.

A direct reply must include the original unique ID in this exact filename form:

```text
reply:20260720-001.md
```

If more than one reply is needed, append a unique suffix while retaining the required reply marker:

```text
reply:20260720-001-02.md
```

The message body should include:

- Sender and intended recipient.
- Related task or paths.
- The decision, question, interface, blocker, or handoff.
- Whether a reply is required.

## Codex procedure

1. Check `dev-com/gpt/new/` at the beginning and end of each work unit, before expanding claims, and periodically during long work.
2. Ignore hidden placeholder files such as `.gitkeep`.
3. For every Claude message that requires a response, write the reply into `dev-com/claude/new/` using `reply:<original-id>.md`.
4. After the reply is safely written—or after a no-reply message has been fully handled—move the incoming file from `dev-com/gpt/new/` to `dev-com/gpt/processed/`.
5. Update `work/coordination/CODEX_STATUS.md` if the message changes ownership, interfaces, blockers, or completed work.

## Claude Code procedure

1. Check `dev-com/claude/new/` at the beginning and end of each work unit, before expanding claims, and periodically during long work.
2. Ignore hidden placeholder files such as `.gitkeep`.
3. For every Codex message that requires a response, write the reply into `dev-com/gpt/new/` using `reply:<original-id>.md`.
4. After the reply is safely written—or after a no-reply message has been fully handled—move the incoming file from `dev-com/claude/new/` to `dev-com/claude/processed/`.
5. Update `work/coordination/CLAUDE_STATUS.md` if the message changes ownership, interfaces, blockers, or completed work.

## Safety and collision rules

- Mail does not grant file ownership. Claims in the two status files remain authoritative.
- Do not edit, rename, move, or delete another agent's unprocessed mailbox message.
- Never edit the other agent's status file.
- If a proposed change overlaps the other agent's claimed paths, send a message and wait for agreement before editing.
- Acknowledging an interface is not permission to weaken the outbound-safety invariant.
- Do not place secrets, credentials, tokens, customer data, or real outbound payloads in these mailboxes.

## Periodic checking

There is no background daemon. Each active agent must check its own `new` directory at natural checkpoints—at minimum at task start, before a new claim, after tests, and before ending a work session.

## When the agents use separate Git clones

Dropping a file locally is not delivery until the other clone receives it. When Codex and Claude are not in the same working directory:

1. Keep work in small commits and do not leave a mailbox delivery only in an uncommitted working tree.
2. Before syncing, commit the files you own. Never stage or commit the other agent's unfinished files.
3. Refresh from `origin/main` and integrate it without force-pushing. If the push is rejected, fetch and rebase or merge the new remote commits, then retry.
4. Commit every new mailbox message and every move from `new` to `processed`, then push it to `origin/main`.
5. Pull or fetch `origin/main` before each periodic mailbox check. A message is received only after its commit is present locally.
6. Because implementation paths do not overlap, resolve unexpected code conflicts by stopping and messaging the other agent; never choose one side automatically.

Mailbox commits should be narrowly named, for example `chore(comms): message Claude 20260720-001` or `chore(comms): process reply 20260720-001`. Never force-push the shared branch.
