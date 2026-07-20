import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { PlaceholderPage } from './PlaceholderPage';

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const pages = {
  today: {
    eyebrow: 'Today',
    title: 'Your next best move',
    description: 'The highest-leverage action across every active target.',
  },
  actions: {
    eyebrow: 'Priority ledger',
    title: 'All actions',
    description: 'A ranked queue of work, approvals, blockers, and commitments.',
  },
  brief: {
    eyebrow: 'Founder briefing',
    title: 'Daily brief',
    description: 'The three decisions and material changes that need attention.',
  },
  targets: {
    eyebrow: 'Target accounts',
    title: 'Targets',
    description: 'Evolving customer cases grounded in evidence and explicit unknowns.',
  },
  pipeline: {
    eyebrow: 'Evidence-earned progress',
    title: 'Pipeline',
    description: 'Lifecycle gates, blockers, and accountable overrides.',
  },
  evidence: {
    eyebrow: 'Source ledger',
    title: 'Evidence',
    description: 'Facts, inferences, unknowns, conflicts, and provenance.',
  },
  approvals: {
    eyebrow: 'Exact-action control',
    title: 'Approvals',
    description: 'Review immutable payloads and simulated receipts. Nothing is sent.',
  },
  library: {
    eyebrow: 'Working library',
    title: 'Library',
    description: 'Briefs, discovery notes, pilot artifacts, and rollout proposals.',
  },
  settings: {
    eyebrow: 'Workspace controls',
    title: 'Settings',
    description: 'Source coverage, demo state, and local workspace controls.',
  },
} as const;

function page(key: keyof typeof pages) {
  return <PlaceholderPage {...pages[key]} />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route index element={page('today')} />
        <Route path="actions" element={page('actions')} />
        <Route path="brief" element={page('brief')} />
        <Route path="targets" element={page('targets')} />
        <Route path="targets/:accountId" element={page('targets')} />
        <Route path="pipeline" element={page('pipeline')} />
        <Route path="evidence" element={page('evidence')} />
        <Route path="approvals" element={page('approvals')} />
        <Route path="approvals/:actionId" element={page('approvals')} />
        <Route path="library" element={page('library')} />
        <Route path="settings" element={page('settings')} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
