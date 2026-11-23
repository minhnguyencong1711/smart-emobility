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

export const useMobilityStore = create<MobilityState>((...args) => ({
  ...createFleetSlice(...args),
  ...createRentalSlice(...args),
  ...createChargingSlice(...args),
  ...createOperationsSlice(...args),
  ...createSimulationSlice(...args),

  resetDemoState: () =>
    args[0]({
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
    }),
}));
