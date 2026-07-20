import { Download, FileBarChart, FileText, FolderOpen, NotebookPen } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { ArtifactView, type Artifact } from './ArtifactView';

const artifacts: Artifact[] = [
  { id: 'racetrac-thesis', title: 'RaceTrac deal thesis', account: 'RaceTrac', type: 'Deal thesis', version: 3, updated: 'Updated today', summary: 'Problem, consequence, trigger, wedge, evidence classes, and open buyer-path decision.' },
  { id: 'heb-brief', title: 'H-E-B external target brief', account: 'H-E-B', type: 'Target brief', version: 2, updated: 'Updated yesterday', summary: 'Physical estate, expansion signals, important assets, job clues, and commissioning hypothesis.' },
  { id: 'bagel-scorecard', title: 'Bagel Brands qualification scorecard', account: 'Bagel Brands', type: 'Scorecard', version: 1, updated: 'Updated July 18', summary: 'Operational fit, estate change, data-decay likelihood, access, timing, and ownership-model uncertainty.' },
] as const;

const icons = { 'Deal thesis': NotebookPen, 'Target brief': FileText, Scorecard: FileBarChart } as const;

function downloadArtifact(artifact: Artifact) {
  const body = `${artifact.title}\n${artifact.account}\nVersion ${artifact.version}\n\n${artifact.summary}\n`;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${artifact.id}-v${artifact.version}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LibraryPage() {
  const [selected, setSelected] = useState<Artifact | null>(null);

  return (
    <section className="library-page" aria-labelledby="library-title">
      <header className="page-title-row"><div><p className="eyebrow">Working library</p><h1 id="library-title">Library</h1><p>Versioned briefs, scorecards, discovery notes, and proposals built from the account record.</p></div><Badge tone="success"><FolderOpen aria-hidden="true" />Local workspace</Badge></header>
      <aside className="library-local-note">Downloads stay on this device. No cloud drive integration is required.</aside>
      <div className="library-layout">
        <div className="artifact-list">
          {artifacts.map((artifact) => {
            const Icon = icons[artifact.type as keyof typeof icons];
            return (
              <article className={selected?.id === artifact.id ? 'artifact-row artifact-row--selected' : 'artifact-row'} key={artifact.id}>
                <button type="button" className="artifact-row__open" onClick={() => setSelected(artifact)}>
                  <span><Icon aria-hidden="true" /></span>
                  <span><Badge>{artifact.type}</Badge><strong>{artifact.title}</strong><small>{artifact.account} · Version {artifact.version} · {artifact.updated}</small></span>
                </button>
                <button type="button" className="icon-button" aria-label={`Download locally ${artifact.title}`} onClick={() => downloadArtifact(artifact)}><Download aria-hidden="true" /></button>
              </article>
            );
          })}
        </div>
        {selected ? <ArtifactView artifact={selected} onClose={() => setSelected(null)} onDownload={() => downloadArtifact(selected)} /> : (
          <aside className="artifact-view artifact-view--empty"><FolderOpen aria-hidden="true" /><h2>Select an artifact</h2><p>Review its working conclusion and download a local copy.</p></aside>
        )}
      </div>
    </section>
  );
}

