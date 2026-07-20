import { AlertTriangle, Check, Circle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { GateReviewDialog } from './GateReviewDialog';
import { OverrideDialog } from './OverrideDialog';

const phases = ['Target Brief', 'Account Thesis', 'Contacted', 'Discovery', 'Diagnostic', 'Pilot', 'Rollout'] as const;
const accounts = [
  { name: 'RaceTrac', initials: 'RT', score: 88, phase: 1, gate: '3 of 4 complete', blocker: 'Buyer path not selected', impact: 'High' },
  { name: 'H-E-B', initials: 'HB', score: 84, phase: 0, gate: '5 of 6 complete', blocker: 'Commissioning owner unknown', impact: 'Medium' },
  { name: 'Bagel Brands', initials: 'BB', score: 72, phase: 1, gate: '4 of 5 complete', blocker: 'Company-owned scope unverified', impact: 'Medium' },
] as const;

export function PipelinePage() {
  const [reviewed, setReviewed] = useState<(typeof accounts)[number] | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<(typeof accounts)[number] | null>(null);
  const [recordedOverride, setRecordedOverride] = useState<{ owner: string; account: string } | null>(null);

  function openOverride() {
    setOverrideTarget(reviewed);
    setReviewed(null);
  }

  return (
    <section className="pipeline-page" aria-labelledby="pipeline-title">
      <header className="pipeline-header">
        <div>
          <p className="eyebrow">Portfolio progress</p>
          <h1 id="pipeline-title">Portfolio progress</h1>
          <p>Movement is earned by evidence, not manually dragged between stages.</p>
        </div>
        <dl className="pipeline-summary">
          <div><dt>3</dt><dd>active targets</dd></div>
          <div><dt>2</dt><dd>blocked gates</dd></div>
          <div><dt>4</dt><dd>approvals waiting</dd></div>
        </dl>
      </header>

      {recordedOverride ? (
        <aside className="override-record" role="status">
          <ShieldCheck aria-hidden="true" />
          <div><strong>Override recorded by {recordedOverride.owner}</strong><p>{recordedOverride.account} · July 20, 2026 · Risk acknowledgement preserved on the account timeline.</p></div>
        </aside>
      ) : null}

      <div className="pipeline-layout">
        <div className="pipeline-matrix">
          <div className="pipeline-phase-head" aria-hidden="true">
            <span />{phases.map((phase) => <span key={phase}>{phase}</span>)}
          </div>
          {accounts.map((account) => (
            <article className="pipeline-account" key={account.name}>
              <div className="pipeline-account__name"><span>{account.initials}</span><strong>{account.name}</strong></div>
              <ol className="pipeline-track" aria-label={`${account.name} lifecycle`}>
                {phases.map((phase, index) => (
                  <li className={index === account.phase ? 'pipeline-track__active' : ''} key={phase}>
                    <span>{index < account.phase ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}</span>
                    <small>{phase}</small>
                  </li>
                ))}
              </ol>
              <div className="pipeline-account__details">
                <span><small>Qualification</small><strong>{account.score} / 100</strong></span>
                <span><small>Gate status</small><strong>{account.gate}</strong></span>
                <span className="pipeline-account__blocker"><small>Blocker</small><strong><AlertTriangle aria-hidden="true" />{account.blocker}</strong></span>
                <Button variant="quiet" aria-label={`Review ${account.name} blocked gate`} onClick={() => setReviewed(account)}>Review gate</Button>
              </div>
            </article>
          ))}
        </div>

        <aside className="stalled-panel">
          <h2>Why accounts are stalled</h2>
          {accounts.map((account, index) => (
            <div className="stalled-item" key={account.name}>
              <AlertTriangle aria-hidden="true" />
              <span className="stalled-item__rank">{index + 1}</span>
              <div><strong>{account.blocker}</strong><small>{account.name}</small><Badge tone="warning">Impact: {account.impact}</Badge></div>
            </div>
          ))}
        </aside>
      </div>

      <section className="gate-requirements" aria-labelledby="requirements-title">
        <div><h2 id="requirements-title">Account Thesis requirements</h2><p>Required artifacts and gate criteria remain visible before any advancement decision.</p></div>
        <div className="gate-requirements__rule"><ShieldCheck aria-hidden="true" /><p><strong>Advancement rule</strong><br />Gate completion plus explicit founder approval.</p></div>
      </section>

      <GateReviewDialog
        open={reviewed !== null}
        account={reviewed?.name ?? ''}
        blocker={reviewed?.blocker ?? ''}
        onClose={() => setReviewed(null)}
        onOverride={openOverride}
      />
      <OverrideDialog
        open={overrideTarget !== null}
        account={overrideTarget?.name ?? ''}
        blocker={overrideTarget?.blocker ?? ''}
        onClose={() => setOverrideTarget(null)}
        onRecord={(owner) => {
          setRecordedOverride({ owner, account: overrideTarget?.name ?? 'Account' });
          setOverrideTarget(null);
        }}
      />
    </section>
  );
}
