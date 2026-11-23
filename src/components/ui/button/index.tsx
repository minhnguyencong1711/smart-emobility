import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { Spinner } from '../spinner';

export type ButtonVariant =
  | 'primary'
  | 'navy'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'eco'
  | 'link';

export type ButtonSize = 'sm' | 'default' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-on shadow-card hover:bg-primary-hover hover:shadow-brand active:bg-primary-active active:shadow-none',
  navy: 'bg-navy text-navy-on shadow-card hover:bg-navy-700 active:opacity-95',
  secondary:
    'border border-line-strong bg-surface text-ink shadow-card hover:border-ink-3 hover:bg-surface-2 active:bg-surface-3',
  soft: 'bg-primary-soft text-primary-700 hover:bg-primary hover:text-primary-on active:bg-primary-active',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink active:bg-surface-3',
  danger:
    'border border-danger bg-danger-soft text-danger-700 hover:bg-danger hover:text-white active:bg-danger-700',
  eco: 'bg-eco text-eco-on shadow-card hover:bg-eco-700 active:opacity-95',
  link: 'h-auto rounded-none px-0 text-primary-700 underline-offset-4 hover:underline',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-sm px-3 text-caption [&_svg]:size-4',
  default: 'h-10 gap-2 rounded-sm px-4 text-body-sm [&_svg]:size-4',
  lg: 'h-11 gap-2 rounded-md px-5 text-body [&_svg]:size-5',
};

type ButtonProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'secondary',
      size = 'default',
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      isLoading = false,
      disabled,
      className,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || isLoading;
    const isLink = variant === 'link';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          'relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold',
          'transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          !isLink && 'active:scale-[0.98]',
          SIZE[size],
          isDisabled
            ? isLink
              ? 'cursor-not-allowed text-ink-muted'
              : 'cursor-not-allowed border border-transparent bg-surface-3 text-ink-3 shadow-none'
            : VARIANT[variant],
          fullWidth ? 'w-full' : 'w-fit',
          className,
        )}
        {...rest}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
        {isLoading ? (
          <span className="bg-surface-3/90 absolute inset-0 flex items-center justify-center rounded-[inherit] text-ink-2">
            <Spinner size="sm" />
          </span>
        ) : null}
      </button>
    );
  },
);

export default Button;
