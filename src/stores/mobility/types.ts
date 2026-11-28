import type { StateCreator } from 'zustand';

import type {
  ActionResult,
  ActiveParkingAndCharging,
  ActiveVehicleHold,
  ChargingPoint,
  ChargingQueueEntry,
  ChargingSessionStatus,
  DlbLogEntry,
  DlbMode,
  IncidentRecord,
  MobilityHub,
  RedistributionOrder,
  ReserveParkingPayload,
  SharedVehicle,
  SimulationScenario,
  SystemPolicyConfig,
  TripHistoryItem,
} from '@/types';

export type {
  ActionResult,
  ActiveParkingAndCharging,
  ActiveVehicleHold,
  DlbLogEntry,
  DlbMode,
  ReserveParkingPayload,
  TripHistoryItem,
};

export type FleetSlice = {
  policyConfig: SystemPolicyConfig;
  hubs: MobilityHub[];
  sharedVehicles: SharedVehicle[];
  updatePolicyConfig: (partial: Partial<SystemPolicyConfig>) => void;
};

export type RentalSlice = {
  activeVehicleHold: ActiveVehicleHold | null;
  tripHistory: TripHistoryItem[];
  reserveVehicle: (
    vehicleId: string,
    pickupDate: string,
    pickupTime: string,
  ) => Promise<ActionResult>;
  tickHoldCountdown: () => void;
  expireVehicleHold: () => void;
  cancelVehicleHold: () => void;
  unlockReservedVehicle: () => void;
  startDemoActiveTrip: (vehicleId?: string) => void;
  tickActiveTrip: () => void;
  completeVehicleReturn: (
    destinationHubId: string,
    hasFault: boolean,
    remarks: string,
  ) => Promise<ActionResult>;
  clearReturnedTrip: () => void;
};

export type OverdueVehicleRecord = {
  plate: string;
  bay: string;
  owner: string;
  hubId: string;
  overdueMins: number;
};

export type ChargingSlice = {
  chargingPoints: ChargingPoint[];
  chargingQueue: ChargingQueueEntry[];
  activeParking: ActiveParkingAndCharging | null;
  dlbMode: DlbMode;
  chargingScheduleApplied: boolean;
  chargingScheduleGeneratedAt: string;
  chargingScheduleOptimized: boolean;
  dlbActivityLogs: DlbLogEntry[];
  setChargingSessionStatus: (
    status: ChargingSessionStatus,
    reason?: string,
  ) => void;
  reserveParkingBay: (payload: ReserveParkingPayload) => Promise<ActionResult>;
  cancelParkingReservation: () => void;
  checkInParkingPass: () => void;
  bookChargingSession: (
    portId: string,
    portCode: string,
    connectorType: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC',
    targetSocPercent: number,
  ) => void;
  tickChargingProgress: () => void;
  resumeInterruptedCharging: () => void;
  reassignChargingPort: (newPortCode: string) => void;
  stopChargingKeepParking: () => void;
  exitHubReleaseBay: () => void;
  setDlbMode: (mode: DlbMode) => void;
  generateChargingSchedule: () => void;
  applyChargingSchedule: () => void;
};

export type OperationsSlice = {
  incidents: IncidentRecord[];
  redistributionOrders: RedistributionOrder[];
  overdueVehicles: OverdueVehicleRecord[];
  warnedOverduePlates: string[];
  isolateIncidentEquipment: (
    incidentId: string,
    assignedCrew?: string,
    dispatchNotes?: string,
  ) => void;
  warnOverdueVehicle: (plate: string) => void;
  ejectOverdueParkingBay: (hubId: string, plate: string) => void;
  createRedistributionOrder: (payload: {
    sourceHubId: string;
    destinationHubId: string;
    vehicleCount: number;
    assignedCrew: string;
  }) => ActionResult;
  updateRedistributionOrderStatus: (
    orderId: string,
    status: RedistributionOrder['status'],
  ) => void;
};

export type SimulationSlice = {
  simulations: SimulationScenario[];
  createSimulationScenario: (scenario: SimulationScenario) => void;
  approveSimulationRecommendationToM4: (simId: string, recId: string) => void;
};

export type MobilityState = FleetSlice &
  RentalSlice &
  ChargingSlice &
  OperationsSlice &
  SimulationSlice & {
    backendMode: 'online' | 'offline';
    hydrateFromBackend: () => Promise<void>;
    resetDemoState: () => void;
  };

export type MobilitySliceCreator<T> = StateCreator<MobilityState, [], [], T>;
