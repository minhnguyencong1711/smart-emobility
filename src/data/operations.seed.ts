import type { IncidentRecord, RedistributionOrder } from '@/types';

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'inc-104',
    code: '#INC-2026-104',
    hubId: 'hub-dorm-b',
    resourceId: 'cp-b04',
    resourceCode: 'CP-B04 (DC 30kW Fast Charger)',
    severity: 'CRITICAL',
    status: 'REPORTED',
    description:
      'Earth leakage residual current exceeded 30 mA safety threshold on Charger Port CP-B04.',
    telemetryReading: 'ERR_GROUND_FAULT · 38.4 mA',
    reportedAt: '12 mins ago',
    assignedCrew: 'Đinh Phạm Ngọc Phước',
  },
  {
    id: 'inc-103',
    code: '#INC-2026-103',
    hubId: 'hub-suoi-tien',
    resourceId: 'veh-105',
    resourceCode: 'EV-128 (VinFast Electric Moped)',
    severity: 'CRITICAL',
    status: 'REPORTED',
    description:
      'Battery management system high-temperature threshold triggered during fast charge.',
    telemetryReading: 'ERR_BMS_TEMP_HIGH (62°C)',
    reportedAt: '28 mins ago',
    assignedCrew: 'Nguyễn Đức Trọng',
  },
  {
    id: 'inc-102',
    code: '#INC-2026-102',
    hubId: 'hub-dorm-a',
    resourceId: 'barrier-a01',
    resourceCode: 'BARRIER-A01 (Entrance Barrier Terminal)',
    severity: 'WARNING',
    status: 'INVESTIGATING',
    description:
      'QR / e-Pass scanner response latency exceeded 3000 ms timeout threshold.',
    telemetryReading: 'ERR_SCANNER_TIMEOUT',
    reportedAt: '45 mins ago',
    assignedCrew: 'Lead Hub Operator',
  },
  {
    id: 'inc-098',
    code: '#INC-2026-098',
    hubId: 'hub-dorm-a',
    resourceId: 'cp-a08',
    resourceCode: 'CP-A08 (AC 7kW Charger Port)',
    severity: 'WARNING',
    status: 'ISOLATED',
    description: 'Mechanical connector latch stuck in locked position.',
    telemetryReading: 'ERR_CABLE_LATCH_STUCK',
    reportedAt: '2 hours ago',
    assignedCrew: 'Ticket #TK-089',
  },
  {
    id: 'inc-095',
    code: '#INC-2026-095',
    hubId: 'hub-vnu-admin',
    resourceId: 'veh-503',
    resourceCode: 'EB-012 (Shared E-Bike)',
    severity: 'INFO',
    status: 'UNDER_REPAIR',
    description:
      'Electronic brake hall sensor drift detected during return check.',
    telemetryReading: 'ERR_BRAKE_SENSOR_DRIFT',
    reportedAt: '4 hours ago',
    assignedCrew: 'Đinh Phạm Ngọc Phước',
  },
];

export const INITIAL_REDISTRIBUTION_ORDERS: RedistributionOrder[] = [
  {
    id: 'ro-301',
    code: 'RO-2026-081',
    sourceHubId: 'hub-hcmut-2',
    destinationHubId: 'hub-dorm-b',
    vehicleCount: 5,
    reservedDestinationBays: 5,
    status: 'IN_PROGRESS',
    assignedCrew: 'Đinh Phạm Ngọc Phước',
    createdAt: '07:50 AM',
  },
];
