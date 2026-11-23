import {
  buildActiveTripFromHold,
  buildVehicleHold,
  computeVehicleReturnOutcome,
} from '@/services';

import type { MobilitySliceCreator, RentalSlice } from '../types';

export const createRentalSlice: MobilitySliceCreator<RentalSlice> = (
  set,
  get,
) => ({
  activeVehicleHold: null,
  tripHistory: [
    {
      tripId: 'T-2394',
      vehicleCode: 'EV-105',
      vehicleType: 'E_MOTORCYCLE',
      fromHubName: 'Suoi Tien Metro Station',
      toHubName: 'HCMUT Campus 2',
      startedAt: '08:15 AM',
      endedAt: '08:34 AM',
      durationMins: 19,
      distanceKm: 5.2,
      fareVnd: 16000,
      rewardPoints: 16,
      hasFault: false,
    },
  ],

  reserveVehicle: (vehicleId, pickupDate, pickupTime) => {
    const state = get();
    if (
      state.activeVehicleHold &&
      (state.activeVehicleHold.status === 'CONFIRMED' ||
        state.activeVehicleHold.status === 'ACTIVE_TRIP')
    ) {
      return {
        ok: false,
        error:
          'A student may hold only one active shared-vehicle reservation or trip at a time.',
      };
    }

    const vehicle = state.sharedVehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return { ok: false, error: 'Selected vehicle was not found.' };
    }
    if (vehicle.status !== 'AVAILABLE') {
      return {
        ok: false,
        error: `Vehicle ${vehicle.code} is currently ${vehicle.status} and cannot be reserved.`,
      };
    }

    set({
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
    });
    return { ok: true };
  },

  tickHoldCountdown: () => {
    const hold = get().activeVehicleHold;
    if (!hold || hold.status !== 'CONFIRMED') return;
    if (hold.remainingSeconds <= 1) {
      get().expireVehicleHold();
      return;
    }
    set({
      activeVehicleHold: {
        ...hold,
        remainingSeconds: hold.remainingSeconds - 1,
      },
    });
  },

  expireVehicleHold: () => {
    const state = get();
    const hold = state.activeVehicleHold;
    if (!hold || hold.status !== 'CONFIRMED') return;

    set({
      sharedVehicles: state.sharedVehicles.map((v) =>
        v.id === hold.vehicleId ? { ...v, status: 'AVAILABLE' } : v,
      ),
      hubs: state.hubs.map((h) =>
        h.id === hold.hubId
          ? { ...h, sharedEvsReady: h.sharedEvsReady + 1 }
          : h,
      ),
      activeVehicleHold: {
        ...hold,
        remainingSeconds: 0,
        status: 'EXPIRED',
      },
    });
  },

  cancelVehicleHold: () => {
    const state = get();
    const hold = state.activeVehicleHold;
    if (!hold) return;

    const shouldRestoreVehicle = hold.status === 'CONFIRMED';
    set({
      sharedVehicles: shouldRestoreVehicle
        ? state.sharedVehicles.map((v) =>
            v.id === hold.vehicleId ? { ...v, status: 'AVAILABLE' } : v,
          )
        : state.sharedVehicles,
      hubs: shouldRestoreVehicle
        ? state.hubs.map((h) =>
            h.id === hold.hubId
              ? { ...h, sharedEvsReady: h.sharedEvsReady + 1 }
              : h,
          )
        : state.hubs,
      activeVehicleHold: null,
    });
  },

  unlockReservedVehicle: () => {
    const state = get();
    const hold = state.activeVehicleHold;
    const fallbackVehicle =
      state.sharedVehicles.find(
        (v) => v.id === (hold?.vehicleId ?? 'veh-102'),
      ) ?? state.sharedVehicles[0];
    const nextHold = buildActiveTripFromHold(hold, fallbackVehicle);

    set({
      sharedVehicles: state.sharedVehicles.map((v) =>
        v.id === nextHold.vehicleId ? { ...v, status: 'IN_USE' } : v,
      ),
      activeVehicleHold: nextHold,
    });
  },

  startDemoActiveTrip: (vehicleId = 'veh-102') => {
    const state = get();
    const vehicle =
      state.sharedVehicles.find((v) => v.id === vehicleId) ??
      state.sharedVehicles[0];

    set({
      sharedVehicles: state.sharedVehicles.map((v) =>
        v.id === vehicle.id ? { ...v, status: 'IN_USE' } : v,
      ),
      activeVehicleHold: buildActiveTripFromHold(null, vehicle),
    });
  },

  tickActiveTrip: () => {
    const hold = get().activeVehicleHold;
    if (!hold || hold.status !== 'ACTIVE_TRIP') return;
    set({
      activeVehicleHold: {
        ...hold,
        elapsedSeconds: (hold.elapsedSeconds ?? 0) + 1,
      },
    });
  },

  completeVehicleReturn: (destinationHubId, hasFault, remarks) => {
    const state = get();
    const hold = state.activeVehicleHold;
    if (!hold) {
      return { ok: false, error: 'No active trip found to return.' };
    }

    const destHub = state.hubs.find((h) => h.id === destinationHubId);
    const originHub = state.hubs.find((h) => h.id === hold.hubId);
    const vehicle = state.sharedVehicles.find((v) => v.id === hold.vehicleId);
    if (!destHub || !vehicle) {
      return { ok: false, error: 'Destination hub or vehicle not found.' };
    }

    const freeCore = destHub.coreBaysTotal - destHub.coreBaysOccupied;
    const freeBuffer = destHub.bufferBaysTotal - destHub.bufferBaysOccupied;
    if (freeCore + freeBuffer <= 0) {
      return {
        ok: false,
        error: `${destHub.shortName} currently has 0 free bays. Choose an alternative hub or request field assistance.`,
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

    set({
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
    });
    return { ok: true };
  },

  clearReturnedTrip: () => set({ activeVehicleHold: null }),
});
