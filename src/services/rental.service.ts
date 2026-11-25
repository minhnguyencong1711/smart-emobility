import type {
  ActiveVehicleHold,
  MobilityHub,
  SharedVehicle,
  SystemPolicyConfig,
  TripHistoryItem,
} from '@/types';
import { formatDateShort, formatTime12h } from '@/utils/date-time';

export function computeDeadlineLabel(
  pickupTime: string,
  graceMins: number,
): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(pickupTime.trim());
  if (!match) return `${pickupTime} (+${graceMins}m)`;
  let hours = Number(match[1]);
  const mins = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const totalMins = hours * 60 + mins + graceMins;
  const endHour24 = Math.floor(totalMins / 60) % 24;
  const endMin = totalMins % 60;
  const endMeridiem = endHour24 >= 12 ? 'PM' : 'AM';
  const endHour12 = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
  return `${endHour12}:${String(endMin).padStart(2, '0')} ${endMeridiem}`;
}

export function buildVehicleHold(
  vehicle: SharedVehicle,
  pickupDate: string,
  pickupTime: string,
  gracePeriodMins: number,
): ActiveVehicleHold {
  return {
    reservationId: `RES-${Math.floor(10000 + Math.random() * 89999)}`,
    vehicleId: vehicle.id,
    hubId: vehicle.hubId,
    pickupDate,
    pickupTime,
    deadlineLabel: computeDeadlineLabel(pickupTime, gracePeriodMins),
    remainingSeconds: gracePeriodMins * 60,
    status: 'CONFIRMED',
  };
}

export function buildActiveTripFromHold(
  hold: ActiveVehicleHold | null,
  fallbackVehicle: SharedVehicle,
): ActiveVehicleHold {
  const now = new Date();
  const targetVehicleId = hold?.vehicleId ?? fallbackVehicle.id;
  const targetHubId = hold?.hubId ?? fallbackVehicle.hubId;
  const destinationHubId =
    targetHubId === 'hub-dorm-a' ? 'hub-hcmut-2' : 'hub-dorm-a';
  const startedAt = formatTime12h(now);
  const todayLabel = formatDateShort(0);

  return {
    reservationId:
      hold?.reservationId ?? `RES-${Math.floor(10000 + Math.random() * 89999)}`,
    vehicleId: targetVehicleId,
    hubId: targetHubId,
    pickupDate: hold?.pickupDate ?? todayLabel,
    pickupTime: hold?.pickupTime ?? startedAt,
    deadlineLabel: hold?.deadlineLabel ?? computeDeadlineLabel(startedAt, 15),
    remainingSeconds: hold?.remainingSeconds ?? 900,
    status: 'ACTIVE_TRIP',
    tripId: `T-${Math.floor(2400 + Math.random() * 599)}`,
    startedAt,
    startedAtIso: now.toISOString(),
    tripDate: todayLabel,
    destinationHubId,
    elapsedSeconds: 0,
    distanceKm: 0,
  };
}

export function computeVehicleReturnOutcome(params: {
  hold: ActiveVehicleHold;
  vehicle: SharedVehicle;
  originHub?: MobilityHub;
  destHub: MobilityHub;
  policyConfig: SystemPolicyConfig;
  hasFault: boolean;
  remarks: string;
}): {
  nextBattery: number;
  nextVehicleStatus: SharedVehicle['status'];
  returnedHold: ActiveVehicleHold;
  historyEntry: TripHistoryItem;
} {
  const { hold, vehicle, originHub, destHub, policyConfig, hasFault, remarks } =
    params;

  const now = new Date();
  const nextBattery = Math.max(12, vehicle.batterySoC - 10);
  const nextVehicleStatus: SharedVehicle['status'] = hasFault
    ? 'OUT_OF_SERVICE'
    : nextBattery < policyConfig.minDispatchSoC
      ? 'CHARGING_QUEUE'
      : 'AVAILABLE';

  const elapsedSec = hold.startedAtIso
    ? Math.max(
        1,
        Math.floor((now.getTime() - Date.parse(hold.startedAtIso)) / 1000),
      )
    : Math.max(1, hold.elapsedSeconds ?? 60);
  const durationMins = Math.max(1, Math.ceil(elapsedSec / 60));
  const distanceKm = Number(Math.max(0.2, durationMins * 0.25).toFixed(1));
  const fareVnd = durationMins * vehicle.ratePerMinVnd;
  const rewardPoints = Math.max(2, durationMins * 2);
  const endedAt = formatTime12h(now);
  const tripDate = hold.tripDate ?? formatDateShort(0);

  return {
    nextBattery,
    nextVehicleStatus,
    returnedHold: {
      ...hold,
      status: 'RETURNED',
      destinationHubId: destHub.id,
      endedAt,
      tripDate,
      durationMins,
      elapsedSeconds: durationMins * 60,
      distanceKm,
      estimatedFareVnd: fareVnd,
      rewardPoints,
      hasFault,
      remarks,
    },
    historyEntry: {
      tripId: hold.tripId ?? 'T-2408',
      vehicleCode: vehicle.code,
      vehicleType: vehicle.type,
      fromHubName: originHub?.shortName ?? 'Origin Hub',
      toHubName: destHub.shortName,
      startedAt: hold.startedAt ?? endedAt,
      endedAt,
      durationMins,
      distanceKm,
      fareVnd,
      rewardPoints,
      hasFault,
    },
  };
}
