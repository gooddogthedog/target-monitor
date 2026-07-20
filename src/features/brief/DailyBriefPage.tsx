import { ArrowRight, Building2, MessageSquare, ShieldAlert, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';

const decisions = [
  { account: 'RaceTrac', title: 'Approve the regional asset-audit approach', because: 'ServiceChannel use, technician routes, and pump-parts downtime create a credible wedge.', confidence: 92, payoff: '$1.2M+', href: '/approvals/action-racetrac-outreach', action: 'Review RaceTrac draft' },
  { account: 'H-E-B', title: 'Choose the first buyer path before outreach', because: 'Facilities ownership is likely divided across real estate, refrigeration, and operations.', confidence: 68, payoff: '$800K+', href: '/targets/heb', action: 'Open H-E-B account' },
  { account: 'Bagel Brands', title: 'Hold outreach until ownership scope is verified', because: 'Franchised, licensed, and company-operated sites imply fragmented authority.', confidence: 63, payoff: '$600K+', href: '/targets/bagel-brands', action: 'Run verification' },
] as const;

export function DailyBriefPage() {
  return (
    <section className="brief-page" aria-labelledby="brief-title">
      <header className="brief-summary">
        <div><p className="eyebrow">Founder briefing</p><p>The best move today is to turn RaceTrac evidence into a specific customer conversation.</p></div>
        <div className="brief-changes" aria-label="Changes since yesterday">
          <span><TrendingUp aria-hidden="true" />1 new expansion signal</span>
          <span><MessageSquare aria-hidden="true" />2 replies received</span>
          <span><ShieldAlert aria-hidden="true" />1 gate blocked</span>
        </div>
      </header>

      <h1 id="brief-title">Today's three decisions.</h1>
      <div className="brief-decisions">
        {decisions.map((decision, index) => (
          <article className="brief-decision" data-testid="brief-decision" key={decision.account}>
            <span className="brief-decision__rank">{index + 1}</span>
            <div className="brief-decision__body">
              <h2>{decision.title}</h2>
              <div className="brief-decision__meta"><Building2 aria-hidden="true" /><strong>{decision.account}</strong><span>Expected payoff: <strong>{decision.payoff}</strong> pipeline impact</span></div>
              <p><strong>Because:</strong> {decision.because}</p>
              <Badge tone={decision.confidence >= 80 ? 'success' : 'warning'}>{decision.confidence}% confidence</Badge>
            </div>
            <Link className="button button--secondary" to={decision.href}>{decision.action}<ArrowRight aria-hidden="true" /></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
