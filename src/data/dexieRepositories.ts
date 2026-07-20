// Dexie-backed RepositoryBundle.
//
// Thin adapters that satisfy the storage-agnostic contracts using Dexie tables.
// No business logic lives here — the application facade owns orchestration and
// the domain modules own the rules.

import type { Table } from 'dexie';
import { CommandCenterDatabase } from './database';
import type {
  AppendOnlyRepository,
  MetaStore,
  Repository,
  RepositoryBundle,
} from '../domain/contracts';

class DexieRepository<T extends { id: string }> implements Repository<T> {
  constructor(private readonly table: Table<T, string>) {}

  getAll(): Promise<T[]> {
    return this.table.toArray();
  }
  getById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }
  async put(entity: T): Promise<void> {
    await this.table.put(entity);
  }
  async bulkPut(entities: T[]): Promise<void> {
    await this.table.bulkPut(entities);
  }
  async remove(id: string): Promise<void> {
    await this.table.delete(id);
  }
  async clear(): Promise<void> {
    await this.table.clear();
  }
}

class DexieAppendOnly<T extends { id: string }> implements AppendOnlyRepository<T> {
  constructor(private readonly table: Table<T, string>) {}

  getAll(): Promise<T[]> {
    return this.table.toArray();
  }
  async append(entity: T): Promise<void> {
    await this.table.put(entity);
  }
  async clear(): Promise<void> {
    await this.table.clear();
  }
}

class DexieMeta implements MetaStore {
  constructor(private readonly database: CommandCenterDatabase) {}

  async isSeeded(): Promise<boolean> {
    const row = await this.database.meta.get('seeded');
    return row?.value === 'true';
  }
  async markSeeded(): Promise<void> {
    await this.database.meta.put({ id: 'seeded', value: 'true' });
  }
  async clear(): Promise<void> {
    await this.database.meta.delete('seeded');
  }
}

export function createDexieRepositories(databaseName?: string): RepositoryBundle {
  const database = new CommandCenterDatabase(databaseName);
  return {
    users: new DexieRepository(database.users),
    accounts: new DexieRepository(database.accounts),
    claims: new DexieRepository(database.claims),
    evidence: new DexieRepository(database.evidence),
    sources: new DexieRepository(database.sources),
    gates: new DexieRepository(database.gates),
    actions: new DexieRepository(database.actions),
    approvals: new DexieRepository(database.approvals),
    receipts: new DexieAppendOnly(database.receipts),
    artifacts: new DexieRepository(database.artifacts),
    activity: new DexieAppendOnly(database.activity),
    meta: new DexieMeta(database),
  };
}
