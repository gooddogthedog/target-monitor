import { describe, expect, it } from 'vitest';
import {
  createInMemoryRepositories,
  dropInMemoryDatabase,
} from '../../src/data/inMemoryStore';
import type { Account } from '../../src/domain/types';

function account(id: string, phase: Account['phase'] = 'target-brief'): Account {
  return {
    id,
    name: id,
    brands: [],
    estateSummary: '',
    qualificationScore: 0,
    ownerId: 'user-caleb',
    phase,
  };
}

describe('in-memory repositories', () => {
  it('supports put/get/bulkPut/remove/clear', async () => {
    const name = `repo-test-${crypto.randomUUID()}`;
    const repos = createInMemoryRepositories(name);
    await repos.accounts.bulkPut([account('a'), account('b')]);
    expect((await repos.accounts.getAll()).map((x) => x.id).sort()).toEqual(['a', 'b']);
    await repos.accounts.put({ ...account('a'), phase: 'discovery' });
    expect((await repos.accounts.getById('a'))?.phase).toBe('discovery');
    await repos.accounts.remove('b');
    expect(await repos.accounts.getById('b')).toBeUndefined();
    await repos.accounts.clear();
    expect(await repos.accounts.getAll()).toEqual([]);
    dropInMemoryDatabase(name);
  });

  it('persists across bundles that open the same database name', async () => {
    const name = `repo-shared-${crypto.randomUUID()}`;
    const first = createInMemoryRepositories(name);
    await first.accounts.put(account('shared'));
    const second = createInMemoryRepositories(name);
    expect(await second.accounts.getById('shared')).toBeDefined();
    dropInMemoryDatabase(name);
  });

  it('does not leak stored records by reference', async () => {
    const name = `repo-clone-${crypto.randomUUID()}`;
    const repos = createInMemoryRepositories(name);
    const original = account('c');
    await repos.accounts.put(original);
    original.phase = 'rollout';
    expect((await repos.accounts.getById('c'))?.phase).toBe('target-brief');
    const fetched = (await repos.accounts.getById('c'))!;
    fetched.phase = 'pilot';
    expect((await repos.accounts.getById('c'))?.phase).toBe('target-brief');
    dropInMemoryDatabase(name);
  });

  it('tracks seeded state via the meta store', async () => {
    const name = `repo-meta-${crypto.randomUUID()}`;
    const repos = createInMemoryRepositories(name);
    expect(await repos.meta.isSeeded()).toBe(false);
    await repos.meta.markSeeded();
    expect(await repos.meta.isSeeded()).toBe(true);
    await repos.meta.clear();
    expect(await repos.meta.isSeeded()).toBe(false);
    dropInMemoryDatabase(name);
  });
});
