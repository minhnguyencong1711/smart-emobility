import type { ReactNode } from 'react';

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PowerOffIcon,
  ShieldAlertIcon,
  WrenchIcon,
} from '@/components/icons';
import { cn } from '@/utils/cn';

export type StatusTone =
  'neutral' | 'primary' | 'eco' | 'info' | 'ok' | 'warn' | 'danger';

const TONE: Record<
  StatusTone,
  { surface: string; icon: string; text: string }
> = {
  neutral: {
    surface: 'bg-surface-2 border border-line',
    icon: 'text-ink-3',
    text: 'text-ink-2',
  },
  primary: {
    surface: 'bg-primary-soft border border-primary/25',
    icon: 'text-primary-700',
    text: 'text-ink',
  },
  eco: {
    surface: 'bg-eco-soft border border-eco/25',
    icon: 'text-eco-700',
    text: 'text-ink',
  },
  info: {
    surface: 'bg-info-soft border border-info/25',
    icon: 'text-info-700',
    text: 'text-ink',
  },
  ok: {
    surface: 'bg-ok-soft border border-ok/30',
    icon: 'text-ok-700',
    text: 'text-ok-700',
  },
  warn: {
    surface: 'bg-warn-soft border border-warn/35',
    icon: 'text-warn-700',
    text: 'text-warn-700',
  },
  danger: {
    surface: 'bg-danger-soft border border-danger/35',
    icon: 'text-danger-700',
    text: 'text-danger-700',
  },
};

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusTone;
  /** Icon is required so status never relies on color alone. */
  icon: ReactNode;
  title?: string;
  pulse?: boolean;
  className?: string;
};

export function StatusPill({
  children,
  tone = 'neutral',
  icon,
  title,
  pulse = false,
  className,
}: StatusPillProps) {
  const styles = TONE[tone];

  return (
    <span
      title={title}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-caption font-semibold',
        styles.surface,
        styles.text,
        className,
      )}
    >
      <span
        className={cn(
          'relative flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5',
          styles.icon,
        )}
      >
        {pulse ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-current opacity-35 motion-reduce:animate-none"
          />
        ) : null}
        {icon}
      </span>
      {children}
    </span>
  );
}

export type HubStatusValue = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE';

const HUB_STATUS_CONFIG: Record<
  HubStatusValue,
  { label: string; tone: StatusTone; icon: ReactNode; pulse?: boolean }
> = {
  NORMAL: {
    label: 'Normal',
    tone: 'ok',
    icon: <CheckCircleIcon />,
  },
  WARNING: {
    label: 'Warning (85–90%)',
    tone: 'warn',
    icon: <AlertTriangleIcon />,
  },
  CRITICAL: {
    label: 'Critical (>=90%)',
    tone: 'danger',
    icon: <ShieldAlertIcon />,
    pulse: true,
  },
  UNAVAILABLE: {
    label: 'Unavailable',
    tone: 'neutral',
    icon: <PowerOffIcon />,
  },
};

export function HubStatusPill({
  status,
  className,
}: {
  status: HubStatusValue;
  className?: string;
}) {
  const cfg = HUB_STATUS_CONFIG[status];
  return (
    <StatusPill
      tone={cfg.tone}
      icon={cfg.icon}
      pulse={cfg.pulse}
      className={className}
    >
      {cfg.label}
    </StatusPill>
  );
}

export type IncidentStatusValue =
  | 'REPORTED'
  | 'INVESTIGATING'
  | 'ISOLATED'
  | 'UNDER_REPAIR'
  | 'RESOLVED'
  | 'CLOSED';

const INCIDENT_STATUS_CONFIG: Record<
  IncidentStatusValue,
  { label: string; tone: StatusTone; icon: ReactNode; pulse?: boolean }
> = {
  REPORTED: {
    label: 'Reported',
    tone: 'danger',
    icon: <AlertTriangleIcon />,
    pulse: true,
  },
  INVESTIGATING: {
    label: 'Investigating',
    tone: 'warn',
    icon: <ClockIcon />,
  },
  ISOLATED: {
    label: 'Isolated',
    tone: 'info',
    icon: <PowerOffIcon />,
  },
  UNDER_REPAIR: {
    label: 'Under Repair',
    tone: 'primary',
    icon: <WrenchIcon />,
  },
  RESOLVED: {
    label: 'Resolved',
    tone: 'ok',
    icon: <CheckCircleIcon />,
  },
  CLOSED: {
    label: 'Closed',
    tone: 'neutral',
    icon: <CheckCircleIcon />,
  },
};

export function IncidentStatusPill({
  status,
  className,
}: {
  status: IncidentStatusValue;
  className?: string;
}) {
  const cfg = INCIDENT_STATUS_CONFIG[status];
  return (
    <StatusPill
      tone={cfg.tone}
      icon={cfg.icon}
      pulse={cfg.pulse}
      className={className}
    >
      {cfg.label}
    </StatusPill>
  );
}

export default StatusPill;
