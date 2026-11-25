import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { ArrowLeftIcon } from '@/components/icons';
import { Badge, Button, ConfirmDialog, PageHeader } from '@/components/ui';
import { useInterval } from '@/hooks';
import { useMobilityStore, useToastStore } from '@/stores';
import { buildUpcomingPickupTimes, formatDateShort } from '@/utils/date-time';

import { VehicleDetailKpis } from './components/vehicle-detail-kpis';
import { VehicleReservePanel } from './components/vehicle-reserve-panel';
import { VehicleSpecPanel } from './components/vehicle-spec-panel';

export const Route = createFileRoute('/student/_student/vehicles/$id')({
  component: VehicleDetailPage,
});

function VehicleDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    hubs,
    sharedVehicles,
    policyConfig,
    activeVehicleHold,
    reserveVehicle,
    tickHoldCountdown,
    expireVehicleHold,
    cancelVehicleHold,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const vehicle = sharedVehicles.find((v) => v.id === id) ?? sharedVehicles[0];
  const hub = hubs.find((h) => h.id === vehicle.hubId) ?? hubs[0];

  const [pickupDate, setPickupDate] = useState(() => formatDateShort(0));
  const [pickupTime, setPickupTime] = useState(
    () => buildUpcomingPickupTimes()[0],
  );
  const [cancelOpen, setCancelOpen] = useState(false);

  const isThisVehicleHeld =
    activeVehicleHold?.vehicleId === vehicle.id &&
    activeVehicleHold.status === 'CONFIRMED';
  const isThisVehicleExpired =
    activeVehicleHold?.vehicleId === vehicle.id &&
    activeVehicleHold.status === 'EXPIRED';

  useInterval(tickHoldCountdown, isThisVehicleHeld ? 1000 : null);

  const pageTitle = isThisVehicleHeld
    ? 'Reservation Confirmed'
    : isThisVehicleExpired
      ? 'Reservation Expired'
      : 'Vehicle Details';
  const breadcrumbLeaf = isThisVehicleHeld
    ? 'Active Hold'
    : isThisVehicleExpired
      ? 'Expired'
      : 'Vehicle Details';

  async function handleReserve() {
    const res = await reserveVehicle(vehicle.id, pickupDate, pickupTime);
    if (!res.ok) {
      pushToast({
        tone: 'warn',
        title: 'Reservation blocked',
        description: res.error,
      });
      return;
    }
    pushToast({
      tone: 'ok',
      title: 'Reservation Confirmed',
      description: `${vehicle.code} held for ${policyConfig.gracePeriodMins} minutes.`,
    });
  }

  function handleConfirmCancel() {
    cancelVehicleHold();
    setCancelOpen(false);
    pushToast({
      tone: 'info',
      title: 'Reservation cancelled',
      description: `${vehicle.code} has been released back to the fleet.`,
    });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title={pageTitle}
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Shared Mobility', to: '/student/vehicles' },
          { label: 'Vehicle Catalogue', to: '/student/vehicles' },
          { label: breadcrumbLeaf },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/student/vehicles">
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={<ArrowLeftIcon size={14} />}
              >
                Vehicle Catalogue
              </Button>
            </Link>
            <Badge tone="navy">{vehicle.code}</Badge>
            <Badge tone="neutral">{hub.name}</Badge>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <VehicleDetailKpis
          vehicle={vehicle}
          hub={hub}
          isThisVehicleHeld={isThisVehicleHeld}
          isThisVehicleExpired={isThisVehicleExpired}
          remainingSeconds={activeVehicleHold?.remainingSeconds}
          gracePeriodMins={policyConfig.gracePeriodMins}
        />

        <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
          <VehicleSpecPanel
            hubs={hubs}
            hub={hub}
            vehicle={vehicle}
            isThisVehicleHeld={isThisVehicleHeld}
            isThisVehicleExpired={isThisVehicleExpired}
          />
          <VehicleReservePanel
            vehicle={vehicle}
            hub={hub}
            gracePeriodMins={policyConfig.gracePeriodMins}
            activeVehicleHold={activeVehicleHold}
            isThisVehicleHeld={isThisVehicleHeld}
            isThisVehicleExpired={isThisVehicleExpired}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            onPickupDateChange={setPickupDate}
            onPickupTimeChange={setPickupTime}
            onReserve={handleReserve}
            onProceedPickup={() => navigate({ to: '/student/vehicles/unlock' })}
            onOpenCancel={() => setCancelOpen(true)}
            onSimulateExpiry={() => {
              expireVehicleHold();
              pushToast({
                tone: 'warn',
                title: 'Reservation hold expired',
                description: `${vehicle.code} hold was released back to ${hub.shortName}.`,
              });
            }}
          />
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Active Vehicle Hold?"
        description={`Are you sure you want to release ${vehicle.code} at ${hub.shortName}?`}
        confirmLabel="Cancel Reservation"
        cancelLabel="Keep Hold"
        destructive
      />
    </div>
  );
}
