import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { ExactActionReview } from './ExactActionReview';

export function ApprovalsPage() {
  const [reviewing, setReviewing] = useState(false);

  return (
    <section className="approvals-page" aria-labelledby="approvals-title">
      <header className="page-title-row">
        <div><p className="eyebrow">Exact-action control</p><h1 id="approvals-title">Approvals</h1><p>Nothing external can happen here. Approval is explicit, concrete, single-use, and simulated.</p></div>
        <Badge tone="success"><ShieldCheck aria-hidden="true" />Outbound disabled</Badge>
      </header>

      <p className="approvals-page__safety">Demo—no message will be sent. Every completion on this route is a local simulation.</p>

      {!reviewing ? (
        <div className="approval-queue">
          <article>
            <span className="approval-queue__icon"><LockKeyhole aria-hidden="true" /></span>
            <div><Badge tone="warning">Founder review</Badge><h2>RaceTrac problem-validation outreach</h2><p>One exact email draft · proposed for VP, Facilities · no attachments</p></div>
            <button type="button" className="button button--primary" onClick={() => setReviewing(true)}>Review exact action</button>
          </article>
        </div>
      ) : <ExactActionReview />}
    </section>
  );
}
