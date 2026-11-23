import { Link } from '@tanstack/react-router';

import { cn } from '@/utils/cn';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-ink-3">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={`${item.label}-${idx}`}
              className="flex items-center gap-1.5"
            >
              {idx > 0 ? (
                <span aria-hidden className="text-ink-muted">
                  /
                </span>
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="font-medium text-ink-3 transition-colors hover:text-primary-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    isLast ? 'font-medium text-ink-2' : 'text-ink-3',
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
