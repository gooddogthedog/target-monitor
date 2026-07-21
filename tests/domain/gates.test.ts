import { describe, expect, it } from 'vitest';
import {
  advanceWithApproval,
  advanceWithOverride,
  evaluateGate,
  nextPhase,
  validateOverride,
} from '../../src/domain/gates';
import { demoData } from '../../src/fixtures/demoData';
import type { OverrideInput } from '../../src/domain/types';

const accounts = Object.fromEntries(demoData.accounts.map((a) => [a.id, a]));
const gates = Object.fromEntries(demoData.gates.map((g) => [g.accountId, g]));

const blockedGate = gates.heb; // has an unmet criterion and a blocker
const bagelGate = gates['bagel-brands']; // unmet criterion, no blocker

describe('evaluateGate', () => {
  it('rejects advancement when criteria are missing and no accountable override exists', () => {
    expect(evaluateGate(blockedGate)).toEqual(expect.objectContaining({ canAdvance: false }));
  });

  it('names the unmet criteria and preserves any blocker', () => {
    const result = evaluateGate(blockedGate);
    expect(result.unmetCriteria.length).toBeGreaterThan(0);
    expect(result.blocker).toBe(blockedGate.blocker);
  });
});

describe('advanceWithApproval', () => {
  it('refuses to advance a blocked gate', () => {
    const result = advanceWithApproval(accounts.heb, blockedGate, 'user-caleb');
    expect(result.ok).toBe(false);
  });

  it('requires a named approver', () => {
    const openGate = { ...bagelGate, criteria: bagelGate.criteria.map((c) => ({ ...c, complete: true })) };
    expect(advanceWithApproval(accounts['bagel-brands'], openGate, '  ').ok).toBe(false);
  });

  it('advances to the next phase when the gate is fully satisfied', () => {
    const openGate = { ...bagelGate, criteria: bagelGate.criteria.map((c) => ({ ...c, complete: true })) };
    const result = advanceWithApproval(accounts['bagel-brands'], openGate, 'user-jordan');
    expect(result).toEqual({
      ok: true,
      account: expect.objectContaining({ phase: 'discovery' }),
      overridden: false,
    });
  });

  it('does not mutate the input account', () => {
    const openGate = { ...bagelGate, criteria: bagelGate.criteria.map((c) => ({ ...c, complete: true })) };
    advanceWithApproval(accounts['bagel-brands'], openGate, 'user-jordan');
    expect(accounts['bagel-brands'].phase).toBe('contacted');
  });
});

describe('validateOverride / advanceWithOverride', () => {
  const validInput: OverrideInput = {
    gateId: blockedGate.id,
    reason: 'Customer verbally confirmed data access; formal grant pending.',
    riskAcknowledged: true,
    authorId: 'user-caleb',
    createdAt: '2026-07-20T15:00:00.000Z',
  };

  it('lists every missing accountability field', () => {
    expect(validateOverride({ ...validInput, reason: '', riskAcknowledged: false })).toEqual([
      'Reason is required',
      'Risk acknowledgement is required',
    ]);
  });

  it('accepts a complete override and advances with the overridden flag set', () => {
    expect(validateOverride(validInput)).toEqual([]);
    const result = advanceWithOverride(accounts.heb, validInput);
    expect(result).toEqual({
      ok: true,
      account: expect.objectContaining({ phase: 'diagnostic' }),
      overridden: true,
    });
  });

  it('refuses an override missing accountability fields', () => {
    expect(advanceWithOverride(accounts.heb, { ...validInput, riskAcknowledged: false }).ok).toBe(false);
  });
});

describe('nextPhase', () => {
  it('returns null at the final phase', () => {
    expect(nextPhase('rollout')).toBeNull();
    expect(nextPhase('target-brief')).toBe('account-thesis');
  });
});
