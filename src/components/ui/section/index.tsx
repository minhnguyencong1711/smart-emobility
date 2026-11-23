import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type SectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      {title || description || action ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title ? (
              <h2 className="text-title font-bold tracking-tight text-ink">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-body-sm text-ink-2">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default Section;
