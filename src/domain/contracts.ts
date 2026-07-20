// Application-service and persistence contracts.
//
// `AppService` is the single typed facade the React layer consumes. The
// repository contracts describe the persistence surface the Dexie layer
// (Task 5) implements. Nothing here exposes credentials, provider clients, a
// send/publish tool, or a network dispatcher: the model-facing surface can
// only produce internal proposals and request deterministic, fail-closed
// simulated authorization.

import type {
  Account,
  AccountCase,
  ActionProposal,
  ActivityEvent,
  AdvanceResult,
  ApprovalCase,
  ApprovalEnvelope,
  Artifact,
  Claim,
  DashboardSnapshot,
  DispatchReceipt,
  Evidence,
  ExactActionPayload,
  OverrideInput,
  SourceConnection,
  SourceHealth,
  StageGate,
  WorkspaceUser,
} from './types';

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
  lockExactAction(
    actionId: string,
    ownerId: string,
    expiresAt: string,
  ): Promise<ApprovalEnvelope>;
  confirmDemoPresence(envelopeId: string, ownerId: string): Promise<ApprovalEnvelope>;
  simulateDispatch(actionId: string, envelopeId: string): Promise<DispatchReceipt>;
  resetDemoData(): Promise<void>;
}

// A minimal, storage-agnostic collection contract. The Dexie implementation in
// `src/data/` satisfies these; domain and application code depend only on the
// interface so persistence can be swapped or faked in tests.
export interface Repository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  put(entity: T): Promise<void>;
  bulkPut(entities: T[]): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

// Append-only stores expose only reads and appends so callers cannot rewrite
// history (activity log, dispatch receipts).
export interface AppendOnlyRepository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  append(entity: T): Promise<void>;
  clear(): Promise<void>;
}

// Tracks whether the approved demo graph has been seeded so first-run seeding
// happens exactly once and never clobbers user mutations.
export interface MetaStore {
  isSeeded(): Promise<boolean>;
  markSeeded(): Promise<void>;
  clear(): Promise<void>;
}

export interface RepositoryBundle {
  users: Repository<WorkspaceUser>;
  accounts: Repository<Account>;
  claims: Repository<Claim>;
  evidence: Repository<Evidence>;
  sources: Repository<SourceConnection>;
  gates: Repository<StageGate>;
  actions: Repository<ActionProposal>;
  approvals: Repository<ApprovalEnvelope>;
  receipts: AppendOnlyRepository<DispatchReceipt>;
  artifacts: Repository<Artifact>;
  activity: AppendOnlyRepository<ActivityEvent>;
  meta: MetaStore;
}
