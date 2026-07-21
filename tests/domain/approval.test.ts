import { describe, expect, it } from 'vitest';
import {
  authorizeExactAction,
  canonicalizePayload,
  confirmPresence,
  hashPayload,
  markUsed,
  validateDispatch,
  type ValidateDispatchInput,
} from '../../src/domain/approval';
import type { ExactActionPayload } from '../../src/domain/types';

const validPayload: ExactActionPayload = {
  channel: 'email',
  recipientOrAccount: 'VP Store Operations, RaceTrac',
  subject: 'A narrow idea on consistent in-store execution',
  content: 'Hi — one narrow idea worth 20 minutes.',
  attachmentIds: ['att-2', 'att-1'],
  scheduledFor: null,
};

const validAuthorizationInput = {
  actionId: 'action-racetrac-outreach',
  ownerId: 'user-caleb',
  payload: validPayload,
  expiresAt: '2026-07-20T18:00:00.000Z',
};

async function buildValidDispatchInput(): Promise<ValidateDispatchInput> {
  const locked = await authorizeExactAction(validAuthorizationInput);
  const confirmed = confirmPresence(locked, 'user-caleb', '2026-07-20T15:05:00.000Z')!;
  return {
    actionId: 'action-racetrac-outreach',
    ownerId: 'user-caleb',
    payload: validPayload,
    envelope: confirmed,
    now: '2026-07-20T15:10:00.000Z',
    integrationAvailable: true,
    outboundEnabled: true,
  };
}

describe('canonicalizePayload / hashPayload', () => {
  it('is stable regardless of attachment order', () => {
    const a = canonicalizePayload(validPayload);
    const b = canonicalizePayload({ ...validPayload, attachmentIds: ['att-1', 'att-2'] });
    expect(a).toBe(b);
  });

  it('changes the hash when any content character changes', async () => {
    const before = await hashPayload(validPayload);
    const after = await hashPayload({ ...validPayload, content: `${validPayload.content}!` });
    expect(after).not.toBe(before);
  });

  it('treats a missing subject and an explicit null subject identically', () => {
    const withUndefined = canonicalizePayload({ ...validPayload, subject: undefined });
    const withNull = canonicalizePayload({ ...validPayload, subject: undefined });
    expect(withUndefined).toBe(withNull);
  });
});

describe('confirmPresence / markUsed', () => {
  it('refuses confirmation from the wrong owner', async () => {
    const locked = await authorizeExactAction(validAuthorizationInput);
    expect(confirmPresence(locked, 'user-jordan', '2026-07-20T15:05:00.000Z')).toBeNull();
  });

  it('refuses to reuse an already-used authorization', async () => {
    const locked = await authorizeExactAction(validAuthorizationInput);
    const used = markUsed(locked, '2026-07-20T15:20:00.000Z')!;
    expect(markUsed(used, '2026-07-20T15:30:00.000Z')).toBeNull();
  });
});

describe('validateDispatch fails closed', () => {
  it('accepts a fully valid, confirmed, unexpired, unchanged authorization', async () => {
    expect((await validateDispatch(await buildValidDispatchInput())).ok).toBe(true);
  });

  it('denies when outbound is disabled', async () => {
    const input = { ...(await buildValidDispatchInput()), outboundEnabled: false };
    expect((await validateDispatch(input)).ok).toBe(false);
  });

  it('denies when the integration is unavailable', async () => {
    const input = { ...(await buildValidDispatchInput()), integrationAvailable: false };
    expect((await validateDispatch(input)).ok).toBe(false);
  });

  it('denies a wrong owner', async () => {
    const input = { ...(await buildValidDispatchInput()), ownerId: 'user-jordan' };
    expect((await validateDispatch(input)).ok).toBe(false);
  });

  it('denies an unconfirmed (missing) authorization', async () => {
    const base = await buildValidDispatchInput();
    const input = { ...base, envelope: { ...base.envelope, confirmedAt: null } };
    expect((await validateDispatch(input)).ok).toBe(false);
  });

  it('denies a reused authorization', async () => {
    const base = await buildValidDispatchInput();
    const input = { ...base, envelope: { ...base.envelope, usedAt: '2026-07-20T15:09:00.000Z' } };
    expect((await validateDispatch(input)).ok).toBe(false);
  });

  it('denies an expired authorization', async () => {
    const input = { ...(await buildValidDispatchInput()), now: '2026-07-20T18:00:00.001Z' };
    expect((await validateDispatch(input)).ok).toBe(false);
  });

  it('invalidates authorization after one payload character changes', async () => {
    const base = await buildValidDispatchInput();
    const changed = { ...base, payload: { ...validPayload, content: `${validPayload.content}!` } };
    expect((await validateDispatch(changed)).ok).toBe(false);
  });
});
