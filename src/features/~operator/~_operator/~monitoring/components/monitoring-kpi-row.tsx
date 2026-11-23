import {
  BikeIcon,
  BoltIcon,
  ChargingStationIcon,
  ParkingIcon,
} from '@/components/icons';
import { StatCard } from '@/components/ui';

export function MonitoringKpiRow({
  totalShared,
  totalOccupiedBays,
  totalBays,
  totalCoreOcc,
  totalCore,
  totalBufOcc,
  totalBuf,
  activeChargers,
  totalChargers,
  totalGridCurrent,
  totalGridMax,
  gridPct,
  gridWarningThreshold,
}: {
  totalShared: number;
  totalOccupiedBays: number;
  totalBays: number;
  totalCoreOcc: number;
  totalCore: number;
  totalBufOcc: number;
  totalBuf: number;
  activeChargers: number;
  totalChargers: number;
  totalGridCurrent: number;
  totalGridMax: number;
  gridPct: number;
  gridWarningThreshold: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="SHARED EV FLEET"
        value={124}
        denominator={`/ ${totalShared} units`}
        badgeText="68.9% Ready"
        badgeTone="primary"
        icon={<BikeIcon size={18} />}
        iconTone="primary"
        progress={69}
        progressTone="primary"
        footerLeft="Avg. Battery SoC: 78%"
        footerRight="1 Hub in Deficit"
        footerRightTone="danger"
      />
      <StatCard
        title="PARKING BAY SATURATION"
        value={totalOccupiedBays}
        denominator={`/ ${totalBays} bays`}
        badgeText={`${((totalOccupiedBays / totalBays) * 100).toFixed(1)}% occupied`}
        badgeTone="warn"
        icon={<ParkingIcon size={18} />}
        iconTone="warn"
        progress={Math.round((totalOccupiedBays / totalBays) * 100)}
        progressTone="warn"
        footerLeft={`Core: ${totalCoreOcc}/${totalCore}`}
        footerRight={`Dynamic Buffer: ${totalBufOcc}/${totalBuf}`}
      />
      <StatCard
        title="OPERATIONAL CHARGER PORTS"
        value={activeChargers}
        denominator={`/ ${totalChargers} ports`}
        badgeText={`${((activeChargers / totalChargers) * 100).toFixed(1)}% Active`}
        badgeTone="eco"
        icon={<ChargingStationIcon size={18} />}
        iconTone="eco"
        progress={Math.round((activeChargers / totalChargers) * 100)}
        progressTone="eco"
        footerLeft="36 EVs charging"
        footerRight={`Idle: ${totalChargers - activeChargers} ports`}
        footerRightTone="eco"
      />
      <StatCard
        title="SUBSTATION GRID DEMAND"
        value={totalGridCurrent}
        denominator={`/ ${totalGridMax} kW`}
        badgeText={`${gridPct}% Safe Load`}
        badgeTone={gridPct >= gridWarningThreshold ? 'warn' : 'ok'}
        icon={<BoltIcon size={18} />}
        iconTone="primary"
        progress={Math.round(gridPct)}
        progressTone={gridPct >= gridWarningThreshold ? 'warn' : 'eco'}
        footerLeft={`DLB Thresh: < ${gridWarningThreshold}%`}
        footerRight={
          gridPct >= gridWarningThreshold ? 'DLB Active' : 'Stable Grid'
        }
        footerRightTone={gridPct >= gridWarningThreshold ? 'warn' : 'eco'}
      />
    </div>
  );
}
