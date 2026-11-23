import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Badge, Button, Callout, PageHeader, StepNav } from '@/components/ui';
import { useInterval } from '@/hooks';
import { useMobilityStore, useToastStore } from '@/stores';

import { TripStepCondition } from './components/trip-step-condition';
import {
  TripReceiptModal,
  TripStepReceipt,
} from './components/trip-step-receipt';
import { TripStepVerify } from './components/trip-step-verify';
import { TripKpiRow } from './components/vehicle-detail-kpis';

export const Route = createFileRoute('/student/_student/vehicles/trip')({
  component: ActiveTripReturnPage,
});

function ActiveTripReturnPage() {
  const navigate = useNavigate();
  const {
    hubs,
    sharedVehicles,
    activeVehicleHold,
    tripHistory,
    startDemoActiveTrip,
    tickActiveTrip,
    completeVehicleReturn,
    clearReturnedTrip,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const isReturned = activeVehicleHold?.status === 'RETURNED';
  const [step, setStep] = useState<0 | 1 | 2>(isReturned ? 2 : 0);
  const [destinationHubId, setDestinationHubId] = useState(
    activeVehicleHold?.destinationHubId ?? 'hub-dorm-a',
  );
  const [hasFault, setHasFault] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [physicalLockChecked, setPhysicalLockChecked] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (activeVehicleHold?.status === 'RETURNED') {
      setStep(2);
    }
  }, [activeVehicleHold?.status]);

  useInterval(
    tickActiveTrip,
    activeVehicleHold?.status === 'ACTIVE_TRIP' ? 1000 : null,
  );

  const vehicle =
    sharedVehicles.find((v) => v.id === activeVehicleHold?.vehicleId) ??
    sharedVehicles[0];
  const originHub =
    hubs.find((h) => h.id === (activeVehicleHold?.hubId ?? vehicle.hubId)) ??
    hubs[3];
  const destHub = hubs.find((h) => h.id === destinationHubId) ?? hubs[1];

  const freeBays =
    destHub.coreBaysTotal -
    destHub.coreBaysOccupied +
    (destHub.bufferBaysTotal - destHub.bufferBaysOccupied);
  const durationMins = Math.max(
    1,
    Math.round((activeVehicleHold?.elapsedSeconds ?? 27 * 60) / 60),
  );

  function handleConfirmReturn() {
    if (!physicalLockChecked) {
      pushToast({
        tone: 'warn',
        title: 'Confirm physical lock first',
        description:
          'Please confirm the vehicle is parked in a bay and physically locked.',
      });
      return;
    }

    const res = completeVehicleReturn(destinationHubId, hasFault, remarks);
    if (!res.ok) {
      pushToast({
        tone: 'danger',
        title: 'Return validation failed',
        description: res.error,
      });
      return;
    }

    setStep(2);
    pushToast({
      tone: 'ok',
      title: 'Trip Completed Successfully',
      description: `${vehicle.code} returned to ${destHub.shortName}.`,
    });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title={step === 2 ? 'Trip Receipt' : 'Return Vehicle'}
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Shared Mobility', to: '/student/vehicles' },
          { label: 'Active Trip' },
          {
            label:
              step === 0
                ? 'Hub validation'
                : step === 1
                  ? 'Condition report'
                  : 'Completed return',
          },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="navy">{vehicle.code}</Badge>
            <Badge tone="neutral">{destHub.shortName}</Badge>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        {!activeVehicleHold ||
        (activeVehicleHold.status !== 'ACTIVE_TRIP' &&
          activeVehicleHold.status !== 'RETURNED') ? (
          <Callout
            tone="info"
            title="No active trip in session"
            description="Launch Trip T-2408 (EV-102 from HCMUT Campus 2 to Dormitory Zone A) to walk through all 3 return verification steps."
            action={
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  startDemoActiveTrip('veh-102');
                  setStep(0);
                }}
              >
                Start Active Trip (EV-102 · T-2408)
              </Button>
            }
          />
        ) : null}

        <TripKpiRow
          vehicle={vehicle}
          destHub={destHub}
          tripId={activeVehicleHold?.tripId ?? 'T-2408'}
          startedAt={activeVehicleHold?.startedAt}
          freeBays={freeBays}
          durationMins={durationMins}
          step={step}
        />

        <StepNav
          currentStepIndex={step}
          onStepClick={(idx) => {
            if (!isReturned && idx <= 1) setStep(idx as 0 | 1);
          }}
          steps={[
            {
              id: 'verify',
              label: 'Verify Hub',
              description: 'Geofence & capacity',
            },
            {
              id: 'report',
              label: 'Secure & Report',
              description: 'Lock & condition',
            },
            {
              id: 'receipt',
              label: 'Trip Receipt',
              description: 'Completed outcome',
            },
          ]}
        />

        {step === 0 ? (
          <TripStepVerify
            hubs={hubs}
            originHubId={originHub.id}
            destinationHubId={destinationHubId}
            destHub={destHub}
            freeBays={freeBays}
            onSelectDestinationHub={setDestinationHubId}
            onContinue={() => setStep(1)}
          />
        ) : null}

        {step === 1 ? (
          <TripStepCondition
            hubs={hubs}
            vehicle={vehicle}
            originHub={originHub}
            destHub={destHub}
            tripId={activeVehicleHold?.tripId ?? 'T-2408'}
            durationMins={durationMins}
            hasFault={hasFault}
            remarks={remarks}
            physicalLockChecked={physicalLockChecked}
            onHasFaultChange={setHasFault}
            onRemarksChange={setRemarks}
            onPhysicalLockChange={setPhysicalLockChecked}
            onBackStep={() => setStep(0)}
            onConfirmReturn={handleConfirmReturn}
          />
        ) : null}

        {step === 2 ? (
          <TripStepReceipt
            originHub={originHub}
            destHub={destHub}
            hasFault={hasFault}
            tripHistory={tripHistory}
            onOpenReceipt={() => setReceiptModalOpen(true)}
            onFindAnother={() => {
              clearReturnedTrip();
              navigate({ to: '/student/vehicles' });
            }}
          />
        ) : null}
      </div>

      <TripReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        vehicle={vehicle}
        originHub={originHub}
        destHub={destHub}
      />
    </div>
  );
}
