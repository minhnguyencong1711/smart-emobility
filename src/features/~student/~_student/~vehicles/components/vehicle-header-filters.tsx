import { RefreshIcon } from '@/components/icons';
import { Button, FilterChip, SearchBar } from '@/components/ui';

import type { HubStatusFilter } from '../hooks/use-vehicle-catalogue';

export function VehicleHeaderFilters({
  headerSearch,
  hubStatusFilter,
  statusCounts,
  refreshing,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
}: {
  headerSearch: string;
  hubStatusFilter: HubStatusFilter;
  statusCounts: {
    ALL: number;
    CRITICAL: number;
    WARNING: number;
    NORMAL: number;
  };
  refreshing: boolean;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: HubStatusFilter) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBar
        value={headerSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search Hub, bay ID, vehicle..."
        className="w-44 xl:w-56"
      />
      <div className="flex items-center gap-1.5">
        <FilterChip
          tone="navy"
          active={hubStatusFilter === 'ALL'}
          onClick={() => onStatusFilterChange('ALL')}
        >
          All ({statusCounts.ALL})
        </FilterChip>
        <FilterChip
          tone="danger"
          active={hubStatusFilter === 'CRITICAL'}
          onClick={() => onStatusFilterChange('CRITICAL')}
        >
          Critical ({statusCounts.CRITICAL})
        </FilterChip>
        <FilterChip
          tone="warn"
          active={hubStatusFilter === 'WARNING'}
          onClick={() => onStatusFilterChange('WARNING')}
        >
          Warning ({statusCounts.WARNING})
        </FilterChip>
        <FilterChip
          tone="ok"
          active={hubStatusFilter === 'NORMAL'}
          onClick={() => onStatusFilterChange('NORMAL')}
        >
          Normal ({statusCounts.NORMAL})
        </FilterChip>
      </div>
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={<RefreshIcon size={14} />}
        isLoading={refreshing}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </div>
  );
}
