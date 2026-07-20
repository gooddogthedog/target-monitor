import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <LoaderCircle className="loading-state__icon" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
