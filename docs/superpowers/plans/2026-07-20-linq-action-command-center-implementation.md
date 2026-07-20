# Linq Action Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, persistent, founder-facing Action Command Center that turns seeded target-account evidence into explainable next moves, evidence-gated progression, and demonstrably fail-closed simulated approvals.

**Architecture:** A React/Vite presentation layer consumes a typed application-service facade; pure TypeScript domain modules own rankings, evidence invariants, stage gates, connector health, and approvals. Dexie repositories sit behind interfaces, while an isolated dispatcher simulator has no network dependency or outbound provider code.

**Tech Stack:** TypeScript, React, Vite, React Router, Dexie/IndexedDB, Web Crypto SHA-256, Lucide React, CSS variables, Vitest, React Testing Library, Playwright, pnpm.

## Global Constraints

- The MVP contains no real email, calendar, social, CRM, or outbound provider integration.
- No model-facing interface exposes credentials, send/publish tools, provider clients, or dispatcher access.
- The application remains useful with only a company name plus manual notes and tasks.
- Missing integrations are shown as missing coverage and are never interpreted as negative customer evidence.
- Stage progression requires gate completion plus explicit founder approval; accountable overrides require reason, risk acknowledgement, author, and timestamp.
- Exact-action authorization is single-use and bound to the unchanged canonical payload hash, action ID, owner ID, and expiry.
- Any missing, expired, reused, changed, disconnected, or ambiguous dispatch condition fails closed; ambiguous outcomes enter manual review without automatic retry.
- Approved visual references are `outputs/linq-action-command-center-visuals/04-approved-home.png` through `08-approved-portfolio-progress.png`, with `01` and `02` guiding All Actions and Daily Brief.
- The UI uses deep navy navigation, cool-white workspaces, blue actions, green verification, amber uncertainty, thin dividers, restrained radii, no gradients, and no decorative card-grid clutter.
- The seven lifecycle phases are Target Brief, Account Thesis, Contacted, Discovery, Diagnostic, Pilot, and Rollout.
- Seed data covers RaceTrac, H-E-B, and Bagel Brands.

## Workstream Ownership

The two agents work in parallel only inside these non-overlapping path boundaries. Claims must still be recorded in the agent's own status file before editing.

### Codex / GPT owns

- Root build and test configuration: `package.json`, lockfile, TypeScript/Vite/Vitest/Playwright configs, `index.html`, `.gitignore`.
- `public/`
- `src/main.tsx`
- `src/app/`
- `src/features/`
- `src/ui/`
- `src/styles/`
- `tests/ui/`
- `tests/e2e/`

### Claude Code owns

- `src/domain/`
- `src/application/`
- `src/data/`
- `src/simulators/`
- `src/fixtures/`
- `tests/domain/`

### Coordination rules

- `CLAUDE.md`, `dev-com/README.md`, and both status files govern collision prevention.
- Codex never edits `work/coordination/CLAUDE_STATUS.md`; Claude never edits `work/coordination/CODEX_STATUS.md`.
- Contract changes under `src/domain/contracts.ts` are Claude-owned and must be announced to Codex through `dev-com/gpt/new/`.
- Root dependency changes are Codex-owned; Claude requests them through `dev-com/gpt/new/` rather than editing `package.json` or the lockfile.
- Each agent checks its own incoming mailbox at task start, before expanding claims, after tests, and before stopping.

## Locked File Map

```text
src/
  main.tsx                              # Codex: browser entry
  app/App.tsx                           # Codex: router and providers
  app/AppErrorBoundary.tsx              # Codex: recoverable persistence/UI errors
  app/routes.tsx                        # Codex: route table
  domain/types.ts                       # Claude: canonical entities and enums
  domain/contracts.ts                   # Claude: AppService and repository contracts
  domain/ranking.ts                     # Claude: deterministic ranking/explanations
  domain/gates.ts                       # Claude: gate completion/override rules
  domain/evidence.ts                    # Claude: classification/source coverage rules
  domain/approval.ts                    # Claude: canonicalization/hash/auth validation
  application/demoAppService.ts         # Claude: UI-facing orchestration facade
  data/database.ts                      # Claude: Dexie schema only
  data/dexieRepositories.ts             # Claude: repository implementations
  simulators/connectors.ts              # Claude: independent source-health simulator
  simulators/dispatcher.ts              # Claude: network-free fail-closed simulator
  fixtures/demoData.ts                  # Claude: complete realistic seed graph
  features/today/                       # Codex: Today route and components
  features/actions/                     # Codex: Priority Ledger
  features/brief/                       # Codex: Founder Briefing
  features/accounts/                    # Codex: Targets and Account Workspace
  features/pipeline/                    # Codex: progress matrix and gate review
  features/evidence/                    # Codex: evidence ledger/conflicts
  features/approvals/                   # Codex: preview/lock/confirm/receipts UI
  features/library/                     # Codex: artifact list/view/export
  features/settings/                    # Codex: source-health controls/reset
  ui/                                   # Codex: reusable controls and layout pieces
  styles/                               # Codex: tokens, global, layout, responsive CSS
tests/domain/                            # Claude: pure domain and persistence tests
tests/ui/                                # Codex: React Testing Library tests
tests/e2e/                               # Codex: Playwright journeys
```

---

### Task 1: Scaffold the runnable shell — Codex

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/app/routes.tsx`, `src/app/AppErrorBoundary.tsx`
- Create: `src/ui/AppShell.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/shell.css`
- Test: `tests/ui/app-shell.test.tsx`

**Interfaces:**
- Consumes: no domain files; placeholder route elements must stay within Codex-owned paths.
- Produces: a working React Router shell with route IDs `today`, `actions`, `brief`, `targets`, `pipeline`, `evidence`, `approvals`, `library`, and `settings`; root commands `dev`, `build`, `test`, `test:e2e`.

- [ ] **Step 1: Create the dependency and test configuration**

Run:

```bash
/opt/homebrew/bin/pnpm add react react-dom react-router-dom dexie lucide-react
/opt/homebrew/bin/pnpm add -D typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Set scripts in `package.json` to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Write the failing shell test**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../../src/ui/AppShell';

it('exposes every primary destination and outbound-disabled status', () => {
  render(<MemoryRouter><AppShell><div>Route body</div></AppShell></MemoryRouter>);
  for (const label of ['Today', 'All Actions', 'Daily Brief', 'Targets', 'Pipeline', 'Evidence', 'Approvals', 'Library']) {
    expect(screen.getByRole('link', { name: label })).toBeVisible();
  }
  expect(screen.getByText('Outbound disabled')).toBeVisible();
});
```

- [ ] **Step 3: Run the shell test and confirm the expected failure**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/app-shell.test.tsx`

Expected: FAIL because `src/ui/AppShell.tsx` does not exist.

- [ ] **Step 4: Implement the minimal shell and routes**

```tsx
// src/app/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { AppErrorBoundary } from './AppErrorBoundary';

export function App() {
  return <AppErrorBoundary><BrowserRouter><AppRoutes /></BrowserRouter></AppErrorBoundary>;
}
```

`AppShell` must use Lucide icons, an accessible `<nav>`, active link states, a persistent “Outbound disabled” indicator, and a mobile menu that does not conceal route content.

- [ ] **Step 5: Run the shell test and production build**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/app-shell.test.tsx && /opt/homebrew/bin/pnpm build`

Expected: both commands PASS.

- [ ] **Step 6: Commit the isolated shell**

```bash
git add package.json pnpm-lock.yaml index.html tsconfig.json tsconfig.app.json vite.config.ts vitest.config.ts playwright.config.ts .gitignore src/main.tsx src/app src/ui/AppShell.tsx src/styles tests/ui/app-shell.test.tsx
git commit -m "feat: scaffold action command center shell"
```

### Task 2: Define canonical domain contracts and seed graph — Claude Code

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/contracts.ts`
- Create: `src/fixtures/demoData.ts`
- Test: `tests/domain/fixtures.test.ts`

**Interfaces:**
- Consumes: no Codex implementation files.
- Produces: `LifecyclePhase`, `SourceHealth`, `ClaimClassification`, `Account`, `Claim`, `Evidence`, `StageGate`, `ActionProposal`, `ApprovalEnvelope`, `DispatchReceipt`, `Artifact`, `DailyBrief`, `DashboardSnapshot`, and `AppService`.

- [ ] **Step 1: Write the fixture contract test**

```ts
import { describe, expect, it } from 'vitest';
import { demoData } from '../../src/fixtures/demoData';

describe('demo data', () => {
  it('contains the three approved accounts and preserves evidence links', () => {
    expect(demoData.accounts.map((account) => account.name).sort()).toEqual([
      'Bagel Brands', 'H-E-B', 'RaceTrac'
    ]);
    const claimIds = new Set(demoData.claims.map((claim) => claim.id));
    expect(demoData.evidence.every((item) => item.claimIds.every((id) => claimIds.has(id)))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/fixtures.test.ts`

Expected: FAIL because `demoData` is undefined or missing.

- [ ] **Step 3: Implement the exact public contract**

```ts
export const lifecyclePhases = ['target-brief', 'account-thesis', 'contacted', 'discovery', 'diagnostic', 'pilot', 'rollout'] as const;
export type LifecyclePhase = typeof lifecyclePhases[number];
export type SourceHealth = 'connected' | 'not-connected' | 'stale' | 'temporarily-unavailable';
export type ClaimClassification = 'known' | 'strong-inference' | 'must-learn';
export type ActionState = 'draft' | 'awaiting-approval' | 'authorized' | 'completed' | 'failed-closed' | 'manual-review' | 'rejected';
export type Confidence = 'low' | 'medium' | 'high';

export interface WorkspaceUser {
  id: string;
  name: string;
  designatedOwner: boolean;
}

export interface Account {
  id: string;
  name: string;
  brands: string[];
  estateSummary: string;
  qualificationScore: number;
  ownerId: string;
  phase: LifecyclePhase;
}

export interface Claim {
  id: string;
  accountId: string;
  statement: string;
  classification: ClaimClassification;
  confidence: Confidence;
  freshness: 'fresh' | 'aging' | 'stale' | 'unknown';
  confirmation: 'unreviewed' | 'confirmed' | 'corrected' | 'rejected';
}

export interface Evidence {
  id: string;
  accountId: string;
  sourceId: string;
  title: string;
  summary: string;
  provenance: string;
  capturedAt: string;
  claimIds: string[];
  conflictsWithEvidenceIds: string[];
}

export interface SourceConnection {
  id: string;
  type: 'public-web' | 'email' | 'calendar' | 'file' | 'manual';
  health: SourceHealth;
  lastSuccessfulSync: string | null;
  coverageNote: string;
}

export interface GateCriterion {
  id: string;
  label: string;
  complete: boolean;
  evidenceIds: string[];
}

export interface StageGate {
  id: string;
  accountId: string;
  phase: LifecyclePhase;
  criteria: GateCriterion[];
  blocker: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface OverrideInput {
  gateId: string;
  reason: string;
  riskAcknowledged: boolean;
  authorId: string;
  createdAt: string;
}

export interface RankFactors {
  impact: number;
  readiness: number;
  urgency: number;
  unblockValue: number;
  evidenceConfidence: number;
  effort: number;
  customerRisk: number;
  costOfDelay: number;
}

export interface ExactActionPayload {
  channel: 'email' | 'social-post';
  recipientOrAccount: string;
  subject?: string;
  content: string;
  attachmentIds: string[];
  scheduledFor: string | null;
}

export interface ActionProposal {
  id: string;
  accountId: string;
  title: string;
  type: 'research' | 'internal' | 'outreach' | 'approval';
  rationale: string;
  evidenceIds: string[];
  expectedGateEffect: string;
  rankFactors: RankFactors;
  dueAt: string | null;
  ownerId: string;
  state: ActionState;
  payload: ExactActionPayload | null;
  pinnedReason: string | null;
}

export interface ApprovalEnvelope {
  id: string;
  actionId: string;
  ownerId: string;
  payloadHash: string;
  expiresAt: string;
  confirmedAt: string | null;
  usedAt: string | null;
  idempotencyKey: string;
}

export interface DispatchReceipt {
  id: string;
  actionId: string;
  envelopeId: string;
  state: 'completed' | 'failed-closed' | 'manual-review';
  reason: string;
  providerStyleReference: string | null;
  attemptCount: number;
  createdAt: string;
}

export interface Artifact {
  id: string;
  accountId: string;
  phase: LifecyclePhase;
  type: 'target-brief' | 'outreach-draft' | 'discovery-memo' | 'diagnostic-baseline' | 'pilot-charter' | 'pilot-readout' | 'business-case' | 'rollout-blueprint' | 'proposal';
  version: number;
  status: 'draft' | 'reviewed' | 'approved';
  title: string;
  content: string;
  updatedAt: string;
}

export interface AccountCase {
  account: Account;
  claims: Claim[];
  evidence: Evidence[];
  gates: StageGate[];
  actions: RankedAction[];
  artifacts: Artifact[];
}

export interface RankedAction extends ActionProposal {
  score: number;
  explanation: string;
}

export interface ApprovalCase {
  action: ActionProposal;
  envelope: ApprovalEnvelope | null;
  receipt: DispatchReceipt | null;
}

export interface DailyBrief {
  summary: string;
  decisions: Array<{ id: string; title: string; destination: string }>;
  changes: Array<{ id: string; accountId: string; summary: string; occurredAt: string }>;
}

export interface DashboardSnapshot {
  accounts: Account[];
  actions: RankedAction[];
  brief: DailyBrief;
  sources: SourceConnection[];
}

export type AdvanceResult =
  | { ok: true; account: Account; overridden: boolean }
  | { ok: false; unmetCriteria: string[]; reason: string };

export interface DemoData {
  users: WorkspaceUser[];
  accounts: Account[];
  claims: Claim[];
  evidence: Evidence[];
  sources: SourceConnection[];
  gates: StageGate[];
  actions: ActionProposal[];
  approvals: ApprovalEnvelope[];
  receipts: DispatchReceipt[];
  artifacts: Artifact[];
}

export interface AppService {
  initialize(): Promise<void>;
  getDashboard(): Promise<DashboardSnapshot>;
  getAccount(accountId: string): Promise<AccountCase | undefined>;
  listEvidence(accountId?: string): Promise<Evidence[]>;
  listApprovals(): Promise<ApprovalCase[]>;
  listArtifacts(accountId?: string): Promise<Artifact[]>;
  pinAction(actionId: string, reason: string): Promise<void>;
  setSourceHealth(sourceId: string, health: SourceHealth): Promise<void>;
  requestStageAdvance(accountId: string, approverId: string): Promise<AdvanceResult>;
  createOverride(input: OverrideInput): Promise<AdvanceResult>;
  updateDraft(actionId: string, payload: ExactActionPayload): Promise<void>;
  lockExactAction(actionId: string, ownerId: string, expiresAt: string): Promise<ApprovalEnvelope>;
  confirmDemoPresence(envelopeId: string, ownerId: string): Promise<ApprovalEnvelope>;
  simulateDispatch(actionId: string, envelopeId: string): Promise<DispatchReceipt>;
  resetDemoData(): Promise<void>;
}
```

Define every referenced type in `types.ts`; keep IDs as opaque strings and timestamps as ISO strings. Seed one coherent evidence chain, gate blocker, recommended action, approval draft, artifact set, and activity history per account.

- [ ] **Step 4: Run fixture tests**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/fixtures.test.ts`

Expected: PASS with three named accounts and no broken claim links.

- [ ] **Step 5: Notify Codex of the locked contracts and commit**

Write `dev-com/gpt/new/<unique-id>-domain-contract-ready.md` naming exported types and any dependency request, then run:

```bash
git add src/domain/types.ts src/domain/contracts.ts src/fixtures/demoData.ts tests/domain/fixtures.test.ts
git commit -m "feat: define command center domain contracts"
```

### Task 3: Implement ranking, evidence, connector, and gate rules — Claude Code

**Files:**
- Create: `src/domain/ranking.ts`, `src/domain/evidence.ts`, `src/domain/gates.ts`
- Create: `src/simulators/connectors.ts`
- Test: `tests/domain/ranking.test.ts`, `tests/domain/evidence.test.ts`, `tests/domain/gates.test.ts`, `tests/domain/connectors.test.ts`

**Interfaces:**
- Consumes: canonical types from Task 2.
- Produces: `rankActions(actions: ActionProposal[]): RankedAction[]`; `evaluateCoverage(claims: Claim[], sources: SourceConnection[]): CoverageEvaluation`; `evaluateGate(gate: StageGate): GateEvaluation`; `advanceWithApproval(account: Account, gate: StageGate, approverId: string): AdvanceResult`; `validateOverride(input: OverrideInput): string[]`; and `ConnectorSimulator.setHealth(sourceId: string, health: SourceHealth): SourceConnection[]`.

`CoverageEvaluation` is `{ coverageNotices: string[]; confidencePenalty: number; negativeCustomerSignals: string[] }`. `GateEvaluation` is `{ canAdvance: boolean; unmetCriteria: string[]; blocker: string | null }`.

- [ ] **Step 1: Write failing invariant tests**

```ts
it('does not convert unavailable email into evidence of no reply', () => {
  const result = evaluateCoverage(claims, [{ ...emailSource, health: 'temporarily-unavailable' }]);
  expect(result.coverageNotices).toContain('Email is temporarily unavailable');
  expect(result.negativeCustomerSignals).toEqual([]);
});

it('rejects advancement when criteria are missing and no accountable override exists', () => {
  expect(evaluateGate(blockedGate)).toEqual(expect.objectContaining({ canAdvance: false }));
});

it('ranks with inspectable factors and a plain-language explanation', () => {
  const [first] = rankActions(actions);
  expect(first.score).toBeGreaterThan(0);
  expect(first.explanation).toMatch(/because/i);
});
```

- [ ] **Step 2: Verify the tests fail**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/ranking.test.ts tests/domain/evidence.test.ts tests/domain/gates.test.ts tests/domain/connectors.test.ts`

Expected: FAIL because the rule modules do not exist.

- [ ] **Step 3: Implement deterministic rules**

```ts
export function scoreAction(f: RankFactors): number {
  const effort = Math.max(1, f.effort);
  const base = (f.impact * f.readiness * f.urgency * f.unblockValue * f.evidenceConfidence) / effort;
  return Number((base + f.costOfDelay - f.customerRisk).toFixed(2));
}

export function validateOverride(input: OverrideInput): string[] {
  return [
    !input.reason.trim() && 'Reason is required',
    !input.riskAcknowledged && 'Risk acknowledgement is required',
    !input.authorId && 'Author is required',
    !input.createdAt && 'Timestamp is required'
  ].filter((value): value is string => Boolean(value));
}
```

`ConnectorSimulator` must change one source without mutating other sources, return coverage notices, and never synthesize customer activity from absence. `rankActions` must retain each factor and explain urgency, unblock value, confidence, and effort in plain language.

- [ ] **Step 4: Run all rule tests**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/ranking.test.ts tests/domain/evidence.test.ts tests/domain/gates.test.ts tests/domain/connectors.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/ranking.ts src/domain/evidence.ts src/domain/gates.ts src/simulators/connectors.ts tests/domain
git commit -m "feat: add explainable progression rules"
```

### Task 4: Build fail-closed approval and dispatcher simulation — Claude Code

**Files:**
- Create: `src/domain/approval.ts`
- Create: `src/simulators/dispatcher.ts`
- Test: `tests/domain/approval.test.ts`, `tests/domain/dispatcher.test.ts`

**Interfaces:**
- Consumes: `ExactActionPayload`, `ApprovalEnvelope`, `DispatchReceipt`.
- Produces: `canonicalizePayload(payload: ExactActionPayload): string`; `hashPayload(payload: ExactActionPayload): Promise<string>`; `authorizeExactAction(input: { actionId: string; ownerId: string; payload: ExactActionPayload; expiresAt: string }): Promise<ApprovalEnvelope>`; `validateDispatch(input: { actionId: string; ownerId: string; payload: ExactActionPayload; envelope: ApprovalEnvelope; now: string; integrationAvailable: boolean; outboundEnabled: boolean }): Promise<{ ok: boolean; reason: string }>`; and `DispatcherSimulator.dispatch(input, outcome): Promise<DispatchReceipt>` where `outcome` is `'success' | 'failure' | 'ambiguous'`.

- [ ] **Step 1: Write failing fail-closed tests**

```ts
it.each([
  'missing-token', 'expired-token', 'changed-payload', 'wrong-owner',
  'reused-token', 'missing-integration', 'outbound-disabled'
])('denies %s without invoking a provider', async (condition) => {
  const result = await runInvalidDispatch(condition);
  expect(result.state).toBe('failed-closed');
  expect(result.externalCalls).toBe(0);
});

it('routes an ambiguous result to manual review and never retries', async () => {
  const result = await dispatcher.dispatch(validInput, 'ambiguous');
  expect(result.state).toBe('manual-review');
  expect(result.attemptCount).toBe(1);
});

it('invalidates authorization after one payload character changes', async () => {
  const envelope = await authorizeExactAction(validAuthorizationInput);
  const changed = { ...validPayload, content: `${validPayload.content}!` };
  expect((await validateDispatch({ ...validDispatchInput, envelope, payload: changed })).ok).toBe(false);
});
```

- [ ] **Step 2: Verify failure**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/approval.test.ts tests/domain/dispatcher.test.ts`

Expected: FAIL because approval and dispatcher functions are missing.

- [ ] **Step 3: Implement canonical hash and isolated validation**

```ts
export function canonicalizePayload(payload: ExactActionPayload): string {
  return JSON.stringify({
    attachmentIds: [...payload.attachmentIds].sort(),
    channel: payload.channel,
    content: payload.content,
    recipientOrAccount: payload.recipientOrAccount,
    scheduledFor: payload.scheduledFor,
    subject: payload.subject ?? null
  });
}

export async function hashPayload(payload: ExactActionPayload): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalizePayload(payload));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
```

The dispatcher module must import no HTTP, email, social, browser, or network client. Its only outcomes are deterministic local receipts: completed-demo, failed-closed, or manual-review. It consumes authorization once before returning a completed demo receipt and rejects duplicate use by idempotency key.

- [ ] **Step 4: Run safety tests twice to catch state leakage**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/approval.test.ts tests/domain/dispatcher.test.ts && /opt/homebrew/bin/pnpm test -- tests/domain/approval.test.ts tests/domain/dispatcher.test.ts`

Expected: both runs PASS; every invalid case reports zero external calls.

- [ ] **Step 5: Commit**

```bash
git add src/domain/approval.ts src/simulators/dispatcher.ts tests/domain/approval.test.ts tests/domain/dispatcher.test.ts
git commit -m "feat: enforce exact-action approval simulation"
```

### Task 5: Add Dexie persistence and the application facade — Claude Code

**Files:**
- Create: `src/data/database.ts`, `src/data/dexieRepositories.ts`
- Create: `src/application/demoAppService.ts`
- Test: `tests/domain/repositories.test.ts`, `tests/domain/app-service.test.ts`

**Interfaces:**
- Consumes: all domain functions and demo fixtures from Tasks 2–4.
- Produces: `createDemoAppService(databaseName?: string): AppService`, default database name `linq-action-command-center`, first-run seeding, explicit reset, persistent mutations, and append-only activity/receipt writes.

- [ ] **Step 1: Write failing persistence tests**

```ts
it('seeds once and preserves user mutations across service instances', async () => {
  const first = createDemoAppService(testDatabaseName);
  await first.initialize();
  await first.pinAction('action-racetrac-outreach', 'Founder priority');
  const second = createDemoAppService(testDatabaseName);
  await second.initialize();
  expect((await second.getDashboard()).actions[0].pinnedReason).toBe('Founder priority');
});

it('reset restores approved demo fixtures only after explicit invocation', async () => {
  await service.resetDemoData();
  expect((await service.getDashboard()).accounts).toHaveLength(3);
});
```

- [ ] **Step 2: Verify failure**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain/repositories.test.ts tests/domain/app-service.test.ts`

Expected: FAIL because persistence and facade do not exist.

- [ ] **Step 3: Implement schema and facade**

```ts
export class CommandCenterDatabase extends Dexie {
  accounts!: Table<Account, string>;
  claims!: Table<Claim, string>;
  evidence!: Table<Evidence, string>;
  actions!: Table<ActionProposal, string>;
  approvals!: Table<ApprovalEnvelope, string>;
  receipts!: Table<DispatchReceipt, string>;
  artifacts!: Table<Artifact, string>;

  constructor(name = 'linq-action-command-center') {
    super(name);
    this.version(1).stores({
      accounts: 'id, phase, ownerId', claims: 'id, accountId, classification',
      evidence: 'id, accountId, sourceId, capturedAt', actions: 'id, accountId, state, dueAt',
      approvals: 'id, actionId, ownerId, expiresAt, usedAt', receipts: 'id, actionId, state, createdAt',
      artifacts: 'id, accountId, phase, type, version'
    });
  }
}
```

The facade owns orchestration but delegates business rules to pure domain functions. Initialization catches an unavailable IndexedDB environment and returns a recoverable persistence error without destroying unsaved UI input.

- [ ] **Step 4: Run the entire Claude-owned test suite**

Run: `/opt/homebrew/bin/pnpm test -- tests/domain`

Expected: PASS.

- [ ] **Step 5: Send the integration handoff and commit**

Write `dev-com/gpt/new/<unique-id>-app-service-ready.md` with the factory import path, public methods, seeded IDs, and test results, then run:

```bash
git add src/application src/data tests/domain
git commit -m "feat: persist demo cases behind app service"
```

### Task 6: Implement the design system and shared UI states — Codex

**Files:**
- Create: `src/app/AppServiceProvider.tsx`
- Create: `src/ui/Button.tsx`, `src/ui/Badge.tsx`, `src/ui/ConfidenceBar.tsx`, `src/ui/EmptyState.tsx`, `src/ui/CoverageNotice.tsx`, `src/ui/LoadingState.tsx`, `src/ui/Modal.tsx`
- Modify: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/shell.css`
- Create: `src/styles/components.css`, `src/styles/responsive.css`
- Test: `tests/ui/shared-states.test.tsx`

**Interfaces:**
- Consumes: `AppService` and `createDemoAppService()` from Claude-owned paths.
- Produces: `useAppService()`, reusable accessible primitives, visible loading/error/empty/coverage states, and responsive visual tokens.

- [ ] **Step 1: Write failing shared-state tests**

```tsx
it('labels missing coverage without implying customer inactivity', () => {
  render(<CoverageNotice source="Email" health="temporarily-unavailable" />);
  expect(screen.getByText(/email is temporarily unavailable/i)).toBeVisible();
  expect(screen.queryByText(/no reply/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/shared-states.test.tsx`

Expected: FAIL because shared UI primitives are missing.

- [ ] **Step 3: Implement the provider and primitives**

`AppServiceProvider` initializes exactly one service instance, exposes retry and explicit reset, and never triggers reset automatically after a persistence error. Buttons and modal controls have visible focus, keyboard behavior, disabled explanations, and minimum mobile touch targets.

- [ ] **Step 4: Implement exact design tokens**

```css
:root {
  --navy-950: #071729;
  --navy-900: #0b2038;
  --surface: #f7f9fc;
  --panel: #ffffff;
  --ink: #152235;
  --muted: #657287;
  --line: #dfe5ec;
  --blue: #1769e0;
  --green: #138a58;
  --amber: #b86a08;
  --danger: #b42318;
  --radius-sm: 6px;
  --radius-md: 10px;
  --shadow-focus: 0 0 0 3px rgb(23 105 224 / 22%);
}
```

- [ ] **Step 5: Run tests and build**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/shared-states.test.tsx && /opt/homebrew/bin/pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/AppServiceProvider.tsx src/ui src/styles tests/ui/shared-states.test.tsx
git commit -m "feat: add command center design system"
```

### Task 7: Build Today, All Actions, and Daily Brief — Codex

**Files:**
- Create: `src/features/today/TodayPage.tsx`, `src/features/today/NextBestMove.tsx`
- Create: `src/features/actions/ActionsPage.tsx`, `src/features/actions/PriorityLedger.tsx`
- Create: `src/features/brief/DailyBriefPage.tsx`
- Modify: `src/app/routes.tsx`
- Test: `tests/ui/today.test.tsx`, `tests/ui/actions.test.tsx`, `tests/ui/daily-brief.test.tsx`

**Interfaces:**
- Consumes: `getDashboard()` and `pinAction(actionId, reason)`.
- Produces: selected home hierarchy, next-three queue, explainable factors, filters, reasoned pinning, top-three founder decisions, and deep links.

- [ ] **Step 1: Write failing Today behavior test**

```tsx
it('shows one dominant action with evidence, confidence, gate effect, approval, and after-this queue', async () => {
  renderApp('/');
  expect(await screen.findByRole('heading', { name: /next best move/i })).toBeVisible();
  expect(screen.getByText(/why this outranks/i)).toBeVisible();
  expect(screen.getByText(/supporting evidence/i)).toBeVisible();
  expect(screen.getByText(/after this/i)).toBeVisible();
});
```

- [ ] **Step 2: Write failing queue and brief tests**

Test that approval/blocked/overdue filters change visible actions, pinning requires and records a reason, and each Daily Brief decision links to its account/evidence/approval destination.

- [ ] **Step 3: Verify failures**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/today.test.tsx tests/ui/actions.test.tsx tests/ui/daily-brief.test.tsx`

Expected: FAIL because the pages are not implemented.

- [ ] **Step 4: Implement the three routes against the service facade**

Match approved home image `04` and alternatives `01`–`02`. Keep one dominant recommendation above the fold, avoid vanity metrics, and show confidence as an explained value rather than an unexplained score.

- [ ] **Step 5: Run targeted UI tests and build**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/today.test.tsx tests/ui/actions.test.tsx tests/ui/daily-brief.test.tsx && /opt/homebrew/bin/pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/today src/features/actions src/features/brief src/app/routes.tsx tests/ui
git commit -m "feat: deliver founder action views"
```

### Task 8: Build Targets, Pipeline, and Evidence — Codex

**Files:**
- Create: `src/features/accounts/TargetsPage.tsx`, `src/features/accounts/AccountWorkspacePage.tsx`, `src/features/accounts/ThesisPanel.tsx`, `src/features/accounts/GateRail.tsx`
- Create: `src/features/pipeline/PipelinePage.tsx`, `src/features/pipeline/GateReviewDialog.tsx`, `src/features/pipeline/OverrideDialog.tsx`
- Create: `src/features/evidence/EvidencePage.tsx`, `src/features/evidence/EvidenceDetail.tsx`
- Modify: `src/app/routes.tsx`
- Test: `tests/ui/account-workspace.test.tsx`, `tests/ui/pipeline.test.tsx`, `tests/ui/evidence.test.tsx`

**Interfaces:**
- Consumes: `getAccount`, `listEvidence`, `requestStageAdvance`, `createOverride`.
- Produces: evolving account cases, evidence classifications, progress matrix, blocked gate review, and accountable overrides.

- [ ] **Step 1: Write failing classification and gate tests**

```tsx
it('keeps known, strong inference, and must learn visibly distinct', async () => {
  renderApp('/targets/racetrac');
  expect(await screen.findByText('Known')).toBeVisible();
  expect(screen.getByText('Strong inference')).toBeVisible();
  expect(screen.getByText('Must learn')).toBeVisible();
});

it('requires every accountability field before override submission', async () => {
  renderApp('/pipeline');
  await openBlockedGate();
  expect(screen.getByRole('button', { name: /record override/i })).toBeDisabled();
});
```

- [ ] **Step 2: Verify failure**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/account-workspace.test.tsx tests/ui/pipeline.test.tsx tests/ui/evidence.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement account case and evidence ledger**

Account tabs are Overview, Thesis, People, Discovery, Diagnostic, Pilot, Rollout, and Activity. Evidence detail shows source, capture time, freshness, confidence, linked claims, conflicts, and manual confirmation state. Missing source access remains a coverage notice.

- [ ] **Step 4: Implement evidence-earned pipeline progression**

Use a matrix, not draggable cards. Disabled advancement names unmet criteria. Overrides collect reason, explicit risk checkbox, author, and timestamp and remain visible on the account timeline.

- [ ] **Step 5: Run tests and build**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/account-workspace.test.tsx tests/ui/pipeline.test.tsx tests/ui/evidence.test.tsx && /opt/homebrew/bin/pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/accounts src/features/pipeline src/features/evidence src/app/routes.tsx tests/ui
git commit -m "feat: add evidence-gated account progression"
```

### Task 9: Build Approvals, Library, and degraded-source controls — Codex

**Files:**
- Create: `src/features/approvals/ApprovalsPage.tsx`, `src/features/approvals/ExactActionReview.tsx`, `src/features/approvals/DemoPresenceDialog.tsx`, `src/features/approvals/ReceiptView.tsx`
- Create: `src/features/library/LibraryPage.tsx`, `src/features/library/ArtifactView.tsx`
- Create: `src/features/settings/SettingsPage.tsx`, `src/features/settings/SourceHealthControls.tsx`
- Modify: `src/app/routes.tsx`
- Test: `tests/ui/approvals.test.tsx`, `tests/ui/library.test.tsx`, `tests/ui/source-health.test.tsx`

**Interfaces:**
- Consumes: approval, artifact, source-health, and reset methods from `AppService`.
- Produces: exact preview/edit/lock/demo-presence/receipt flow, local artifact export, independent source failure controls, and explicit demo reset.

- [ ] **Step 1: Write failing approval-flow tests**

```tsx
it('invalidates an existing authorization when exact content changes', async () => {
  renderApp('/approvals/action-racetrac-outreach');
  await lockAndConfirmExactAction();
  await userEvent.type(screen.getByLabelText(/content/i), '!');
  expect(screen.getByText(/approval invalidated/i)).toBeVisible();
  expect(screen.getByRole('button', { name: /complete demo action/i })).toBeDisabled();
});

it('always labels user-presence confirmation and receipts as simulation', async () => {
  renderApp('/approvals/action-racetrac-outreach');
  expect(await screen.findByText(/demo—no message will be sent/i)).toBeVisible();
});
```

- [ ] **Step 2: Write degraded-mode and library tests**

Verify email/calendar can both be unavailable while manual notes, target navigation, action pinning, gates, and local artifact export continue to work. Verify reset requires an explicit confirmation.

- [ ] **Step 3: Verify failures**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/approvals.test.tsx tests/ui/library.test.tsx tests/ui/source-health.test.tsx`

Expected: FAIL.

- [ ] **Step 4: Implement exact-action review and receipts**

Review displays exact channel, recipient/account, subject/content, attachments, timing, rationale, and customer context. Editing returns the item to Draft. Locking displays the payload hash. Demo presence confirmation is visibly simulated. Completed/failed/manual-review receipts are immutable in the UI, and no button contains provider-send code.

- [ ] **Step 5: Implement library and source controls**

Artifacts are versioned and downloaded locally using `Blob` plus an object URL. Source controls operate independently and show Connected, Not Connected, Stale, or Temporarily Unavailable. Reset is explicit and warns that local demo edits will be replaced.

- [ ] **Step 6: Run tests and build**

Run: `/opt/homebrew/bin/pnpm test -- tests/ui/approvals.test.tsx tests/ui/library.test.tsx tests/ui/source-health.test.tsx && /opt/homebrew/bin/pnpm build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/approvals src/features/library src/features/settings src/app/routes.tsx tests/ui
git commit -m "feat: add fail-closed approval experience"
```

### Task 10: Integrate, verify journeys, and close visual gaps — Codex with Claude review

**Files:**
- Create: `tests/e2e/core-workflows.spec.ts`, `tests/e2e/safety.spec.ts`, `tests/e2e/degraded-mode.spec.ts`, `tests/e2e/responsive.spec.ts`
- Modify only within the owning agent's paths when a defect is found.
- Update: the owning agent's status file and mailbox messages.

**Interfaces:**
- Consumes: complete app and all seeded IDs.
- Produces: verified vertical slice at desktop and mobile widths; evidence that safety invariants, graceful degradation, persistence, and primary journeys pass together.

- [ ] **Step 1: Write end-to-end journeys**

```ts
test('RaceTrac thesis reaches a completed simulated outreach receipt', async ({ page }) => {
  await page.goto('/targets/racetrac');
  await page.getByRole('link', { name: /review proposed outreach/i }).click();
  await expect(page.getByText(/demo—no message will be sent/i)).toBeVisible();
  await page.getByRole('button', { name: /approve this exact action/i }).click();
  await page.getByRole('button', { name: /confirm demo presence/i }).click();
  await page.getByRole('button', { name: /complete demo action/i }).click();
  await expect(page.getByText(/completed demo receipt/i)).toBeVisible();
});
```

Also implement H-E-B blocked gate → accountable override; Bagel Brands ownership verification → gate completion; email/calendar unavailable → core work remains usable; changed payload → denial; reused authorization → denial.

- [ ] **Step 2: Run all automated checks**

Run:

```bash
/opt/homebrew/bin/pnpm test
/opt/homebrew/bin/pnpm build
/opt/homebrew/bin/pnpm test:e2e
```

Expected: all PASS with no skipped safety test.

- [ ] **Step 3: Perform desktop visual comparison**

At one consistent desktop viewport, capture Today, RaceTrac Account Workspace, Approval flow, and Pipeline. Compare each implementation capture side-by-side with approved images `04`, `05`, `07`, and `08`; correct hierarchy, typography, spacing, borders, radii, colors, and overflow inside the responsible owner's paths.

- [ ] **Step 4: Perform mobile verification**

At 390×844, verify every primary route, nav access, dialog containment, table fallback, readable evidence, exact-action content, keyboard focus, and no horizontal document overflow.

- [ ] **Step 5: Ask Claude for domain/safety review**

Codex writes `dev-com/claude/new/<unique-id>-final-domain-review.md` requesting review of failed-closed behavior, contract usage, and absence of outbound/network provider code. Claude replies to `dev-com/gpt/new/reply:<unique-id>.md`; Codex handles the reply and moves it to `dev-com/gpt/processed/`.

- [ ] **Step 6: Run a forbidden-capability scan**

Run:

```bash
rg -n "nodemailer|sendgrid|mailgun|smtp|twitter|linkedin|facebook|fetch\(|XMLHttpRequest|sendMail|publishPost|postTo" src
```

Expected: no outbound provider, email/social client, or dispatcher network call. Any `fetch(` occurrence must be absent from the isolated approval/dispatcher path and justified before completion.

- [ ] **Step 7: Commit verified integration**

```bash
git add tests/e2e src
git commit -m "test: verify command center critical journeys"
```

## Final Completion Gate

Before calling the MVP complete, both agents must record fresh test results and clear active claims in their own status files. Codex must confirm the mailbox is handled, every primary route works, desktop and mobile comparisons were performed, and no real outbound capability exists. Claude must confirm domain invariants, persistence behavior, safety tests, and the application-service contract.
