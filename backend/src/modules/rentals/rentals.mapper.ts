import type { VehicleRental } from '@prisma/client';

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
    startedAt: rental.startedAt ?? undefined,
    destinationHubId: rental.destinationHubId ?? undefined,
    elapsedSeconds: rental.durationMins ? rental.durationMins * 60 : undefined,
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
  return {
    tripId: row.tripCode ?? row.reservationCode,
    vehicleCode: row.vehicle.code,
    vehicleType: row.vehicle.type,
    fromHubName: row.originHub.name,
    toHubName: row.destinationHub?.name ?? row.originHub.name,
    startedAt: row.startedAt ?? row.pickupTime,
    endedAt: row.endedAt ?? '11:08 AM',
    durationMins: row.durationMins ?? 28,
    distanceKm: row.distanceKm ?? 4.6,
    fareVnd: row.fareVnd ?? 12000,
    rewardPoints: row.rewardPoints ?? 12,
    hasFault: row.hasFault,
  };
}

export function buildUnlockFallbackHoldData(
  userId: string,
  vehicleId: string,
  hubId: string,
) {
  return {
    id: `rnt-${Date.now()}`,
    reservationCode: `RES-${Math.floor(10000 + Math.random() * 89999)}`,
    userId,
    vehicleId,
    originHubId: hubId,
    pickupDate: '24 Oct 2026',
    pickupTime: '10:40 AM',
    deadlineLabel: '10:55 AM',
    deadlineAt: new Date(Date.now() + 15 * 60 * 1000),
    status: 'CONFIRMED',
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
    reportedAt: 'Just now',
    assignedCrew: 'Đinh Phạm Ngọc Phước',
  };
}
