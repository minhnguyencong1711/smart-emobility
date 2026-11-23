import type { ReactNode } from 'react';

import { SearchIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-ink-3 [&>svg]:size-6">
        {icon ?? <SearchIcon size={24} />}
      </div>
      <h3 className="mt-3 text-body-lg font-bold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-body-sm text-ink-2">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
