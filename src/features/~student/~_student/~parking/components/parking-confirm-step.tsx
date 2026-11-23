import { CalendarIcon, ClockIcon } from '@/components/icons';
import { CampusHubMap, DetailRow } from '@/components/shared';
import { Button, Callout, Card, StatusPill } from '@/components/ui';
import type { MobilityHub } from '@/types';

export function ParkingConfirmStep({
  hubs,
  selectedHub,
  floor,
  selectedSlot,
  selectedHasCharger,
  vehicleChoice,
  arrivalDate,
  arrivalTime,
  durationHours,
  estCostVnd,
  gracePeriodMins,
  onEditSpot,
  onConfirmReserve,
}: {
  hubs: MobilityHub[];
  selectedHub: MobilityHub;
  floor: string;
  selectedSlot: string;
  selectedHasCharger: boolean;
  vehicleChoice: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: string;
  estCostVnd: number;
  gracePeriodMins: number;
  onEditSpot: () => void;
  onConfirmReserve: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-title font-extrabold text-ink">
              Confirm Parking Reservation
            </h2>
            <StatusPill tone="info" icon={<ClockIcon size={12} />}>
              Ready to hold
            </StatusPill>
          </div>

          <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
            <DetailRow label="Mobility Hub" value={selectedHub.name} />
            <DetailRow
              label="Selected Bay"
              value={`Floor ${floor} · BAY-${selectedSlot}${selectedHasCharger ? ' (Charging Port)' : ''}`}
              mono
            />
            <DetailRow
              label="Registered EV"
              value={vehicleChoice.replace('|', ' · ')}
            />
            <DetailRow
              label="Arrival Window"
              value={`${arrivalDate} · ${arrivalTime} (${durationHours}h)`}
            />
            <DetailRow
              label="Estimated Fee"
              value={`₫${estCostVnd.toLocaleString()}`}
              mono
            />
          </div>

          <Callout
            tone="info"
            title="Decoupled Parking & Charging Lifecycle"
            description="Reserving this bay secures your parking slot first. After gate check-in, you can book or stop charging without losing your bay."
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" fullWidth onClick={onEditSpot}>
            ← Edit Spot
          </Button>
          <Button
            variant="primary"
            fullWidth
            leadingIcon={<CalendarIcon size={16} />}
            onClick={onConfirmReserve}
          >
            Confirm &amp; View Check-in Code
          </Button>
        </div>
      </Card>

      <Card padding="md" className="space-y-3">
        <h3 className="text-body-lg font-extrabold text-ink">
          Hub Entrance &amp; Bay Location
        </h3>
        <CampusHubMap
          hubs={hubs}
          selectedHubId={selectedHub.id}
          variant="mini"
          className="h-64"
        />
        <p className="text-caption text-ink-3">
          Arrive within {gracePeriodMins} minutes of {arrivalTime} to keep bay{' '}
          {selectedSlot}.
        </p>
      </Card>
    </div>
  );
}
