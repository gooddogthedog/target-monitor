// Stage-gate completion, earned advancement, and accountable-override rules.
//
// Advancement is *earned*, never dragged: every criterion must be complete and
// the gate must be unblocked. When it is not, an accountable override is the
// only path forward and it requires a reason, explicit risk acknowledgement,
// an author, and a timestamp — all recorded and left visible.

import {
  lifecyclePhases,
  type Account,
  type AdvanceResult,
  type LifecyclePhase,
  type OverrideInput,
  type StageGate,
} from './types';

export interface GateEvaluation {
  canAdvance: boolean;
  unmetCriteria: string[];
  blocker: string | null;
}

export function nextPhase(phase: LifecyclePhase): LifecyclePhase | null {
  const index = lifecyclePhases.indexOf(phase);
  if (index === -1 || index === lifecyclePhases.length - 1) return null;
  return lifecyclePhases[index + 1];
}

export function evaluateGate(gate: StageGate): GateEvaluation {
  const unmetCriteria = gate.criteria
    .filter((criterion) => !criterion.complete)
    .map((criterion) => criterion.label);
  return {
    canAdvance: unmetCriteria.length === 0 && gate.blocker === null,
    unmetCriteria,
    blocker: gate.blocker,
  };
}

// The earned path: advance only when the gate is genuinely satisfied and an
// approver is named. Returns the account moved to the next phase; never mutates
// the input.
export function advanceWithApproval(
  account: Account,
  gate: StageGate,
  approverId: string,
): AdvanceResult {
  if (!approverId.trim()) {
    return { ok: false, unmetCriteria: [], reason: 'An approver is required to advance a stage.' };
  }
  const evaluation = evaluateGate(gate);
  if (!evaluation.canAdvance) {
    return {
      ok: false,
      unmetCriteria: evaluation.unmetCriteria,
      reason:
        evaluation.blocker ??
        `Cannot advance: ${evaluation.unmetCriteria.length} gate criterion/criteria remain incomplete.`,
    };
  }
  const target = nextPhase(account.phase);
  if (target === null) {
    return { ok: false, unmetCriteria: [], reason: 'The account is already at the final phase.' };
  }
  return { ok: true, account: { ...account, phase: target }, overridden: false };
}

export function validateOverride(input: OverrideInput): string[] {
  return [
    !input.reason.trim() && 'Reason is required',
    !input.riskAcknowledged && 'Risk acknowledgement is required',
    !input.authorId && 'Author is required',
    !input.createdAt && 'Timestamp is required',
  ].filter((value): value is string => Boolean(value));
}

// The accountable-override path: bypasses unmet criteria only when every
// accountability field is present. The caller is responsible for recording the
// override on the account timeline and leaving it visible.
export function advanceWithOverride(account: Account, input: OverrideInput): AdvanceResult {
  const errors = validateOverride(input);
  if (errors.length > 0) {
    return { ok: false, unmetCriteria: [], reason: errors.join('; ') };
  }
  const target = nextPhase(account.phase);
  if (target === null) {
    return { ok: false, unmetCriteria: [], reason: 'The account is already at the final phase.' };
  }
  return { ok: true, account: { ...account, phase: target }, overridden: true };
}
