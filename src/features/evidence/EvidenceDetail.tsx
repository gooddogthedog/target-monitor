import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

export interface EvidenceItem {
  id: string;
  account: string;
  title: string;
  source: string;
  classification: 'Known' | 'Strong inference' | 'Must learn';
  captured: string;
  freshness: string;
  confidence: string;
  claim: string;
  conflicts: string;
  confirmation: string;
}

interface EvidenceDetailProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export function EvidenceDetail({ item, onClose }: EvidenceDetailProps) {
  const tone = item?.classification === 'Known' ? 'success' : item?.classification === 'Must learn' ? 'warning' : 'info';

  return (
    <Modal
      title={item?.title ?? 'Evidence detail'}
      open={item !== null}
      onClose={onClose}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      {item ? (
        <div className="evidence-detail">
          <div className="evidence-detail__status"><Badge tone={tone}>{item.classification}</Badge><Badge>{item.account}</Badge></div>
          <dl>
            <div><dt>Source</dt><dd>{item.source}</dd></div>
            <div><dt>Capture time</dt><dd>Captured {item.captured}</dd></div>
            <div><dt>Freshness</dt><dd>{item.freshness}</dd></div>
            <div><dt>Confidence</dt><dd>{item.confidence}</dd></div>
            <div><dt>Linked claim</dt><dd>{item.claim}</dd></div>
            <div><dt>Conflicts</dt><dd>{item.conflicts}</dd></div>
            <div><dt>Confirmation</dt><dd>Manual confirmation: {item.confirmation}</dd></div>
          </dl>
        </div>
      ) : null}
    </Modal>
  );
}

