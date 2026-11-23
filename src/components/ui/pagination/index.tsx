import { useMemo } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  variant?: 'default' | 'compact';
  itemLabel?: string;
  className?: string;
};

const WINDOW_SIZE = 5;

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  variant = 'default',
  itemLabel,
  className,
}: PaginationProps) {
  const pageRange = useMemo(() => {
    const half = Math.floor(WINDOW_SIZE / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (end - start + 1 < WINDOW_SIZE) {
      if (start === 1) {
        end = Math.min(totalPages, start + WINDOW_SIZE - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - WINDOW_SIZE + 1);
      }
    }

    const pages: number[] = [];
    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const hasRangeSummary =
    typeof totalItems === 'number' && typeof pageSize === 'number';
  const start = hasRangeSummary
    ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
    : 0;
  const end = hasRangeSummary
    ? Math.min(currentPage * pageSize, totalItems)
    : 0;

  const btnSize = variant === 'compact' ? 'size-8' : 'size-9';

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        className,
      )}
    >
      {hasRangeSummary ? (
        <p className="text-caption font-medium tabular-nums text-ink-3">
          {variant === 'compact'
            ? `${start}–${end} of ${totalItems}`
            : `Showing ${start}–${end} of ${totalItems}${itemLabel ? ` ${itemLabel}` : ''}`}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            'inline-flex items-center justify-center rounded-sm border border-line bg-surface text-ink-2 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            currentPage <= 1
              ? 'cursor-not-allowed opacity-45'
              : 'hover:border-primary/40 hover:text-primary-700',
            btnSize,
          )}
        >
          <ChevronLeftIcon size={15} />
        </button>

        {pageRange.map((pageNumber) => {
          const isActive = pageNumber === currentPage;
          return (
            <button
              key={pageNumber}
              type="button"
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                'inline-flex items-center justify-center rounded-sm border text-caption font-bold tabular-nums transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                isActive
                  ? 'border-primary bg-primary text-white shadow-card'
                  : 'border-line bg-surface text-ink-2 hover:border-primary/40 hover:text-primary-700',
                btnSize,
              )}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            'inline-flex items-center justify-center rounded-sm border border-line bg-surface text-ink-2 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            currentPage >= totalPages
              ? 'cursor-not-allowed opacity-45'
              : 'hover:border-primary/40 hover:text-primary-700',
            btnSize,
          )}
        >
          <ChevronRightIcon size={15} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
