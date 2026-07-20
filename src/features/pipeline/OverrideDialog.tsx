import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface OverrideDialogProps {
  open: boolean;
  account: string;
  blocker: string;
  onClose: () => void;
  onRecord: (owner: string) => void;
}

export function OverrideDialog({ open, account, blocker, onClose, onRecord }: OverrideDialogProps) {
  const [reason, setReason] = useState('');
  const [owner, setOwner] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const complete = reason.trim().length >= 10 && owner.trim().length > 0 && riskAcknowledged;

  return (
    <Modal
      title={`Accountable override · ${account}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!complete} onClick={() => onRecord(owner.trim())}>Record override</Button>
        </>
      }
    >
      <div className="override-form">
        <p className="override-form__warning">This does not erase the unmet gate: <strong>{blocker}</strong>.</p>
        <label>
          Override reason
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why proceeding now is justified"
          />
        </label>
        <label>
          Accountable owner
          <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Name" />
        </label>
        <label className="override-risk">
          <input
            type="checkbox"
            checked={riskAcknowledged}
            onChange={(event) => setRiskAcknowledged(event.target.checked)}
          />
          <span>I acknowledge the risk of advancing without this criterion.</span>
        </label>
        <p className="override-form__timestamp">Timestamp will be recorded automatically: July 20, 2026 · 5:45 PM CT</p>
      </div>
    </Modal>
  );
}

