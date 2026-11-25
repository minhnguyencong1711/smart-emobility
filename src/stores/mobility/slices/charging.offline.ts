import {
  advanceChargingTelemetry,
  buildParkingReservation,
  getStoredAccessToken,
} from '@/services';
import type { ActionResult, ReserveParkingPayload } from '@/types';

import type { MobilityState } from '../types';

export function buildOfflineParkingPatch(
  state: MobilityState,
  payload: ReserveParkingPayload,
): { result: ActionResult; patch?: Partial<MobilityState> } {
  const hub = state.hubs.find((h) => h.id === payload.hubId);
  if (!hub) {
    return { result: { ok: false, error: 'Selected hub was not found.' } };
  }

  const freeCore = hub.coreBaysTotal - hub.coreBaysOccupied;
  if (freeCore <= 0) {
    return {
      result: {
        ok: false,
        error: `${hub.shortName} is at full parking capacity.`,
      },
    };
  }

  return {
    result: { ok: true },
    patch: {
      hubs: state.hubs.map((h) =>
        h.id === payload.hubId
          ? { ...h, coreBaysOccupied: h.coreBaysOccupied + 1 }
          : h,
      ),
      activeParking: buildParkingReservation(payload),
    },
  };
}

export function buildPortReleasedPatch(
  state: MobilityState,
  opts: { releaseBay: boolean },
): Partial<MobilityState> | null {
  const ap = state.activeParking;
  if (!ap) return null;
  return {
    ...(opts.releaseBay
      ? {
          hubs: state.hubs.map((h) =>
            h.id === ap.hubId
              ? { ...h, coreBaysOccupied: Math.max(0, h.coreBaysOccupied - 1) }
              : h,
          ),
        }
      : {}),
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
      parkingStatus: opts.releaseBay ? 'EXITED' : 'CHECKED_IN',
    },
  };
}

export function buildRecoverChargingPatch(
  state: MobilityState,
  newPortCode?: string,
): Partial<MobilityState> {
  if (!state.activeParking) return {};
  return {
    activeParking: {
      ...state.activeParking,
      ...(newPortCode
        ? {
            chargingPortId: newPortCode.toLowerCase(),
            chargingPortCode: newPortCode,
          }
        : {}),
      chargingStatus: 'CHARGING',
      currentKw: 11,
      interruptionReason: undefined,
    },
  };
}

export function runOnlineChargingSync(
  getState: () => MobilityState,
  action: () => Promise<unknown>,
) {
  if (getState().backendMode !== 'online' || !getStoredAccessToken()) return;
  void action().catch(() => undefined);
}

export { advanceChargingTelemetry };
