# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

---

## ⚠️ Project status: design-phase, no code yet

This repository is currently a **greenfield scaffold**. As of this writing it
contains only `README.md` and this file — **no application source, no build
tooling, no tests, and no chosen tech stack**.

This CLAUDE.md documents the **approved design** so that the architecture and its
non-negotiable safety invariants are in front of you *before* the first line of
code is written. Everything below describing screens, services, and behavior is a
**specification to build toward**, not a description of code that already exists.
Sections marked _(placeholder)_ must be filled in with real values once they
exist — do not invent commands, paths, or file names that aren't real yet.

---

## What we're building: Linq Action Command Center

An internal, **AI-first operating system** for a small, founder-led Linq team. It
carries a prospective customer through the full journey — corporate name →
research → qualification → outreach → discovery → diagnostic → pilot → business
case → rollout → final proposal.

Core stance:

- **Primary source of truth**, not a CRM add-on.
- **AI-first operating partner**, not a passive database.
- The home screen exists to answer one question every morning: **“What should we
  do next?”**
- Consequential actions are **approval-gated** (see the hard invariants below).
- Source scope is public web, email, calendar, and uploaded files/documents — but
  **every integration is optional** (see Graceful Degradation).

---

## Navigation map

Primary destinations:

- **Today** — the one recommended next-best move.
- **All Actions** — the full ranked queue.
- **Daily Brief** — meaningful changes + top three decisions for founder review.
- **Targets** — the accounts / deal cases.
- **Pipeline** — lifecycle stage view.
- **Evidence** — the evidence ledger and provenance.
- **Approvals** — the outbound approval queue.
- **Library** — reusable artifacts and reference material.

---

## Home-screen contract (Today)

Today shows **one next-best move** across all active targets. The recommendation
must always explain, in-context:

1. **What** to do.
2. **Why** it outranks other work.
3. **Supporting evidence** and **confidence**.
4. **Which gate or stage** it advances.
5. **Which customer-facing artifact** is prepared.
6. **Which explicit approval** is required.

The founder can **execute**, **inspect evidence**, or **reject and choose another
move**. Rejections and edits **improve future ranking** — capture them as signal.
An **“After this”** region keeps the next three actions visible.

The home screen **avoids vanity metrics and pipeline charts**. Do not add
dashboard-style widgets here.

---

## Account workspace (Targets)

Each target is an **evolving deal case**, not a generic CRM record.

**Deal thesis** contains:

- Problem
- Operational consequence
- Trigger
- Narrow Linq wedge

**Every claim is classified**:

- **Known** — directly supported by evidence.
- **Strong inference** — plausible but unconfirmed.
- **Must learn** — an explicit discovery question.

> **Rule:** The AI may organize evidence automatically, but it must **never
> silently promote an inference into a fact.** Conflicts, stale sources,
> provenance, and missing evidence stay visible.

The **right rail** shows: the next gate, missing conditions, the accountable
override, and the account-specific next-best move.

---

## Lifecycle (seven phases)

The detailed target-to-rollout method is compressed into seven usable phases
while preserving all underlying artifacts:

1. **Target Brief** — intake and external research.
2. **Account Thesis** — qualification, deal thesis, account map, entry strategy.
3. **Contacted** — approved outreach is active and a real engagement path exists.
4. **Discovery** — operational, systems/data, and commercial discovery.
5. **Diagnostic** — evidence access, field/data assessment, quantified baseline.
6. **Pilot** — charter, execution, measurement, readout, business case.
7. **Rollout** — operating blueprint, final proposal, commercial decision.

> **Rule:** Accounts **cannot be dragged between stages.** Advancement is *earned*
> from artifacts and evidence, *recommended* by the AI, and *approved* by a
> founder. Overrides require a reason and remain visible.

---

## AI operating loop

1. **Observe** — monitor available sources for signals, commitments, replies,
   deadlines, and external change.
2. **Ground** — preserve provenance, reconcile duplicates, surface conflicts,
   separate fact from inference.
3. **Reason** — update the canonical account model and compare possible actions.
4. **Recommend** — show the next-best move, ranking rationale, confidence,
   missing evidence, and prepared work.
5. **Approve & learn** — perform safe internal work, **pause consequential
   actions**, and learn from founder decisions.

**Prioritization model:**

```
Impact × readiness × urgency × unblock value × evidence confidence ÷ effort
```

Adjust for customer risk and cost of delay. This is an **explainable ranking
aid, never an unquestionable score** — always be able to show the inputs.

---

## HARD INVARIANT 1 — Graceful degradation

The **minimum viable system is: company name + manual notes and tasks.**

Email, calendar, files, and web research are **independent, optional adapters.**
If a source is disconnected, stale, or failing:

- Core workflows continue.
- The source is **skipped, not treated as a system failure.**
- **Coverage gaps are visible.**
- Confidence falls where appropriate.
- **“Email unavailable” must never be interpreted as “customer did not reply.”**
- **One failing connector cannot crash or block the rest of the product.**

When adding or touching any source integration, preserve isolation and
fail-soft behavior. Never let one adapter's failure propagate.

---

## HARD INVARIANT 2 — The LLM cannot send or publish

**This is a non-negotiable architectural invariant. Protect it first in any
change.**

The LLM has:

- **No** outbound credentials.
- **No** send, publish, post, or schedule tools.
- **No** access to the outbound dispatcher.
- **No** ability to manufacture approval.
- **No** batch, wildcard, standing, or future-action approval.

The model may **only create an internal action proposal.**

External execution requires a **separate deterministic path**:

1. **Preview** the exact channel, recipient/account, content, attachments, and
   time.
2. Require **approval from the specifically authorized owner account.**
3. Require **passkey or equivalent user-presence confirmation.**
4. Create a **short-lived, single-use authorization** bound to the exact
   **payload hash, owner identity, action ID, and expiration.**
5. Let an **isolated dispatcher** execute only when authorization and unchanged
   payload match **exactly.**
6. **Any edit invalidates approval.**
7. Record an **immutable receipt.**

> No token, expired token, changed payload, missing integration, or ambiguous
> provider result means **no action.** Ambiguous sends require **manual review**
> and are **never automatically retried.** The LLM must have **no direct network
> path** to email or social providers.

This invariant is the **priority target of the outbound-safety test suite**
(see Open design work). Tests here must be **non-bypassable**.

---

## Visual & UX conventions

- **Desktop-first**, founder-grade operational software.
- **Deep navy** navigation, **cool-white** workspace.
- Color semantics: **blue** = active action, **green** = verified/complete,
  **amber** = gates and uncertainty.
- Strong typography, generous spacing, thin dividers, restrained radii.
- **No** gradients, glassmorphism, decorative illustration, vanity dashboards, or
  card-grid clutter.

---

## Development workflow

- **Active branch:** `claude/claude-md-docs-q3ckxn`. Develop here.
- **Never** push to `main` without explicit permission.
- Commit with clear, descriptive messages.
- Push with `git push -u origin <branch-name>`.
- After pushing, open a **draft** pull request if one isn't already open for the
  branch. (No PR template exists in this repo yet; write a normal descriptive
  body.)

---

## Tooling _(placeholder — no stack chosen yet)_

Fill these in once a tech stack is selected and real tooling lands. Do not invent
values before they exist.

- **Install:** _TBD_
- **Build:** _TBD_
- **Run (dev):** _TBD_
- **Test:** _TBD_ — must include the non-bypassable **outbound-safety** suite.
- **Lint/format:** _TBD_

---

## Open design work

Design is **not complete**. The following sections remain open — resume design
here rather than restarting discovery, and get founder approval per section
before implementing:

- [ ] Detailed **All Actions** screen (ranked queue, owners, deadlines,
      blockers, manual reprioritization).
- [ ] Detailed **Daily Brief** screen (meaningful changes + top three decisions).
- [ ] **Approval-preview and passkey-confirmation** flow (the concrete UX for
      Hard Invariant 2).
- [ ] **Evidence Ledger** and source-conflict experience.
- [ ] **Pilot** workspace, **business-case** output, **rollout blueprint**, and
      **proposal-generation** flow.
- [ ] **Canonical data model** and service boundaries.
- [ ] **Forecast / reporting** view.
- [ ] **Empty, offline, stale-source, and connector-error** states.
- [ ] **Testing strategy** — especially non-bypassable outbound-safety tests.
- [ ] **MVP scope** and implementation sequence.

Suggested MVP floor: **company name + manual notes and tasks** working end to
end, with every source integration added as an optional, fail-soft adapter on
top.

---

## Guardrails for AI assistants

- Keep this file honest: when code lands, replace _(placeholder)_ sections with
  real commands and remove the design-phase banner once it no longer applies.
- Do not weaken the two hard invariants when refactoring. If a change appears to
  require the LLM to send/publish, or to make a connector failure fatal, **stop
  and raise it** rather than working around the invariant.
- Prefer explainability: rankings, confidence, and stage advancement must always
  be able to show their inputs and evidence.
