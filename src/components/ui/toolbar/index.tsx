import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type ToolbarProps = {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function Toolbar({ left, right, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 shadow-card sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {left ? (
        <div className="flex flex-1 flex-wrap items-center gap-2">{left}</div>
      ) : null}
      {right ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {right}
        </div>
      ) : null}
    </div>
  );
}

export default Toolbar;
