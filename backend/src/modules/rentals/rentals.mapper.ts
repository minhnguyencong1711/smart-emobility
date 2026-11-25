import type { VehicleRental } from '@prisma/client';

const VN_TZ = 'Asia/Ho_Chi_Minh';

export function formatVnTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatVnDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function isIsoTimestamp(value?: string | null): boolean {
  return Boolean(value && value.includes('T') && !Number.isNaN(Date.parse(value)));
}

export function computeDeadlineLabel(
  pickupTime: string,
  graceMins: number,
): string {
  const [timePart, periodRaw] = pickupTime.split(' ');
  const [hhRaw, mmRaw] = timePart.split(':').map(Number);
  if (Number.isNaN(hhRaw) || Number.isNaN(mmRaw)) return pickupTime;
  const period = (periodRaw ?? 'AM').toUpperCase();
  let hours24 = hhRaw % 12;
  if (period === 'PM') hours24 += 12;
  const totalMins = hours24 * 60 + mmRaw + graceMins;
  const finalH24 = Math.floor(totalMins / 60) % 24;
  const finalM = totalMins % 60;
  const finalPeriod = finalH24 >= 12 ? 'PM' : 'AM';
  const finalH12 = finalH24 % 12 === 0 ? 12 : finalH24 % 12;
  return `${finalH12}:${String(finalM).padStart(2, '0')} ${finalPeriod}`;
}

export function toHoldDto(rental: VehicleRental) {
  const remainingSeconds =
    rental.status === 'CONFIRMED'
      ? Math.max(0, Math.floor((rental.deadlineAt.getTime() - Date.now()) / 1000))
      : 0;

  const startedAtIso = isIsoTimestamp(rental.startedAt)
    ? (rental.startedAt as string)
    : undefined;
  const startedAtLabel = startedAtIso
    ? formatVnTime(new Date(startedAtIso))
    : (rental.startedAt ?? undefined);
  const tripDate = startedAtIso
    ? formatVnDate(new Date(startedAtIso))
    : rental.pickupDate;

  let elapsedSeconds: number | undefined;
  if (rental.status === 'ACTIVE_TRIP' && startedAtIso) {
    elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(startedAtIso)) / 1000),
    );
  } else if (rental.durationMins) {
    elapsedSeconds = rental.durationMins * 60;
  }

  return {
    reservationId: rental.reservationCode,
    vehicleId: rental.vehicleId,
    hubId: rental.originHubId,
    pickupDate: rental.pickupDate,
    pickupTime: rental.pickupTime,
    deadlineLabel: rental.deadlineLabel,
    remainingSeconds,
    status: rental.status,
    tripId: rental.tripCode ?? undefined,
    startedAt: startedAtLabel,
    startedAtIso,
    endedAt: rental.endedAt ?? undefined,
    tripDate,
    durationMins: rental.durationMins ?? undefined,
    destinationHubId: rental.destinationHubId ?? undefined,
    elapsedSeconds,
    distanceKm: rental.distanceKm ?? undefined,
    estimatedFareVnd: rental.fareVnd ?? undefined,
    rewardPoints: rental.rewardPoints ?? undefined,
    hasFault: rental.hasFault,
    remarks: rental.remarks ?? undefined,
  };
}

export function toRentalHistoryDto(row: {
  tripCode: string | null;
  reservationCode: string;
  vehicle: { code: string; type: string };
  originHub: { name: string };
  destinationHub: { name: string } | null;
  startedAt: string | null;
  pickupTime: string;
  endedAt: string | null;
  durationMins: number | null;
  distanceKm: number | null;
  fareVnd: number | null;
  rewardPoints: number | null;
  hasFault: boolean;
}) {
  const startedLabel = isIsoTimestamp(row.startedAt)
    ? formatVnTime(new Date(row.startedAt as string))
    : (row.startedAt ?? row.pickupTime);

  return {
    tripId: row.tripCode ?? row.reservationCode,
    vehicleCode: row.vehicle.code,
    vehicleType: row.vehicle.type,
    fromHubName: row.originHub.name,
    toHubName: row.destinationHub?.name ?? row.originHub.name,
    startedAt: startedLabel,
    endedAt: row.endedAt ?? formatVnTime(new Date()),
    durationMins: row.durationMins ?? 1,
    distanceKm: row.distanceKm ?? 0.3,
    fareVnd: row.fareVnd ?? 1500,
    rewardPoints: row.rewardPoints ?? 2,
    hasFault: row.hasFault,
  };
}

export function buildUnlockFallbackHoldData(
  userId: string,
  vehicleId: string,
  hubId: string,
) {
  const now = new Date();
  const pickupTime = formatVnTime(now);
  return {
    id: `rnt-${Date.now()}`,
    reservationCode: `RES-${Math.floor(10000 + Math.random() * 89999)}`,
    userId,
    vehicleId,
    originHubId: hubId,
    pickupDate: formatVnDate(now),
    pickupTime,
    deadlineLabel: computeDeadlineLabel(pickupTime, 15),
    deadlineAt: new Date(now.getTime() + 15 * 60 * 1000),
    status: 'CONFIRMED',
  };
}

export function computeTripReturnMetrics(params: {
  startedAt?: string | null;
  fallbackUpdatedAt?: Date | null;
  ratePerMinVnd?: number | null;
}) {
  const now = new Date();
  const startMs = isIsoTimestamp(params.startedAt)
    ? Date.parse(params.startedAt as string)
    : (params.fallbackUpdatedAt?.getTime() ?? now.getTime());
  const elapsedSec = Math.max(1, Math.floor((now.getTime() - startMs) / 1000));
  const durationMins = Math.max(1, Math.ceil(elapsedSec / 60));
  const distanceKm = Number(Math.max(0.2, durationMins * 0.25).toFixed(1));
  const rate = params.ratePerMinVnd ?? 1500;
  return {
    endedAt: formatVnTime(now),
    durationMins,
    distanceKm,
    fareVnd: durationMins * rate,
    rewardPoints: Math.max(2, durationMins * 2),
  };
}

export function buildReturnFaultIncidentData(params: {
  destinationHubId: string;
  destHubShortName: string;
  vehicleId: string;
  vehicleCode: string;
  vehicleModel: string;
  remarks?: string;
}) {
  return {
    id: `inc-${Date.now()}`,
    code: `#INC-2026-${Math.floor(200 + Math.random() * 799)}`,
    hubId: params.destinationHubId,
    resourceId: params.vehicleId,
    resourceCode: `${params.vehicleCode} (${params.vehicleModel})`,
    severity: 'WARNING',
    status: 'REPORTED',
    description:
      params.remarks?.trim() ||
      `Student reported fault upon trip return at ${params.destHubShortName}.`,
    telemetryReading: 'ERR_RETURN_INSPECTION',
    reportedAt: formatVnTime(new Date()),
    assignedCrew: 'Đinh Phạm Ngọc Phước',
  };
}

export function toLiveFleetRentalDto(
  row: VehicleRental & {
    user: { fullName: string; email: string };
    vehicle: { code: string; model: string; type: string; batterySoC: number };
    originHub: { shortName: string };
  },
) {
  const base = toHoldDto(row);
  return {
    id: row.id,
    reservationId: base.reservationId,
    tripId: base.tripId,
    status: base.status,
    vehicleId: base.vehicleId,
    vehicleCode: row.vehicle.code,
    vehicleModel: row.vehicle.model,
    vehicleType: row.vehicle.type,
    batterySoC: row.vehicle.batterySoC,
    riderName: row.user.fullName,
    riderEmail: row.user.email,
    originHubId: base.hubId,
    originHubName: row.originHub.shortName,
    startedAt: base.startedAt,
    startedAtIso: base.startedAtIso,
    remainingSeconds: base.remainingSeconds,
    elapsedSeconds: base.elapsedSeconds,
  };
}
