import { describe, expect, it } from 'vitest';
import { rankActions, scoreAction } from '../../src/domain/ranking';
import { demoData } from '../../src/fixtures/demoData';

const actions = demoData.actions;

describe('rankActions', () => {
  it('ranks with inspectable factors and a plain-language explanation', () => {
    const [first] = rankActions(actions);
    expect(first.score).toBeGreaterThan(0);
    expect(first.explanation).toMatch(/because/i);
    // The originating factors remain attached for inspection.
    expect(first.rankFactors).toBeDefined();
  });

  it('surfaces the RaceTrac outreach as the top unpinned move', () => {
    const ranked = rankActions(actions);
    expect(ranked[0].id).toBe('action-racetrac-outreach');
  });

  it('places a pinned action ahead of a higher-scoring unpinned action', () => {
    const withPin = actions.map((action) =>
      action.id === 'action-bagel-schedule'
        ? { ...action, pinnedReason: 'Founder priority' }
        : action,
    );
    const ranked = rankActions(withPin);
    expect(ranked[0].id).toBe('action-bagel-schedule');
    expect(ranked[0].explanation).toMatch(/pinned/i);
  });

  it('is a stable, pure function of its input order', () => {
    const a = rankActions(actions).map((r) => r.id);
    const b = rankActions([...actions].reverse()).map((r) => r.id);
    expect(a).toEqual(b);
  });
});

describe('scoreAction', () => {
  it('floors effort at 1 so it never divides by zero or inverts sign', () => {
    const factors = {
      impact: 2,
      readiness: 2,
      urgency: 2,
      unblockValue: 2,
      evidenceConfidence: 2,
      effort: 0,
      customerRisk: 0,
      costOfDelay: 0,
    };
    expect(scoreAction(factors)).toBe(32);
  });
});
