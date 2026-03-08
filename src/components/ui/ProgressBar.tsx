"use client";

interface ProgressBarProps {
  value: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  className = "",
  showPercentage = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border-warm"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showPercentage && (
        <span className="mt-1 text-xs text-muted">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}
