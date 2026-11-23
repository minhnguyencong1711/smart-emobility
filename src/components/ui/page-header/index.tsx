import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { Breadcrumb, type BreadcrumbItem } from '../breadcrumb';

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  breadcrumb?: BreadcrumbItem[];
  badge?: ReactNode;
  actions?: ReactNode;
  variant?: 'bar' | 'inline';
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  breadcrumb,
  badge,
  actions,
  variant = 'bar',
  className,
}: PageHeaderProps) {
  const isBar = variant === 'bar';

  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-line lg:flex-row lg:items-center lg:justify-between lg:gap-4',
        isBar ? 'bg-surface px-4 py-3.5 sm:px-6 lg:px-7' : 'pb-4',
        className,
      )}
    >
      <div className="min-w-0 shrink-0">
        {eyebrow ? (
          <p className="text-label font-bold uppercase text-primary-700">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-title font-extrabold tracking-tight text-ink sm:text-heading">
            {title}
          </h1>
          {badge}
        </div>
        {breadcrumb && breadcrumb.length > 0 ? (
          <Breadcrumb items={breadcrumb} className="mt-0.5" />
        ) : null}
        {subtitle ? (
          <p className="mt-1 text-body-sm text-ink-2">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export default PageHeader;
