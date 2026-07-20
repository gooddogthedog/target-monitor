import { CheckCircle2, Clock3, PlugZap, WifiOff } from 'lucide-react';

type CoverageHealth =
  | 'connected'
  | 'not-connected'
  | 'stale'
  | 'temporarily-unavailable';

interface CoverageNoticeProps {
  source: string;
  health: CoverageHealth;
}

const healthContent = {
  connected: {
    icon: CheckCircle2,
    tone: 'success',
    text: 'is connected',
    detail: 'Coverage is available for relevant recommendations.',
  },
  'not-connected': {
    icon: PlugZap,
    tone: 'neutral',
    text: 'is not connected',
    detail: 'Core work remains available; this source is excluded from conclusions.',
  },
  stale: {
    icon: Clock3,
    tone: 'warning',
    text: 'coverage is stale',
    detail: 'Confidence is reduced only where this source would add evidence.',
  },
  'temporarily-unavailable': {
    icon: WifiOff,
    tone: 'warning',
    text: 'is temporarily unavailable',
    detail: 'This gap is not evidence of customer inactivity.',
  },
} as const;

export function CoverageNotice({ source, health }: CoverageNoticeProps) {
  const content = healthContent[health];
  const Icon = content.icon;

  return (
    <aside className={`coverage-notice coverage-notice--${content.tone}`}>
      <Icon aria-hidden="true" />
      <div>
        <strong>
          {source} {content.text}
        </strong>
        <p>{content.detail}</p>
      </div>
    </aside>
  );
}
