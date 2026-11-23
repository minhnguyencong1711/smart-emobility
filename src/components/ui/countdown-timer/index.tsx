import { ClockIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

type CountdownTimerProps = {
  secondsRemaining: number;
  label?: string;
  className?: string;
};

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function CountdownTimer({
  secondsRemaining,
  label = 'Grace Hold Remaining',
  className,
}: CountdownTimerProps) {
  const isExpired = secondsRemaining <= 0;
  const isUrgent = secondsRemaining > 0 && secondsRemaining <= 180;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-3 py-1.5',
        isExpired
          ? 'border-danger/35 bg-danger-soft text-danger-700'
          : isUrgent
            ? 'border-warn/40 bg-warn-soft text-warn-700'
            : 'border-primary/25 bg-primary-soft text-primary-700',
        className,
      )}
    >
      <ClockIcon size={16} />
      <span className="text-caption font-medium">{label}:</span>
      <span className="font-mono text-body-sm font-bold tabular-nums">
        {formatCountdown(secondsRemaining)}
      </span>
    </div>
  );
}

export default CountdownTimer;
