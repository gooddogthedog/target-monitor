import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface GateReviewDialogProps {
  open: boolean;
  account: string;
  blocker: string;
  onClose: () => void;
  onOverride: () => void;
}

export function GateReviewDialog({ open, account, blocker, onClose, onOverride }: GateReviewDialogProps) {
  return (
    <Modal
      title={`${account} · Gate review`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onOverride}>Override with accountability</Button>
        </>
      }
    >
      <div className="gate-review">
        <p className="gate-review__blocker"><AlertTriangle aria-hidden="true" />Advancement is blocked: {blocker}</p>
        <ul className="gate-checklist">
          <li><CheckCircle2 aria-hidden="true" />Specific operational problem</li>
          <li className="gate-checklist__open"><Circle aria-hidden="true" />Plausible buyer</li>
          <li><CheckCircle2 aria-hidden="true" />Credible trigger</li>
          <li><CheckCircle2 aria-hidden="true" />Narrow conversation request</li>
        </ul>
        <p>Complete the missing criterion for normal advancement. Use an override only when a named owner accepts the stated risk.</p>
      </div>
    </Modal>
  );
}

