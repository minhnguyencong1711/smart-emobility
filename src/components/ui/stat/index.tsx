import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { ProgressBar, type ProgressTone } from '../progress-bar';

type StatCardProps = {
  title: string;
  value: ReactNode;
  denominator?: string;
  badgeText?: string;
  badgeTone?: 'primary' | 'navy' | 'eco' | 'ok' | 'warn' | 'danger' | 'neutral';
  icon?: ReactNode;
  iconTone?: 'primary' | 'navy' | 'eco' | 'warn' | 'danger' | 'info';
  progress?: number;
  progressTone?: ProgressTone;
  footer?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  footerRightTone?: 'default' | 'primary' | 'eco' | 'ok' | 'warn' | 'danger';
  className?: string;
};

const ICON_BG = {
  primary: 'bg-primary-soft text-primary-700',
  navy: 'bg-navy-soft text-navy',
  eco: 'bg-eco-soft text-eco-700',
  warn: 'bg-warn-soft text-warn-700',
  danger: 'bg-danger-soft text-danger-700',
  info: 'bg-info-soft text-info-700',
} as const;

const BADGE_BG = {
  primary: 'bg-primary-soft text-primary-700',
  navy: 'bg-navy-soft text-navy',
  eco: 'bg-eco-soft text-eco-700',
  ok: 'bg-ok-soft text-ok-700',
  warn: 'bg-warn-soft text-warn-700',
  danger: 'bg-danger-soft text-danger-700',
  neutral: 'bg-surface-2 text-ink-2',
} as const;

const FOOTER_RIGHT_TONE = {
  default: 'text-ink-2',
  primary: 'text-primary-700 font-semibold',
  eco: 'text-eco-700 font-semibold',
  ok: 'text-ok-700 font-semibold',
  warn: 'text-warn-700 font-semibold',
  danger: 'text-danger-700 font-semibold',
} as const;

export function StatCard({
  title,
  value,
  denominator,
  badgeText,
  badgeTone = 'primary',
  icon,
  iconTone = 'primary',
  progress,
  progressTone,
  footer,
  footerLeft,
  footerRight,
  footerRightTone = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-lg border border-line bg-surface p-4 shadow-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-label font-bold uppercase tracking-wider text-ink-3">
          {title}
        </span>
        {icon ? (
          <span
            aria-hidden
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-sm [&>svg]:size-4',
              ICON_BG[iconTone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-baseline gap-1.5">
        <span className="font-display text-heading font-extrabold tabular-nums tracking-tight text-ink sm:text-display">
          {value}
        </span>
        {denominator ? (
          <span className="text-body-sm font-medium text-ink-3">
            {denominator}
          </span>
        ) : null}
        {badgeText ? (
          <span
            className={cn(
              'ml-auto rounded-full px-2.5 py-0.5 text-caption font-semibold tabular-nums',
              BADGE_BG[badgeTone],
            )}
          >
            {badgeText}
          </span>
        ) : null}
      </div>

      {typeof progress === 'number' ? (
        <ProgressBar
          value={progress}
          tone={progressTone}
          size="sm"
          className="mt-3"
        />
      ) : null}

      {footerLeft || footerRight ? (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-caption">
          <span className="truncate text-ink-3">{footerLeft}</span>
          {footerRight ? (
            <span
              className={cn(
                'shrink-0 truncate',
                FOOTER_RIGHT_TONE[footerRightTone],
              )}
            >
              {footerRight}
            </span>
          ) : null}
        </div>
      ) : footer ? (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-caption text-ink-2">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export default StatCard;
