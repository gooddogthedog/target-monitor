// Independent source-health simulator.
//
// Each source adapter is independent: changing one never mutates or cascades to
// another, and one failing connector can never crash the rest of the product.
// The simulator only toggles health and describes coverage — it never
// synthesizes customer activity to fill an absence. It imports no network,
// email, or provider client.

import { coverageNoticeFor } from '../domain/evidence';
import type { SourceConnection, SourceHealth } from '../domain/types';

function coverageNoteFor(source: SourceConnection): string {
  const notice = coverageNoticeFor(source);
  if (notice) return `${notice}; this is a coverage gap, not a customer signal.`;
  return `${source.type} is connected and contributing coverage.`;
}

export class ConnectorSimulator {
  private sources: SourceConnection[];

  constructor(sources: SourceConnection[]) {
    // Defensive copy so external mutation of the seed cannot leak in.
    this.sources = sources.map((source) => ({ ...source }));
  }

  list(): SourceConnection[] {
    return this.sources.map((source) => ({ ...source }));
  }

  setHealth(sourceId: string, health: SourceHealth): SourceConnection[] {
    this.sources = this.sources.map((source) => {
      if (source.id !== sourceId) return source;
      const updated: SourceConnection = { ...source, health };
      updated.coverageNote = coverageNoteFor(updated);
      return updated;
    });
    return this.list();
  }
}
