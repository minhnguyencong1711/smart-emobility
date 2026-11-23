import type { HubStatus, MobilityHub, SharedVehicle } from '@/types';

export function getHubOccupancyPctFromCounts(
  coreOccupied: number,
  coreTotal: number,
  bufferOccupied: number,
  bufferTotal: number,
): number {
  const total = coreTotal + bufferTotal;
  return total > 0
    ? Math.round(((coreOccupied + bufferOccupied) / total) * 100)
    : 0;
}

export function getHubOccupancyPct(hub: MobilityHub): number {
  return getHubOccupancyPctFromCounts(
    hub.coreBaysOccupied,
    hub.coreBaysTotal,
    hub.bufferBaysOccupied,
    hub.bufferBaysTotal,
  );
}

export function getHubPriorityRank(status: HubStatus): number {
  if (status === 'CRITICAL') return 0;
  if (status === 'WARNING') return 1;
  if (status === 'UNAVAILABLE') return 2;
  return 3;
}

export function countAvailableVehiclesByHub(
  hubs: MobilityHub[],
  vehicles: SharedVehicle[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  hubs.forEach((hub) => {
    counts[hub.id] = vehicles.filter(
      (vehicle) => vehicle.hubId === hub.id && vehicle.status === 'AVAILABLE',
    ).length;
  });
  return counts;
}
