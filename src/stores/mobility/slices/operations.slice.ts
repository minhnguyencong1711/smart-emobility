import { INITIAL_INCIDENTS, INITIAL_REDISTRIBUTION_ORDERS } from '@/data';
import {
  applyIncidentIsolation,
  applyRedistributionHubTransfers,
  buildRedistributionOrder,
} from '@/services';

import type { MobilitySliceCreator, OperationsSlice } from '../types';

export const createOperationsSlice: MobilitySliceCreator<OperationsSlice> = (
  set,
  get,
) => ({
  incidents: INITIAL_INCIDENTS,
  redistributionOrders: INITIAL_REDISTRIBUTION_ORDERS,

  isolateIncidentEquipment: (incidentId, assignedCrew) =>
    set((state) =>
      applyIncidentIsolation({
        incidentId,
        assignedCrew,
        incidents: state.incidents,
        chargingPoints: state.chargingPoints,
        activeParking: state.activeParking,
      }),
    ),

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

    set({
      hubs: state.hubs.map((h) =>
        h.id === destinationHubId
          ? {
              ...h,
              reservedInboundBays: h.reservedInboundBays + vehicleCount,
            }
          : h,
      ),
      redistributionOrders: [newOrder, ...state.redistributionOrders],
    });
    return { ok: true };
  },

  updateRedistributionOrderStatus: (orderId, status) =>
    set((state) => {
      const target = state.redistributionOrders.find((o) => o.id === orderId);
      return {
        redistributionOrders: state.redistributionOrders.map((o) =>
          o.id === orderId ? { ...o, status } : o,
        ),
        hubs: applyRedistributionHubTransfers({
          order: target,
          status,
          hubs: state.hubs,
        }),
      };
    }),
});
