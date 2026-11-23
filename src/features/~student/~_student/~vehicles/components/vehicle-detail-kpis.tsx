import {
  BatteryIcon,
  BikeIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ScooterIcon,
} from '@/components/icons';
import { StatCard } from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';

export function VehicleDetailKpis({
  vehicle,
  hub,
  isThisVehicleHeld,
  isThisVehicleExpired,
  remainingSeconds,
  gracePeriodMins,
}: {
  vehicle: SharedVehicle;
  hub: MobilityHub;
  isThisVehicleHeld: boolean;
  isThisVehicleExpired: boolean;
  remainingSeconds?: number;
  gracePeriodMins: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Selected Shared Vehicle"
        value={vehicle.code}
        badgeText={
          isThisVehicleHeld
            ? 'RESERVED'
            : isThisVehicleExpired
              ? 'EXPIRED'
              : vehicle.status
        }
        badgeTone={
          isThisVehicleHeld ? 'primary' : isThisVehicleExpired ? 'danger' : 'ok'
        }
        icon={
          vehicle.type === 'E_BIKE' ? (
            <BikeIcon size={18} />
          ) : (
            <ScooterIcon size={18} />
          )
        }
        iconTone="primary"
        progress={100}
        progressTone="primary"
        footerLeft={`Rental category: ${vehicle.type === 'E_BIKE' ? 'Electric bicycle' : 'E-Motorcycle'}`}
        footerRight="Ready to reserve"
        footerRightTone="eco"
      />
      <StatCard
        title="Current Battery Level"
        value={vehicle.batterySoC}
        denominator="% SoC"
        badgeText={vehicle.batterySoC >= 70 ? 'High battery' : 'Ready'}
        badgeTone="eco"
        icon={<BatteryIcon size={18} />}
        iconTone="eco"
        progress={vehicle.batterySoC}
        progressTone="eco"
        footerLeft="Latest sensor reading"
        footerRight="Ready for your trip"
        footerRightTone="eco"
      />
      <StatCard
        title="Pickup Mobility Hub"
        value={hub.shortName}
        badgeText="Operational"
        badgeTone="ok"
        icon={<MapPinIcon size={18} />}
        iconTone="primary"
        progress={85}
        progressTone="primary"
        footerLeft={hub.code}
        footerRight={`~${hub.walkMins} min walk`}
      />
      <StatCard
        title="Reservation Grace Period"
        value={
          isThisVehicleHeld
            ? Math.ceil((remainingSeconds ?? 0) / 60)
            : gracePeriodMins
        }
        denominator="minutes"
        badgeText={
          isThisVehicleHeld
            ? 'Live Hold'
            : isThisVehicleExpired
              ? 'Expired'
              : 'Configurable'
        }
        badgeTone={isThisVehicleExpired ? 'danger' : 'warn'}
        icon={<ClockIcon size={18} />}
        iconTone="warn"
        progress={isThisVehicleHeld ? 65 : 100}
        progressTone={isThisVehicleExpired ? 'danger' : 'warn'}
        footerLeft="After scheduled pickup time"
        footerRight="config.grace_period_mins"
      />
    </div>
  );
}

export function TripKpiRow({
  vehicle,
  destHub,
  tripId,
  startedAt,
  freeBays,
  durationMins,
  step,
}: {
  vehicle: SharedVehicle;
  destHub: MobilityHub;
  tripId: string;
  startedAt?: string;
  freeBays: number;
  durationMins: number;
  step: 0 | 1 | 2;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Shared Vehicle"
        value={vehicle.code}
        badgeText={step === 2 ? 'RETURNED' : 'IN USE'}
        badgeTone={step === 2 ? 'ok' : 'primary'}
        icon={<BikeIcon size={18} />}
        iconTone="primary"
        progress={100}
        progressTone={step === 2 ? 'eco' : 'primary'}
        footerLeft={`Rental category: ${vehicle.type === 'E_BIKE' ? 'E-Bike' : 'E-MC'}`}
        footerRight={`Trip ${tripId}`}
      />
      <StatCard
        title="Destination Mobility Hub"
        value={destHub.shortName}
        badgeText={freeBays > 0 ? 'Accepting' : 'Full'}
        badgeTone={freeBays > 0 ? 'ok' : 'danger'}
        icon={<MapPinIcon size={18} />}
        iconTone="eco"
        progress={76}
        progressTone={freeBays > 0 ? 'eco' : 'danger'}
        footerLeft={`Parking: ${destHub.coreBaysOccupied}/${destHub.coreBaysTotal} bays`}
        footerRight={`${freeBays} bays free`}
        footerRightTone="eco"
      />
      <StatCard
        title="Trip Duration"
        value={step === 2 ? durationMins + 1 : durationMins}
        denominator="min"
        badgeText={step === 2 ? 'Trip complete' : 'At return Hub'}
        badgeTone={step === 2 ? 'ok' : 'primary'}
        icon={<ClockIcon size={18} />}
        iconTone="primary"
        progress={step === 2 ? 100 : 80}
        progressTone="primary"
        footerLeft={`Start: ${startedAt ?? '10:40 AM'}`}
        footerRight="24 Oct 2026"
      />
      <StatCard
        title="Return Progress"
        value={`Step ${step + 1} / 3`}
        badgeText={step === 2 ? 'Complete' : '03 steps'}
        badgeTone={step === 2 ? 'ok' : 'warn'}
        icon={<CheckCircleIcon size={18} />}
        iconTone="warn"
        progress={Math.round(((step + 1) / 3) * 100)}
        progressTone={step === 2 ? 'eco' : 'warn'}
        footerLeft="Verify · Report · Receipt"
        footerRight="Trip lifecycle"
      />
    </div>
  );
}
