import { CalendarDays, FileText, Globe2, Mail, NotebookPen } from 'lucide-react';
import { Badge } from '../../ui/Badge';

export type Health = 'connected' | 'not-connected' | 'stale' | 'temporarily-unavailable';

interface SourceHealthControlsProps {
  emailHealth: Health;
  calendarHealth: Health;
  setEmailHealth: (health: Health) => void;
  setCalendarHealth: (health: Health) => void;
}

const statusLabels: Record<Health, string> = {
  connected: 'Connected',
  'not-connected': 'Not connected',
  stale: 'Stale',
  'temporarily-unavailable': 'Temporarily unavailable',
};

const options = Object.entries(statusLabels) as [Health, string][];

export function SourceHealthControls({ emailHealth, calendarHealth, setEmailHealth, setCalendarHealth }: SourceHealthControlsProps) {
  return (
    <div className="source-health-grid">
      <article className="source-health-card source-health-card--fixed"><Globe2 aria-hidden="true" /><div><strong>Public web</strong><Badge tone="success">Always available</Badge></div></article>
      <article className="source-health-card"><Mail aria-hidden="true" /><label>Email source health<select value={emailHealth} onChange={(event) => setEmailHealth(event.target.value as Health)}>{options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></article>
      <article className="source-health-card"><CalendarDays aria-hidden="true" /><label>Calendar source health<select value={calendarHealth} onChange={(event) => setCalendarHealth(event.target.value as Health)}>{options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></article>
      <article className="source-health-card source-health-card--fixed"><FileText aria-hidden="true" /><div><strong>Files and documents</strong><Badge tone="warning">Temporarily unavailable</Badge></div></article>
      <article className="source-health-card source-health-card--fixed"><NotebookPen aria-hidden="true" /><div><strong>Manual notes and tasks</strong><Badge tone="success">Always available</Badge></div></article>
    </div>
  );
}
