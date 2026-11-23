import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type IconButtonSize = 'sm' | 'default' | 'lg';
export type IconButtonTone =
  'neutral' | 'primary' | 'navy' | 'danger' | 'ghost';

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'size-8 rounded-xs [&_svg]:size-4',
  default: 'size-9 rounded-sm [&_svg]:size-5',
  lg: 'size-11 rounded-md [&_svg]:size-5',
};

const TONE_CLASSES: Record<IconButtonTone, string> = {
  neutral:
    'border border-line-strong bg-surface text-ink-2 shadow-card hover:bg-surface-2 hover:text-ink',
  primary: 'bg-primary text-primary-on shadow-card hover:bg-primary-hover',
  navy: 'bg-navy text-navy-on shadow-card hover:bg-navy-700',
  danger:
    'border border-danger/30 bg-danger-soft text-danger-700 hover:bg-danger hover:text-white',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
};

type IconButtonProps = {
  icon: ReactNode;
  'aria-label': string;
  size?: IconButtonSize;
  tone?: IconButtonTone;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      size = 'default',
      tone = 'neutral',
      type = 'button',
      className,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex shrink-0 items-center justify-center transition-colors duration-150 ease-out',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          disabled
            ? 'cursor-not-allowed bg-surface-3 text-ink-muted opacity-70 shadow-none'
            : TONE_CLASSES[tone],
          SIZE_CLASSES[size],
          className,
        )}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);

export default IconButton;
