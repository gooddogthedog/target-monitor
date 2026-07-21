// Dexie/IndexedDB schema for the Action Command Center.
//
// Schema only: no business logic and no outbound path. Repository
// implementations in `dexieRepositories.ts` wrap these tables behind the
// storage-agnostic contracts the application facade depends on.

import Dexie, { type Table } from 'dexie';
import type {
  Account,
  ActionProposal,
  ActivityEvent,
  ApprovalEnvelope,
  Artifact,
  Claim,
  DispatchReceipt,
  Evidence,
  SourceConnection,
  StageGate,
  WorkspaceUser,
} from '../domain/types';

export const DEXIE_DEFAULT_DATABASE_NAME = 'linq-action-command-center';

// Single-row key/value table used to track first-run seeding.
export interface MetaRow {
  id: string;
  value: string;
}

export class CommandCenterDatabase extends Dexie {
  users!: Table<WorkspaceUser, string>;
  accounts!: Table<Account, string>;
  claims!: Table<Claim, string>;
  evidence!: Table<Evidence, string>;
  sources!: Table<SourceConnection, string>;
  gates!: Table<StageGate, string>;
  actions!: Table<ActionProposal, string>;
  approvals!: Table<ApprovalEnvelope, string>;
  receipts!: Table<DispatchReceipt, string>;
  artifacts!: Table<Artifact, string>;
  activity!: Table<ActivityEvent, string>;
  meta!: Table<MetaRow, string>;

  constructor(name = DEXIE_DEFAULT_DATABASE_NAME) {
    super(name);
    this.version(1).stores({
      users: 'id',
      accounts: 'id, phase, ownerId',
      claims: 'id, accountId, classification',
      evidence: 'id, accountId, sourceId, capturedAt',
      sources: 'id, type, health',
      gates: 'id, accountId, phase',
      actions: 'id, accountId, state, dueAt',
      approvals: 'id, actionId, ownerId, expiresAt, usedAt',
      receipts: 'id, actionId, state, createdAt',
      artifacts: 'id, accountId, phase, type, version',
      activity: 'id, accountId, occurredAt',
      meta: 'id',
    });
  }
}
