// Demo application-service factory.
//
// `createDemoAppService` is the entry point the UI consumes. It selects a
// persistence driver — Dexie/IndexedDB in the browser, a process-persistent
// in-memory store elsewhere (SSR, tests) — and builds the pure `createAppService`
// core against it. The Dexie driver is imported lazily so non-browser
// environments never require IndexedDB or the Dexie module.

import type { AppService, RepositoryBundle } from '../domain/contracts';
import { createInMemoryRepositories } from '../data/inMemoryStore';
import {
  createAppService,
  DEFAULT_DATABASE_NAME,
  PersistenceUnavailableError,
  type AppServiceOptions,
} from './appService';

export {
  createAppService,
  DEFAULT_DATABASE_NAME,
  PersistenceUnavailableError,
  type AppServiceOptions,
};

function hasIndexedDB(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { indexedDB?: unknown }).indexedDB !== 'undefined' &&
    (globalThis as { indexedDB?: unknown }).indexedDB !== null
  );
}

async function selectRepositories(databaseName: string): Promise<RepositoryBundle> {
  if (hasIndexedDB()) {
    const { createDexieRepositories } = await import('../data/dexieRepositories');
    return createDexieRepositories(databaseName);
  }
  return createInMemoryRepositories(databaseName);
}

export function createDemoAppService(
  databaseName: string = DEFAULT_DATABASE_NAME,
  options?: AppServiceOptions,
): AppService {
  // The core is built lazily on first use so driver selection (and any dynamic
  // Dexie import) happens off the construction path.
  let corePromise: Promise<AppService> | null = null;
  const core = (): Promise<AppService> => {
    if (!corePromise) {
      corePromise = selectRepositories(databaseName).then((repos) =>
        createAppService(repos, options),
      );
    }
    return corePromise;
  };

  return {
    initialize: async () => (await core()).initialize(),
    getDashboard: async () => (await core()).getDashboard(),
    getAccount: async (accountId) => (await core()).getAccount(accountId),
    listEvidence: async (accountId) => (await core()).listEvidence(accountId),
    listApprovals: async () => (await core()).listApprovals(),
    listArtifacts: async (accountId) => (await core()).listArtifacts(accountId),
    pinAction: async (actionId, reason) => (await core()).pinAction(actionId, reason),
    setSourceHealth: async (sourceId, health) => (await core()).setSourceHealth(sourceId, health),
    requestStageAdvance: async (accountId, approverId) =>
      (await core()).requestStageAdvance(accountId, approverId),
    createOverride: async (input) => (await core()).createOverride(input),
    updateDraft: async (actionId, payload) => (await core()).updateDraft(actionId, payload),
    lockExactAction: async (actionId, ownerId, expiresAt) =>
      (await core()).lockExactAction(actionId, ownerId, expiresAt),
    confirmDemoPresence: async (envelopeId, ownerId) =>
      (await core()).confirmDemoPresence(envelopeId, ownerId),
    simulateDispatch: async (actionId, envelopeId) =>
      (await core()).simulateDispatch(actionId, envelopeId),
    resetDemoData: async () => (await core()).resetDemoData(),
  };
}
