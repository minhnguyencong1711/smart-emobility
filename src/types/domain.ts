export type UserRole = 'STUDENT' | 'OPERATOR' | 'FIELD_CREW' | 'ADMIN';

export type HubStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE';

export type VehicleType = 'E_BIKE' | 'E_MOTORCYCLE';

export type VehicleStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'IN_USE'
  | 'CHARGING'
  | 'CHARGING_QUEUE'
  | 'OUT_OF_SERVICE';

export type ReservationStatus =
  'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';

export type RentalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type ChargingSessionStatus =
  | 'PENDING'
  | 'READY'
  | 'CHARGING'
  | 'THROTTLED'
  | 'INTERRUPTED'
  | 'REASSIGNED'
  | 'CHARGING_COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type IncidentStatus =
  | 'REPORTED'
  | 'INVESTIGATING'
  | 'ISOLATED'
  | 'UNDER_REPAIR'
  | 'RESOLVED'
  | 'CLOSED';

export type ChargingScheduleStatus =
  'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type RedistributionStatus =
  | 'CREATED'
  | 'DISPATCHED'
  | 'IN_PROGRESS'
  | 'REROUTED'
  | 'PARTIAL_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SimulationStatus =
  'DRAFT' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type SimulationScenarioType =
  | 'DEMAND_SURGE'
  | 'PARKING_OVERLOAD'
  | 'CHARGING_SURGE'
  | 'CHARGER_FAILURE'
  | 'VEHICLE_IMBALANCE';

export type SystemPolicyConfig = {
  gracePeriodMins: number;
  gridWarningThreshold: number;
  gridCriticalThreshold: number;
  baySaturationThreshold: number;
  minDispatchSoC: number;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  role: UserRole;
  title: string;
};

export type MobilityHub = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  location: string;
  status: HubStatus;
  lat: number;
  lng: number;
  walkMins: number;
  cardAnchorOffset?: [number, number];
  mapX: number;
  mapY: number;
  coreBaysTotal: number;
  coreBaysOccupied: number;
  bufferBaysTotal: number;
  bufferBaysOccupied: number;
  reservedInboundBays: number;
  gridMaxKw: number;
  gridCurrentKw: number;
  chargerPortsTotal: number;
  chargerPortsActive: number;
  sharedEvsTotal: number;
  sharedEvsReady: number;
  avgBatterySoC: number;
};

export type SharedVehicle = {
  id: string;
  code: string;
  model: string;
  type: VehicleType;
  hubId: string;
  batterySoC: number;
  rangeKm: number;
  ratePerMinVnd: number;
  walkMins?: number;
  status: VehicleStatus;
};

export type ChargingPoint = {
  id: string;
  code: string;
  hubId: string;
  connectorType: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC';
  maxPowerKw: number;
  currentPowerKw: number;
  status: 'AVAILABLE' | 'CHARGING' | 'THROTTLED' | 'FAULTY' | 'ISOLATED';
  earthLeakageMa: number;
};

export type ChargingQueueEntry = {
  id: string;
  plateNumber: string;
  tier: 1 | 2 | 3;
  tierLabel: string;
  hubId: string;
  socPercent: number;
  status: 'AVAILABLE' | 'RESERVED' | 'CRITICAL' | 'CHARGING' | 'THROTTLED';
  allocatedKw: number;
};

export type IncidentRecord = {
  id: string;
  code: string;
  hubId: string;
  resourceId: string;
  resourceCode: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  description: string;
  telemetryReading: string;
  reportedAt: string;
  assignedCrew?: string;
};

export type RedistributionOrder = {
  id: string;
  code: string;
  sourceHubId: string;
  destinationHubId: string;
  vehicleCount: number;
  reservedDestinationBays: number;
  status: RedistributionStatus;
  assignedCrew: string;
  createdAt: string;
};

export type SimulationRecommendation = {
  id: string;
  title: string;
  targetType: 'SCHEDULING' | 'REDISTRIBUTION';
  summary: string;
  expectedWaitReductionPct: number;
  approvedToM4: boolean;
};

export type SimulationScenario = {
  id: string;
  name: string;
  type: SimulationScenarioType;
  selectedHubIds: string[];
  demandMultiplier: number;
  durationHours: number;
  timeStepMins: number;
  status: SimulationStatus;
  utilizationRatePct?: number;
  avgWaitingTimeMins?: number;
  recommendations: SimulationRecommendation[];
};
