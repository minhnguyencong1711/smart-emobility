import type {
  ActiveParkingAndCharging,
  ActiveVehicleHold,
  ChargingPoint,
  IncidentRecord,
  LiveFleetRental,
  MobilityHub,
  ReserveParkingPayload,
  SharedVehicle,
  SystemPolicyConfig,
  TripHistoryItem,
  UserProfile,
} from '@/types';

import { apiRequest } from './api-client';

export type AuthResponseDto = {
  accessToken: string;
  user: UserProfile;
};

export const backendApi = {
  // Health
  health: () => apiRequest<{ ok: boolean }>('/health'),

  // Auth
  login: (email: string, password: string) =>
    apiRequest<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { fullName: string; email: string; password: string }) =>
    apiRequest<AuthResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest<UserProfile>('/auth/me'),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiRequest<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),

  resetLockout: (email: string) =>
    apiRequest<{ ok: boolean }>('/auth/reset-lockout', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Policy
  getPolicy: () => apiRequest<SystemPolicyConfig>('/policy'),

  updatePolicy: (partial: Partial<SystemPolicyConfig>) =>
    apiRequest<SystemPolicyConfig>('/policy', {
      method: 'PATCH',
      body: JSON.stringify(partial),
    }),

  resetBaseline: () =>
    apiRequest<{ ok: boolean; policy: SystemPolicyConfig }>(
      '/policy/reset-baseline',
      { method: 'POST' },
    ),

  // Fleet & Hubs
  listHubs: () => apiRequest<MobilityHub[]>('/hubs'),
  listVehicles: () => apiRequest<SharedVehicle[]>('/vehicles'),

  // Rentals
  getActiveHold: () => apiRequest<ActiveVehicleHold | null>('/rentals/active'),
  getRentalHistory: () => apiRequest<TripHistoryItem[]>('/rentals/history'),
  getLiveFleetRentals: () => apiRequest<LiveFleetRental[]>('/rentals/live'),
  holdVehicle: (vehicleId: string, pickupDate: string, pickupTime: string) =>
    apiRequest<ActiveVehicleHold>('/rentals/hold', {
      method: 'POST',
      body: JSON.stringify({ vehicleId, pickupDate, pickupTime }),
    }),
  cancelHold: () =>
    apiRequest<{ ok: boolean }>('/rentals/hold', { method: 'DELETE' }),
  expireHold: () =>
    apiRequest<ActiveVehicleHold | null>('/rentals/hold/expire', {
      method: 'POST',
    }),
  unlockVehicle: () =>
    apiRequest<ActiveVehicleHold>('/rentals/unlock', { method: 'POST' }),
  returnVehicle: (
    destinationHubId: string,
    hasFault: boolean,
    remarks: string,
  ) =>
    apiRequest<ActiveVehicleHold>('/rentals/return', {
      method: 'POST',
      body: JSON.stringify({ destinationHubId, hasFault, remarks }),
    }),

  // Parking & Charging
  listChargingPoints: () => apiRequest<ChargingPoint[]>('/charging/points'),
  getActiveParking: () =>
    apiRequest<ActiveParkingAndCharging | null>('/parking/active'),
  reserveParking: (payload: ReserveParkingPayload) =>
    apiRequest<ActiveParkingAndCharging>('/parking/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelParking: () =>
    apiRequest<{ ok: boolean }>('/parking/active', { method: 'DELETE' }),
  checkInParking: () =>
    apiRequest<ActiveParkingAndCharging>('/parking/checkin', {
      method: 'POST',
    }),
  startCharging: (payload: {
    portId: string;
    portCode: string;
    connectorType: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC';
    targetSocPercent: number;
  }) =>
    apiRequest<ActiveParkingAndCharging>('/charging/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  tickCharging: () =>
    apiRequest<ActiveParkingAndCharging | null>('/charging/progress', {
      method: 'POST',
    }),
  recoverCharging: (mode: 'RESUME' | 'REASSIGN', newPortCode?: string) =>
    apiRequest<ActiveParkingAndCharging>('/charging/recover', {
      method: 'POST',
      body: JSON.stringify({ mode, newPortCode }),
    }),
  stopChargingKeepParking: () =>
    apiRequest<ActiveParkingAndCharging | null>('/charging/stop', {
      method: 'POST',
    }),
  exitHubReleaseBay: () =>
    apiRequest<ActiveParkingAndCharging | null>('/charging/exit', {
      method: 'POST',
    }),

  // Incidents
  listIncidents: () => apiRequest<IncidentRecord[]>('/incidents'),
  isolateIncident: (incidentId: string, assignedCrew?: string) =>
    apiRequest<IncidentRecord>(`/incidents/${incidentId}/isolate`, {
      method: 'POST',
      body: JSON.stringify({ assignedCrew }),
    }),
};
