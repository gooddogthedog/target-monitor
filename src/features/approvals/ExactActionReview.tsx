import { AlertTriangle, CheckCircle2, LockKeyhole, Mail, Paperclip, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { DemoPresenceDialog } from './DemoPresenceDialog';
import { ReceiptView } from './ReceiptView';

type ReviewState = 'draft' | 'locked' | 'authorized' | 'invalidated' | 'completed';

const initialContent = `Hi — I’ve been looking at how RaceTrac coordinates equipment records across fuel, HVAC/R, and store systems. Public evidence suggests a useful question: when equipment is replaced in the field, how reliably does the installed asset make it back into ServiceChannel?\n\nWould a 20-minute problem-validation conversation be useful?`;

function localFingerprint(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `DEMO-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

export function ExactActionReview() {
  const [content, setContent] = useState(initialContent);
  const [state, setState] = useState<ReviewState>('draft');
  const [presenceOpen, setPresenceOpen] = useState(false);
  const payloadHash = useMemo(() => localFingerprint(content), [content]);
  const locked = state === 'locked';
  const authorized = state === 'authorized';

  function changeContent(value: string) {
    setContent(value);
    if (state === 'locked' || state === 'authorized') {
      setState('invalidated');
    }
  }

  if (state === 'completed') {
    return <ReceiptView payloadHash={payloadHash} />;
  }

  return (
    <section className="exact-review" aria-labelledby="exact-review-title">
      <header className="exact-review__header">
        <div><p className="eyebrow">Exact-action review</p><h2 id="exact-review-title">RaceTrac problem-validation outreach</h2></div>
        <Badge tone={authorized ? 'success' : state === 'invalidated' ? 'danger' : locked ? 'warning' : 'neutral'}>
          {authorized ? 'Demo authorized' : state === 'invalidated' ? 'Approval invalidated' : locked ? 'Locked for review' : 'Draft'}
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
          {state === 'draft' || state === 'invalidated' ? (
            <Button onClick={() => setState('locked')}><LockKeyhole aria-hidden="true" />Lock exact action</Button>
          ) : null}
          {locked ? <Button onClick={() => setPresenceOpen(true)}>Approve this exact action</Button> : null}
          <Button disabled={!authorized} onClick={() => setState('completed')} variant={authorized ? 'primary' : 'secondary'}>
            <CheckCircle2 aria-hidden="true" />Complete demo action
          </Button>
          <p className="payload-hash"><span>Current payload fingerprint</span><strong>{payloadHash}</strong></p>
        </aside>
      </div>

      <DemoPresenceDialog
        open={presenceOpen}
        onClose={() => setPresenceOpen(false)}
        onConfirm={() => { setState('authorized'); setPresenceOpen(false); }}
      />
    </section>
  );
}
