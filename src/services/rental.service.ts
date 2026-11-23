import type {
  ActiveVehicleHold,
  MobilityHub,
  SharedVehicle,
  SystemPolicyConfig,
  TripHistoryItem,
} from '@/types';

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
    reservationId: 'RES-24081',
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
  const targetVehicleId = hold?.vehicleId ?? fallbackVehicle.id;
  const targetHubId = hold?.hubId ?? fallbackVehicle.hubId;
  const destinationHubId =
    targetHubId === 'hub-dorm-a' ? 'hub-hcmut-2' : 'hub-dorm-a';

  return {
    reservationId: hold?.reservationId ?? 'RES-24081',
    vehicleId: targetVehicleId,
    hubId: targetHubId,
    pickupDate: hold?.pickupDate ?? '24 Oct 2026',
    pickupTime: hold?.pickupTime ?? '10:30 AM',
    deadlineLabel: hold?.deadlineLabel ?? '10:45 AM',
    remainingSeconds: hold?.remainingSeconds ?? 590,
    status: 'ACTIVE_TRIP',
    tripId: 'T-2408',
    startedAt: '10:40 AM',
    destinationHubId,
    elapsedSeconds: 27 * 60,
    distanceKm: 4.6,
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

  const nextBattery = Math.max(12, vehicle.batterySoC - 10);
  const nextVehicleStatus: SharedVehicle['status'] = hasFault
    ? 'OUT_OF_SERVICE'
    : nextBattery < policyConfig.minDispatchSoC
      ? 'CHARGING_QUEUE'
      : 'AVAILABLE';
  const durationMins = Math.max(
    1,
    Math.round((hold.elapsedSeconds ?? 28 * 60) / 60),
  );
  const fareVnd = 12000;
  const rewardPoints = 12;

  return {
    nextBattery,
    nextVehicleStatus,
    returnedHold: {
      ...hold,
      status: 'RETURNED',
      destinationHubId: destHub.id,
      distanceKm: 4.6,
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
      startedAt: hold.startedAt ?? '10:40 AM',
      endedAt: '11:08 AM',
      durationMins,
      distanceKm: 4.6,
      fareVnd,
      rewardPoints,
      hasFault,
    },
  };
}
