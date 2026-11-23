import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type TabItem = {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
};

export function Tabs({
  items,
  value,
  onChange,
  variant = 'pill',
  className,
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto',
        variant === 'underline'
          ? 'border-b border-line'
          : 'rounded-md bg-surface-2 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              variant === 'underline'
                ? cn(
                    'border-b-2 px-3 py-2 text-body-sm',
                    active
                      ? 'border-primary text-primary-700'
                      : 'border-transparent text-ink-2 hover:text-ink',
                  )
                : cn(
                    'rounded-sm px-3 py-1.5 text-caption',
                    active
                      ? 'bg-surface text-ink shadow-card'
                      : 'text-ink-2 hover:text-ink',
                  ),
            )}
          >
            {item.icon ? (
              <span className="[&>svg]:size-3.5">{item.icon}</span>
            ) : null}
            <span>{item.label}</span>
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-label tabular-nums',
                  active
                    ? 'bg-primary-soft text-primary-700'
                    : 'bg-surface-3 text-ink-3',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
