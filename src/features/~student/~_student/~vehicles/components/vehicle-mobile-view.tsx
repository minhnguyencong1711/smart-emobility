import { useState } from 'react';

import { BikeIcon, FilterIcon } from '@/components/icons';
import { CampusHubMap } from '@/components/shared';
import { Button, EmptyState, Pagination, SearchBar } from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';

import type { VehicleFilterState } from '../hooks/use-vehicle-catalogue';

import { VehicleActiveFilterChips } from './vehicle-active-filters';
import { VehicleFilterPopover } from './vehicle-filter-popover';
import { CompactVehicleCard } from './vehicle-kpi-row';

export function VehicleMobileView({
  hubs,
  filteredHubs,
  filteredVehicles,
  pageVehicles,
  page,
  totalPages,
  onPageChange,
  selectedHub,
  selectedMapHubId,
  vehicleCountsByHub,
  catalogueSearch,
  filters,
  activeFilterCount,
  onCatalogueSearchChange,
  onApplyFilters,
  onRemoveTypeFilter,
  onRemoveHubFilter,
  onRemoveBatteryFilter,
  onToggleMapHub,
  onSelectHubId,
  onSelectNearestHub,
  onClearFilters,
}: {
  hubs: MobilityHub[];
  filteredHubs: MobilityHub[];
  filteredVehicles: SharedVehicle[];
  pageVehicles: SharedVehicle[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedHub: MobilityHub | null;
  selectedMapHubId: string | null;
  vehicleCountsByHub: Record<string, number>;
  catalogueSearch: string;
  filters: VehicleFilterState;
  activeFilterCount: number;
  onCatalogueSearchChange: (val: string) => void;
  onApplyFilters: (next: VehicleFilterState) => void;
  onRemoveTypeFilter: () => void;
  onRemoveHubFilter: (hubId: string) => void;
  onRemoveBatteryFilter: () => void;
  onToggleMapHub: (id: string) => void;
  onSelectHubId: (id: string | null) => void;
  onSelectNearestHub: () => void;
  onClearFilters: () => void;
}) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div className="flex flex-col lg:hidden">
      <div className="space-y-2.5 border-b border-line bg-surface px-4 py-3">
        <h1 className="text-title font-extrabold text-ink">
          Find Shared Vehicles
        </h1>

        <div className="flex items-center gap-2">
          <SearchBar
            value={catalogueSearch}
            onChange={(e) => onCatalogueSearchChange(e.target.value)}
            placeholder="Search hubs, vehicles..."
            className="flex-1"
          />
          <Button
            size="sm"
            variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
            leadingIcon={<FilterIcon size={14} />}
            onClick={() => setMobileFilterOpen(true)}
          >
            <span>Filters</span>
            {activeFilterCount > 0 ? (
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold tabular-nums text-primary">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </div>

        <VehicleActiveFilterChips
          filters={filters}
          hubs={hubs}
          onRemoveType={onRemoveTypeFilter}
          onRemoveHub={onRemoveHubFilter}
          onRemoveBattery={onRemoveBatteryFilter}
          onClearAll={onClearFilters}
          className="flex flex-wrap items-center gap-1.5"
        />
      </div>

      <CampusHubMap
        hubs={filteredHubs}
        selectedHubId={selectedMapHubId}
        onSelectHub={onToggleMapHub}
        vehicleCountsByHub={vehicleCountsByHub}
        variant="catalogue"
        hideHeader
        className="h-[340px] rounded-none border-x-0 border-t-0"
      />

      <div className="relative z-20 -mt-3 rounded-t-xl border-t border-line bg-surface px-4 pb-5 pt-3 shadow-2">
        <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-surface-3" />
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-body font-extrabold text-ink">
              {selectedHub ? selectedHub.name : 'All Campus Hubs'}
            </h2>
            <p className="text-caption text-ink-3">
              {filteredVehicles.length}{' '}
              {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} available
            </p>
          </div>
          {selectedHub ? (
            <Button
              size="sm"
              variant="soft"
              onClick={() => onSelectHubId(null)}
            >
              All Hubs
            </Button>
          ) : null}
        </div>

        <div className="space-y-2.5">
          {filteredVehicles.length > 0 ? (
            pageVehicles.map((v, idx) => (
              <CompactVehicleCard
                key={v.id}
                vehicle={v}
                hub={hubs.find((h) => h.id === v.hubId)}
                isFirst={page === 1 && idx === 0}
              />
            ))
          ) : (
            <EmptyState
              icon={<BikeIcon size={22} />}
              title="No available vehicles"
              description="Try selecting another mobility hub or resetting your filters."
              action={
                <Button size="sm" variant="primary" onClick={onClearFilters}>
                  Reset Filters
                </Button>
              }
            />
          )}
        </div>

        <Pagination
          variant="compact"
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredVehicles.length}
          pageSize={4}
          onPageChange={onPageChange}
          className="mt-4 border-t border-line pt-3"
        />
      </div>

      <VehicleFilterPopover
        isOpen={mobileFilterOpen}
        mode="modal"
        onClose={() => setMobileFilterOpen(false)}
        appliedFilters={filters}
        hubs={hubs}
        vehicleCountsByHub={vehicleCountsByHub}
        onApply={onApplyFilters}
        onSelectNearestHub={onSelectNearestHub}
      />
    </div>
  );
}
