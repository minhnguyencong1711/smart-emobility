import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { CloseIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

export type FilterChipTone =
  'navy' | 'primary' | 'danger' | 'warn' | 'ok' | 'eco';

const TONE_CLASSES: Record<
  FilterChipTone,
  { active: string; inactive: string }
> = {
  navy: {
    active: 'border-navy bg-navy text-white',
    inactive: 'border-line bg-surface text-ink-2 hover:bg-surface-2',
  },
  primary: {
    active: 'border-primary bg-primary text-white',
    inactive: 'border-line bg-surface text-ink-2 hover:bg-surface-2',
  },
  danger: {
    active: 'border-danger bg-danger text-white',
    inactive:
      'border-danger/30 bg-danger-soft text-danger-700 hover:bg-danger/15',
  },
  warn: {
    active: 'border-warn bg-warn text-white',
    inactive: 'border-warn/35 bg-warn-soft text-warn-700 hover:bg-warn/20',
  },
  ok: {
    active: 'border-ok bg-ok text-white',
    inactive: 'border-ok/35 bg-ok-soft text-ok-700 hover:bg-ok/20',
  },
  eco: {
    active: 'border-eco bg-eco text-white',
    inactive: 'border-eco/35 bg-eco-soft text-eco-700 hover:bg-eco/20',
  },
};

type FilterChipProps = {
  active?: boolean;
  tone?: FilterChipTone;
  size?: 'sm' | 'default';
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function FilterChip({
  active = false,
  tone = 'navy',
  size = 'default',
  className,
  children,
  type = 'button',
  ...rest
}: FilterChipProps) {
  const styles = TONE_CLASSES[tone];
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border text-caption font-semibold transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1.5',
        active ? styles.active : styles.inactive,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type RemovableFilterChipProps = {
  label: string;
  category?: string;
  onRemove: () => void;
  className?: string;
};

export function RemovableFilterChip({
  label,
  category,
  onRemove,
  className,
}: RemovableFilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-soft px-2.5 py-0.5 text-caption text-primary-700',
        className,
      )}
    >
      {category ? (
        <span className="font-medium text-ink-2">{category}:</span>
      ) : null}
      <span className="font-bold">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
      >
        <CloseIcon size={11} />
      </button>
    </span>
  );
}
