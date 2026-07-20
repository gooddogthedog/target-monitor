import { Download, FileText, X } from 'lucide-react';
import { Button } from '../../ui/Button';

export interface Artifact {
  id: string;
  title: string;
  account: string;
  type: string;
  version: number;
  updated: string;
  summary: string;
}

interface ArtifactViewProps {
  artifact: Artifact;
  onClose: () => void;
  onDownload: () => void;
}

export function ArtifactView({ artifact, onClose, onDownload }: ArtifactViewProps) {
  return (
    <aside className="artifact-view" aria-labelledby="artifact-title">
      <header><span><FileText aria-hidden="true" /></span><div><p className="eyebrow">{artifact.type}</p><h2 id="artifact-title">{artifact.title}</h2></div><button className="icon-button" type="button" aria-label="Close artifact" onClick={onClose}><X aria-hidden="true" /></button></header>
      <div className="artifact-view__meta"><span>{artifact.account}</span><span>Version {artifact.version}</span><span>{artifact.updated}</span></div>
      <p>{artifact.summary}</p>
      <section><h3>Current working conclusion</h3><p>Public evidence supports a problem-validation conversation around installed equipment records, replacement reconciliation, and service workflow—not yet an enterprise rollout pitch.</p></section>
      <Button onClick={onDownload}><Download aria-hidden="true" />Download locally</Button>
    </aside>
  );
}

