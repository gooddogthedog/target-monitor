import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppService } from '../../app/AppServiceProvider';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { SourceHealthControls, type Health } from './SourceHealthControls';

export function SettingsPage() {
  const { service, resetDemoData } = useAppService();
  const [emailHealth, setEmailHealth] = useState<Health>('not-connected');
  const [calendarHealth, setCalendarHealth] = useState<Health>('stale');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    void service.getDashboard().then((dashboard) => {
      if (!current) return;
      const email = dashboard.sources.find((source) => source.id === 'source-email');
      const calendar = dashboard.sources.find((source) => source.id === 'source-calendar');
      if (email) setEmailHealth(email.health);
      if (calendar) setCalendarHealth(calendar.health);
    }).catch(() => {
      if (current) setSavingError('Source health could not be loaded. Manual work remains available.');
    });
    return () => { current = false; };
  }, [service]);

  function updateSource(sourceId: string, health: Health, updateLocal: (value: Health) => void) {
    updateLocal(health);
    setSavingError(null);
    void service.setSourceHealth(sourceId, health).catch(() => {
      setSavingError('Source health could not be saved. Manual work remains available.');
    });
  }

  async function confirmReset() {
    try {
      await resetDemoData();
      setResetComplete(true);
      setResetOpen(false);
      setEmailHealth('connected');
      setCalendarHealth('connected');
    } catch {
      setSavingError('Local demo data could not be reset. Existing work was not cleared.');
    }
  }

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <header className="page-title-row"><div><p className="eyebrow">Workspace controls</p><h1 id="settings-title">Settings</h1><p>Test source degradation and manage only the local demo workspace.</p></div></header>

      <section className="settings-section" aria-labelledby="sources-title">
        <div className="settings-section__heading"><div><h2 id="sources-title">Source health</h2><p>Each source fails independently. Missing sources are skipped, never treated as system failure.</p></div><ShieldCheck aria-hidden="true" /></div>
        <SourceHealthControls
          emailHealth={emailHealth}
          calendarHealth={calendarHealth}
          setEmailHealth={(health) => updateSource('source-email', health, setEmailHealth)}
          setCalendarHealth={(health) => updateSource('source-calendar', health, setCalendarHealth)}
        />
        {savingError ? <p role="alert">{savingError}</p> : null}
        <aside className="core-availability"><CheckCircle2 aria-hidden="true" /><div><strong>Core workflow remains ready</strong><p>Manual notes and tasks are always available. Missing integrations never become negative customer evidence.</p><Link to="/targets">Continue to targets</Link></div></aside>
      </section>

      <section className="settings-section settings-section--danger" aria-labelledby="reset-title">
        <div><h2 id="reset-title">Local demo data</h2><p>Replace local edits with the original RaceTrac, H-E-B, and Bagel Brands seed state.</p></div>
        <Button variant="danger" onClick={() => { setResetConfirmed(false); setResetOpen(true); }}><RotateCcw aria-hidden="true" />Reset demo data</Button>
        {resetComplete ? <p role="status">Local demo data reset complete.</p> : null}
      </section>

      <Modal
        title="Reset local demo data"
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={!resetConfirmed} onClick={confirmReset}>Confirm reset</Button>
          </>
        }
      >
        <div className="reset-confirmation"><AlertTriangle aria-hidden="true" /><p>This replaces local demo changes. It does not affect any external system because none is connected.</p></div>
        <label className="reset-check"><input type="checkbox" checked={resetConfirmed} onChange={(event) => setResetConfirmed(event.target.checked)} />Replace my local demo edits with the seed state.</label>
      </Modal>
    </section>
  );
}
