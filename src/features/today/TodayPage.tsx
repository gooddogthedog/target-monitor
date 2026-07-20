import { AlertTriangle, ArrowRight, Building2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NextBestMove, type NextBestMoveViewModel } from './NextBestMove';

const raceTracMove: NextBestMoveViewModel = {
  account: 'RaceTrac',
  title: 'Turn the asset-data hypothesis into a customer conversation.',
  rationale:
    'Public evidence is strong enough to test the problem directly, but not yet strong enough to prescribe a pilot.',
  confidence: 86,
  currentPhase: 'Account thesis',
  nextPhase: 'Contacted',
  evidence: [
    { id: 'servicechannel', label: 'ServiceChannel confirmed', detail: 'Known · current' },
    { id: 'technician-routes', label: 'Technician routes confirmed', detail: 'Known · current' },
    { id: 'pump-downtime', label: 'Pump-parts downtime documented', detail: 'Known · current' },
  ],
  outreach: {
    subject: 'Ideas to reduce pump-related downtime across RaceTrac sites',
    recipient: 'VP, Facilities',
    goal: 'Secure a 20-minute problem-validation call',
    status: 'Draft — requires founder approval',
  },
};

const nextActions = [
  {
    account: 'H-E-B',
    title: 'Resolve buyer hypothesis',
    reason: 'Needed to unlock Contacted stage',
    effort: '8 min',
  },
  {
    account: 'Bagel Brands',
    title: 'Verify company-owned scope',
    reason: 'Needed to qualify a pilot path',
    effort: '12 min',
  },
  {
    account: 'RaceTrac',
    title: 'Review new reply',
    reason: 'Follower replied overnight',
    effort: '4 min',
  },
] as const;

export function TodayPage() {
  return (
    <section className="today-page" aria-labelledby="today-title">
      <header className="today-page__header">
        <div>
          <p className="eyebrow">Monday · Founder focus</p>
          <h1 id="today-title">Your next best move</h1>
        </div>
        <Link to="/brief">Open daily brief</Link>
      </header>

      <NextBestMove move={raceTracMove} />

      <aside className="blocked-gate" role="note">
        <AlertTriangle aria-hidden="true" />
        <p>
          <strong>Blocked gate:</strong> H-E-B cannot advance to Contacted until a buyer
          path is selected.
        </p>
        <Link to="/pipeline">Override with reason</Link>
      </aside>

      <section className="after-this" aria-labelledby="after-this-title">
        <div className="section-heading">
          <h2 id="after-this-title">After this</h2>
          <Link to="/actions">View all actions</Link>
        </div>
        <div className="after-this__grid">
          {nextActions.map((action, index) => (
            <Link
              to="/actions"
              className="next-action"
              data-testid="next-action"
              key={`${action.account}-${action.title}`}
            >
              <span className="next-action__rank">{index + 1}</span>
              <span className="next-action__brand">
                <Building2 aria-hidden="true" />
              </span>
              <span className="next-action__copy">
                <strong>
                  {action.account} — {action.title}
                </strong>
                <small>{action.reason}</small>
                <span>
                  <Clock3 aria-hidden="true" />
                  {action.effort}
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="next-action__arrow" />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
