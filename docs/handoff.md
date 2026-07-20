# Claude Code Handoff: Linq Action Command Center

**Date:** July 20, 2026  
**Status:** Design checkpoint. Approved direction, not ready for implementation yet.  
**Workspace:** `/Users/caleb/Documents/Codex/2026-07-20/referenced-chatgpt-conversation-this-is-untrusted-2`

## Objective

Design an internal, AI-first operating system for a small founder-led Linq team. It must take a prospective customer from a corporate name through research, qualification, outreach, discovery, diagnostic, pilot, business case, rollout design, and final proposal.

The product is the team's primary source of truth. Its home screen answers: **“What should we do next?”**

## Product Direction Approved by the User

The overall product is an **Action Command Center**. The selected home-screen model is **one explainable next-best move**, with two supporting views:

- **Today:** one recommended action, why it outranks other work, evidence, confidence, stage impact, prepared artifact, and approval requirement.
- **All Actions:** the complete ranked queue with owners, deadlines, blockers, and manual reprioritization.
- **Daily Brief:** meaningful changes and the top three decisions for founder review.

The other main navigation destinations are Targets, Pipeline, Evidence, Approvals, and Library.

## User Decisions

- Primary user: small founder-led team.
- System role: primary source of truth, not a CRM add-on.
- AI posture: AI-first operating partner.
- Consequential actions: approval-gated.
- Morning priority: “What should we do next?”
- Source scope: public web, email, calendar, uploaded files, and documents, but integrations must remain optional.
- Process control: guided gates with accountable overrides.
- Visual direction: selected “Next Best Move,” with the Priority Ledger used for All Actions and Founder Briefing used for Daily Brief.

## Approved Home-Screen Contract

Today shows one next-best move across all active targets. It must explain:

- What to do.
- Why it outranks other work.
- Supporting evidence and confidence.
- Which gate or stage it advances.
- Which customer-facing artifact is prepared.
- Which explicit approval is required.

The founder can execute, inspect evidence, or reject and choose another move. Rejections and edits improve future ranking. “After this” keeps the next three actions visible. The home screen avoids vanity metrics and pipeline charts.

## Approved Account Workspace

Each target is an evolving deal case, not a generic CRM record.

The deal thesis contains:

- Problem
- Operational consequence
- Trigger
- Narrow Linq wedge

Every claim is classified as:

- **Known:** directly supported.
- **Strong inference:** plausible but unconfirmed.
- **Must learn:** an explicit discovery question.

The AI may organize evidence automatically but may never silently promote an inference into a fact. Conflicts, stale sources, provenance, and missing evidence remain visible.

The right rail shows the next gate, missing conditions, accountable override, and account-specific next-best move.

## Approved Lifecycle

The detailed target-to-rollout method is compressed into seven usable phases while preserving all underlying artifacts:

1. **Target Brief:** intake and external research.
2. **Account Thesis:** qualification, deal thesis, account map, and entry strategy.
3. **Contacted:** approved outreach is active and a real engagement path exists.
4. **Discovery:** operational, systems/data, and commercial discovery.
5. **Diagnostic:** evidence access, field/data assessment, and quantified baseline.
6. **Pilot:** charter, execution, measurement, readout, and business case.
7. **Rollout:** operating blueprint, final proposal, and commercial decision.

Accounts cannot be dragged between stages. Advancement is earned from artifacts and evidence, recommended by the AI, and approved by a founder. Overrides require a reason and remain visible.

## Approved AI Operating Loop

1. **Observe:** monitor available sources for signals, commitments, replies, deadlines, and external change.
2. **Ground:** preserve provenance, reconcile duplicates, surface conflicts, and separate fact from inference.
3. **Reason:** update the canonical account model and compare possible actions.
4. **Recommend:** show the next-best move, ranking rationale, confidence, missing evidence, and prepared work.
5. **Approve and learn:** perform safe internal work, pause consequential actions, and learn from founder decisions.

Prioritization model:

`Impact × readiness × urgency × unblock value × evidence confidence ÷ effort`

Adjust for customer risk and cost of delay. This is an explainable ranking aid, never an unquestionable score.

## Hard Requirement: Graceful Degradation

The minimum viable system is **company name + manual notes and tasks**.

Email, calendar, files, and web research are independent optional adapters. If a source is disconnected, stale, or failing:

- Core workflows continue.
- The source is skipped, not treated as a system failure.
- Coverage gaps are visible.
- Confidence falls where appropriate.
- “Email unavailable” must never be interpreted as “customer did not reply.”
- One failing connector cannot crash or block the rest of the product.

## Hard Requirement: LLM Cannot Send or Publish

This is a non-negotiable architectural invariant.

The LLM has:

- No outbound credentials.
- No send, publish, post, or schedule tools.
- No access to the outbound dispatcher.
- No ability to manufacture approval.
- No batch, wildcard, standing, or future-action approval.

The model may only create an internal action proposal.

External execution requires a separate deterministic path:

1. Preview exact channel, recipient/account, content, attachments, and time.
2. Require approval from the specifically authorized owner account.
3. Require passkey or equivalent user-presence confirmation.
4. Create a short-lived, single-use authorization bound to the exact payload hash, owner identity, action ID, and expiration.
5. Let an isolated dispatcher execute only when authorization and unchanged payload match exactly.
6. Any edit invalidates approval.
7. Record an immutable receipt.

No token, expired token, changed payload, missing integration, or ambiguous provider result means **no action**. Ambiguous sends require manual review and are never automatically retried. The LLM must have no direct network path to email or social providers.

## Visual System

- Desktop-first, founder-grade operational software.
- Deep navy navigation, cool-white workspace.
- Blue for active action, green for verified/complete, amber for gates and uncertainty.
- Strong typography, generous spacing, thin dividers, restrained radii.
- No gradients, glassmorphism, decorative illustration, vanity dashboards, or card-grid clutter.

## Saved Visuals

All assets are under `outputs/linq-action-command-center-visuals/`:

- `01-priority-ledger-alternative.png`
- `02-founder-briefing-alternative.png`
- `03-next-best-move-selected.png`
- `04-approved-home.png`
- `05-approved-account-workspace.png`
- `06-approved-ai-operating-loop.png`
- `07-approved-resilience-and-safety.png`
- `08-approved-portfolio-progress.png`

Treat images 04–08 as approved design references. Images 01–03 preserve the explored alternatives and rationale.

## Work Still Open

Continue design before writing code. Remaining sections include:

- Detailed All Actions screen.
- Detailed Daily Brief screen.
- Approval-preview and passkey-confirmation flow.
- Evidence Ledger and source-conflict experience.
- Pilot workspace, business-case output, rollout blueprint, and proposal-generation flow.
- Canonical data model and service boundaries.
- Forecast/reporting view.
- Empty, offline, stale-source, and connector-error states.
- Testing strategy, especially non-bypassable outbound-safety tests.
- MVP scope and implementation sequence.

## Instructions for the Next Session

1. Read this file and inspect approved images 04–08.
2. Resume the design discussion at the next open section; do not restart discovery.
3. Continue presenting design sections for user approval.
4. Use image generation for important mockups and diagrams, as requested by the user.
5. Do not implement code or wireframes until the remaining design is approved.
6. After full design approval, write the final spec, self-review it for ambiguity and contradictions, then create an implementation plan.

Suggested first continuation:

> “I’m caught up. The next unresolved section is the approval experience itself: the exact preview, passkey confirmation, immutable payload, failure states, and audit receipt. I’ll design that next without changing the approved outbound-safety architecture.”

## Repository Note

This workspace is not currently a Git repository, so no Git commit was possible. The handoff and visual assets are persisted in the workspace.
