# Linq Action Command Center — Vertical-Slice MVP Design

**Date:** July 20, 2026  
**Status:** Approved for implementation  
**Primary user:** Small founder-led Linq team

## 1. Product Outcome

Build Linq's primary internal operating system for progressing target customers from a company name through research, qualification, outreach, discovery, diagnostic, pilot, business case, and rollout proposal.

The product's daily promise is: **open the application and know the single best next move, why it matters, what evidence supports it, and what requires founder approval.**

## 2. Approved Product Direction

The product is an **Action Command Center**, not a conventional CRM.

- **Today** presents one explainable next-best move.
- **All Actions** provides the complete ranked queue.
- **Daily Brief** summarizes meaningful changes and the top three founder decisions.
- **Targets** contains evolving account cases.
- **Pipeline** shows evidence-earned progression and blockers.
- **Evidence** preserves facts, inferences, unknowns, conflicts, and provenance.
- **Approvals** contains exact-action review and immutable receipts.
- **Library** contains briefs, outreach drafts, pilot artifacts, business cases, and proposals.

The selected visual direction is the approved “Next Best Move” mockup, supplemented by the Priority Ledger for All Actions and Founder Briefing for Daily Brief.

## 3. MVP Scope

The first build is a working vertical slice with realistic seeded data for RaceTrac, H-E-B, and Bagel Brands.

It includes:

- Functional navigation across all primary surfaces.
- A canonical persisted account and evidence model.
- Explainable action ranking.
- Guided stage gates and accountable overrides.
- Evidence classifications and source health.
- Connector-degraded states.
- Exact-action approval workflow.
- Simulated outbound dispatch and immutable demo receipts.
- Realistic artifacts and activity history.

It does not include:

- Real email, calendar, social, or CRM integrations.
- Real outbound sending or publishing.
- Production authentication or passkeys.
- Production LLM calls.
- Multi-tenant administration, billing, or enterprise permissions.
- A production-grade predictive model or revenue forecast.

The MVP demonstrates the production workflow while remaining structurally incapable of external communication because it contains no outbound credentials or provider integrations.

## 4. Lifecycle

The detailed Linq method is represented as seven phases:

1. **Target Brief:** intake and external research.
2. **Account Thesis:** qualification, deal thesis, account map, and entry strategy.
3. **Contacted:** approved outreach is active and a real engagement path exists.
4. **Discovery:** operational, systems/data, and commercial discovery.
5. **Diagnostic:** evidence access, field/data assessment, and quantified baseline.
6. **Pilot:** charter, execution, measurement, readout, and business case.
7. **Rollout:** operating blueprint, final proposal, and commercial decision.

Accounts cannot be moved by drag-and-drop or a free-form stage dropdown. Stage advancement requires completed gate criteria plus explicit founder approval. Overrides require a reason, risk acknowledgement, author, and timestamp.

## 5. Core Screens

### 5.1 Today

Today shows one dominant recommendation containing:

- Account and current phase.
- Recommended action.
- Plain-language rationale.
- Supporting evidence chain.
- Confidence and missing evidence.
- Expected stage or gate effect.
- Prepared draft or internal action.
- Required approval state.

The founder may review the action, inspect evidence, reject it, or choose another move. “After this” shows the next three ranked actions.

### 5.2 All Actions

All Actions uses the Priority Ledger model:

- Ranked action list across accounts.
- Why now, confidence, owner, due date, effort, and action control.
- Filters for approvals, blocked, overdue, research, outreach, and internal work.
- Manual pinning and reprioritization with a recorded reason.
- Clear separation between internal actions and consequential external proposals.

### 5.3 Daily Brief

Daily Brief uses the Founder Briefing model:

- One-sentence portfolio synthesis.
- Top three decisions.
- Changes since the previous brief.
- New signals, replies, upcoming commitments, stale evidence, and blocked gates.
- Links into the exact account, evidence, or approval item.

### 5.4 Account Workspace

The workspace is an evolving deal case, not a generic company record.

The Account Thesis contains:

- Problem.
- Operational consequence.
- Trigger.
- Narrow Linq wedge.

Tabs organize Overview, Thesis, People, Discovery, Diagnostic, Pilot, Rollout, and Activity. Each phase exposes its required artifacts and gate criteria.

Claims are classified as:

- **Known:** directly supported.
- **Strong inference:** plausible but unconfirmed.
- **Must learn:** explicit discovery question.

The system never silently promotes an inference into a fact.

### 5.5 Pipeline

Pipeline is a progress matrix, not a kanban board. It shows:

- Current lifecycle phase.
- Completed and future phases.
- Qualification score.
- Gate completion.
- Primary blocker.
- Next move.
- Accounts requiring review or override.

Forecasting remains separate from evidence-backed progression.

### 5.6 Evidence

Evidence supports:

- Source, timestamp, account, and claim linkage.
- Known/inference/unknown classification.
- Confidence and freshness.
- Duplicate reconciliation.
- Explicit source conflicts.
- Manual confirmation, correction, or rejection.

Missing source access is represented as missing coverage, never negative evidence.

### 5.7 Approvals

Approvals contains Draft, Awaiting Approval, Authorized, Completed, Failed Closed, and Manual Review states. Every completed item has an immutable receipt view.

### 5.8 Library

Library contains versioned target briefs, outreach drafts, discovery memos, diagnostic baselines, pilot charters, pilot readouts, business cases, rollout blueprints, and proposals. The MVP uses realistic seeded artifacts and local export/download behavior.

## 6. AI Operating Model

The conceptual loop is:

1. **Observe:** collect available signals.
2. **Ground:** preserve provenance, reconcile duplicates, expose conflicts, and separate fact from inference.
3. **Reason:** update the account model and compare possible actions.
4. **Recommend:** explain the next-best move and prepare internal work.
5. **Approve and learn:** pause consequential actions and learn from founder edits or rejection.

The MVP uses deterministic seeded logic rather than a production LLM. This keeps behavior testable while preserving the intended interfaces.

Ranking uses:

`Impact × readiness × urgency × unblock value × evidence confidence ÷ effort`

The result is adjusted for customer risk and cost of delay. All factors are inspectable and founder-overridable.

## 7. Graceful Degradation

The minimum usable state is **company name + manual notes and tasks**.

Each source adapter is independent and reports Connected, Not Connected, Stale, or Temporarily Unavailable. A missing or failed source:

- Does not block core workflows.
- Does not crash other adapters.
- Is skipped rather than treated as empty business activity.
- Reduces confidence only where relevant.
- Produces a visible coverage notice.

The MVP provides interactive source-health states to verify these behaviors without real integrations.

## 8. Exact-Action Approval and Safety

### 8.1 Production Invariant

The LLM must never possess outbound credentials, send/publish tools, dispatcher access, or the ability to manufacture approval.

### 8.2 Review Flow

1. AI or user creates an internal Draft proposal.
2. Review shows exact channel, recipient/account, content, attachments, timing, rationale, and customer context.
3. Editing keeps the item in Draft.
4. “Approve this exact action” locks the payload.
5. The designated owner confirms user presence through a WebAuthn passkey.
6. A deterministic service creates a short-lived, single-use authorization bound to payload hash, owner identity, action ID, and expiry.
7. An isolated dispatcher accepts only the valid authorization and exact unchanged payload.
8. Completion writes an immutable receipt.

Any edit invalidates authorization. No token, expired token, changed payload, missing integration, or ambiguous provider response results in no action. Ambiguous provider results require manual review and are never retried automatically.

### 8.3 MVP Simulation

The MVP has no external dispatcher. It simulates:

- Exact payload locking.
- Owner-confirmation dialog clearly labeled as a demo.
- Deterministic payload hashing.
- Single-use authorization state.
- Completed, failed-closed, and manual-review receipts.
- Global Outbound Disabled state enabled by default.

No control in the MVP sends external communication.

## 9. Canonical Data Model

Core entities:

- **WorkspaceUser:** founder identity and designated owner flag.
- **Account:** company, brands, estate summary, qualification, owner, and lifecycle phase.
- **Claim:** statement, classification, confidence, freshness, and confirmation state.
- **Evidence:** source, timestamp, excerpt/summary, provenance, and linked claims.
- **SourceConnection:** adapter type, health, last successful sync, and coverage notes.
- **Contact:** person, role, account, buying role, and relationship state.
- **StageGate:** phase, criteria, completion, blocker, and advancement state.
- **Override:** gate, reason, risk acknowledgement, author, and timestamp.
- **ActionProposal:** account, action type, rationale, rank factors, due date, and state.
- **ApprovalEnvelope:** exact payload, payload hash, approver, expiry, and single-use state.
- **DispatchReceipt:** simulated result, provider-style reference, timestamp, and audit data.
- **Artifact:** type, account, lifecycle phase, version, status, and content.
- **Decision:** decision, alternatives, author, rationale, and timestamp.
- **ActivityEvent:** normalized account timeline event.

Relationships preserve provenance: evidence supports claims; claims support hypotheses and gates; gates affect stage progression; actions target gaps; approvals bind exact action payloads.

## 10. Component and Service Boundaries

The implementation should isolate:

- **Presentation:** routes, layouts, and reusable UI components.
- **Domain:** accounts, evidence, gates, rankings, actions, approvals, and artifacts.
- **Persistence:** repository interfaces and local storage implementation.
- **Ranking engine:** deterministic score and explanation generation.
- **Connector simulator:** independent source-health and event inputs.
- **Approval service:** payload canonicalization, hashing, authorization state, and validation.
- **Dispatcher simulator:** deterministic outcomes with no network capability.
- **Audit log:** append-only domain events and receipts.
- **Seed fixtures:** realistic H-E-B, RaceTrac, and Bagel Brands data.

The UI consumes domain interfaces rather than embedding business rules in components.

## 11. Technical Shape

Use a local TypeScript web application with:

- React and Vite.
- React Router.
- Pure TypeScript domain services with no business rules embedded in React components.
- IndexedDB persistence through Dexie, isolated behind repository interfaces.
- Web Crypto SHA-256 for the simulated immutable payload hash.
- CSS variables and component-level styles matching the approved visual system.
- Lucide icons.
- Vitest and React Testing Library.
- Playwright for end-to-end and visual verification.

Seed fixtures initialize the database on first launch and can be restored through an explicit demo-data reset control. Domain code depends on repository interfaces rather than Dexie directly.

## 12. Error Handling

- Connector failures are isolated and recoverable.
- Missing data produces explicit unknown states.
- Invalid stage advancement is rejected with unmet criteria.
- Override creation requires all accountability fields.
- Payload edits invalidate approval.
- Duplicate execution is prevented by single-use state and idempotency key.
- Ambiguous simulated dispatch enters Manual Review.
- Persistence errors preserve unsaved form content and present retry/export options.
- Empty states explain the next productive action.

## 13. Testing Strategy

### Domain tests

- Ranking calculation and explanations.
- Gate completion and advancement rules.
- Override requirements.
- Fact/inference/unknown invariants.
- Missing-source confidence behavior.
- Payload canonicalization and hashing.
- Approval invalidation after any payload change.
- Single-use authorization and duplicate prevention.
- Failed-closed behavior for every invalid dispatch condition.

### UI tests

- Today recommendation and “After this” queue.
- All Actions filters and pinning.
- Daily Brief navigation.
- Account thesis and evidence classification.
- Pipeline blockers and advancement review.
- Connector-degraded states.
- Exact-action preview, edit, lock, confirm, receipt, and manual review.

### End-to-end tests

- RaceTrac account thesis to approved simulated outreach.
- H-E-B blocked gate to accountable override.
- Bagel Brands ownership verification to gate completion.
- Email and calendar unavailable while all core workflows remain usable.
- Changed recipient or content after approval causes dispatch denial.
- Reusing an authorization causes dispatch denial.

### Visual verification

Compare rendered desktop screens against approved mockups at a consistent viewport. Verify layout hierarchy, typography, spacing, colors, borders, radii, and responsive behavior.

## 14. Acceptance Criteria

The MVP is complete when:

- A founder can understand the next-best move within ten seconds.
- All primary navigation surfaces work with realistic data.
- Account progression is evidence-gated rather than freely editable.
- Evidence provenance and classification are inspectable.
- Disconnected email/calendar states do not break any core workflow.
- No application path performs real external communication.
- The simulated approval path fails closed on every mismatch or invalid state.
- The selected home, account, safety, and pipeline visuals are faithfully represented.
- Automated tests cover domain invariants and critical workflows.
- The application is visually verified at desktop and mobile widths.

## 15. Approved Visual References

Located in `outputs/linq-action-command-center-visuals/`:

- `04-approved-home.png`
- `05-approved-account-workspace.png`
- `06-approved-ai-operating-loop.png`
- `07-approved-resilience-and-safety.png`
- `08-approved-portfolio-progress.png`

The alternatives `01`–`03` remain references for All Actions, Daily Brief, and the selected home direction.
