import { AlertTriangle, CheckCircle2, Circle, FileCheck2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { GateRail } from './GateRail';
import { ThesisPanel } from './ThesisPanel';

const tabs = ['Overview', 'Thesis', 'People', 'Discovery', 'Diagnostic', 'Pilot', 'Rollout', 'Activity'];

const accountRecords = {
  racetrac: {
    initials: 'RT',
    name: 'RaceTrac',
    summary: 'Convenience retail · 600+ stores · 14 states',
    score: 88,
  },
  'h-e-b': {
    initials: 'HB',
    name: 'H-E-B',
    summary: 'Grocery retail · 455+ stores · Texas and Mexico',
    score: 84,
  },
  'bagel-brands': {
    initials: 'BB',
    name: 'Bagel Brands',
    summary: 'Restaurant group · 1,001 locations · four brands',
    score: 72,
  },
} as const;

export function AccountWorkspacePage() {
  const { accountId = 'racetrac' } = useParams();
  const account = accountRecords[accountId as keyof typeof accountRecords] ?? accountRecords.racetrac;
  const [activeTab, setActiveTab] = useState('Thesis');

  return (
    <section className="account-workspace" aria-labelledby="account-title">
      <p className="account-breadcrumb"><Link to="/targets">Targets</Link><span>/</span>{account.name}</p>
      <header className="account-header">
        <span className="account-monogram" aria-hidden="true">{account.initials}</span>
        <div className="account-header__identity">
          <h1 id="account-title">{account.name}</h1>
          <p>{account.summary}</p>
        </div>
        <div className="account-score">
          <span>Account Thesis</span>
          <strong>{account.score} / 100</strong>
          <small>Active pursuit</small>
        </div>
        <Link className="button button--primary account-header__action" to="/approvals/action-racetrac-outreach">
          <FileCheck2 aria-hidden="true" /> Review outreach
        </Link>
      </header>

      <GateRail />

      <div className="account-tabs" role="tablist" aria-label="Account workspace sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? 'account-tab account-tab--active' : 'account-tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="account-workspace__body">
        <div className="account-workspace__main">
          {activeTab === 'Thesis' ? (
            <ThesisPanel />
          ) : (
            <section className="account-tab-placeholder">
              <h2>{activeTab}</h2>
              <p>This workspace is ready for manual notes and the next verified customer input.</p>
            </section>
          )}
        </div>

        <aside className="gate-sidebar" aria-labelledby="gate-to-contacted">
          <h2 id="gate-to-contacted">Gate to Contacted</h2>
          <ul className="gate-checklist">
            <li><CheckCircle2 aria-hidden="true" /><span>Specific operational problem</span></li>
            <li className="gate-checklist__open"><Circle aria-hidden="true" /><span>Plausible buyer</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>Credible trigger</span></li>
            <li><CheckCircle2 aria-hidden="true" /><span>Narrow conversation request</span></li>
          </ul>
          <p className="gate-blocker"><AlertTriangle aria-hidden="true" />Blocked: buyer path not selected</p>
          <Link className="button button--primary" to="/pipeline">Choose buyer path</Link>
          <Link className="gate-sidebar__override" to="/pipeline">Override with reason</Link>

          <div className="gate-next-move">
            <Badge tone="info">Next best move</Badge>
            <h3>Test the asset-data hypothesis with a facilities leader.</h3>
            <p>Evidence supports a problem-validation conversation, not a pilot pitch.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

