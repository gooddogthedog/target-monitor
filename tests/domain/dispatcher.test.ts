import { describe, expect, it } from 'vitest';
import { DispatcherSimulator } from '../../src/simulators/dispatcher';
import {
  authorizeExactAction,
  confirmPresence,
  type ValidateDispatchInput,
} from '../../src/domain/approval';
import type { ExactActionPayload } from '../../src/domain/types';

const validPayload: ExactActionPayload = {
  channel: 'email',
  recipientOrAccount: 'VP Store Operations, RaceTrac',
  subject: 'A narrow idea',
  content: 'Hi — one narrow idea worth 20 minutes.',
  attachmentIds: [],
  scheduledFor: null,
};

const authInput = {
  actionId: 'action-racetrac-outreach',
  ownerId: 'user-caleb',
  payload: validPayload,
  expiresAt: '2026-07-20T18:00:00.000Z',
};

async function validInput(): Promise<ValidateDispatchInput> {
  const locked = await authorizeExactAction(authInput);
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

type Condition =
  | 'missing-token'
  | 'expired-token'
  | 'changed-payload'
  | 'wrong-owner'
  | 'reused-token'
  | 'missing-integration'
  | 'outbound-disabled';

async function runInvalidDispatch(condition: Condition) {
  const dispatcher = new DispatcherSimulator();
  const base = await validInput();
  let input: ValidateDispatchInput = base;
  switch (condition) {
    case 'missing-token':
      input = { ...base, envelope: { ...base.envelope, confirmedAt: null } };
      break;
    case 'expired-token':
      input = { ...base, now: '2026-07-20T18:00:00.001Z' };
      break;
    case 'changed-payload':
      input = { ...base, payload: { ...validPayload, content: `${validPayload.content}!` } };
      break;
    case 'wrong-owner':
      input = { ...base, ownerId: 'user-jordan' };
      break;
    case 'reused-token':
      input = { ...base, envelope: { ...base.envelope, usedAt: '2026-07-20T15:09:00.000Z' } };
      break;
    case 'missing-integration':
      input = { ...base, integrationAvailable: false };
      break;
    case 'outbound-disabled':
      input = { ...base, outboundEnabled: false };
      break;
  }
  const receipt = await dispatcher.dispatch(input, 'success');
  return { state: receipt.state, externalCalls: dispatcher.externalCalls };
}

describe('DispatcherSimulator', () => {
  it.each<Condition>([
    'missing-token',
    'expired-token',
    'changed-payload',
    'wrong-owner',
    'reused-token',
    'missing-integration',
    'outbound-disabled',
  ])('denies %s without invoking a provider', async (condition) => {
    const result = await runInvalidDispatch(condition);
    expect(result.state).toBe('failed-closed');
    expect(result.externalCalls).toBe(0);
  });

  it('completes a valid authorization as a demo receipt with no real send', async () => {
    const dispatcher = new DispatcherSimulator();
    const receipt = await dispatcher.dispatch(await validInput(), 'success');
    expect(receipt.state).toBe('completed');
    expect(receipt.reason).toMatch(/no real message was sent/i);
    expect(dispatcher.externalCalls).toBe(0);
  });

  it('routes an ambiguous result to manual review and never retries', async () => {
    const dispatcher = new DispatcherSimulator();
    const receipt = await dispatcher.dispatch(await validInput(), 'ambiguous');
    expect(receipt.state).toBe('manual-review');
    expect(receipt.attemptCount).toBe(1);
  });

  it('consumes authorization once — a replayed idempotency key is denied', async () => {
    const dispatcher = new DispatcherSimulator();
    const input = await validInput();
    const first = await dispatcher.dispatch(input, 'success');
    const second = await dispatcher.dispatch(input, 'success');
    expect(first.state).toBe('completed');
    expect(second.state).toBe('failed-closed');
    expect(dispatcher.externalCalls).toBe(0);
  });
});
