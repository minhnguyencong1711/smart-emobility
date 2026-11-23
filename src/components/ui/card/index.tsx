import type {
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from 'react';

import { cn } from '@/utils/cn';

type CardOwnProps = {
  children: ReactNode;
  elevation?: 0 | 1 | 2 | 3;
  flush?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
};

type CardProps =
  | ({ as?: 'div' } & CardOwnProps & HTMLAttributes<HTMLDivElement>)
  | ({ as: 'button' } & CardOwnProps & ButtonHTMLAttributes<HTMLButtonElement>);

const ELEVATION = ['shadow-card', 'shadow-1', 'shadow-2', 'shadow-3'] as const;
const PADDING = { sm: 'p-4', md: 'p-5', lg: 'p-6 sm:p-8' } as const;

export function Card({
  children,
  elevation = 0,
  flush = false,
  padding = 'md',
  interactive = false,
  className,
  ...rest
}: CardProps) {
  const { as, ...domProps } = rest as { as?: ElementType } & Record<
    string,
    unknown
  >;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      className={cn(
        'min-w-0 rounded-lg border border-line bg-surface text-ink',
        flush ? 'overflow-hidden' : PADDING[padding],
        ELEVATION[elevation],
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        as === 'button' && 'text-left',
        className,
      )}
      {...domProps}
    >
      {children}
    </Component>
  );
}

const HEADER_TONE = {
  neutral: 'bg-surface-2 text-ink-2',
  primary: 'bg-primary-soft text-primary-700',
  navy: 'bg-navy-soft text-navy',
  eco: 'bg-eco-soft text-eco-700',
  ok: 'bg-ok-soft text-ok-700',
  warn: 'bg-warn-soft text-warn-700',
  danger: 'bg-danger-soft text-danger-700',
  info: 'bg-info-soft text-info-700',
} as const;

export type CardHeaderTone = keyof typeof HEADER_TONE;

export function CardHeader({
  title,
  description,
  action,
  icon,
  tone = 'neutral',
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  tone?: CardHeaderTone;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-wrap items-start gap-x-3.5 gap-y-3', className)}
    >
      {icon ? (
        <span
          aria-hidden
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-md [&>svg]:size-5',
            HEADER_TONE[tone],
          )}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1 basis-36">
        <h3 className="text-body-lg font-bold tracking-tight text-ink">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-body-sm text-ink-2">{description}</p>
        ) : null}
      </div>
      {action ? <div className="ml-auto shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-t border-line py-3 first:border-t-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
