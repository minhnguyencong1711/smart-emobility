import type {
  ActiveParkingAndCharging,
  ChargingPoint,
  DlbLogEntry,
  IncidentRecord,
  MobilityHub,
  RedistributionOrder,
  SimulationScenario,
} from '@/types';

export function applyIncidentIsolation(params: {
  incidentId: string;
  assignedCrew?: string;
  incidents: IncidentRecord[];
  chargingPoints: ChargingPoint[];
  activeParking: ActiveParkingAndCharging | null;
}) {
  const { incidentId, assignedCrew, incidents, chargingPoints, activeParking } =
    params;
  const target = incidents.find((inc) => inc.id === incidentId);
  const isActivePortAffected =
    target &&
    activeParking &&
    activeParking.chargingPortId === target.resourceId;

  return {
    incidents: incidents.map((inc) =>
      inc.id === incidentId
        ? {
            ...inc,
            status: 'ISOLATED' as const,
            assignedCrew: assignedCrew ?? inc.assignedCrew,
          }
        : inc,
    ),
    chargingPoints: target
      ? chargingPoints.map((cp) =>
          cp.id === target.resourceId
            ? { ...cp, status: 'ISOLATED' as const, currentPowerKw: 0 }
            : cp,
        )
      : chargingPoints,
    activeParking: isActivePortAffected
      ? {
          ...activeParking,
          chargingStatus: 'INTERRUPTED' as const,
          currentKw: 0,
          interruptionReason: `Remote safety isolation triggered for ${target.resourceCode}. Parking bay remains reserved.`,
        }
      : activeParking,
  };
}

export function buildRedistributionOrder(payload: {
  sourceHubId: string;
  destinationHubId: string;
  vehicleCount: number;
  assignedCrew: string;
}): RedistributionOrder {
  return {
    id: `ro-${Date.now()}`,
    code: `ORD-${Math.floor(6768 + Math.random() * 200)}`,
    sourceHubId: payload.sourceHubId,
    destinationHubId: payload.destinationHubId,
    vehicleCount: payload.vehicleCount,
    reservedDestinationBays: payload.vehicleCount,
    status: 'DISPATCHED',
    assignedCrew: payload.assignedCrew,
    createdAt: 'Just now',
  };
}

export function applyRedistributionHubTransfers(params: {
  order: RedistributionOrder | undefined;
  status: RedistributionOrder['status'];
  hubs: MobilityHub[];
}): MobilityHub[] {
  const { order, status, hubs } = params;
  const isFinishing =
    status === 'COMPLETED' ||
    status === 'PARTIAL_COMPLETED' ||
    status === 'CANCELLED';

  if (!order || !isFinishing) return hubs;

  return hubs.map((h) => {
    if (h.id === order.destinationHubId) {
      return {
        ...h,
        reservedInboundBays: Math.max(
          0,
          h.reservedInboundBays - order.reservedDestinationBays,
        ),
        sharedEvsReady:
          status === 'CANCELLED'
            ? h.sharedEvsReady
            : h.sharedEvsReady + order.vehicleCount,
      };
    }
    if (h.id === order.sourceHubId && status !== 'CANCELLED') {
      return {
        ...h,
        sharedEvsReady: Math.max(0, h.sharedEvsReady - order.vehicleCount),
      };
    }
    return h;
  });
}

export function applySimulationAdvisoryApproval(params: {
  simId: string;
  recId: string;
  simulations: SimulationScenario[];
  redistributionOrders: RedistributionOrder[];
  dlbActivityLogs: DlbLogEntry[];
}) {
  const { simId, recId, simulations, redistributionOrders, dlbActivityLogs } =
    params;
  const sim = simulations.find((s) => s.id === simId);
  const rec = sim?.recommendations.find((r) => r.id === recId);

  const nextOrders =
    rec?.targetType === 'REDISTRIBUTION'
      ? [
          {
            id: `ro-sim-${Date.now()}`,
            code: `ORD-SIM-${Math.floor(100 + Math.random() * 899)}`,
            sourceHubId: 'hub-dorm-b',
            destinationHubId: 'hub-suoi-tien',
            vehicleCount: 8,
            reservedDestinationBays: 8,
            status: 'DISPATCHED' as const,
            assignedCrew: 'Đinh Phạm Ngọc Phước',
            createdAt: 'From Simulation Advisory',
          },
          ...redistributionOrders,
        ]
      : redistributionOrders;

  const nextLogs =
    rec?.targetType === 'SCHEDULING'
      ? [
          {
            id: `dlb-m5-${Date.now()}`,
            time: '[09:18:00]',
            level: 'SYSTEM' as const,
            message: `ADVISORY APPROVED: ${rec.title} dispatched to Smart Charging.`,
          },
          ...dlbActivityLogs,
        ]
      : dlbActivityLogs;

  return {
    simulations: simulations.map((s) =>
      s.id === simId
        ? {
            ...s,
            recommendations: s.recommendations.map((r) =>
              r.id === recId ? { ...r, approvedToM4: true } : r,
            ),
          }
        : s,
    ),
    redistributionOrders: nextOrders,
    dlbActivityLogs: nextLogs,
  };
}
