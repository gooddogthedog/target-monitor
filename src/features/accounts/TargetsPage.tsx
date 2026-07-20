import { ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';

const targets = [
  { id: 'racetrac', name: 'RaceTrac', score: 88, phase: 'Account Thesis', blocker: 'Buyer path not selected' },
  { id: 'h-e-b', name: 'H-E-B', score: 84, phase: 'Target Brief', blocker: 'Commissioning owner unknown' },
  { id: 'bagel-brands', name: 'Bagel Brands', score: 72, phase: 'Account Thesis', blocker: 'Company-owned scope unverified' },
] as const;

export function TargetsPage() {
  return (
    <section className="targets-page" aria-labelledby="targets-title">
      <header className="page-title-row">
        <div><p className="eyebrow">Target accounts</p><h1 id="targets-title">Targets</h1><p>Evidence-backed customer cases, not static lead records.</p></div>
        <button className="button button--primary" type="button">Add company</button>
      </header>
      <div className="target-list">
        {targets.map((target) => (
          <Link className="target-row" to={`/targets/${target.id}`} key={target.id}>
            <span className="target-row__icon"><Building2 aria-hidden="true" /></span>
            <span className="target-row__identity"><strong>{target.name}</strong><small>{target.phase}</small></span>
            <span className="target-row__score"><small>Qualification</small><strong>{target.score} / 100</strong></span>
            <span className="target-row__blocker"><Badge tone="warning">Blocked gate</Badge><small>{target.blocker}</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

