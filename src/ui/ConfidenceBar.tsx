interface ConfidenceBarProps {
  value: number;
  label: string;
}

export function ConfidenceBar({ value, label }: ConfidenceBarProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="confidence">
      <div className="confidence__label">
        <span>{label}</span>
        <strong>{boundedValue}%</strong>
      </div>
      <div
        className="confidence__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={boundedValue}
      >
        <span className="confidence__fill" style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  );
}
