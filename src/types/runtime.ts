import type { ChargingSessionStatus, VehicleType } from './domain';

export type ActiveVehicleHold = {
  reservationId: string;
  vehicleId: string;
  hubId: string;
  pickupDate: string;
  pickupTime: string;
  deadlineLabel: string;
  remainingSeconds: number;
  status: 'CONFIRMED' | 'EXPIRED' | 'ACTIVE_TRIP' | 'RETURNED';
  tripId?: string;
  startedAt?: string;
  destinationHubId?: string;
  elapsedSeconds?: number;
  distanceKm?: number;
  estimatedFareVnd?: number;
  rewardPoints?: number;
  hasFault?: boolean;
  remarks?: string;
};

export type TripHistoryItem = {
  tripId: string;
  vehicleCode: string;
  vehicleType: VehicleType;
  fromHubName: string;
  toHubName: string;
  startedAt: string;
  endedAt: string;
  durationMins: number;
  distanceKm: number;
  fareVnd: number;
  rewardPoints: number;
  hasFault: boolean;
};

export type ActiveParkingAndCharging = {
  reservationId: string;
  hubId: string;
  bayCode: string;
  floor: number;
  vehicleModel: string;
  plateNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: number;
  ePassCode: string;
  pinCode: string;
  parkingStatus: 'RESERVED' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED' | 'EXITED';
  checkedIn: boolean;
  chargingPortId: string | null;
  chargingPortCode: string | null;
  connectorType: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC';
  chargingStatus: ChargingSessionStatus;
  socPercent: number;
  targetSocPercent: number;
  currentKw: number;
  energyDeliveredKwh: number;
  chargingElapsedMins: number;
  interruptionReason?: string;
};

export type DlbMode = 'NORMAL' | 'CRITICAL' | 'RECOVERY';

export type DlbLogEntry = {
  id: string;
  time: string;
  level: 'SYSTEM' | 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
};

export type ReserveParkingPayload = {
  hubId: string;
  bayCode: string;
  floor: number;
  vehicleModel: string;
  plateNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: number;
};

export type ActionResult = {
  ok: boolean;
  error?: string;
};
