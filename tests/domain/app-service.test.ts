import { describe, expect, it } from 'vitest';
import { createDemoAppService } from '../../src/application/demoAppService';
import { createAppService } from '../../src/application/appService';
import {
  createInMemoryRepositories,
  dropInMemoryDatabase,
} from '../../src/data/inMemoryStore';
import type { AppService } from '../../src/domain/contracts';

let clock = 0;
function newService(): { service: AppService; name: string } {
  const name = `svc-${crypto.randomUUID()}`;
  const repos = createInMemoryRepositories(name);
  const service = createAppService(repos, {
    // Monotonic, deterministic clock so activity ordering is stable.
    now: () => new Date(Date.UTC(2026, 6, 20, 12, 0, 0) + clock++ * 1000).toISOString(),
  });
  return { service, name };
}

describe('createDemoAppService (plan contract)', () => {
  it('seeds once and preserves user mutations across service instances', async () => {
    const name = `plan-${crypto.randomUUID()}`;
    const first = createDemoAppService(name);
    await first.initialize();
    await first.pinAction('action-racetrac-outreach', 'Founder priority');
    const second = createDemoAppService(name);
    await second.initialize();
    expect((await second.getDashboard()).actions[0].pinnedReason).toBe('Founder priority');
    dropInMemoryDatabase(name);
  });

  it('reset restores approved demo fixtures only after explicit invocation', async () => {
    const name = `plan-reset-${crypto.randomUUID()}`;
    const service = createDemoAppService(name);
    await service.initialize();
    await service.resetDemoData();
    expect((await service.getDashboard()).accounts).toHaveLength(3);
    dropInMemoryDatabase(name);
  });
});

describe('dashboard and account cases', () => {
  it('ranks the RaceTrac outreach as the top next-best move with an explanation', async () => {
    const { service, name } = newService();
    await service.initialize();
    const dashboard = await service.getDashboard();
    expect(dashboard.actions[0].id).toBe('action-racetrac-outreach');
    expect(dashboard.actions[0].explanation).toMatch(/because/i);
    expect(dashboard.brief.decisions[0].destination).toBe('/approvals/action-racetrac-outreach');
    dropInMemoryDatabase(name);
  });

  it('assembles an evidence-linked account case', async () => {
    const { service, name } = newService();
    await service.initialize();
    const account = await service.getAccount('heb');
    expect(account?.account.name).toBe('H-E-B');
    expect(account?.claims.length).toBeGreaterThan(0);
    expect(account?.gates[0].blocker).not.toBeNull();
    dropInMemoryDatabase(name);
  });
});

describe('evidence-gated progression', () => {
  it('refuses to advance a blocked gate but allows an accountable override', async () => {
    const { service, name } = newService();
    await service.initialize();

    const blocked = await service.requestStageAdvance('heb', 'user-caleb');
    expect(blocked.ok).toBe(false);

    const override = await service.createOverride({
      gateId: 'gate-heb-diagnostic',
      reason: 'Verbal data-access confirmation received; formal grant pending.',
      riskAcknowledged: true,
      authorId: 'user-caleb',
      createdAt: new Date().toISOString(),
    });
    expect(override.ok).toBe(true);
    expect((await service.getAccount('heb'))?.account.phase).toBe('diagnostic');
    dropInMemoryDatabase(name);
  });
});

describe('fail-closed exact-action approval flow', () => {
  it('locks, confirms, and completes a demo dispatch with a receipt', async () => {
    const { service, name } = newService();
    await service.initialize();

    const envelope = await service.lockExactAction(
      'action-racetrac-outreach',
      'user-caleb',
      new Date(Date.now() + 3_600_000).toISOString(),
    );
    await service.confirmDemoPresence(envelope.id, 'user-caleb');
    const receipt = await service.simulateDispatch('action-racetrac-outreach', envelope.id);

    expect(receipt.state).toBe('completed');
    expect(receipt.reason).toMatch(/no real message was sent/i);
    dropInMemoryDatabase(name);
  });

  it('invalidates the authorization when the draft is edited', async () => {
    const { service, name } = newService();
    await service.initialize();

    const account = await service.getAccount('racetrac');
    const original = account!.actions.find((a) => a.id === 'action-racetrac-outreach')!;
    const envelope = await service.lockExactAction(
      'action-racetrac-outreach',
      'user-caleb',
      new Date(Date.now() + 3_600_000).toISOString(),
    );
    await service.updateDraft('action-racetrac-outreach', {
      ...original.payload!,
      content: `${original.payload!.content}!`,
    });
    // Editing removed the envelope; dispatch against the stale id fails closed.
    const receipt = await service.simulateDispatch('action-racetrac-outreach', envelope.id);
    expect(receipt.state).toBe('failed-closed');
    dropInMemoryDatabase(name);
  });

  it('fails closed when the channel integration is unavailable', async () => {
    const { service, name } = newService();
    await service.initialize();
    await service.setSourceHealth('source-email', 'temporarily-unavailable');

    const envelope = await service.lockExactAction(
      'action-racetrac-outreach',
      'user-caleb',
      new Date(Date.now() + 3_600_000).toISOString(),
    );
    await service.confirmDemoPresence(envelope.id, 'user-caleb');
    const receipt = await service.simulateDispatch('action-racetrac-outreach', envelope.id);
    expect(receipt.state).toBe('failed-closed');
    dropInMemoryDatabase(name);
  });

  it('refuses presence confirmation from the wrong owner', async () => {
    const { service, name } = newService();
    await service.initialize();
    const envelope = await service.lockExactAction(
      'action-racetrac-outreach',
      'user-caleb',
      new Date(Date.now() + 3_600_000).toISOString(),
    );
    await expect(service.confirmDemoPresence(envelope.id, 'user-jordan')).rejects.toThrow();
    dropInMemoryDatabase(name);
  });
});
