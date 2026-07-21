// Application-service core.
//
// `createAppService` implements the entire UI-facing `AppService` facade against
// an abstract `RepositoryBundle`. It orchestrates persistence and delegates all
// business rules to the pure domain functions — ranking, gates, evidence
// coverage, and the fail-closed approval/dispatch path. It holds no outbound
// credentials and no provider client; the only "dispatch" is the network-free
// simulator, and every consequential action passes through the exact-action
// authorization choke point.

import type { AppService, RepositoryBundle } from '../domain/contracts';
import {
  authorizeExactAction,
  confirmPresence,
  markUsed,
} from '../domain/approval';
import { rankActions } from '../domain/ranking';
import { advanceWithApproval, advanceWithOverride } from '../domain/gates';
import { ConnectorSimulator } from '../simulators/connectors';
import { DispatcherSimulator } from '../simulators/dispatcher';
import { demoData } from '../fixtures/demoData';
import type {
  AccountCase,
  ActionProposal,
  ActivityEvent,
  AdvanceResult,
  ApprovalCase,
  ApprovalEnvelope,
  Artifact,
  DailyBrief,
  DashboardSnapshot,
  DispatchReceipt,
  Evidence,
  ExactActionPayload,
  OverrideInput,
  RankedAction,
  SourceConnection,
  SourceHealth,
} from '../domain/types';

export const DEFAULT_DATABASE_NAME = 'linq-action-command-center';

// Signals that persistence could not be initialized (e.g. IndexedDB blocked).
// The UI can catch this, keep unsaved input, and offer a retry.
export class PersistenceUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PersistenceUnavailableError';
  }
}

export interface AppServiceOptions {
  now?: () => string;
  // Whether the *simulated* outbound pipeline may run. Real outbound is never
  // possible — there is no provider path — but this flag lets the demo model an
  // "outbound off" state that still fails closed.
  simulatedOutboundEnabled?: boolean;
}

function destinationFor(action: ActionProposal): string {
  return action.type === 'outreach' ? `/approvals/${action.id}` : `/targets/${action.accountId}`;
}

function channelSourceType(channel: ExactActionPayload['channel']): SourceConnection['type'] | null {
  // Only email has a modeled adapter. A social-post has no connected integration
  // in the MVP, so it can never even be simulated — it fails closed.
  return channel === 'email' ? 'email' : null;
}

export function createAppService(
  repos: RepositoryBundle,
  options: AppServiceOptions = {},
): AppService {
  const now = options.now ?? (() => new Date().toISOString());
  const outboundEnabled = options.simulatedOutboundEnabled ?? true;
  // One dispatcher per service: its consumed-key set is a second line of defense
  // against replay, on top of the persisted envelope `usedAt`.
  const dispatcher = new DispatcherSimulator();

  async function appendActivity(
    accountId: string,
    kind: ActivityEvent['kind'],
    summary: string,
  ): Promise<void> {
    await repos.activity.append({
      id: `act-${crypto.randomUUID()}`,
      accountId,
      kind,
      summary,
      occurredAt: now(),
    });
  }

  async function clearAll(): Promise<void> {
    await Promise.all([
      repos.users.clear(),
      repos.accounts.clear(),
      repos.claims.clear(),
      repos.evidence.clear(),
      repos.sources.clear(),
      repos.gates.clear(),
      repos.actions.clear(),
      repos.approvals.clear(),
      repos.receipts.clear(),
      repos.artifacts.clear(),
      repos.activity.clear(),
      repos.meta.clear(),
    ]);
  }

  async function seed(): Promise<void> {
    await clearAll();
    await repos.users.bulkPut(demoData.users);
    await repos.accounts.bulkPut(demoData.accounts);
    await repos.claims.bulkPut(demoData.claims);
    await repos.evidence.bulkPut(demoData.evidence);
    await repos.sources.bulkPut(demoData.sources);
    await repos.gates.bulkPut(demoData.gates);
    await repos.actions.bulkPut(demoData.actions);
    await repos.artifacts.bulkPut(demoData.artifacts);
    // Seed a short activity history from captured evidence so the Daily Brief
    // change feed and account timeline have content on first run.
    for (const item of demoData.evidence) {
      await repos.activity.append({
        id: `act-seed-${item.id}`,
        accountId: item.accountId,
        kind: 'evidence-added',
        summary: `Captured "${item.title}"`,
        occurredAt: item.capturedAt,
      });
    }
    await repos.meta.markSeeded();
  }

  async function buildBrief(actions: RankedAction[]): Promise<DailyBrief> {
    const accounts = await repos.accounts.getAll();
    const top = actions.slice(0, 3);
    const changes = (await repos.activity.getAll())
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 8)
      .map((event) => ({
        id: event.id,
        accountId: event.accountId,
        summary: event.summary,
        occurredAt: event.occurredAt,
      }));
    const summary =
      top.length > 0
        ? `${accounts.length} active targets. Top move: ${top[0].title}.`
        : `${accounts.length} active targets. No recommended moves.`;
    return {
      summary,
      decisions: top.map((action) => ({
        id: action.id,
        title: action.title,
        destination: destinationFor(action),
      })),
      changes,
    };
  }

  function failedClosedReceipt(
    actionId: string,
    envelopeId: string,
    reason: string,
  ): DispatchReceipt {
    return {
      id: `rcpt-${crypto.randomUUID()}`,
      actionId,
      envelopeId,
      state: 'failed-closed',
      reason,
      providerStyleReference: null,
      attemptCount: 1,
      createdAt: now(),
    };
  }

  return {
    async initialize(): Promise<void> {
      try {
        if (await repos.meta.isSeeded()) return;
        await seed();
      } catch (error) {
        throw new PersistenceUnavailableError(
          'Local persistence is unavailable. Your unsaved work is preserved; retry to reconnect storage.',
          { cause: error },
        );
      }
    },

    async getDashboard(): Promise<DashboardSnapshot> {
      const accounts = await repos.accounts.getAll();
      const actions = rankActions(await repos.actions.getAll());
      const sources = await repos.sources.getAll();
      const brief = await buildBrief(actions);
      return { accounts, actions, brief, sources };
    },

    async getAccount(accountId: string): Promise<AccountCase | undefined> {
      const account = await repos.accounts.getById(accountId);
      if (!account) return undefined;
      const [claims, evidence, gates, allActions, artifacts] = await Promise.all([
        repos.claims.getAll(),
        repos.evidence.getAll(),
        repos.gates.getAll(),
        repos.actions.getAll(),
        repos.artifacts.getAll(),
      ]);
      return {
        account,
        claims: claims.filter((claim) => claim.accountId === accountId),
        evidence: evidence.filter((item) => item.accountId === accountId),
        gates: gates.filter((gate) => gate.accountId === accountId),
        actions: rankActions(allActions.filter((action) => action.accountId === accountId)),
        artifacts: artifacts.filter((artifact) => artifact.accountId === accountId),
      };
    },

    async listEvidence(accountId?: string): Promise<Evidence[]> {
      const all = await repos.evidence.getAll();
      return accountId ? all.filter((item) => item.accountId === accountId) : all;
    },

    async listApprovals(): Promise<ApprovalCase[]> {
      const [actions, approvals, receipts] = await Promise.all([
        repos.actions.getAll(),
        repos.approvals.getAll(),
        repos.receipts.getAll(),
      ]);
      return actions
        .filter((action) => action.payload !== null)
        .map((action) => {
          const envelope =
            approvals.filter((item) => item.actionId === action.id).at(-1) ?? null;
          const receipt =
            receipts
              .filter((item) => item.actionId === action.id)
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .at(-1) ?? null;
          return { action, envelope, receipt };
        });
    },

    async listArtifacts(accountId?: string): Promise<Artifact[]> {
      const all = await repos.artifacts.getAll();
      return accountId ? all.filter((artifact) => artifact.accountId === accountId) : all;
    },

    async pinAction(actionId: string, reason: string): Promise<void> {
      const action = await repos.actions.getById(actionId);
      if (!action) throw new Error(`Unknown action: ${actionId}`);
      await repos.actions.put({ ...action, pinnedReason: reason });
      await appendActivity(action.accountId, 'action-proposed', `Pinned "${action.title}": ${reason}`);
    },

    async setSourceHealth(sourceId: string, health: SourceHealth): Promise<void> {
      const sources = await repos.sources.getAll();
      const simulator = new ConnectorSimulator(sources);
      const updated = simulator.setHealth(sourceId, health).find((s) => s.id === sourceId);
      if (!updated) return;
      await repos.sources.put(updated);
      await appendActivity('', 'source-health-changed', `${updated.type} set to ${health}`);
    },

    async requestStageAdvance(accountId: string, approverId: string): Promise<AdvanceResult> {
      const account = await repos.accounts.getById(accountId);
      if (!account) return { ok: false, unmetCriteria: [], reason: 'Unknown account.' };
      const gate = (await repos.gates.getAll()).find(
        (item) => item.accountId === accountId && item.phase === account.phase,
      );
      if (!gate) {
        return { ok: false, unmetCriteria: [], reason: 'No gate for the current phase.' };
      }
      const result = advanceWithApproval(account, gate, approverId);
      if (result.ok) {
        await repos.accounts.put(result.account);
        await repos.gates.put({ ...gate, approvedBy: approverId, approvedAt: now() });
        await appendActivity(
          accountId,
          'gate-advanced',
          `Advanced to ${result.account.phase}, approved by ${approverId}.`,
        );
      }
      return result;
    },

    async createOverride(input: OverrideInput): Promise<AdvanceResult> {
      const gate = await repos.gates.getById(input.gateId);
      if (!gate) return { ok: false, unmetCriteria: [], reason: 'Unknown gate.' };
      const account = await repos.accounts.getById(gate.accountId);
      if (!account) return { ok: false, unmetCriteria: [], reason: 'Unknown account.' };
      const result = advanceWithOverride(account, input);
      if (result.ok) {
        await repos.accounts.put(result.account);
        await repos.gates.put({ ...gate, approvedBy: input.authorId, approvedAt: input.createdAt });
        await appendActivity(
          gate.accountId,
          'override-recorded',
          `Override to ${result.account.phase} by ${input.authorId}: ${input.reason}`,
        );
      }
      return result;
    },

    async updateDraft(actionId: string, payload: ExactActionPayload): Promise<void> {
      const action = await repos.actions.getById(actionId);
      if (!action) throw new Error(`Unknown action: ${actionId}`);
      await repos.actions.put({ ...action, payload, state: 'draft' });
      // Any edit invalidates existing authorization: remove envelopes for this
      // action so a stale approval can never be reused against new content.
      const stale = (await repos.approvals.getAll()).filter((item) => item.actionId === actionId);
      for (const envelope of stale) await repos.approvals.remove(envelope.id);
      await appendActivity(action.accountId, 'action-proposed', `Edited exact action "${action.title}".`);
    },

    async lockExactAction(
      actionId: string,
      ownerId: string,
      expiresAt: string,
    ): Promise<ApprovalEnvelope> {
      const action = await repos.actions.getById(actionId);
      if (!action || !action.payload) {
        throw new Error('Action has no exact payload to authorize.');
      }
      const envelope = await authorizeExactAction({
        actionId,
        ownerId,
        payload: action.payload,
        expiresAt,
      });
      await repos.approvals.put(envelope);
      await repos.actions.put({ ...action, state: 'awaiting-approval' });
      await appendActivity(action.accountId, 'approval-locked', `Locked exact action "${action.title}".`);
      return envelope;
    },

    async confirmDemoPresence(envelopeId: string, ownerId: string): Promise<ApprovalEnvelope> {
      const envelope = await repos.approvals.getById(envelopeId);
      if (!envelope) throw new Error(`Unknown authorization: ${envelopeId}`);
      const confirmed = confirmPresence(envelope, ownerId, now());
      if (!confirmed) throw new Error('Presence confirmation refused for this owner.');
      await repos.approvals.put(confirmed);
      const action = await repos.actions.getById(envelope.actionId);
      if (action) await repos.actions.put({ ...action, state: 'authorized' });
      return confirmed;
    },

    async simulateDispatch(actionId: string, envelopeId: string): Promise<DispatchReceipt> {
      const action = await repos.actions.getById(actionId);
      const envelope = await repos.approvals.getById(envelopeId);
      if (!action || !action.payload || !envelope) {
        const receipt = failedClosedReceipt(
          actionId,
          envelopeId,
          'Missing action or authorization; no action taken.',
        );
        await repos.receipts.append(receipt);
        return receipt;
      }
      const sources = await repos.sources.getAll();
      const sourceType = channelSourceType(action.payload.channel);
      const integrationAvailable =
        sourceType !== null &&
        sources.some((source) => source.type === sourceType && source.health === 'connected');

      const receipt = await dispatcher.dispatch(
        {
          actionId,
          ownerId: envelope.ownerId,
          payload: action.payload,
          envelope,
          now: now(),
          integrationAvailable,
          outboundEnabled,
        },
        'success',
      );
      await repos.receipts.append(receipt);
      await repos.actions.put({ ...action, state: receipt.state });
      if (receipt.state === 'completed' || receipt.state === 'manual-review') {
        const used = markUsed(envelope, now());
        if (used) await repos.approvals.put(used);
      }
      await appendActivity(
        action.accountId,
        'dispatch-simulated',
        `Simulated dispatch for "${action.title}": ${receipt.state}.`,
      );
      return receipt;
    },

    async resetDemoData(): Promise<void> {
      try {
        await seed();
      } catch (error) {
        throw new PersistenceUnavailableError('Could not reset local demo data.', { cause: error });
      }
    },
  };
}
