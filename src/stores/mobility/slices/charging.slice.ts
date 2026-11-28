import {
  INITIAL_ACTIVE_PARKING,
  INITIAL_CHARGING_POINTS,
  INITIAL_CHARGING_QUEUE,
  INITIAL_DLB_LOGS,
} from '@/data';
import {
  advanceChargingTelemetry,
  ApiHttpError,
  backendApi,
  buildDlbTransition,
  getConnectorNominalKw,
  getStoredAccessToken,
} from '@/services';

import type { ChargingSlice, MobilitySliceCreator } from '../types';

import {
  buildOfflineParkingPatch,
  buildPortReleasedPatch,
  buildRecoverChargingPatch,
  runOnlineChargingSync,
} from './charging.offline';

export const createChargingSlice: MobilitySliceCreator<ChargingSlice> = (
  set,
  get,
) => ({
  chargingPoints: INITIAL_CHARGING_POINTS,
  chargingQueue: INITIAL_CHARGING_QUEUE,
  activeParking: INITIAL_ACTIVE_PARKING,
  dlbMode: 'NORMAL',
  chargingScheduleApplied: false,
  chargingScheduleGeneratedAt: '08:00–10:30',
  chargingScheduleOptimized: false,
  dlbActivityLogs: INITIAL_DLB_LOGS,

  setChargingSessionStatus: (status, reason) =>
    set((state) =>
      state.activeParking
        ? {
            activeParking: {
              ...state.activeParking,
              chargingStatus: status,
              interruptionReason: reason,
              currentKw:
                status === 'CHARGING' ? 11 : status === 'THROTTLED' ? 3.7 : 0,
              socPercent:
                status === 'CHARGING_COMPLETED'
                  ? state.activeParking.targetSocPercent
                  : state.activeParking.socPercent,
            },
          }
        : state,
    ),

  reserveParkingBay: async (payload) => {
    const state = get();
    if (state.backendMode === 'online' && getStoredAccessToken()) {
      try {
        const session = await backendApi.reserveParking(payload);
        set({ activeParking: session });
        void get().hydrateFromBackend();
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiHttpError) {
          return { ok: false, error: err.message };
        }
      }
    }
    const offline = buildOfflineParkingPatch(state, payload);
    if (offline.patch) set(offline.patch);
    return offline.result;
  },

  cancelParkingReservation: () => {
    const current = get().activeParking;
    if (!current) return;
    set((state) => ({
      hubs: state.hubs.map((h) =>
        h.id === current.hubId
          ? { ...h, coreBaysOccupied: Math.max(0, h.coreBaysOccupied - 1) }
          : h,
      ),
      activeParking: {
        ...current,
        parkingStatus: 'CANCELLED',
        checkedIn: false,
      },
    }));
    runOnlineChargingSync(get, () =>
      backendApi.cancelParking().then(() => get().hydrateFromBackend()),
    );
  },

  checkInParkingPass: () => {
    set((state) =>
      state.activeParking
        ? {
            activeParking: {
              ...state.activeParking,
              checkedIn: true,
              parkingStatus: 'CHECKED_IN',
            },
          }
        : state,
    );
    runOnlineChargingSync(get, () =>
      backendApi.checkInParking().then((session) => {
        set({ activeParking: session });
      }),
    );
  },

  bookChargingSession: (portId, portCode, connectorType, targetSocPercent) => {
    const powerKw = getConnectorNominalKw(connectorType);
    set((state) => ({
      chargingPoints: state.chargingPoints.map((cp) =>
        cp.id === portId
          ? { ...cp, status: 'CHARGING', currentPowerKw: powerKw }
          : cp,
      ),
      activeParking: {
        ...(state.activeParking ?? INITIAL_ACTIVE_PARKING),
        checkedIn: true,
        parkingStatus: 'CHECKED_IN',
        chargingPortId: portId,
        chargingPortCode: portCode,
        connectorType,
        chargingStatus: 'CHARGING',
        targetSocPercent,
        currentKw: powerKw,
        interruptionReason: undefined,
      },
    }));
    runOnlineChargingSync(get, () =>
      backendApi
        .startCharging({ portId, portCode, connectorType, targetSocPercent })
        .then((session) => set({ activeParking: session })),
    );
  },

  tickChargingProgress: () => {
    set((state) =>
      state.activeParking
        ? { activeParking: advanceChargingTelemetry(state.activeParking) }
        : state,
    );
    runOnlineChargingSync(get, () =>
      backendApi
        .tickCharging()
        .then((session) => (session ? set({ activeParking: session }) : null)),
    );
  },

  resumeInterruptedCharging: () => {
    set((state) => buildRecoverChargingPatch(state));
    runOnlineChargingSync(get, () =>
      backendApi
        .recoverCharging('RESUME')
        .then((session) => set({ activeParking: session })),
    );
  },

  reassignChargingPort: (newPortCode) => {
    set((state) => buildRecoverChargingPatch(state, newPortCode));
    runOnlineChargingSync(get, () =>
      backendApi
        .recoverCharging('REASSIGN', newPortCode)
        .then((session) => set({ activeParking: session })),
    );
  },

  stopChargingKeepParking: () => {
    set((state) => buildPortReleasedPatch(state, { releaseBay: false }) ?? {});
    runOnlineChargingSync(get, () =>
      backendApi
        .stopChargingKeepParking()
        .then(() => get().hydrateFromBackend()),
    );
  },

  exitHubReleaseBay: () => {
    set((state) => buildPortReleasedPatch(state, { releaseBay: true }) ?? {});
    runOnlineChargingSync(get, () =>
      backendApi.exitHubReleaseBay().then(() => get().hydrateFromBackend()),
    );
  },

  setDlbMode: (mode) =>
    set((state) => {
      const transition = buildDlbTransition({
        mode,
        chargingQueue: state.chargingQueue,
        activeParking: state.activeParking,
      });
      return {
        dlbMode: mode,
        chargingQueue: transition.nextQueue,
        activeParking: transition.nextActiveParking,
        dlbActivityLogs: [transition.nextLog, ...state.dlbActivityLogs],
      };
    }),

  generateChargingSchedule: () =>
    set((state) => ({
      chargingScheduleApplied: false,
      chargingScheduleOptimized: true,
      chargingScheduleGeneratedAt: '08:00–10:30 (Optimized)',
      dlbActivityLogs: [
        {
          id: `dlb-gen-${Date.now()}`,
          time: '[09:13:10]',
          level: 'INFO',
          message:
            'Smart schedule optimized: Tier-1/2 prioritized in 08:00–09:00; Tier-3 routine shifted to 09:30–10:30.',
        },
        ...state.dlbActivityLogs,
      ],
    })),

  applyChargingSchedule: () =>
    set((state) => ({
      chargingScheduleApplied: true,
      dlbActivityLogs: [
        {
          id: `dlb-sched-${Date.now()}`,
          time: '[09:14:20]',
          level: 'SYSTEM',
          message:
            'Charging schedule applied across Ports 1-4. Tier 1 & Tier 2 reservations locked.',
        },
        ...state.dlbActivityLogs,
      ],
    })),
});
