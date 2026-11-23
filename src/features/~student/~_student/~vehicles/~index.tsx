import { createFileRoute, Link } from '@tanstack/react-router';

import { CampusHubMap } from '@/components/shared';
import { Button, Callout, PageHeader } from '@/components/ui';

import { VehicleCataloguePanel } from './components/vehicle-catalogue-panel';
import { VehicleHeaderFilters } from './components/vehicle-header-filters';
import { VehicleKpiRow } from './components/vehicle-kpi-row';
import { VehicleMobileView } from './components/vehicle-mobile-view';
import { useVehicleCatalogue } from './hooks/use-vehicle-catalogue';

export const Route = createFileRoute('/student/_student/vehicles/')({
  component: StudentVehiclesPage,
});

function StudentVehiclesPage() {
  const catalogue = useVehicleCatalogue();

  return (
    <div className="flex flex-col">
      <div className="hidden lg:block">
        <PageHeader
          variant="bar"
          title="Find Shared Vehicles"
          breadcrumb={[
            { label: 'Home', to: '/student/vehicles' },
            { label: 'Shared Mobility' },
            { label: 'Vehicle Catalogue' },
          ]}
          actions={
            <VehicleHeaderFilters
              headerSearch={catalogue.headerSearch}
              hubStatusFilter={catalogue.hubStatusFilter}
              statusCounts={catalogue.statusCounts}
              refreshing={catalogue.refreshing}
              onSearchChange={catalogue.setHeaderSearch}
              onStatusFilterChange={catalogue.setHubStatusFilter}
              onRefresh={catalogue.handleRefresh}
            />
          }
        />
      </div>

      <div className="hidden space-y-5 px-6 py-5 lg:block lg:px-7">
        {catalogue.activeVehicleHold &&
        (catalogue.activeVehicleHold.status === 'CONFIRMED' ||
          catalogue.activeVehicleHold.status === 'ACTIVE_TRIP') ? (
          <Callout
            tone={
              catalogue.activeVehicleHold.status === 'ACTIVE_TRIP'
                ? 'ok'
                : 'primary'
            }
            title={
              catalogue.activeVehicleHold.status === 'ACTIVE_TRIP'
                ? `Active Trip ${catalogue.activeVehicleHold.tripId ?? 'T-2408'} in Progress`
                : `Active Vehicle Hold (${catalogue.activeVehicleHold.reservationId})`
            }
            description={
              catalogue.activeVehicleHold.status === 'ACTIVE_TRIP'
                ? 'You are currently riding a shared EV. Proceed to Return Vehicle when you reach your destination Hub.'
                : 'You have an active 15-minute pickup hold. Proceed to your reserved vehicle to scan QR or manage hold.'
            }
            action={
              <Link
                to={
                  catalogue.activeVehicleHold.status === 'ACTIVE_TRIP'
                    ? '/student/vehicles/trip'
                    : '/student/vehicles/$id'
                }
                params={
                  catalogue.activeVehicleHold.status === 'ACTIVE_TRIP'
                    ? undefined
                    : { id: catalogue.activeVehicleHold.vehicleId }
                }
              >
                <Button size="sm" variant="primary">
                  {catalogue.activeVehicleHold.status === 'ACTIVE_TRIP'
                    ? 'Go to Return Flow →'
                    : 'View Hold & Unlock →'}
                </Button>
              </Link>
            }
          />
        ) : null}

        <VehicleKpiRow
          readyUnits={catalogue.readyUnits}
          totalShared={catalogue.totalShared}
          avgSoC={catalogue.avgSoC}
          eligibleCount={catalogue.eligibleCount}
          hubCount={catalogue.hubs.length}
          activeHubsCount={catalogue.activeHubsWithVehicles}
        />

        <div className="grid items-start gap-5 lg:grid-cols-12">
          <VehicleCataloguePanel
            hubs={catalogue.hubs}
            vehicleCountsByHub={catalogue.vehicleCountsByHub}
            filteredVehicles={catalogue.filteredVehicles}
            pageVehicles={catalogue.desktopPagination.pageItems}
            page={catalogue.desktopPagination.page}
            totalPages={catalogue.desktopPagination.totalPages}
            onPageChange={catalogue.desktopPagination.setPage}
            selectedHub={catalogue.selectedHub}
            catalogueSearch={catalogue.catalogueSearch}
            onCatalogueSearchChange={catalogue.setCatalogueSearch}
            filters={catalogue.filters}
            activeFilterCount={catalogue.activeFilterCount}
            filterOpen={catalogue.filterOpen}
            onToggleFilterOpen={() => catalogue.setFilterOpen((v) => !v)}
            onCloseFilter={() => catalogue.setFilterOpen(false)}
            onApplyFilters={catalogue.applyFilters}
            onRemoveTypeFilter={catalogue.removeTypeFilter}
            onRemoveHubFilter={catalogue.removeHubFilter}
            onRemoveBatteryFilter={catalogue.removeBatteryFilter}
            onSelectHubId={catalogue.selectSingleHub}
            sortMode={catalogue.sortMode}
            onSortModeChange={catalogue.setSortMode}
            onSelectNearestHub={catalogue.handleSelectNearestHub}
            onClearFilters={catalogue.clearFilters}
          />

          <div className="lg:col-span-7 xl:col-span-8">
            <CampusHubMap
              hubs={catalogue.filteredHubs}
              selectedHubId={catalogue.selectedMapHubId}
              onSelectHub={catalogue.toggleMapHub}
              vehicleCountsByHub={catalogue.vehicleCountsByHub}
              variant="catalogue"
              className="h-[640px]"
            />
          </div>
        </div>
      </div>

      <VehicleMobileView
        hubs={catalogue.hubs}
        filteredHubs={catalogue.filteredHubs}
        filteredVehicles={catalogue.filteredVehicles}
        pageVehicles={catalogue.mobilePagination.pageItems}
        page={catalogue.mobilePagination.page}
        totalPages={catalogue.mobilePagination.totalPages}
        onPageChange={catalogue.mobilePagination.setPage}
        selectedHub={catalogue.selectedHub}
        selectedMapHubId={catalogue.selectedMapHubId}
        vehicleCountsByHub={catalogue.vehicleCountsByHub}
        catalogueSearch={catalogue.catalogueSearch}
        filters={catalogue.filters}
        activeFilterCount={catalogue.activeFilterCount}
        onCatalogueSearchChange={catalogue.setCatalogueSearch}
        onApplyFilters={catalogue.applyFilters}
        onRemoveTypeFilter={catalogue.removeTypeFilter}
        onRemoveHubFilter={catalogue.removeHubFilter}
        onRemoveBatteryFilter={catalogue.removeBatteryFilter}
        onToggleMapHub={catalogue.toggleMapHub}
        onSelectHubId={catalogue.selectSingleHub}
        onSelectNearestHub={catalogue.handleSelectNearestHub}
        onClearFilters={catalogue.clearFilters}
      />
    </div>
  );
}
