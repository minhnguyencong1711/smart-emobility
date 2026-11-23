import { useId, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type ColumnAlign = 'left' | 'center' | 'right';

export type Column<Row> = {
  key: string;
  header: string;
  cell: (row: Row, index: number) => ReactNode;
  numeric?: boolean;
  align?: ColumnAlign;
  width?: string;
  noWrap?: boolean;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  caption: string;
  emptyState?: ReactNode;
  onRowClick?: (row: Row) => void;
  density?: 'comfortable' | 'compact';
  stickyHeader?: boolean;
  responsiveStack?: boolean;
  className?: string;
};

const ALIGN: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function EmptyCell() {
  return <span className="text-ink-muted">—</span>;
}

function resolveAlign<Row>(col: Column<Row>): ColumnAlign {
  return col.align ?? (col.numeric ? 'right' : 'left');
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  emptyState,
  onRowClick,
  density = 'comfortable',
  stickyHeader = false,
  responsiveStack = true,
  className,
}: DataTableProps<Row>) {
  const captionId = useId();

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const cellPadding = density === 'compact' ? 'px-3.5 py-2.5' : 'px-4 py-3.5';

  return (
    <div
      data-table-wrapper=""
      tabIndex={0}
      role="region"
      aria-labelledby={captionId}
      className={cn(
        'relative w-full overflow-x-auto rounded-lg border border-line bg-surface shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
        className,
      )}
    >
      <table
        data-responsive-table={responsiveStack ? '' : undefined}
        className="w-full border-collapse text-body-sm"
      >
        <caption id={captionId} className="sr-only">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-line bg-surface-2">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  'whitespace-nowrap px-4 py-3 align-middle text-label font-bold uppercase text-ink-3',
                  ALIGN[resolveAlign(column)],
                  stickyHeader && 'sticky top-0 z-10 bg-surface-2',
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowKey(row, rowIndex)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-line text-ink transition-colors last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-surface-2',
              )}
            >
              {columns.map((column) => {
                const value = column.cell(row, rowIndex);
                const align = resolveAlign(column);

                return (
                  <td
                    key={column.key}
                    data-label={responsiveStack ? column.header : undefined}
                    className={cn(
                      cellPadding,
                      'align-middle',
                      ALIGN[align],
                      column.numeric && 'tabular-nums',
                      column.noWrap && 'whitespace-nowrap',
                      column.className,
                    )}
                  >
                    {value === null || value === undefined || value === '' ? (
                      <EmptyCell />
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
