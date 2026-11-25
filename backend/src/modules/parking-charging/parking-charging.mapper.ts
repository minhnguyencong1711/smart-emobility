import type { ParkingChargingSession } from '@prisma/client';

export function getNominalKw(connectorType: string): number {
  if (connectorType === 'DC_FAST') return 30;
  if (connectorType === 'E_BIKE_AC') return 3.7;
  return 7.4;
}

export function toSessionDto(s: ParkingChargingSession) {
  return {
    reservationId: s.reservationId,
    hubId: s.hubId,
    bayCode: s.bayCode,
    floor: s.floor,
    vehicleModel: s.vehicleModel,
    plateNumber: s.plateNumber,
    arrivalDate: s.arrivalDate,
    arrivalTime: s.arrivalTime,
    durationHours: s.durationHours,
    ePassCode: s.ePassCode,
    pinCode: s.pinCode,
    parkingStatus: s.parkingStatus,
    checkedIn: s.checkedIn,
    chargingPortId: s.chargingPortId,
    chargingPortCode: s.chargingPortCode,
    connectorType: s.connectorType,
    chargingStatus: s.chargingStatus,
    socPercent: s.socPercent,
    targetSocPercent: s.targetSocPercent,
    currentKw: s.currentKw,
    energyDeliveredKwh: s.energyDeliveredKwh,
    chargingElapsedMins: s.chargingElapsedMins,
    interruptionReason: s.interruptionReason ?? undefined,
  };
}
