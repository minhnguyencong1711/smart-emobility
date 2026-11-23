import { CheckCircleIcon, ClockIcon } from '@/components/icons';
import { CampusHubMap, DetailRow } from '@/components/shared';
import { Badge, Card, StatusPill } from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';
import { cn } from '@/utils/cn';

export function VehicleSpecPanel({
  hubs,
  hub,
  vehicle,
  isThisVehicleHeld,
  isThisVehicleExpired,
}: {
  hubs: MobilityHub[];
  hub: MobilityHub;
  vehicle: SharedVehicle;
  isThisVehicleHeld: boolean;
  isThisVehicleExpired: boolean;
}) {
  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-title font-extrabold text-ink">Vehicle Overview</h2>
        <Badge
          tone={
            isThisVehicleHeld
              ? 'primary'
              : isThisVehicleExpired
                ? 'danger'
                : 'ok'
          }
        >
          {isThisVehicleHeld
            ? 'RESERVED FOR YOU'
            : isThisVehicleExpired
              ? 'RESERVATION EXPIRED'
              : 'Current selection'}
        </Badge>
      </div>

      <div
        className={cn(
          'rounded-lg border p-4',
          isThisVehicleExpired
            ? 'border-danger/30 bg-danger-soft'
            : isThisVehicleHeld
              ? 'border-primary/30 bg-primary-soft'
              : 'border-line bg-surface-2',
        )}
      >
        <p className="text-label font-bold uppercase tracking-wider text-ink-3">
          VNU-HCM E-MOBILITY
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-heading font-extrabold text-ink">
            {vehicle.type === 'E_BIKE'
              ? 'Electric Bicycle · E-Bike'
              : 'Electric Motorcycle · E-MC'}
          </h3>
          <StatusPill
            tone={
              isThisVehicleHeld
                ? 'info'
                : isThisVehicleExpired
                  ? 'danger'
                  : 'ok'
            }
            icon={
              isThisVehicleHeld ? (
                <ClockIcon size={12} />
              ) : (
                <CheckCircleIcon size={12} />
              )
            }
          >
            {isThisVehicleHeld
              ? 'RESERVED'
              : isThisVehicleExpired
                ? 'EXPIRED'
                : vehicle.status}
          </StatusPill>
        </div>
        <p className="mt-1 text-body-sm text-ink-2">
          {vehicle.model} · {hub.name} · {vehicle.batterySoC}% Battery
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-line bg-surface-2 p-3">
          <p className="font-mono text-title font-bold text-ink">
            {vehicle.batterySoC}% SoC
          </p>
          <p className="text-caption text-ink-3">Reported battery level</p>
        </div>
        <div className="rounded-md border border-line bg-surface-2 p-3">
          <p className="font-mono text-title font-bold text-ink">
            ~{vehicle.rangeKm} km
          </p>
          <p className="text-caption text-ink-3">Est. range</p>
        </div>
        <div className="rounded-md border border-line bg-surface-2 p-3">
          <p className="font-mono text-title font-bold text-ink">
            ~{vehicle.walkMins ?? hub.walkMins} min
          </p>
          <p className="text-caption text-ink-3">Walking time</p>
        </div>
      </div>

      <CampusHubMap hubs={hubs} selectedHubId={hub.id} variant="mini" />

      <div className="rounded-md border border-line bg-surface px-4 py-1">
        <DetailRow
          label="Vehicle category"
          value={
            vehicle.type === 'E_BIKE' ? 'Shared E-Bike' : 'Shared E-Motorcycle'
          }
        />
        <DetailRow label="Pickup Hub" value={hub.name} />
        <DetailRow label="Parking bay" value="Shown at pickup" />
        <DetailRow
          label="Rental rate"
          value={`${vehicle.ratePerMinVnd.toLocaleString()} VND / min (see rate at pickup)`}
        />
      </div>
    </Card>
  );
}
