import { describe, expect, it } from 'vitest';
import { evaluateCoverage } from '../../src/domain/evidence';
import { demoData } from '../../src/fixtures/demoData';

const claims = demoData.claims.filter((claim) => claim.accountId === 'heb');
const emailSource = demoData.sources.find((source) => source.type === 'email')!;
const connectedSources = demoData.sources.filter((source) => source.health === 'connected');

describe('evaluateCoverage', () => {
  it('does not convert unavailable email into evidence of no reply', () => {
    const result = evaluateCoverage(claims, [
      { ...emailSource, health: 'temporarily-unavailable' },
    ]);
    expect(result.coverageNotices).toContain('Email is temporarily unavailable');
    expect(result.negativeCustomerSignals).toEqual([]);
  });

  it('lowers confidence when a source is degraded but never fabricates signals', () => {
    const healthy = evaluateCoverage([], connectedSources);
    const degraded = evaluateCoverage([], [{ ...emailSource, health: 'stale' }]);
    expect(degraded.confidencePenalty).toBeGreaterThan(healthy.confidencePenalty);
    expect(degraded.negativeCustomerSignals).toEqual([]);
  });

  it('reports open must-learn questions as coverage, not as customer negatives', () => {
    const result = evaluateCoverage(claims, connectedSources);
    expect(result.coverageNotices.some((note) => /must-learn/.test(note))).toBe(true);
    expect(result.negativeCustomerSignals).toEqual([]);
  });

  it('emits no notices when every source is connected and no questions are open', () => {
    const result = evaluateCoverage([], connectedSources);
    expect(result.coverageNotices).toEqual([]);
    expect(result.confidencePenalty).toBe(0);
  });
});
