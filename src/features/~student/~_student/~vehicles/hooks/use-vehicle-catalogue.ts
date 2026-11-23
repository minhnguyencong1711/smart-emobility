import { useMemo, useState } from 'react';

import { useNetworkSummary, usePagination } from '@/hooks';
import { useMobilityStore, useToastStore } from '@/stores';
import type { HubStatus } from '@/types';

export type HubStatusFilter = 'ALL' | HubStatus;
export type VehicleTypeFilter = 'ALL' | 'E_BIKE' | 'E_MOTORCYCLE';
export type MinBatteryFilter = 0 | 50 | 75 | 90;
export type SortMode = 'BATTERY_DESC' | 'WALK_ASC' | 'RATE_ASC';

export type VehicleFilterState = {
  type: VehicleTypeFilter;
  hubIds: string[];
  minBattery: MinBatteryFilter;
};

const EMPTY_FILTERS: VehicleFilterState = {
  type: 'ALL',
  hubIds: [],
  minBattery: 0,
};

export function useVehicleCatalogue() {
  const hubs = useMobilityStore((s) => s.hubs);
  const sharedVehicles = useMobilityStore((s) => s.sharedVehicles);
  const activeVehicleHold = useMobilityStore((s) => s.activeVehicleHold);
  const pushToast = useToastStore((s) => s.pushToast);

  const {
    totalSharedEvs,
    avgBatterySoC,
    criticalCount,
    warningCount,
    normalCount,
    availableVehiclesByHub,
    availableVehicleList,
  } = useNetworkSummary();

  const [headerSearch, setHeaderSearchState] = useState('');
  const [catalogueSearch, setCatalogueSearchState] = useState('');
  const [hubStatusFilter, setHubStatusFilterState] =
    useState<HubStatusFilter>('ALL');
  const [filters, setFilters] = useState<VehicleFilterState>(EMPTY_FILTERS);
  const [sortMode, setSortModeState] = useState<SortMode>('BATTERY_DESC');
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const combinedQuery = (catalogueSearch || headerSearch).trim().toLowerCase();

  const filteredHubs = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    return hubs.filter((h) => {
      if (hubStatusFilter !== 'ALL' && h.status !== hubStatusFilter) {
        return false;
      }
      if (q) {
        const hay = `${h.name} ${h.shortName} ${h.code}`.toLowerCase();
        const hasMatchingVehicle = sharedVehicles.some(
          (v) =>
            v.hubId === h.id &&
            v.status === 'AVAILABLE' &&
            `${v.code} ${v.model}`.toLowerCase().includes(q),
        );
        return hay.includes(q) || hasMatchingVehicle;
      }
      return true;
    });
  }, [hubs, hubStatusFilter, headerSearch, sharedVehicles]);

  const filteredVehicles = useMemo(() => {
    const list = sharedVehicles.filter((v) => {
      if (v.status !== 'AVAILABLE') return false;
      if (filters.hubIds.length > 0 && !filters.hubIds.includes(v.hubId)) {
        return false;
      }
      if (filters.type !== 'ALL' && v.type !== filters.type) return false;
      if (filters.minBattery > 0 && v.batterySoC < filters.minBattery) {
        return false;
      }
      if (combinedQuery) {
        const hub = hubs.find((h) => h.id === v.hubId);
        const hay =
          `${v.code} ${v.model} ${v.type} ${hub?.name ?? ''} ${hub?.shortName ?? ''}`.toLowerCase();
        if (!hay.includes(combinedQuery)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'WALK_ASC') {
        const wa =
          a.walkMins ?? hubs.find((h) => h.id === a.hubId)?.walkMins ?? 5;
        const wb =
          b.walkMins ?? hubs.find((h) => h.id === b.hubId)?.walkMins ?? 5;
        return wa - wb;
      }
      if (sortMode === 'RATE_ASC') return a.ratePerMinVnd - b.ratePerMinVnd;
      return b.batterySoC - a.batterySoC;
    });
  }, [sharedVehicles, filters, combinedQuery, hubs, sortMode]);

  const desktopPagination = usePagination(filteredVehicles, 3);
  const mobilePagination = usePagination(filteredVehicles, 4);

  const resetPages = () => {
    desktopPagination.setPage(1);
    mobilePagination.setPage(1);
  };

  const setHeaderSearch = (val: string) => {
    setHeaderSearchState(val);
    resetPages();
  };

  const setCatalogueSearch = (val: string) => {
    setCatalogueSearchState(val);
    resetPages();
  };

  const setHubStatusFilter = (val: HubStatusFilter) => {
    setHubStatusFilterState(val);
    resetPages();
  };

  const setSortMode = (val: SortMode) => {
    setSortModeState(val);
    resetPages();
  };

  const applyFilters = (next: VehicleFilterState) => {
    setFilters(next);
    resetPages();
  };

  const toggleMapHub = (hubId: string) => {
    setFilters((prev) => ({
      ...prev,
      hubIds:
        prev.hubIds.length === 1 && prev.hubIds[0] === hubId ? [] : [hubId],
    }));
    resetPages();
  };

  const selectSingleHub = (hubId: string | null) => {
    setFilters((prev) => ({
      ...prev,
      hubIds: hubId ? [hubId] : [],
    }));
    resetPages();
  };

  const removeTypeFilter = () => {
    setFilters((prev) => ({ ...prev, type: 'ALL' }));
    resetPages();
  };

  const removeHubFilter = (hubId: string) => {
    setFilters((prev) => ({
      ...prev,
      hubIds: prev.hubIds.filter((id) => id !== hubId),
    }));
    resetPages();
  };

  const removeBatteryFilter = () => {
    setFilters((prev) => ({ ...prev, minBattery: 0 }));
    resetPages();
  };

  function clearFilters() {
    setHeaderSearchState('');
    setCatalogueSearchState('');
    setHubStatusFilterState('ALL');
    setFilters(EMPTY_FILTERS);
    setSortModeState('BATTERY_DESC');
    resetPages();
  }

  function handleSelectNearestHub() {
    const nearest = [...hubs]
      .filter((h) => (availableVehiclesByHub[h.id] ?? 0) > 0)
      .sort((a, b) => a.walkMins - b.walkMins)[0];
    if (nearest) {
      setFilters((prev) => ({ ...prev, hubIds: [nearest.id] }));
      resetPages();
      pushToast({
        tone: 'info',
        title: `Nearest Hub: ${nearest.name}`,
        description: `${nearest.walkMins} min walk · ${availableVehiclesByHub[nearest.id]} vehicles available.`,
      });
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      pushToast({
        tone: 'info',
        title: 'Fleet telemetry refreshed',
        description: 'Latest hub occupancy and vehicle SoC values synced.',
      });
    }, 350);
  }

  const activeFilterCount =
    (filters.type !== 'ALL' ? 1 : 0) +
    filters.hubIds.length +
    (filters.minBattery > 0 ? 1 : 0);

  const selectedMapHubId =
    filters.hubIds.length === 1 ? filters.hubIds[0] : null;
  const selectedHub = selectedMapHubId
    ? (hubs.find((h) => h.id === selectedMapHubId) ?? null)
    : null;

  const activeHubsWithVehicles = hubs.filter(
    (h) => (availableVehiclesByHub[h.id] ?? 0) > 0,
  ).length;

  return {
    hubs,
    activeVehicleHold,
    totalShared: totalSharedEvs,
    readyUnits: 124,
    avgSoC: avgBatterySoC,
    eligibleCount: availableVehicleList.length,
    activeHubsWithVehicles,
    statusCounts: {
      ALL: hubs.length,
      CRITICAL: criticalCount,
      WARNING: warningCount,
      NORMAL: normalCount,
    },
    vehicleCountsByHub: availableVehiclesByHub,
    filteredHubs,
    filteredVehicles,
    desktopPagination,
    mobilePagination,
    filters,
    activeFilterCount,
    selectedMapHubId,
    selectedHub,
    filterOpen,
    setFilterOpen,
    headerSearch,
    setHeaderSearch,
    catalogueSearch,
    setCatalogueSearch,
    hubStatusFilter,
    setHubStatusFilter,
    sortMode,
    setSortMode,
    refreshing,
    applyFilters,
    toggleMapHub,
    selectSingleHub,
    removeTypeFilter,
    removeHubFilter,
    removeBatteryFilter,
    clearFilters,
    handleSelectNearestHub,
    handleRefresh,
  };
}
