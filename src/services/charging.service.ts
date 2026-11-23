import type {
  ActiveParkingAndCharging,
  ChargingQueueEntry,
  DlbLogEntry,
  DlbMode,
} from '@/types';
import type { ReserveParkingPayload } from '@/types';

export function buildParkingReservation(
  payload: ReserveParkingPayload,
): ActiveParkingAndCharging {
  return {
    reservationId: `PRK-2026-${Math.floor(100 + Math.random() * 899)}`,
    hubId: payload.hubId,
    bayCode: `BAY-${payload.bayCode}`,
    floor: payload.floor,
    vehicleModel: payload.vehicleModel,
    plateNumber: payload.plateNumber,
    arrivalDate: payload.arrivalDate,
    arrivalTime: payload.arrivalTime,
    durationHours: payload.durationHours,
    ePassCode: `EPASS-VNU-${payload.bayCode}`,
    pinCode: '482-910',
    parkingStatus: 'RESERVED',
    checkedIn: false,
    chargingPortId: null,
    chargingPortCode: null,
    connectorType: 'TYPE_2',
    chargingStatus: 'PENDING',
    socPercent: 48,
    targetSocPercent: 90,
    currentKw: 0,
    energyDeliveredKwh: 0,
    chargingElapsedMins: 0,
  };
}

export function getConnectorNominalKw(
  connectorType: ActiveParkingAndCharging['connectorType'],
): number {
  if (connectorType === 'DC_FAST') return 30;
  if (connectorType === 'TYPE_2') return 11;
  return 7;
}

export function advanceChargingTelemetry(
  ap: ActiveParkingAndCharging,
): ActiveParkingAndCharging {
  if (ap.chargingStatus !== 'CHARGING' && ap.chargingStatus !== 'THROTTLED') {
    return ap;
  }
  const nextSoc = Math.min(ap.targetSocPercent, ap.socPercent + 10);
  const completed = nextSoc >= ap.targetSocPercent;
  return {
    ...ap,
    socPercent: nextSoc,
    chargingStatus: completed ? 'CHARGING_COMPLETED' : ap.chargingStatus,
    currentKw: completed ? 0 : ap.currentKw,
    energyDeliveredKwh: +(ap.energyDeliveredKwh + 2.4).toFixed(1),
    chargingElapsedMins: ap.chargingElapsedMins + 8,
  };
}

export function buildDlbTransition(params: {
  mode: DlbMode;
  chargingQueue: ChargingQueueEntry[];
  activeParking: ActiveParkingAndCharging | null;
}): {
  nextLog: DlbLogEntry;
  nextQueue: ChargingQueueEntry[];
  nextActiveParking: ActiveParkingAndCharging | null;
} {
  const { mode, chargingQueue, activeParking } = params;
  const isCritical = mode === 'CRITICAL';

  const nextLog: DlbLogEntry = {
    id: `dlb-${Date.now()}`,
    time: '[09:12:04]',
    level: isCritical ? 'CRITICAL' : 'INFO',
    message: isCritical
      ? 'CRITICAL 91% FEEDER LOAD: Tier-3 routine charging throttled to 3.7 kW; Tier-1/2 protected.'
      : mode === 'RECOVERY'
        ? 'RECOVERY 74%: Grid demand stabilized below 85%. Restoring nominal 7kW/11kW charging rates.'
        : 'NORMAL 65%: Grid load at safe levels. No DLB throttling required.',
  };

  const nextQueue = chargingQueue.map((entry) =>
    entry.tier === 3
      ? {
          ...entry,
          allocatedKw: isCritical ? 3.7 : 7,
          status: (isCritical
            ? 'THROTTLED'
            : 'CHARGING') as ChargingQueueEntry['status'],
        }
      : entry,
  );

  const nextActiveParking = activeParking
    ? {
        ...activeParking,
        chargingStatus: isCritical
          ? ('THROTTLED' as const)
          : activeParking.chargingStatus === 'THROTTLED'
            ? ('CHARGING' as const)
            : activeParking.chargingStatus,
        currentKw: isCritical
          ? 3.7
          : activeParking.chargingStatus === 'THROTTLED'
            ? 11
            : activeParking.currentKw,
        interruptionReason: isCritical
          ? 'Grid demand reached 91% — Tier-3 DLB throttling active (3.7 kW).'
          : undefined,
      }
    : null;

  return { nextLog, nextQueue, nextActiveParking };
}
