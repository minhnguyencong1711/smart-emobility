import { INITIAL_INCIDENTS, INITIAL_REDISTRIBUTION_ORDERS } from '@/data';
import {
  applyIncidentIsolation,
  applyRedistributionHubTransfers,
  backendApi,
  buildRedistributionOrder,
  getStoredAccessToken,
  isTerminalRedistributionStatus,
} from '@/services';
import type { RedistributionOrder } from '@/types';

import type {
  MobilitySliceCreator,
  OperationsSlice,
  OverdueVehicleRecord,
} from '../types';

export const INITIAL_OVERDUE_VEHICLES: OverdueVehicleRecord[] = [
  {
    plate: '59A-412.88',
    bay: 'BAY-B02',
    owner: 'Tran Minh Khoa',
    hubId: 'hub-dorm-b',
    overdueMins: 42,
  },
  {
    plate: '51H-904.11',
    bay: 'BAY-B07',
    owner: 'Le Hoang Nam',
    hubId: 'hub-dorm-b',
    overdueMins: 28,
  },
  {
    plate: '59A-810.22',
    bay: 'BAY-A03',
    owner: 'Pham Gia Huy',
    hubId: 'hub-dorm-a',
    overdueMins: 19,
  },
  {
    plate: '51H-331.09',
    bay: 'BAY-ST04',
    owner: 'Vo Ngoc Han',
    hubId: 'hub-suoi-tien',
    overdueMins: 35,
  },
];

export const REDISTRIBUTION_STORAGE_KEY = 'emobility_redistribution_orders';

export function readStoredRedistributionOrders(): RedistributionOrder[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(REDISTRIBUTION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RedistributionOrder[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial seed orders
    }
  }
  return INITIAL_REDISTRIBUTION_ORDERS;
}

export function persistRedistributionOrders(
  orders: RedistributionOrder[] | null,
) {
  if (typeof window === 'undefined') return;
  try {
    if (orders) {
      window.localStorage.setItem(
        REDISTRIBUTION_STORAGE_KEY,
        JSON.stringify(orders),
      );
    } else {
      window.localStorage.removeItem(REDISTRIBUTION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export const createOperationsSlice: MobilitySliceCreator<OperationsSlice> = (
  set,
  get,
) => ({
  incidents: INITIAL_INCIDENTS,
  redistributionOrders: readStoredRedistributionOrders(),
  overdueVehicles: INITIAL_OVERDUE_VEHICLES,
  warnedOverduePlates: [],

  isolateIncidentEquipment: (incidentId, assignedCrew, dispatchNotes) => {
    set((state) =>
      applyIncidentIsolation({
        incidentId,
        assignedCrew,
        dispatchNotes,
        incidents: state.incidents,
        chargingPoints: state.chargingPoints,
        activeParking: state.activeParking,
      }),
    );
    if (get().backendMode === 'online' && getStoredAccessToken()) {
      void backendApi
        .isolateIncident(incidentId, assignedCrew, dispatchNotes)
        .then(() => get().hydrateFromBackend())
        .catch(() => undefined);
    }
  },

  warnOverdueVehicle: (plate) =>
    set((state) => ({
      warnedOverduePlates: state.warnedOverduePlates.includes(plate)
        ? state.warnedOverduePlates
        : [...state.warnedOverduePlates, plate],
    })),

  ejectOverdueParkingBay: (hubId, plate) =>
    set((state) => ({
      overdueVehicles: state.overdueVehicles.filter((v) => v.plate !== plate),
      hubs: state.hubs.map((h) =>
        h.id === hubId
          ? { ...h, coreBaysOccupied: Math.max(0, h.coreBaysOccupied - 1) }
          : h,
      ),
    })),

  createRedistributionOrder: ({
    sourceHubId,
    destinationHubId,
    vehicleCount,
    assignedCrew,
  }) => {
    const state = get();
    if (sourceHubId === destinationHubId) {
      return {
        ok: false,
        error: 'Source and Destination Hubs must be different.',
      };
    }
    const destHub = state.hubs.find((h) => h.id === destinationHubId);
    if (!destHub) {
      return { ok: false, error: 'Destination hub not found.' };
    }
    const freeBays = destHub.coreBaysTotal - destHub.coreBaysOccupied;
    if (vehicleCount > freeBays) {
      return {
        ok: false,
        error: `${destHub.shortName} only has ${freeBays} free bays available for inbound reservation.`,
      };
    }

    const newOrder = buildRedistributionOrder({
      sourceHubId,
      destinationHubId,
      vehicleCount,
      assignedCrew,
    });
    const nextOrders = [newOrder, ...state.redistributionOrders];
    persistRedistributionOrders(nextOrders);

    set({
      hubs: state.hubs.map((h) =>
        h.id === destinationHubId
          ? {
              ...h,
              reservedInboundBays: h.reservedInboundBays + vehicleCount,
            }
          : h,
      ),
      redistributionOrders: nextOrders,
    });
    return { ok: true };
  },

  updateRedistributionOrderStatus: (orderId, status) =>
    set((state) => {
      const target = state.redistributionOrders.find((o) => o.id === orderId);
      if (!target) return state;
      if (
        target.status === status ||
        isTerminalRedistributionStatus(target.status)
      ) {
        return state;
      }

      const nextOrders = state.redistributionOrders.map((o) =>
        o.id === orderId ? { ...o, status } : o,
      );
      persistRedistributionOrders(nextOrders);

      return {
        redistributionOrders: nextOrders,
        hubs: applyRedistributionHubTransfers({
          order: target,
          status,
          hubs: state.hubs,
        }),
      };
    }),
});
