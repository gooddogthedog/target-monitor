import { AlertTriangle, ArrowDownRight, KeyRound, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';

const thesisRows = [
  {
    label: 'Problem',
    icon: AlertTriangle,
    text: 'Installed equipment likely does not consistently match ServiceChannel asset records.',
  },
  {
    label: 'Consequence',
    icon: ArrowDownRight,
    text: 'Repeat visits, wrong parts, warranty leakage, and prolonged downtime.',
  },
  {
    label: 'Trigger',
    icon: Zap,
    text: 'Geographic expansion, Potbelly integration, and active pump-parts visibility work.',
  },
  {
    label: 'Wedge',
    icon: KeyRound,
    text: 'Regional HVAC/R and fuel-dispenser asset-integrity audit.',
  },
] as const;

const evidenceGroups = [
  {
    title: 'Known',
    tone: 'success' as const,
    body: 'ServiceChannel is used; technicians cover standardized store routes; pump-parts visibility has delayed repairs.',
    sources: '3 sources',
    confidence: 'High confidence',
  },
  {
    title: 'Strong inference',
    tone: 'info' as const,
    body: 'Replacements and acquisitions create stale or inconsistent equipment records.',
    sources: '2 sources',
    confidence: 'Medium confidence',
  },
  {
    title: 'Must learn',
    tone: 'warning' as const,
    body: 'Authoritative asset system; correction workflow; budget owner; directly managed brands in scope.',
    sources: '0 sources',
    confidence: 'Low confidence',
  },
] as const;

export function ThesisPanel() {
  return (
    <section className="thesis-panel" aria-labelledby="deal-thesis-title">
      <h2 id="deal-thesis-title">Deal thesis</h2>
      <div className="thesis-rows">
        {thesisRows.map(({ label, icon: Icon, text }) => (
          <div className="thesis-row" key={label}>
            <span className="thesis-row__icon"><Icon aria-hidden="true" /></span>
            <strong>{label}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <div className="section-heading evidence-groups__heading">
        <h2>Evidence and unknowns</h2>
        <Link to="/evidence">Open evidence ledger</Link>
      </div>
      <div className="evidence-groups">
        {evidenceGroups.map((group) => (
          <article className={`evidence-group evidence-group--${group.tone}`} key={group.title}>
            <div className="evidence-group__title">
              <h3>{group.title}</h3>
              <Badge tone={group.tone}>{group.confidence}</Badge>
            </div>
            <p>{group.body}</p>
            <small>{group.sources}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

