// Process-persistent in-memory RepositoryBundle.
//
// Used as the persistence driver when IndexedDB is unavailable (Node, SSR, test
// runners) so the application-service facade can be exercised without a browser.
// State is keyed by database name in a module-level registry, so two service
// instances that open the same name share data — mirroring how Dexie databases
// persist across page loads. Values are structured-cloned on read and write so
// callers can never mutate stored records by reference.

import type {
  AppendOnlyRepository,
  MetaStore,
  Repository,
  RepositoryBundle,
} from '../domain/contracts';
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

function clone<T>(value: T): T {
  return structuredClone(value);
}

class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  constructor(private readonly store: Map<string, T>) {}

  async getAll(): Promise<T[]> {
    return [...this.store.values()].map(clone);
  }
  async getById(id: string): Promise<T | undefined> {
    const found = this.store.get(id);
    return found ? clone(found) : undefined;
  }
  async put(entity: T): Promise<void> {
    this.store.set(entity.id, clone(entity));
  }
  async bulkPut(entities: T[]): Promise<void> {
    for (const entity of entities) this.store.set(entity.id, clone(entity));
  }
  async remove(id: string): Promise<void> {
    this.store.delete(id);
  }
  async clear(): Promise<void> {
    this.store.clear();
  }
}

class InMemoryAppendOnly<T extends { id: string }> implements AppendOnlyRepository<T> {
  constructor(private readonly store: Map<string, T>) {}

  async getAll(): Promise<T[]> {
    return [...this.store.values()].map(clone);
  }
  async append(entity: T): Promise<void> {
    this.store.set(entity.id, clone(entity));
  }
  async clear(): Promise<void> {
    this.store.clear();
  }
}

class InMemoryMeta implements MetaStore {
  constructor(private readonly flags: { seeded: boolean }) {}

  async isSeeded(): Promise<boolean> {
    return this.flags.seeded;
  }
  async markSeeded(): Promise<void> {
    this.flags.seeded = true;
  }
  async clear(): Promise<void> {
    this.flags.seeded = false;
  }
}

interface DatabaseState {
  users: Map<string, WorkspaceUser>;
  accounts: Map<string, Account>;
  claims: Map<string, Claim>;
  evidence: Map<string, Evidence>;
  sources: Map<string, SourceConnection>;
  gates: Map<string, StageGate>;
  actions: Map<string, ActionProposal>;
  approvals: Map<string, ApprovalEnvelope>;
  receipts: Map<string, DispatchReceipt>;
  artifacts: Map<string, Artifact>;
  activity: Map<string, ActivityEvent>;
  flags: { seeded: boolean };
}

const registry = new Map<string, DatabaseState>();

function stateFor(databaseName: string): DatabaseState {
  let state = registry.get(databaseName);
  if (!state) {
    state = {
      users: new Map(),
      accounts: new Map(),
      claims: new Map(),
      evidence: new Map(),
      sources: new Map(),
      gates: new Map(),
      actions: new Map(),
      approvals: new Map(),
      receipts: new Map(),
      artifacts: new Map(),
      activity: new Map(),
      flags: { seeded: false },
    };
    registry.set(databaseName, state);
  }
  return state;
}

export function createInMemoryRepositories(databaseName: string): RepositoryBundle {
  const state = stateFor(databaseName);
  return {
    users: new InMemoryRepository(state.users),
    accounts: new InMemoryRepository(state.accounts),
    claims: new InMemoryRepository(state.claims),
    evidence: new InMemoryRepository(state.evidence),
    sources: new InMemoryRepository(state.sources),
    gates: new InMemoryRepository(state.gates),
    actions: new InMemoryRepository(state.actions),
    approvals: new InMemoryRepository(state.approvals),
    receipts: new InMemoryAppendOnly(state.receipts),
    artifacts: new InMemoryRepository(state.artifacts),
    activity: new InMemoryAppendOnly(state.activity),
    meta: new InMemoryMeta(state.flags),
  };
}

// Test/reset affordance: drop a named database's process-memory state entirely.
export function dropInMemoryDatabase(databaseName: string): void {
  registry.delete(databaseName);
}
