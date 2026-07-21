import { AlertTriangle, CheckCircle2, LockKeyhole, Mail, Paperclip, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppService } from '../../app/AppServiceProvider';
import type { DispatchReceipt, ExactActionPayload } from '../../domain/types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { DemoPresenceDialog } from './DemoPresenceDialog';
import { ReceiptView } from './ReceiptView';

type ReviewState = 'draft' | 'locked' | 'authorized' | 'invalidated' | 'completed' | 'denied';

const initialContent = `Hi — I’ve been looking at how RaceTrac coordinates equipment records across fuel, HVAC/R, and store systems. Public evidence suggests a useful question: when equipment is replaced in the field, how reliably does the installed asset make it back into ServiceChannel?\n\nWould a 20-minute problem-validation conversation be useful?`;

function localFingerprint(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `DEMO-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

const actionId = 'action-racetrac-outreach';
const ownerId = 'user-caleb';

export function ExactActionReview() {
  const { service } = useAppService();
  const [content, setContent] = useState(initialContent);
  const [state, setState] = useState<ReviewState>('draft');
  const [presenceOpen, setPresenceOpen] = useState(false);
  const [envelopeId, setEnvelopeId] = useState<string | null>(null);
  const [lockedHash, setLockedHash] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DispatchReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payloadHash = useMemo(() => lockedHash ?? localFingerprint(content), [content, lockedHash]);
  const locked = state === 'locked';
  const authorized = state === 'authorized';

  function exactPayload(value = content): ExactActionPayload {
    return {
      channel: 'email',
      recipientOrAccount: 'VP, Facilities · RaceTrac',
      subject: 'Ideas to reduce pump-related downtime across RaceTrac sites',
      content: value,
      attachmentIds: [],
      scheduledFor: null,
    };
  }

  function changeContent(value: string) {
    setContent(value);
    if (state === 'locked' || state === 'authorized') {
      setState('invalidated');
      setEnvelopeId(null);
      setLockedHash(null);
      setBusy(true);
      void service.updateDraft(actionId, exactPayload(value))
        .catch(() => setError('The changed draft could not be saved. Approval remains invalidated.'))
        .finally(() => setBusy(false));
    }
  }

  async function lockExactAction() {
    setBusy(true);
    setError(null);
    try {
      await service.updateDraft(actionId, exactPayload());
      const envelope = await service.lockExactAction(
        actionId,
        ownerId,
        new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      );
      setEnvelopeId(envelope.id);
      setLockedHash(envelope.payloadHash);
      setState('locked');
    } catch {
      setError('The exact action could not be locked. Nothing was authorized.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPresence() {
    if (!envelopeId) return;
    setBusy(true);
    setError(null);
    try {
      await service.confirmDemoPresence(envelopeId, ownerId);
      setState('authorized');
      setPresenceOpen(false);
    } catch {
      setError('Presence confirmation was refused. Nothing was authorized.');
    } finally {
      setBusy(false);
    }
  }

  async function completeSimulation() {
    if (!envelopeId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await service.simulateDispatch(actionId, envelopeId);
      setReceipt(result);
      setState(result.state === 'completed' ? 'completed' : 'denied');
    } catch {
      setError('The local simulation failed closed. No external action was attempted.');
      setState('denied');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'completed' && receipt) {
    return <ReceiptView payloadHash={payloadHash} receipt={receipt} />;
  }

  return (
    <section className="exact-review" aria-labelledby="exact-review-title">
      <header className="exact-review__header">
        <div><p className="eyebrow">Exact-action review</p><h2 id="exact-review-title">RaceTrac problem-validation outreach</h2></div>
        <Badge tone={authorized ? 'success' : state === 'invalidated' || state === 'denied' ? 'danger' : locked ? 'warning' : 'neutral'}>
          {authorized ? 'Demo authorized' : state === 'denied' ? 'Failed closed' : state === 'invalidated' ? 'Approval invalidated' : locked ? 'Locked for review' : 'Draft'}
        </Badge>
      </header>

      <aside className="simulation-banner"><AlertTriangle aria-hidden="true" /><strong>Demo—no message will be sent.</strong><span>This screen has no outbound credentials, provider client, send tool, or publish tool.</span></aside>

      <div className="exact-review__layout">
        <div className="exact-payload">
          <dl className="payload-facts">
            <div><dt><Mail aria-hidden="true" />Channel</dt><dd>Email · simulated</dd></div>
            <div><dt><UserRound aria-hidden="true" />Recipient</dt><dd>VP, Facilities · RaceTrac</dd></div>
            <div><dt><Paperclip aria-hidden="true" />Attachments</dt><dd>None</dd></div>
          </dl>
          <label>Subject<input value="Ideas to reduce pump-related downtime across RaceTrac sites" readOnly /></label>
          <label>Exact content<textarea aria-label="Exact content" value={content} onChange={(event) => changeContent(event.target.value)} /></label>
        </div>

        <aside className="approval-control">
          <h3>Founder control</h3>
          <ol>
            <li className={state !== 'draft' && state !== 'invalidated' ? 'complete' : ''}><span>1</span>Lock one exact payload</li>
            <li className={authorized ? 'complete' : ''}><span>2</span>Confirm founder presence</li>
            <li><span>3</span>Complete local simulation</li>
          </ol>
          {state === 'invalidated' ? <p className="approval-invalidated" role="status">Approval invalidated because exact content changed. Re-lock and approve the new payload.</p> : null}
          {state === 'denied' ? <p className="approval-invalidated" role="status">Simulation failed closed: {receipt?.reason ?? 'authorization denied'}</p> : null}
          {error ? <p className="approval-invalidated" role="alert">{error}</p> : null}
          {state === 'draft' || state === 'invalidated' ? (
            <Button disabled={busy} onClick={lockExactAction}><LockKeyhole aria-hidden="true" />Lock exact action</Button>
          ) : null}
          {locked ? <Button disabled={busy} onClick={() => setPresenceOpen(true)}>Approve this exact action</Button> : null}
          <Button disabled={!authorized || busy} onClick={completeSimulation} variant={authorized ? 'primary' : 'secondary'}>
            <CheckCircle2 aria-hidden="true" />Complete demo action
          </Button>
          <p className="payload-hash"><span>Current payload fingerprint</span><strong>{payloadHash}</strong></p>
        </aside>
      </div>

      <DemoPresenceDialog
        open={presenceOpen}
        onClose={() => setPresenceOpen(false)}
        onConfirm={confirmPresence}
      />
    </section>
  );
}
