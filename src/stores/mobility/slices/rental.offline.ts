import { buildVehicleHold, computeVehicleReturnOutcome } from '@/services';
import type { ActionResult } from '@/types';

import type { MobilityState } from '../types';

export function buildOfflineHoldPatch(
  state: MobilityState,
  vehicleId: string,
  pickupDate: string,
  pickupTime: string,
): { result: ActionResult; patch?: Partial<MobilityState> } {
  if (
    state.activeVehicleHold &&
    (state.activeVehicleHold.status === 'CONFIRMED' ||
      state.activeVehicleHold.status === 'ACTIVE_TRIP')
  ) {
    return {
      result: {
        ok: false,
        error:
          'A student may hold only one active shared-vehicle reservation or trip at a time.',
      },
    };
  }

  const vehicle = state.sharedVehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    return { result: { ok: false, error: 'Selected vehicle was not found.' } };
  }
  if (vehicle.status !== 'AVAILABLE') {
    return {
      result: {
        ok: false,
        error: `Vehicle ${vehicle.code} is currently ${vehicle.status} and cannot be reserved.`,
      },
    };
  }

  return {
    result: { ok: true },
    patch: {
      sharedVehicles: state.sharedVehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: 'RESERVED' } : v,
      ),
      hubs: state.hubs.map((h) =>
        h.id === vehicle.hubId
          ? { ...h, sharedEvsReady: Math.max(0, h.sharedEvsReady - 1) }
          : h,
      ),
      activeVehicleHold: buildVehicleHold(
        vehicle,
        pickupDate,
        pickupTime,
        state.policyConfig.gracePeriodMins,
      ),
    },
  };
}

export function buildOfflineReturnPatch(
  state: MobilityState,
  destinationHubId: string,
  hasFault: boolean,
  remarks: string,
): { result: ActionResult; patch?: Partial<MobilityState> } {
  const hold = state.activeVehicleHold;
  if (!hold) {
    return { result: { ok: false, error: 'No active trip found to return.' } };
  }
  const destHub = state.hubs.find((h) => h.id === destinationHubId);
  const originHub = state.hubs.find((h) => h.id === hold.hubId);
  const vehicle = state.sharedVehicles.find((v) => v.id === hold.vehicleId);
  if (!destHub || !vehicle) {
    return {
      result: { ok: false, error: 'Destination hub or vehicle not found.' },
    };
  }

  const freeCore = destHub.coreBaysTotal - destHub.coreBaysOccupied;
  const freeBuffer = destHub.bufferBaysTotal - destHub.bufferBaysOccupied;
  if (freeCore + freeBuffer <= 0) {
    return {
      result: {
        ok: false,
        error: `${destHub.shortName} currently has 0 free bays. Choose an alternative hub or request field assistance.`,
      },
    };
  }

  const outcome = computeVehicleReturnOutcome({
    hold,
    vehicle,
    originHub,
    destHub,
    policyConfig: state.policyConfig,
    hasFault,
    remarks,
  });

  return {
    result: { ok: true },
    patch: {
      sharedVehicles: state.sharedVehicles.map((v) =>
        v.id === vehicle.id
          ? {
              ...v,
              hubId: destinationHubId,
              batterySoC: outcome.nextBattery,
              status: outcome.nextVehicleStatus,
            }
          : v,
      ),
      hubs: state.hubs.map((h) => {
        if (h.id !== destinationHubId) return h;
        const incCore = h.coreBaysOccupied < h.coreBaysTotal ? 1 : 0;
        const incBuffer = incCore === 0 ? 1 : 0;
        return {
          ...h,
          coreBaysOccupied: h.coreBaysOccupied + incCore,
          bufferBaysOccupied: h.bufferBaysOccupied + incBuffer,
          sharedEvsReady:
            outcome.nextVehicleStatus === 'AVAILABLE'
              ? h.sharedEvsReady + 1
              : h.sharedEvsReady,
        };
      }),
      activeVehicleHold: outcome.returnedHold,
      tripHistory: [outcome.historyEntry, ...state.tripHistory],
    },
  };
}
