import { CheckCircle2, LockKeyhole } from 'lucide-react';
import type { DispatchReceipt } from '../../domain/types';

interface ReceiptViewProps {
  payloadHash: string;
  receipt: DispatchReceipt;
}

export function ReceiptView({ payloadHash, receipt }: ReceiptViewProps) {
  return (
    <section className="receipt-view" aria-labelledby="receipt-title">
      <span className="receipt-view__icon"><CheckCircle2 aria-hidden="true" /></span>
      <div>
        <p className="eyebrow">Local simulation</p>
        <h2 id="receipt-title">Completed demo receipt</h2>
        <p>No external provider was contacted. No email was sent and no post was published.</p>
        <dl>
          <div><dt>Result</dt><dd>{receipt.reason}</dd></div>
          <div><dt>Payload</dt><dd><LockKeyhole aria-hidden="true" />{payloadHash}</dd></div>
          <div><dt>Authorization</dt><dd>Single-use demo authorization consumed</dd></div>
          <div><dt>Recorded</dt><dd>{new Date(receipt.createdAt).toLocaleString()}</dd></div>
        </dl>
      </div>
    </section>
  );
}
