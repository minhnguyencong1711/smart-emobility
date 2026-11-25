import {
  ApiHttpError,
  backendApi,
  buildActiveTripFromHold,
  getStoredAccessToken,
} from '@/services';

import type { MobilitySliceCreator, RentalSlice } from '../types';

import {
  buildOfflineHoldPatch,
  buildOfflineReturnPatch,
} from './rental.offline';

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

  reserveVehicle: async (vehicleId, pickupDate, pickupTime) => {
    const state = get();
    if (state.backendMode === 'online' && getStoredAccessToken()) {
      try {
        const hold = await backendApi.holdVehicle(
          vehicleId,
          pickupDate,
          pickupTime,
        );
        set({ activeVehicleHold: hold });
        void get().hydrateFromBackend();
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiHttpError) {
          return { ok: false, error: err.message };
        }
      }
    }

    const offline = buildOfflineHoldPatch(
      state,
      vehicleId,
      pickupDate,
      pickupTime,
    );
    if (offline.patch) set(offline.patch);
    return offline.result;
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

    if (state.backendMode === 'online' && getStoredAccessToken()) {
      void backendApi
        .expireHold()
        .then(() => get().hydrateFromBackend())
        .catch(() => undefined);
    }
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

    if (state.backendMode === 'online' && getStoredAccessToken()) {
      void backendApi
        .cancelHold()
        .then(() => get().hydrateFromBackend())
        .catch(() => undefined);
    }
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

    if (state.backendMode === 'online' && getStoredAccessToken()) {
      void backendApi
        .unlockVehicle()
        .then((res) => {
          set({ activeVehicleHold: res });
          return get().hydrateFromBackend();
        })
        .catch(() => undefined);
    }
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

    if (state.backendMode === 'online' && getStoredAccessToken()) {
      void backendApi
        .unlockVehicle()
        .then((res) => {
          set({ activeVehicleHold: res });
          return get().hydrateFromBackend();
        })
        .catch(() => undefined);
    }
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

  completeVehicleReturn: async (destinationHubId, hasFault, remarks) => {
    const state = get();
    if (state.backendMode === 'online' && getStoredAccessToken()) {
      try {
        const returned = await backendApi.returnVehicle(
          destinationHubId,
          hasFault,
          remarks,
        );
        set({ activeVehicleHold: returned });
        void get().hydrateFromBackend();
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiHttpError) {
          return { ok: false, error: err.message };
        }
      }
    }

    const offline = buildOfflineReturnPatch(
      state,
      destinationHubId,
      hasFault,
      remarks,
    );
    if (offline.patch) set(offline.patch);
    return offline.result;
  },

  clearReturnedTrip: () => set({ activeVehicleHold: null }),
});
