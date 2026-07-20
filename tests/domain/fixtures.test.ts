import { describe, expect, it } from 'vitest';
import { demoData } from '../../src/fixtures/demoData';
import { lifecyclePhases } from '../../src/domain/types';

describe('demo data', () => {
  it('contains the three approved accounts and preserves evidence links', () => {
    expect(demoData.accounts.map((account) => account.name).sort()).toEqual([
      'Bagel Brands',
      'H-E-B',
      'RaceTrac',
    ]);
    const claimIds = new Set(demoData.claims.map((claim) => claim.id));
    expect(
      demoData.evidence.every((item) => item.claimIds.every((id) => claimIds.has(id))),
    ).toBe(true);
  });

  it('keeps evidence conflict references resolvable within the graph', () => {
    const evidenceIds = new Set(demoData.evidence.map((item) => item.id));
    for (const item of demoData.evidence) {
      for (const conflictId of item.conflictsWithEvidenceIds) {
        expect(evidenceIds.has(conflictId)).toBe(true);
      }
    }
  });

  it('references only known accounts, sources, and owners across entities', () => {
    const accountIds = new Set(demoData.accounts.map((account) => account.id));
    const sourceIds = new Set(demoData.sources.map((source) => source.id));
    const userIds = new Set(demoData.users.map((user) => user.id));

    for (const account of demoData.accounts) {
      expect(userIds.has(account.ownerId)).toBe(true);
      expect(lifecyclePhases).toContain(account.phase);
    }
    for (const claim of demoData.claims) {
      expect(accountIds.has(claim.accountId)).toBe(true);
    }
    for (const item of demoData.evidence) {
      expect(accountIds.has(item.accountId)).toBe(true);
      expect(sourceIds.has(item.sourceId)).toBe(true);
    }
    for (const action of demoData.actions) {
      expect(accountIds.has(action.accountId)).toBe(true);
      expect(userIds.has(action.ownerId)).toBe(true);
    }
    for (const gate of demoData.gates) {
      expect(accountIds.has(gate.accountId)).toBe(true);
    }
  });

  it('provides at least one blocked gate and the seeded RaceTrac outreach action', () => {
    expect(demoData.gates.some((gate) => gate.blocker !== null)).toBe(true);
    const outreach = demoData.actions.find((action) => action.id === 'action-racetrac-outreach');
    expect(outreach).toBeDefined();
    expect(outreach?.type).toBe('outreach');
    expect(outreach?.payload).not.toBeNull();
  });
});
