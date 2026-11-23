import { BikeIcon, FilterIcon, MapPinIcon } from '@/components/icons';
import {
  Button,
  Card,
  EmptyState,
  Pagination,
  SearchBar,
  Select,
} from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';
import { getHubOccupancyPct } from '@/utils/hub-metrics';

import type {
  SortMode,
  VehicleFilterState,
} from '../hooks/use-vehicle-catalogue';

import { VehicleActiveFilterChips } from './vehicle-active-filters';
import { VehicleFilterPopover } from './vehicle-filter-popover';
import { CompactVehicleCard } from './vehicle-kpi-row';

type VehicleCataloguePanelProps = {
  hubs: MobilityHub[];
  vehicleCountsByHub: Record<string, number>;
  filteredVehicles: SharedVehicle[];
  pageVehicles: SharedVehicle[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedHub: MobilityHub | null;
  catalogueSearch: string;
  onCatalogueSearchChange: (val: string) => void;
  filters: VehicleFilterState;
  activeFilterCount: number;
  filterOpen: boolean;
  onToggleFilterOpen: () => void;
  onCloseFilter: () => void;
  onApplyFilters: (next: VehicleFilterState) => void;
  onRemoveTypeFilter: () => void;
  onRemoveHubFilter: (hubId: string) => void;
  onRemoveBatteryFilter: () => void;
  onSelectHubId: (id: string | null) => void;
  sortMode: SortMode;
  onSortModeChange: (val: SortMode) => void;
  onSelectNearestHub: () => void;
  onClearFilters: () => void;
};

export function VehicleCataloguePanel({
  hubs,
  vehicleCountsByHub,
  filteredVehicles,
  pageVehicles,
  page,
  totalPages,
  onPageChange,
  selectedHub,
  catalogueSearch,
  onCatalogueSearchChange,
  filters,
  activeFilterCount,
  filterOpen,
  onToggleFilterOpen,
  onCloseFilter,
  onApplyFilters,
  onRemoveTypeFilter,
  onRemoveHubFilter,
  onRemoveBatteryFilter,
  onSelectHubId,
  sortMode,
  onSortModeChange,
  onSelectNearestHub,
  onClearFilters,
}: VehicleCataloguePanelProps) {
  return (
    <Card
      padding="md"
      className="flex min-h-[640px] flex-col justify-between gap-3 lg:col-span-5 xl:col-span-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="whitespace-nowrap text-body-lg font-extrabold text-ink">
            Vehicle Catalogue
          </h2>
          <Button
            size="sm"
            variant="soft"
            leadingIcon={<MapPinIcon size={13} />}
            onClick={onSelectNearestHub}
          >
            Nearest Hub
          </Button>
        </div>

        <div className="relative flex items-center gap-2">
          <SearchBar
            value={catalogueSearch}
            onChange={(e) => onCatalogueSearchChange(e.target.value)}
            placeholder="Search hub, vehicle ID..."
            className="flex-1"
          />
          <Button
            size="sm"
            variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
            leadingIcon={<FilterIcon size={14} />}
            aria-expanded={filterOpen}
            onClick={onToggleFilterOpen}
          >
            <span>Filters</span>
            {activeFilterCount > 0 ? (
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold tabular-nums text-primary">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>

          <VehicleFilterPopover
            isOpen={filterOpen}
            mode="popover"
            onClose={onCloseFilter}
            appliedFilters={filters}
            hubs={hubs}
            vehicleCountsByHub={vehicleCountsByHub}
            onApply={onApplyFilters}
            onSelectNearestHub={onSelectNearestHub}
          />
        </div>

        <VehicleActiveFilterChips
          filters={filters}
          hubs={hubs}
          onRemoveType={onRemoveTypeFilter}
          onRemoveHub={onRemoveHubFilter}
          onRemoveBattery={onRemoveBatteryFilter}
          onClearAll={onClearFilters}
          className="flex flex-wrap items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-2"
        />

        <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
          <p className="whitespace-nowrap text-body-sm font-bold tabular-nums text-ink">
            {filteredVehicles.length}{' '}
            {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} available
          </p>
          <Select
            size="sm"
            aria-label="Sort vehicles"
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as SortMode)}
            wrapperClassName="w-40 shrink-0"
            options={[
              { value: 'BATTERY_DESC', label: 'Highest Battery' },
              { value: 'WALK_ASC', label: 'Shortest Walk' },
              { value: 'RATE_ASC', label: 'Lowest Rate' },
            ]}
          />
        </div>

        {filteredVehicles.length > 0 ? (
          <div className="space-y-2.5">
            {pageVehicles.map((v, idx) => (
              <CompactVehicleCard
                key={v.id}
                vehicle={v}
                hub={hubs.find((h) => h.id === v.hubId)}
                isFirst={page === 1 && idx === 0}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <EmptyState
              icon={<BikeIcon size={24} />}
              title="No matching vehicles available"
              description={`No shared vehicles match your current selection${selectedHub ? ` at ${selectedHub.name}` : ''}.`}
              action={
                <Button variant="primary" size="sm" onClick={onClearFilters}>
                  Reset Filters
                </Button>
              }
            />
            <div className="space-y-1.5">
              <p className="text-caption font-bold text-ink-3">
                Nearby Hub Suggestions
              </p>
              {hubs
                .filter((h) => (vehicleCountsByHub[h.id] ?? 0) > 0)
                .slice(0, 3)
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2"
                  >
                    <div>
                      <p className="text-caption font-bold text-ink">
                        {h.name}
                      </p>
                      <p className="text-[11px] text-ink-3">
                        {h.walkMins} min walk · {getHubOccupancyPct(h)}%
                        occupancy · {vehicleCountsByHub[h.id]} available
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSelectHubId(h.id)}
                    >
                      View →
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <Pagination
        variant="compact"
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredVehicles.length}
        pageSize={3}
        onPageChange={onPageChange}
        className="border-t border-line pt-3"
      />
    </Card>
  );
}
