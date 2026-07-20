import { Building2, CalendarClock, Pin, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

type ActionFilter = 'all' | 'approvals' | 'blocked' | 'overdue' | 'research';

const actions = [
  { id: 'racetrac-audit', account: 'RaceTrac', title: 'Approve regional asset-audit outreach', why: 'ServiceChannel and pump-parts evidence support the wedge.', confidence: 86, owner: 'Alex', due: 'Today', tags: ['approvals'], pinLabel: 'Pin RaceTrac action' },
  { id: 'heb-buyer', account: 'H-E-B', title: 'Resolve buyer hypothesis before outreach', why: 'Facilities and construction ownership remain split.', confidence: 61, owner: 'Sam', due: 'Jul 22', tags: ['blocked', 'approvals'], pinLabel: 'Pin H-E-B action' },
  { id: 'bagel-scope', account: 'Bagel Brands', title: 'Validate company-owned pilot scope', why: 'Mixed ownership may fragment operating authority.', confidence: 56, owner: 'Jordan', due: 'Jul 24', tags: ['research'], pinLabel: 'Pin Bagel Brands action' },
  { id: 'racetrac-followup', account: 'RaceTrac', title: 'Follow up with Facilities VP', why: 'A positive initial response creates near-term momentum.', confidence: 76, owner: 'Taylor', due: 'Overdue', tags: ['overdue'], pinLabel: 'Pin RaceTrac follow-up' },
  { id: 'heb-signal', account: 'H-E-B', title: 'Review North Texas expansion signal', why: 'Store and distribution growth indicates near-term spend.', confidence: 59, owner: 'Riley', due: 'Jul 23', tags: ['research'], pinLabel: 'Pin H-E-B signal' },
] as const;

const filters: Array<{ key: ActionFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'research', label: 'Research' },
];

export function ActionsPage() {
  const [filter, setFilter] = useState<ActionFilter>('all');
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [pinnedReasons, setPinnedReasons] = useState<Record<string, string>>({});

  const visibleActions = actions.filter(
    (action) => filter === 'all' || action.tags.includes(filter as never),
  );

  function savePin() {
    if (!pinningId || !reason.trim()) return;
    setPinnedReasons((current) => ({ ...current, [pinningId]: reason.trim() }));
    setPinningId(null);
    setReason('');
  }

  return (
    <section className="actions-page" aria-labelledby="actions-title">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Priority ledger</p>
          <h1 id="actions-title">All actions</h1>
          <p>Ranked work across accounts, with every override and approval visible.</p>
        </div>
        <SlidersHorizontal aria-hidden="true" />
      </header>

      <div className="action-filters" aria-label="Action filters">
        {filters.map((item) => (
          <button
            type="button"
            key={item.key}
            className={filter === item.key ? 'filter-chip filter-chip--active' : 'filter-chip'}
            aria-pressed={filter === item.key}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="priority-ledger">
        <div className="priority-ledger__header" aria-hidden="true">
          <span>Rank</span><span>Account and action</span><span>Why now</span><span>Confidence</span><span>Owner / due</span><span>Control</span>
        </div>
        {visibleActions.map((action) => (
          <article className="priority-action" data-testid="priority-action" key={action.id}>
            <strong className="priority-action__rank">{actions.indexOf(action) + 1}</strong>
            <div className="priority-action__account">
              <span><Building2 aria-hidden="true" /></span>
              <div><small>{action.account}</small><strong>{action.title}</strong></div>
            </div>
            <p>{action.why}</p>
            <div><Badge tone={action.confidence >= 70 ? 'success' : 'warning'}>{action.confidence}%</Badge></div>
            <div className="priority-action__owner"><strong>{action.owner}</strong><small><CalendarClock aria-hidden="true" />{action.due}</small></div>
            <div className="priority-action__control">
              <button type="button" aria-label={action.pinLabel} onClick={() => setPinningId(action.id)}><Pin aria-hidden="true" /></button>
              <Link to={`/targets/${action.account.toLowerCase().replaceAll(' ', '-')}`}>Open</Link>
              {pinnedReasons[action.id] ? <small>Pinned: {pinnedReasons[action.id]}</small> : null}
            </div>
          </article>
        ))}
      </div>

      <Modal
        title="Pin this action"
        open={pinningId !== null}
        onClose={() => { setPinningId(null); setReason(''); }}
        footer={<><Button variant="quiet" onClick={() => setPinningId(null)}>Cancel</Button><Button disabled={!reason.trim()} onClick={savePin}>Save pin</Button></>}
      >
        <label className="field-label" htmlFor="pin-reason">Reason for pinning</label>
        <textarea id="pin-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Record why this should outrank the model." />
      </Modal>
    </section>
  );
}
