import { ExternalLink, SearchCheck } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { CoverageNotice } from '../../ui/CoverageNotice';
import { EvidenceDetail, type EvidenceItem } from './EvidenceDetail';

const evidence: EvidenceItem[] = [
  {
    id: 'servicechannel',
    account: 'RaceTrac',
    title: 'ServiceChannel use confirmed',
    source: 'RaceTrac HVAC/R technician job posting',
    classification: 'Known',
    captured: 'July 18, 2026',
    freshness: 'Fresh · 2 days old',
    confidence: 'High',
    claim: 'Technicians report identified repairs through ServiceChannel.',
    conflicts: 'No known conflicts',
    confirmation: 'confirmed',
  },
  {
    id: 'pump-parts',
    account: 'RaceTrac',
    title: 'Pump-parts visibility delayed repairs',
    source: 'Sensolus customer announcement',
    classification: 'Known',
    captured: 'July 17, 2026',
    freshness: 'Fresh · 3 days old',
    confidence: 'High',
    claim: 'Limited parts visibility prolonged dispenser downtime.',
    conflicts: 'No known conflicts',
    confirmation: 'confirmed',
  },
  {
    id: 'replacement-decay',
    account: 'RaceTrac',
    title: 'Equipment replacements may create stale records',
    source: 'Synthesis of route structure and acquisition evidence',
    classification: 'Strong inference',
    captured: 'July 19, 2026',
    freshness: 'Fresh · 1 day old',
    confidence: 'Medium',
    claim: 'Field replacements are not always reconciled to the authoritative asset record.',
    conflicts: 'Not yet checked against customer data',
    confirmation: 'unreviewed',
  },
  {
    id: 'system-of-record',
    account: 'RaceTrac',
    title: 'Authoritative asset system',
    source: 'Customer discovery required',
    classification: 'Must learn',
    captured: 'July 20, 2026',
    freshness: 'Unknown',
    confidence: 'Low',
    claim: 'Which system is actually trusted when records disagree?',
    conflicts: 'No source evidence yet',
    confirmation: 'unreviewed',
  },
  {
    id: 'heb-expansion',
    account: 'H-E-B',
    title: 'Supply-chain expansion increases commissioning load',
    source: 'H-E-B public expansion announcement',
    classification: 'Known',
    captured: 'July 16, 2026',
    freshness: 'Fresh · 4 days old',
    confidence: 'High',
    claim: 'New facilities increase asset handoff and governance demands.',
    conflicts: 'No known conflicts',
    confirmation: 'confirmed',
  },
];

export function EvidencePage() {
  const [activeItem, setActiveItem] = useState<EvidenceItem | null>(null);
  const [filter, setFilter] = useState('All');
  const visible = filter === 'All' ? evidence : evidence.filter((item) => item.classification === filter);

  return (
    <section className="evidence-page" aria-labelledby="evidence-title">
      <header className="page-title-row">
        <div><p className="eyebrow">Source ledger</p><h1 id="evidence-title">Evidence</h1><p>Every recommendation traces back to a source, inference, or explicit unknown.</p></div>
        <button className="button button--primary" type="button"><SearchCheck aria-hidden="true" />Add manual evidence</button>
      </header>

      <CoverageNotice source="Email and calendar" health="not-connected" />
      <p className="coverage-interpretation">Missing source coverage is not negative evidence and never blocks manual research or action tracking.</p>

      <div className="evidence-filters" aria-label="Evidence classification filters">
        {['All', 'Known', 'Strong inference', 'Must learn'].map((label) => (
          <button type="button" className={filter === label ? 'filter-pill filter-pill--active' : 'filter-pill'} onClick={() => setFilter(label)} key={label}>{label}</button>
        ))}
      </div>

      <div className="evidence-ledger">
        <div className="evidence-ledger__head" aria-hidden="true"><span>Evidence</span><span>Account</span><span>Classification</span><span>Freshness</span><span>Confidence</span><span /></div>
        {visible.map((item) => {
          const tone = item.classification === 'Known' ? 'success' : item.classification === 'Must learn' ? 'warning' : 'info';
          return (
            <button
              type="button"
              className="evidence-ledger__row"
              aria-label={`Open ${item.title.replace('use confirmed', '')} evidence`}
              onClick={() => setActiveItem(item)}
              key={item.id}
            >
              <span><strong>{item.title}</strong><small>{item.source}</small></span>
              <span>{item.account}</span>
              <span><Badge tone={tone}>{item.classification}</Badge></span>
              <span>{item.freshness}</span>
              <span>{item.confidence}</span>
              <ExternalLink aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <EvidenceDetail item={activeItem} onClose={() => setActiveItem(null)} />
    </section>
  );
}

