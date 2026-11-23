import {
  INITIAL_ACTIVE_PARKING,
  INITIAL_CHARGING_POINTS,
  INITIAL_CHARGING_QUEUE,
  INITIAL_DLB_LOGS,
} from '@/data';
import {
  advanceChargingTelemetry,
  buildDlbTransition,
  buildParkingReservation,
  getConnectorNominalKw,
} from '@/services';

import type { ChargingSlice, MobilitySliceCreator } from '../types';

export const createChargingSlice: MobilitySliceCreator<ChargingSlice> = (
  set,
  get,
) => ({
  chargingPoints: INITIAL_CHARGING_POINTS,
  chargingQueue: INITIAL_CHARGING_QUEUE,
  activeParking: INITIAL_ACTIVE_PARKING,
  dlbMode: 'NORMAL',
  chargingScheduleApplied: false,
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

  reserveParkingBay: (payload) => {
    const state = get();
    const hub = state.hubs.find((h) => h.id === payload.hubId);
    if (!hub) return { ok: false, error: 'Selected hub was not found.' };

    const freeCore = hub.coreBaysTotal - hub.coreBaysOccupied;
    if (freeCore <= 0) {
      return {
        ok: false,
        error: `${hub.shortName} is at full parking capacity.`,
      };
    }

    set({
      hubs: state.hubs.map((h) =>
        h.id === payload.hubId
          ? { ...h, coreBaysOccupied: h.coreBaysOccupied + 1 }
          : h,
      ),
      activeParking: buildParkingReservation(payload),
    });
    return { ok: true };
  },

  cancelParkingReservation: () => {
    const state = get();
    const current = state.activeParking;
    if (!current) return;

    set({
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
    });
  },

  checkInParkingPass: () =>
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
    ),

  bookChargingSession: (portId, portCode, connectorType, targetSocPercent) => {
    const powerKw = getConnectorNominalKw(connectorType);
    set((state) => ({
      chargingPoints: state.chargingPoints.map((cp) =>
        cp.id === portId
          ? { ...cp, status: 'CHARGING', currentPowerKw: powerKw }
          : cp,
      ),
      activeParking: state.activeParking
        ? {
            ...state.activeParking,
            checkedIn: true,
            parkingStatus: 'CHECKED_IN',
            chargingPortId: portId,
            chargingPortCode: portCode,
            connectorType,
            chargingStatus: 'CHARGING',
            targetSocPercent,
            currentKw: powerKw,
            interruptionReason: undefined,
          }
        : {
            ...INITIAL_ACTIVE_PARKING,
            chargingPortId: portId,
            chargingPortCode: portCode,
            connectorType,
            chargingStatus: 'CHARGING',
            targetSocPercent,
            currentKw: powerKw,
          },
    }));
  },

  tickChargingProgress: () =>
    set((state) =>
      state.activeParking
        ? { activeParking: advanceChargingTelemetry(state.activeParking) }
        : state,
    ),

  resumeInterruptedCharging: () =>
    set((state) =>
      state.activeParking
        ? {
            activeParking: {
              ...state.activeParking,
              chargingStatus: 'CHARGING',
              currentKw: 11,
              interruptionReason: undefined,
            },
          }
        : state,
    ),

  reassignChargingPort: (newPortCode) =>
    set((state) =>
      state.activeParking
        ? {
            activeParking: {
              ...state.activeParking,
              chargingPortId: newPortCode.toLowerCase(),
              chargingPortCode: newPortCode,
              chargingStatus: 'CHARGING',
              currentKw: 11,
              interruptionReason: undefined,
            },
          }
        : state,
    ),

  stopChargingKeepParking: () =>
    set((state) => {
      const ap = state.activeParking;
      if (!ap) return state;
      return {
        chargingPoints: ap.chargingPortId
          ? state.chargingPoints.map((cp) =>
              cp.id === ap.chargingPortId
                ? { ...cp, status: 'AVAILABLE', currentPowerKw: 0 }
                : cp,
            )
          : state.chargingPoints,
        activeParking: {
          ...ap,
          chargingStatus: 'CHARGING_COMPLETED',
          currentKw: 0,
          parkingStatus: 'CHECKED_IN',
        },
      };
    }),

  exitHubReleaseBay: () =>
    set((state) => {
      const ap = state.activeParking;
      if (!ap) return state;
      return {
        hubs: state.hubs.map((h) =>
          h.id === ap.hubId
            ? { ...h, coreBaysOccupied: Math.max(0, h.coreBaysOccupied - 1) }
            : h,
        ),
        chargingPoints: ap.chargingPortId
          ? state.chargingPoints.map((cp) =>
              cp.id === ap.chargingPortId
                ? { ...cp, status: 'AVAILABLE', currentPowerKw: 0 }
                : cp,
            )
          : state.chargingPoints,
        activeParking: {
          ...ap,
          chargingStatus: 'CHARGING_COMPLETED',
          currentKw: 0,
          parkingStatus: 'EXITED',
        },
      };
    }),

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
