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
import { backendApi, getStoredAccessToken } from '@/services';

import { createChargingSlice } from './slices/charging.slice';
import { createFleetSlice } from './slices/fleet.slice';
import { createOperationsSlice } from './slices/operations.slice';
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

      const patch: Partial<MobilityState> = {
        backendMode: 'online',
        policyConfig,
        hubs,
        sharedVehicles,
        chargingPoints,
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
        const preserveReturnedReceipt =
          activeVehicleHold === null && currentHold?.status === 'RETURNED';
        patch.activeVehicleHold = preserveReturnedReceipt
          ? currentHold
          : activeVehicleHold;
        patch.tripHistory = tripHistory;
        patch.activeParking = activeParking;
      } else {
        patch.activeVehicleHold = null;
      }

      set(patch);
    } catch {
      // Preserve offline seed/in-memory behavior when BE is not running
    }
  },

  resetDemoState: () => {
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
