// Canonical domain entities and enums for the Linq Action Command Center.
//
// Every value in this module is pure data: opaque string IDs and ISO-8601
// timestamps only. No behavior, no I/O, no provider clients. The presentation
// layer and the application facade both depend on these shapes, so changes
// here are announced to Codex through the mailbox before they land.

export const lifecyclePhases = [
  'target-brief',
  'account-thesis',
  'contacted',
  'discovery',
  'diagnostic',
  'pilot',
  'rollout',
] as const;
export type LifecyclePhase = (typeof lifecyclePhases)[number];

export type SourceHealth =
  | 'connected'
  | 'not-connected'
  | 'stale'
  | 'temporarily-unavailable';

export type ClaimClassification = 'known' | 'strong-inference' | 'must-learn';

export type ActionState =
  | 'draft'
  | 'awaiting-approval'
  | 'authorized'
  | 'completed'
  | 'failed-closed'
  | 'manual-review'
  | 'rejected';

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
  type:
    | 'target-brief'
    | 'outreach-draft'
    | 'discovery-memo'
    | 'diagnostic-baseline'
    | 'pilot-charter'
    | 'pilot-readout'
    | 'business-case'
    | 'rollout-blueprint'
    | 'proposal';
  version: number;
  status: 'draft' | 'reviewed' | 'approved';
  title: string;
  content: string;
  updatedAt: string;
}

// Append-only activity record. Feeds the Daily Brief change feed and the
// account timeline. Seeded with a short history per account; the facade only
// ever appends to it.
export interface ActivityEvent {
  id: string;
  accountId: string;
  kind:
    | 'evidence-added'
    | 'claim-updated'
    | 'gate-advanced'
    | 'override-recorded'
    | 'action-proposed'
    | 'approval-locked'
    | 'dispatch-simulated'
    | 'source-health-changed';
  summary: string;
  occurredAt: string;
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
  changes: Array<{
    id: string;
    accountId: string;
    summary: string;
    occurredAt: string;
  }>;
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
