import type { ReactNode } from 'react';

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  ShieldAlertIcon,
} from '@/components/icons';
import { cn } from '@/utils/cn';

export type CalloutTone = 'info' | 'ok' | 'warn' | 'danger' | 'primary';

const TONE_MAP: Record<
  CalloutTone,
  { wrap: string; icon: string; defaultIcon: ReactNode }
> = {
  info: {
    wrap: 'border-info/30 bg-info-soft text-ink',
    icon: 'text-info-700',
    defaultIcon: <InfoIcon size={18} />,
  },
  primary: {
    wrap: 'border-primary/30 bg-primary-soft text-ink',
    icon: 'text-primary-700',
    defaultIcon: <InfoIcon size={18} />,
  },
  ok: {
    wrap: 'border-ok/35 bg-ok-soft text-ink',
    icon: 'text-ok-700',
    defaultIcon: <CheckCircleIcon size={18} />,
  },
  warn: {
    wrap: 'border-warn/40 bg-warn-soft text-ink',
    icon: 'text-warn-700',
    defaultIcon: <AlertTriangleIcon size={18} />,
  },
  danger: {
    wrap: 'border-danger/40 bg-danger-soft text-ink',
    icon: 'text-danger-700',
    defaultIcon: <ShieldAlertIcon size={18} />,
  },
};

type CalloutProps = {
  tone?: CalloutTone;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
};

export function Callout({
  tone = 'info',
  title,
  description,
  icon,
  action,
  onDismiss,
  className,
}: CalloutProps) {
  const styles = TONE_MAP[tone];

  return (
    <div
      role={tone === 'danger' || tone === 'warn' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3',
        styles.wrap,
        className,
      )}
    >
      <span className={cn('mt-0.5 shrink-0', styles.icon)}>
        {icon ?? styles.defaultIcon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mt-0.5 text-caption text-ink-2">{description}</p>
        ) : null}
        {action ? <div className="mt-2.5">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="hover:bg-surface/60 rounded-xs p-1 text-ink-3 hover:text-ink"
        >
          <CloseIcon size={16} />
        </button>
      ) : null}
    </div>
  );
}

export default Callout;
