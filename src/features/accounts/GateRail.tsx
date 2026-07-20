import { Check } from 'lucide-react';

const phases = [
  'Target Brief',
  'Account Thesis',
  'Contacted',
  'Discovery',
  'Diagnostic',
  'Pilot',
  'Rollout',
] as const;

interface GateRailProps {
  activePhase?: string;
}

export function GateRail({ activePhase = 'Account Thesis' }: GateRailProps) {
  const activeIndex = phases.indexOf(activePhase as (typeof phases)[number]);

  return (
    <ol className="gate-rail" aria-label="Account lifecycle">
      {phases.map((phase, index) => {
        const complete = index < activeIndex;
        const active = phase === activePhase;
        return (
          <li
            className={active ? 'gate-rail__step gate-rail__step--active' : 'gate-rail__step'}
            key={phase}
            aria-current={active ? 'step' : undefined}
          >
            <span className={complete ? 'gate-rail__dot gate-rail__dot--complete' : 'gate-rail__dot'}>
              {complete ? <Check aria-hidden="true" /> : null}
            </span>
            <span>{phase}</span>
          </li>
        );
      })}
    </ol>
  );
}

