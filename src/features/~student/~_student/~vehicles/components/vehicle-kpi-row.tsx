import { Link } from '@tanstack/react-router';

import {
  BatteryIcon,
  BikeIcon,
  MapPinIcon,
  ScooterIcon,
} from '@/components/icons';
import { StatCard } from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';
import { cn } from '@/utils/cn';

export function VehicleKpiRow({
  readyUnits,
  totalShared,
  avgSoC,
  eligibleCount,
  hubCount,
  activeHubsCount,
}: {
  readyUnits: number;
  totalShared: number;
  avgSoC: number;
  eligibleCount: number;
  hubCount: number;
  activeHubsCount: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="SHARED EV FLEET"
        value={readyUnits}
        denominator={`/ ${totalShared} units`}
        badgeText="68.9% Ready"
        badgeTone="primary"
        icon={<BikeIcon size={18} />}
        iconTone="primary"
        progress={69}
        progressTone="primary"
        footerLeft={`Avg. Battery SoC: ${avgSoC}%`}
        footerRight="1 Hub in Deficit"
        footerRightTone="danger"
      />
      <StatCard
        title="AVAILABLE FOR RENT"
        value={eligibleCount}
        denominator="vehicles"
        badgeText="Live Status"
        badgeTone="eco"
        icon={<BatteryIcon size={18} />}
        iconTone="eco"
        progress={80}
        progressTone="eco"
        footerLeft={`At ${activeHubsCount} of ${hubCount} hubs`}
        footerRight="Rental-Ready"
        footerRightTone="eco"
      />
      <StatCard
        title="OPERATIONAL MOBILITY HUBS"
        value={hubCount}
        denominator={`/ ${hubCount} hubs`}
        badgeText="100% Online"
        badgeTone="ok"
        icon={<MapPinIcon size={18} />}
        iconTone="eco"
        progress={100}
        progressTone="eco"
        footerLeft="Campus & Dorms"
        footerRight="Network Active"
        footerRightTone="eco"
      />
      <StatCard
        title="SHARED VEHICLE TYPES"
        value={2}
        denominator="types"
        badgeText="E-Bike & E-MC"
        badgeTone="warn"
        icon={<ScooterIcon size={18} />}
        iconTone="warn"
        progress={75}
        progressTone="warn"
        footerLeft="E-bike & e-moto"
        footerRight="Active Fleet"
      />
    </div>
  );
}

export function CompactVehicleCard({
  vehicle,
  hub,
  isFirst = false,
}: {
  vehicle: SharedVehicle;
  hub?: MobilityHub;
  isFirst?: boolean;
}) {
  const isBike = vehicle.type === 'E_BIKE';
  const walkMins = vehicle.walkMins ?? hub?.walkMins ?? 5;

  return (
    <div
      className={cn(
        'rounded-lg border bg-surface p-3 transition-colors',
        isFirst
          ? 'border-primary/60 shadow-card'
          : 'border-line hover:border-primary/50',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary-soft text-primary-700">
          {isBike ? <BikeIcon size={22} /> : <ScooterIcon size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-extrabold text-ink">
              {vehicle.code}
            </span>
            <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ok-700">
              AVAILABLE
            </span>
          </div>
          <p className="mt-0.5 text-caption font-medium text-ink-2">
            {isBike ? 'E-Bike' : 'E-Motorcycle'}
          </p>
          <p className="inline-flex items-center gap-1 text-caption text-ink-3">
            <MapPinIcon size={12} className="shrink-0" />
            <span className="truncate">{hub?.name ?? 'Campus Hub'}</span>
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[11.5px]">
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold text-ink">
            <BatteryIcon size={13} className="text-eco-700" />
            {vehicle.batterySoC}% SoC
          </span>
          <span className="text-ink-muted">·</span>
          <span className="truncate whitespace-nowrap text-ink-3">
            {walkMins} min walk
          </span>
        </div>

        <Link
          to="/student/vehicles/$id"
          params={{ id: vehicle.id }}
          className="shrink-0"
        >
          <span className="inline-flex items-center whitespace-nowrap rounded-sm border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11.5px] font-bold text-primary-700 transition-colors hover:bg-primary hover:text-white">
            View Details →
          </span>
        </Link>
      </div>
    </div>
  );
}
