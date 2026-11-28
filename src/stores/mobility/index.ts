import { create } from 'zustand';

import {
  DEFAULT_POLICY_CONFIG,
  INITIAL_ACTIVE_PARKING,
  INITIAL_CHARGING_POINTS,
  INITIAL_CHARGING_QUEUE,
  INITIAL_DLB_LOGS,
  INITIAL_HUBS,
  INITIAL_INCIDENTS,
  INITIAL_REDISTRIBUTION_ORDERS,
  INITIAL_SHARED_VEHICLES,
  INITIAL_SIMULATIONS,
} from '@/data';
import {
  applyRedistributionOrdersToHubs,
  backendApi,
  getStoredAccessToken,
} from '@/services';

import { createChargingSlice } from './slices/charging.slice';
import { createFleetSlice } from './slices/fleet.slice';
import {
  createOperationsSlice,
  INITIAL_OVERDUE_VEHICLES,
  persistRedistributionOrders,
} from './slices/operations.slice';
import { createRentalSlice } from './slices/rental.slice';
import { createSimulationSlice } from './slices/simulation.slice';
import type { MobilityState } from './types';

export type {
  ActionResult,
  ActiveParkingAndCharging,
  ActiveVehicleHold,
  DlbLogEntry,
  DlbMode,
  ReserveParkingPayload,
  TripHistoryItem,
} from './types';

export const useMobilityStore = create<MobilityState>((set, get, api) => ({
  ...createFleetSlice(set, get, api),
  ...createRentalSlice(set, get, api),
  ...createChargingSlice(set, get, api),
  ...createOperationsSlice(set, get, api),
  ...createSimulationSlice(set, get, api),

  backendMode: 'offline',

  hydrateFromBackend: async () => {
    try {
      const [policyConfig, hubs, sharedVehicles, chargingPoints, incidents] =
        await Promise.all([
          backendApi.getPolicy(),
          backendApi.listHubs(),
          backendApi.listVehicles(),
          backendApi.listChargingPoints(),
          backendApi.listIncidents(),
        ]);

      const isCriticalDlb = get().dlbMode === 'CRITICAL';
      const syncedChargingPoints = isCriticalDlb
        ? chargingPoints.map((cp) =>
            cp.status === 'CHARGING'
              ? { ...cp, status: 'THROTTLED' as const, currentPowerKw: 3.7 }
              : cp,
          )
        : chargingPoints;

      const patch: Partial<MobilityState> = {
        backendMode: 'online',
        policyConfig,
        hubs: applyRedistributionOrdersToHubs(hubs, get().redistributionOrders),
        sharedVehicles,
        chargingPoints: syncedChargingPoints,
        incidents,
      };

      if (getStoredAccessToken()) {
        const [activeVehicleHold, tripHistory, activeParking] =
          await Promise.all([
            backendApi.getActiveHold().catch(() => null),
            backendApi.getRentalHistory().catch(() => get().tripHistory),
            backendApi.getActiveParking().catch(() => get().activeParking),
          ]);
        const currentHold = get().activeVehicleHold;
        const hasServerActiveRental =
          activeVehicleHold?.status === 'CONFIRMED' ||
          activeVehicleHold?.status === 'ACTIVE_TRIP';
        const preserveReturnedReceipt =
          !hasServerActiveRental && currentHold?.status === 'RETURNED';
        patch.activeVehicleHold = preserveReturnedReceipt
          ? currentHold
          : activeVehicleHold;
        patch.tripHistory = tripHistory;

        const prevParking = get().activeParking;
        if (
          activeParking &&
          isCriticalDlb &&
          activeParking.chargingStatus === 'CHARGING'
        ) {
          patch.activeParking = {
            ...activeParking,
            chargingStatus: 'THROTTLED',
            currentKw: 3.7,
            interruptionReason:
              'Grid demand reached 91% — Tier-3 DLB throttling active (3.7 kW).',
          };
        } else if (
          activeParking &&
          prevParking &&
          prevParking.reservationId === activeParking.reservationId &&
          activeParking.chargingStatus === 'CHARGING' &&
          (prevParking.chargingStatus === 'THROTTLED' ||
            prevParking.chargingStatus === 'INTERRUPTED')
        ) {
          patch.activeParking = {
            ...activeParking,
            chargingStatus: prevParking.chargingStatus,
            currentKw: prevParking.currentKw,
            interruptionReason: prevParking.interruptionReason,
          };
        } else {
          patch.activeParking = activeParking;
        }
      } else {
        patch.activeVehicleHold = null;
      }

      set(patch);
    } catch {
      // Preserve offline seed/in-memory behavior when BE is not running
    }
  },

  resetDemoState: () => {
    persistRedistributionOrders(null);
    set({
      policyConfig: DEFAULT_POLICY_CONFIG,
      hubs: INITIAL_HUBS,
      sharedVehicles: INITIAL_SHARED_VEHICLES,
      chargingPoints: INITIAL_CHARGING_POINTS,
      chargingQueue: INITIAL_CHARGING_QUEUE,
      incidents: INITIAL_INCIDENTS,
      redistributionOrders: INITIAL_REDISTRIBUTION_ORDERS,
      simulations: INITIAL_SIMULATIONS,
      activeVehicleHold: null,
      activeParking: INITIAL_ACTIVE_PARKING,
      dlbMode: 'NORMAL',
      chargingScheduleApplied: false,
      chargingScheduleGeneratedAt: '08:00–10:30',
      chargingScheduleOptimized: false,
      overdueVehicles: INITIAL_OVERDUE_VEHICLES,
      warnedOverduePlates: [],
      dlbActivityLogs: INITIAL_DLB_LOGS,
    });
    if (getStoredAccessToken()) {
      void backendApi
        .resetBaseline()
        .then(() => get().hydrateFromBackend())
        .catch(() => undefined);
    }
  },
}));
