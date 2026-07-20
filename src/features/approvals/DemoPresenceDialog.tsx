import { AlertTriangle, UserCheck } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface DemoPresenceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DemoPresenceDialog({ open, onClose, onConfirm }: DemoPresenceDialogProps) {
  return (
    <Modal
      title="Demo founder-presence check"
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}><UserCheck aria-hidden="true" />Confirm demo presence</Button>
        </>
      }
    >
      <div className="demo-presence">
        <AlertTriangle aria-hidden="true" />
        <div>
          <strong>Simulation only—no identity provider is connected.</strong>
          <p>This click authorizes one unchanged demo payload in this local session. It cannot send or publish anything.</p>
        </div>
      </div>
    </Modal>
  );
}

