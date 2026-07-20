// Network-free, fail-closed dispatcher simulator.
//
// This module deliberately imports NO HTTP, email, social, browser, or network
// client. It has no outbound path. Its only outputs are deterministic local
// receipts: `completed` (a simulated success — nothing was actually sent),
// `failed-closed`, or `manual-review`. An ambiguous outcome goes to manual
// review and is never automatically retried. Authorization is consumed exactly
// once; a reused idempotency key is denied.

import { validateDispatch, type ValidateDispatchInput } from '../domain/approval';
import type { DispatchReceipt } from '../domain/types';

export type DispatchOutcome = 'success' | 'failure' | 'ambiguous';

function receiptId(): string {
  return `rcpt-${crypto.randomUUID()}`;
}

export class DispatcherSimulator {
  // Never incremented. Its presence documents — and lets tests assert — that no
  // external provider is ever invoked on any path, valid or invalid.
  readonly externalCalls = 0;

  // Enforces single use independently of the envelope's own `usedAt`, so a
  // replayed authorization is denied even if the caller forgot to persist usage.
  private readonly consumedKeys = new Set<string>();

  private receipt(
    input: ValidateDispatchInput,
    state: DispatchReceipt['state'],
    reason: string,
    providerStyleReference: string | null,
  ): DispatchReceipt {
    return {
      id: receiptId(),
      actionId: input.actionId,
      envelopeId: input.envelope.id,
      state,
      reason,
      providerStyleReference,
      attemptCount: 1, // exactly one attempt, ever — no automatic retry
      createdAt: input.now,
    };
  }

  async dispatch(input: ValidateDispatchInput, outcome: DispatchOutcome): Promise<DispatchReceipt> {
    const check = await validateDispatch(input);
    if (!check.ok) {
      return this.receipt(input, 'failed-closed', check.reason, null);
    }

    if (this.consumedKeys.has(input.envelope.idempotencyKey)) {
      return this.receipt(
        input,
        'failed-closed',
        'Authorization already consumed (idempotency key reuse).',
        null,
      );
    }
    // Consume before producing any outcome so even an ambiguous or failing
    // result cannot be retried against the same authorization.
    this.consumedKeys.add(input.envelope.idempotencyKey);

    if (outcome === 'ambiguous') {
      return this.receipt(
        input,
        'manual-review',
        'Provider result ambiguous; routed to manual review with no automatic retry.',
        null,
      );
    }
    if (outcome === 'failure') {
      return this.receipt(
        input,
        'failed-closed',
        'Simulated provider failure; no message was sent.',
        null,
      );
    }
    return this.receipt(
      input,
      'completed',
      'Completed demo receipt — no real message was sent.',
      `demo:${input.envelope.payloadHash.slice(0, 12)}`,
    );
  }
}
