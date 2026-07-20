import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  Check,
  FileSearch,
  MessageSquareText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ConfidenceBar } from '../../ui/ConfidenceBar';

export interface NextBestMoveViewModel {
  account: string;
  title: string;
  rationale: string;
  confidence: number;
  currentPhase: string;
  nextPhase: string;
  evidence: Array<{ id: string; label: string; detail: string }>;
  outreach: {
    subject: string;
    recipient: string;
    goal: string;
    status: string;
  };
}

interface NextBestMoveProps {
  move: NextBestMoveViewModel;
}

export function NextBestMove({ move }: NextBestMoveProps) {
  return (
    <div className="next-move-layout">
      <article className="next-move-card">
        <div className="account-label">
          <span className="account-label__mark">
            <Building2 aria-hidden="true" />
          </span>
          <strong>{move.account}</strong>
        </div>

        <div className="next-move-card__summary">
          <div>
            <h2>{move.title}</h2>
            <p>{move.rationale}</p>
          </div>
          <aside className="confidence-card">
            <ConfidenceBar value={move.confidence} label="Evidence confidence" />
            <p>
              {move.currentPhase} → {move.nextPhase}
            </p>
          </aside>
        </div>

        <aside className="ranking-rationale" aria-label="Why this outranks other work">
          <strong>Why this outranks other work</strong>
          <p>
            Strong public evidence, a prepared conversation, and a near-term buyer-path
            decision make this the fastest way to unlock qualified discovery.
          </p>
        </aside>

        <section className="evidence-chain" aria-labelledby="supporting-evidence-title">
          <div className="section-heading">
            <h3 id="supporting-evidence-title">Supporting evidence</h3>
            <Link to="/evidence">Inspect ledger</Link>
          </div>
          <div className="evidence-chain__items">
            {move.evidence.map((item) => (
              <article className="evidence-proof" key={item.id}>
                <span className="evidence-proof__check">
                  <Check aria-hidden="true" />
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="next-move-card__actions">
          <Link className="button button--primary" to="/approvals/action-racetrac-outreach">
            Review outreach
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="button button--secondary" to="/evidence">
            <FileSearch aria-hidden="true" />
            Inspect evidence
          </Link>
          <Link className="button button--secondary" to="/actions">
            <ArrowLeftRight aria-hidden="true" />
            Choose another move
          </Link>
        </footer>
      </article>

      <aside className="outreach-preview">
        <div className="outreach-preview__title">
          <MessageSquareText aria-hidden="true" />
          <h2>Outreach preview</h2>
        </div>
        <dl>
          <div>
            <dt>Subject</dt>
            <dd>{move.outreach.subject}</dd>
          </div>
          <div>
            <dt>Recipient</dt>
            <dd>{move.outreach.recipient}</dd>
          </div>
          <div>
            <dt>Goal</dt>
            <dd>{move.outreach.goal}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <Badge tone="warning">{move.outreach.status}</Badge>
            </dd>
          </div>
        </dl>
        <Link className="button button--secondary outreach-preview__button" to="/approvals/action-racetrac-outreach">
          Review exact action
        </Link>
        <p className="outreach-preview__note">Approval required before demo completion</p>
      </aside>
    </div>
  );
}
