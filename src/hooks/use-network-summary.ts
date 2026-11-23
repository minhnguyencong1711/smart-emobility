import { useMemo } from 'react';

import { useMobilityStore } from '@/stores';
import { countAvailableVehiclesByHub } from '@/utils/hub-metrics';

export function useNetworkSummary() {
  const hubs = useMobilityStore((s) => s.hubs);
  const sharedVehicles = useMobilityStore((s) => s.sharedVehicles);

  return useMemo(() => {
    const totalSharedEvs = hubs.reduce(
      (sum, hub) => sum + hub.sharedEvsTotal,
      0,
    );
    const totalReadyEvs = hubs.reduce(
      (sum, hub) => sum + hub.sharedEvsReady,
      0,
    );
    const avgBatterySoC =
      hubs.length > 0
        ? Math.round(
            hubs.reduce((sum, hub) => sum + hub.avgBatterySoC, 0) / hubs.length,
          )
        : 0;

    const criticalCount = hubs.filter((h) => h.status === 'CRITICAL').length;
    const warningCount = hubs.filter((h) => h.status === 'WARNING').length;
    const normalCount = hubs.filter((h) => h.status === 'NORMAL').length;
    const onlineCount = hubs.filter((h) => h.status !== 'UNAVAILABLE').length;
    const availableVehiclesByHub = countAvailableVehiclesByHub(
      hubs,
      sharedVehicles,
    );
    const availableVehicleList = sharedVehicles.filter(
      (v) => v.status === 'AVAILABLE',
    );

    return {
      totalSharedEvs,
      totalReadyEvs,
      avgBatterySoC,
      criticalCount,
      warningCount,
      normalCount,
      onlineCount,
      availableVehiclesByHub,
      availableVehicleList,
    };
  }, [hubs, sharedVehicles]);
}
