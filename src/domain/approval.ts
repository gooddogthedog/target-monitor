// Exact-action authorization: canonicalization, hashing, and fail-closed
// validation.
//
// The model can never send. It can only produce an internal proposal. Turning a
// proposal into a (simulated) dispatch requires a separate deterministic path:
// a single-use authorization bound to the exact canonical payload hash, the
// owner identity, the action ID, and an expiry. Any missing, expired, reused,
// changed, wrong-owner, disconnected, or outbound-disabled condition denies the
// action. This module imports no HTTP, email, social, or provider client.

import type { ApprovalEnvelope, ExactActionPayload } from './types';

// Stable canonical form. Keys are ordered and attachment IDs sorted so that
// semantically identical payloads hash identically and any real edit changes
// the hash.
export function canonicalizePayload(payload: ExactActionPayload): string {
  return JSON.stringify({
    attachmentIds: [...payload.attachmentIds].sort(),
    channel: payload.channel,
    content: payload.content,
    recipientOrAccount: payload.recipientOrAccount,
    scheduledFor: payload.scheduledFor,
    subject: payload.subject ?? null,
  });
}

export async function hashPayload(payload: ExactActionPayload): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalizePayload(payload));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface AuthorizeInput {
  actionId: string;
  ownerId: string;
  payload: ExactActionPayload;
  expiresAt: string;
}

// Create a locked authorization bound to the exact current payload. Confirmation
// (user presence) and consumption happen later; the envelope starts unconfirmed
// and unused.
export async function authorizeExactAction(input: AuthorizeInput): Promise<ApprovalEnvelope> {
  const payloadHash = await hashPayload(input.payload);
  return {
    id: `env-${crypto.randomUUID()}`,
    actionId: input.actionId,
    ownerId: input.ownerId,
    payloadHash,
    expiresAt: input.expiresAt,
    confirmedAt: null,
    usedAt: null,
    idempotencyKey: crypto.randomUUID(),
  };
}

// Record simulated user-presence confirmation. Only the bound owner may confirm.
// Returns a new envelope; never mutates the input. Returns null on owner
// mismatch so the caller fails closed.
export function confirmPresence(
  envelope: ApprovalEnvelope,
  ownerId: string,
  now: string,
): ApprovalEnvelope | null {
  if (envelope.ownerId !== ownerId) return null;
  if (envelope.usedAt !== null) return null;
  return { ...envelope, confirmedAt: now };
}

// Mark an authorization consumed. Single-use: refuses if already used.
export function markUsed(envelope: ApprovalEnvelope, now: string): ApprovalEnvelope | null {
  if (envelope.usedAt !== null) return null;
  return { ...envelope, usedAt: now };
}

export interface ValidateDispatchInput {
  actionId: string;
  ownerId: string;
  payload: ExactActionPayload;
  envelope: ApprovalEnvelope;
  now: string;
  integrationAvailable: boolean;
  outboundEnabled: boolean;
}

// The single choke point. Returns ok only when every condition holds. Ordered so
// the reason is the first violated invariant; all paths are side-effect free and
// touch no provider.
export async function validateDispatch(
  input: ValidateDispatchInput,
): Promise<{ ok: boolean; reason: string }> {
  const { envelope } = input;

  if (!input.outboundEnabled) {
    return { ok: false, reason: 'Outbound is disabled; no action taken.' };
  }
  if (!input.integrationAvailable) {
    return { ok: false, reason: 'Required integration is unavailable; no action taken.' };
  }
  if (envelope.ownerId !== input.ownerId) {
    return { ok: false, reason: 'Approving owner does not match the authorization.' };
  }
  if (envelope.actionId !== input.actionId) {
    return { ok: false, reason: 'Authorization is bound to a different action.' };
  }
  if (envelope.confirmedAt === null) {
    return { ok: false, reason: 'User-presence confirmation is required.' };
  }
  if (envelope.usedAt !== null) {
    return { ok: false, reason: 'Authorization has already been used.' };
  }
  if (input.now > envelope.expiresAt) {
    return { ok: false, reason: 'Authorization has expired.' };
  }
  const currentHash = await hashPayload(input.payload);
  if (currentHash !== envelope.payloadHash) {
    return { ok: false, reason: 'Payload changed after approval; authorization invalidated.' };
  }
  return { ok: true, reason: 'Authorization valid for a single simulated dispatch.' };
}
