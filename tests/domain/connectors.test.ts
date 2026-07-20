import { describe, expect, it } from 'vitest';
import { ConnectorSimulator } from '../../src/simulators/connectors';
import { demoData } from '../../src/fixtures/demoData';

function freshSources() {
  return demoData.sources.map((source) => ({ ...source }));
}

describe('ConnectorSimulator', () => {
  it('changes one source without mutating the others', () => {
    const simulator = new ConnectorSimulator(freshSources());
    const before = simulator.list();
    const others = before.filter((s) => s.id !== 'source-email');

    simulator.setHealth('source-email', 'temporarily-unavailable');
    const after = simulator.list();

    for (const other of others) {
      const match = after.find((s) => s.id === other.id);
      expect(match).toEqual(other);
    }
    expect(after.find((s) => s.id === 'source-email')?.health).toBe('temporarily-unavailable');
  });

  it('never synthesizes customer activity — the coverage note flags a gap, not a signal', () => {
    const simulator = new ConnectorSimulator(freshSources());
    const [email] = simulator.setHealth('source-email', 'temporarily-unavailable').filter(
      (s) => s.id === 'source-email',
    );
    expect(email.coverageNote).toMatch(/coverage gap/i);
    expect(email.coverageNote).not.toMatch(/no reply|did not reply|customer signal[^,]*$/i);
  });

  it('does not leak internal state through the returned array', () => {
    const simulator = new ConnectorSimulator(freshSources());
    const list = simulator.list();
    list[0].health = 'not-connected';
    expect(simulator.list()[0].health).not.toBe('not-connected');
  });

  it('is a no-op for an unknown source id', () => {
    const simulator = new ConnectorSimulator(freshSources());
    expect(simulator.setHealth('does-not-exist', 'stale')).toEqual(simulator.list());
  });
});
