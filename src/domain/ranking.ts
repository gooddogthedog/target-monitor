// Deterministic, explainable action ranking.
//
// The score is an explainable aid, never an unquestionable verdict. Every
// factor is preserved on the returned `RankedAction` and summarized in plain
// language so a founder can inspect *why* one move outranks another. Pinned
// actions are surfaced first (founder override), then remaining actions by
// score, descending. Ranking is a pure function of its inputs.

import type { ActionProposal, RankFactors, RankedAction } from './types';

// Impact × readiness × urgency × unblock value × evidence confidence ÷ effort,
// adjusted for cost of delay and customer risk. Effort is floored at 1 so a
// zero/negative effort can never divide by zero or invert the sign.
export function scoreAction(f: RankFactors): number {
  const effort = Math.max(1, f.effort);
  const base =
    (f.impact * f.readiness * f.urgency * f.unblockValue * f.evidenceConfidence) / effort;
  return Number((base + f.costOfDelay - f.customerRisk).toFixed(2));
}

function level(value: number): 'low' | 'moderate' | 'high' {
  if (value <= 2) return 'low';
  if (value === 3) return 'moderate';
  return 'high';
}

// Effort reads inversely: low effort is favorable, high effort is a drag.
function effortLevel(value: number): 'low' | 'moderate' | 'high' {
  if (value <= 2) return 'low';
  if (value === 3) return 'moderate';
  return 'high';
}

export function explainAction(action: ActionProposal): string {
  const f = action.rankFactors;
  const reasons =
    `urgency is ${level(f.urgency)}, unblock value is ${level(f.unblockValue)}, ` +
    `evidence confidence is ${level(f.evidenceConfidence)}, and effort is ${effortLevel(f.effort)}`;
  if (action.pinnedReason) {
    return `Pinned by the founder (${action.pinnedReason}), and otherwise prioritized because ${reasons}.`;
  }
  return `Prioritized because ${reasons}.`;
}

export function rankActions(actions: ActionProposal[]): RankedAction[] {
  return actions
    .map((action) => ({
      ...action,
      score: scoreAction(action.rankFactors),
      explanation: explainAction(action),
    }))
    .sort((a, b) => {
      // Founder-pinned actions always lead the queue.
      const pinDelta = Number(Boolean(b.pinnedReason)) - Number(Boolean(a.pinnedReason));
      if (pinDelta !== 0) return pinDelta;
      if (b.score !== a.score) return b.score - a.score;
      // Deterministic tie-break so the order is stable across runs.
      return a.id.localeCompare(b.id);
    });
}
