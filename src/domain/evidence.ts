// Evidence classification and source-coverage rules.
//
// Core invariant: a missing, stale, or unavailable source is a *coverage gap*,
// never negative customer evidence. "Email unavailable" must never be read as
// "the customer did not reply." Absence lowers confidence and is surfaced as a
// notice; it never manufactures a customer signal.

import type { Claim, SourceConnection, SourceHealth } from './types';

export interface CoverageEvaluation {
  coverageNotices: string[];
  confidencePenalty: number;
  negativeCustomerSignals: string[];
}

const SOURCE_LABEL: Record<SourceConnection['type'], string> = {
  'public-web': 'Public web',
  email: 'Email',
  calendar: 'Calendar',
  file: 'Files',
  manual: 'Manual notes',
};

const HEALTH_PHRASE: Record<SourceHealth, string | null> = {
  connected: null,
  'not-connected': 'not connected',
  stale: 'stale',
  'temporarily-unavailable': 'temporarily unavailable',
};

// How much a degraded source erodes confidence. Small, additive, deterministic.
const HEALTH_PENALTY: Record<SourceHealth, number> = {
  connected: 0,
  stale: 0.1,
  'not-connected': 0.15,
  'temporarily-unavailable': 0.2,
};

export function coverageNoticeFor(
  source: Pick<SourceConnection, 'type' | 'health'>,
): string | null {
  const phrase = HEALTH_PHRASE[source.health];
  if (phrase === null) return null;
  return `${SOURCE_LABEL[source.type]} is ${phrase}`;
}

export function evaluateCoverage(
  claims: Claim[],
  sources: SourceConnection[],
): CoverageEvaluation {
  const coverageNotices: string[] = [];
  let confidencePenalty = 0;

  for (const source of sources) {
    const notice = coverageNoticeFor(source);
    if (notice) {
      coverageNotices.push(notice);
      confidencePenalty += HEALTH_PENALTY[source.health];
    }
  }

  // Open "must-learn" questions are a coverage gap too, but only ever lower
  // confidence — they are never treated as negative customer evidence.
  const openQuestions = claims.filter((claim) => claim.classification === 'must-learn').length;
  if (openQuestions > 0) {
    coverageNotices.push(
      `${openQuestions} open must-learn ${openQuestions === 1 ? 'question' : 'questions'} remain`,
    );
    confidencePenalty += Math.min(0.3, openQuestions * 0.05);
  }

  return {
    coverageNotices,
    confidencePenalty: Number(confidencePenalty.toFixed(2)),
    // Absence is never a negative signal. This list stays empty for coverage
    // gaps by construction; genuine negatives would come from confirmed,
    // evidence-backed claims, not from a disconnected or silent source.
    negativeCustomerSignals: [],
  };
}
