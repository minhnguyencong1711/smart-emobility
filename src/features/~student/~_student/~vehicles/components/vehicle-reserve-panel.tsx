import { Link } from '@tanstack/react-router';

import { CheckCircleIcon, ClockIcon } from '@/components/icons';
import { DetailRow } from '@/components/shared';
import {
  Button,
  Callout,
  Card,
  CountdownTimer,
  FilterChip,
  Select,
  StatusPill,
} from '@/components/ui';
import type { ActiveVehicleHold, MobilityHub, SharedVehicle } from '@/types';

const PICKUP_TIMES = ['10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM'];

type VehicleReservePanelProps = {
  vehicle: SharedVehicle;
  hub: MobilityHub;
  gracePeriodMins: number;
  activeVehicleHold: ActiveVehicleHold | null;
  isThisVehicleHeld: boolean;
  isThisVehicleExpired: boolean;
  pickupDate: string;
  pickupTime: string;
  onPickupDateChange: (val: string) => void;
  onPickupTimeChange: (val: string) => void;
  onReserve: () => void;
  onProceedPickup: () => void;
  onOpenCancel: () => void;
  onSimulateExpiry: () => void;
};

export function VehicleReservePanel({
  vehicle,
  hub,
  gracePeriodMins,
  activeVehicleHold,
  isThisVehicleHeld,
  isThisVehicleExpired,
  pickupDate,
  pickupTime,
  onPickupDateChange,
  onPickupTimeChange,
  onReserve,
  onProceedPickup,
  onOpenCancel,
  onSimulateExpiry,
}: VehicleReservePanelProps) {
  if (isThisVehicleHeld && activeVehicleHold) {
    return (
      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-title font-extrabold text-ink">
              Your Reservation
            </h2>
            <StatusPill tone="info" icon={<ClockIcon size={12} />}>
              Reserved
            </StatusPill>
          </div>

          <Callout
            tone="ok"
            title={`${vehicle.code} has been reserved for your upcoming pickup`}
            description="Arrive at the pickup hub before the grace deadline to scan the QR sticker and unlock."
          />

          <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
            <DetailRow
              label="Reservation ID"
              value={activeVehicleHold.reservationId}
              mono
            />
            <DetailRow
              label="Vehicle / Hub"
              value={`${vehicle.code} / ${hub.shortName}`}
            />
            <DetailRow
              label="Scheduled pickup"
              value={`${activeVehicleHold.pickupDate} · ${activeVehicleHold.pickupTime}`}
            />
            <DetailRow
              label="Pickup deadline"
              value={`${activeVehicleHold.pickupDate} · ${activeVehicleHold.deadlineLabel}`}
            />
          </div>

          <div className="flex flex-col items-center gap-2 rounded-lg border border-primary/25 bg-primary-soft p-4 text-center">
            <span className="text-caption font-semibold text-primary-700">
              TIME REMAINING TO PICK UP (Grace period: {gracePeriodMins} min)
            </span>
            <CountdownTimer
              secondsRemaining={activeVehicleHold.remainingSeconds}
              label="Hold expires in"
            />
          </div>

          <div className="space-y-2 rounded-md border border-line p-3.5 text-body-sm text-ink-2">
            <p className="font-bold text-ink">Pickup Checklist</p>
            <p className="flex items-center gap-2">
              <CheckCircleIcon size={15} className="text-eco-700" />
              Arrive at {hub.shortName} before {activeVehicleHold.deadlineLabel}
              .
            </p>
            <p className="flex items-center gap-2">
              <CheckCircleIcon size={15} className="text-eco-700" />
              Locate {vehicle.code} and continue to the QR pickup flow.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button variant="primary" fullWidth onClick={onProceedPickup}>
            Proceed to Pickup →
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" fullWidth onClick={onOpenCancel}>
              Cancel Reservation
            </Button>
            <Button variant="ghost" fullWidth onClick={onSimulateExpiry}>
              Simulate Grace Expiry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isThisVehicleExpired && activeVehicleHold) {
    return (
      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-title font-extrabold text-ink">
              Reservation Window Ended
            </h2>
            <StatusPill tone="danger" icon={<ClockIcon size={12} />}>
              EXPIRED
            </StatusPill>
          </div>

          <div className="border-danger/30 flex flex-col items-center gap-2 rounded-lg border bg-danger-soft p-4 text-center">
            <CountdownTimer secondsRemaining={0} label="Pickup window" />
            <p className="text-body-sm font-medium text-danger-700">
              Reservation status: EXPIRED
            </p>
          </div>

          <Callout
            tone="warn"
            title={`The pickup grace period for ${vehicle.code} has ended`}
            description={`Hold ${activeVehicleHold.reservationId} is no longer active. The vehicle may be available to other students if it remains operationally eligible.`}
          />
        </div>

        <div className="space-y-2">
          <Button variant="primary" fullWidth onClick={onReserve}>
            Reserve {vehicle.code} Again
          </Button>
          <Link to="/student/vehicles" className="block">
            <Button variant="secondary" fullWidth>
              Browse Available Vehicles
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" className="flex flex-col justify-between gap-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-title font-extrabold text-ink">
            Reserve This Vehicle
          </h2>
          <StatusPill
            tone={vehicle.status === 'AVAILABLE' ? 'ok' : 'warn'}
            icon={<CheckCircleIcon size={12} />}
          >
            {vehicle.status}
          </StatusPill>
        </div>

        <p className="text-body-sm text-ink-2">
          One active hold per student. Review your pickup details before
          submitting a reservation request.
        </p>

        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow
            label="Selected vehicle"
            value={`${vehicle.code} · ${vehicle.type === 'E_BIKE' ? 'E-Bike' : 'E-MC'}`}
          />
          <DetailRow label="Pickup Hub" value={hub.name} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Pickup Date"
            value={pickupDate}
            onChange={(e) => onPickupDateChange(e.target.value)}
            options={[
              { value: '24 Oct 2026', label: '24 Oct 2026' },
              { value: '25 Oct 2026', label: '25 Oct 2026' },
            ]}
          />
          <Select
            label="Pickup Time"
            value={pickupTime}
            onChange={(e) => onPickupTimeChange(e.target.value)}
            options={PICKUP_TIMES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-caption font-medium text-ink-3">
            Quick select:
          </span>
          {PICKUP_TIMES.slice(0, 3).map((t) => (
            <FilterChip
              key={t}
              size="sm"
              tone="primary"
              active={pickupTime === t}
              onClick={() => onPickupTimeChange(t)}
            >
              {t}
            </FilterChip>
          ))}
        </div>

        <Callout
          tone="primary"
          title={`Hold valid for ${gracePeriodMins} minutes after ${pickupTime}`}
          description={`Pickup deadline = scheduled pickup time + configured ${gracePeriodMins}-minute grace period.`}
        />

        <div className="space-y-1.5 text-caption text-ink-2">
          <p className="font-bold text-ink">Reservation Terms</p>
          <p>
            • A student may hold only one active shared-vehicle reservation.
          </p>
          <p>• The vehicle is held immediately after confirmation.</p>
          <p>• A missed pickup deadline automatically expires the hold.</p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Button
          variant="primary"
          fullWidth
          disabled={vehicle.status !== 'AVAILABLE'}
          onClick={onReserve}
        >
          Reserve Vehicle
        </Button>
        <Link to="/student/vehicles" className="block">
          <Button variant="secondary" fullWidth>
            Back to Vehicle Catalogue
          </Button>
        </Link>
      </div>
    </Card>
  );
}
