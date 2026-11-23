import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type BadgeTone =
  'neutral' | 'primary' | 'navy' | 'eco' | 'info' | 'ok' | 'warn' | 'danger';

export type BadgeVariant = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';

const SOFT: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-2',
  primary: 'bg-primary-soft text-primary-700',
  navy: 'bg-navy-soft text-navy',
  eco: 'bg-eco-soft text-eco-700',
  info: 'bg-info-soft text-info-700',
  ok: 'bg-ok-soft text-ok-700',
  warn: 'bg-warn-soft text-warn-700',
  danger: 'bg-danger-soft text-danger-700',
};

const SOLID: Record<BadgeTone, string> = {
  neutral: 'bg-ink text-white',
  primary: 'bg-primary text-white',
  navy: 'bg-navy text-white',
  eco: 'bg-eco text-white',
  info: 'bg-info text-white',
  ok: 'bg-ok-700 text-white',
  warn: 'bg-warn text-white',
  danger: 'bg-danger text-white',
};

const SIZE: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-label',
  md: 'h-6 px-2.5 text-caption',
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  title?: string;
  className?: string;
};

export function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  icon,
  title,
  className,
}: BadgeProps) {
  const toneClass =
    variant === 'solid'
      ? SOLID[tone]
      : variant === 'outline'
        ? 'border border-line-strong bg-surface text-ink-2'
        : SOFT[tone];

  return (
    <span
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-semibold tabular-nums',
        SIZE[size],
        toneClass,
        className,
      )}
    >
      {icon ? (
        <span className="flex shrink-0 items-center [&>svg]:size-3">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export default Badge;
