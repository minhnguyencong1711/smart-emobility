import { cn } from '@/utils/cn';

export type ProgressTone =
  'primary' | 'navy' | 'eco' | 'ok' | 'warn' | 'danger';

const TONE_COLOR: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  navy: 'bg-navy',
  eco: 'bg-eco',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: 'sm' | 'md';
  warningThreshold?: number;
  criticalThreshold?: number;
  showLabel?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  tone,
  size = 'md',
  warningThreshold = 85,
  criticalThreshold = 90,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  const resolvedTone: ProgressTone =
    tone ??
    (pct >= criticalThreshold
      ? 'danger'
      : pct >= warningThreshold
        ? 'warn'
        : 'primary');

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-surface-2',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <div
          style={{ width: `${pct}%` }}
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            TONE_COLOR[resolvedTone],
          )}
        />
      </div>
      {showLabel ? (
        <span className="shrink-0 font-mono text-caption font-semibold tabular-nums text-ink-2">
          {pct}%
        </span>
      ) : null}
    </div>
  );
}

export default ProgressBar;
