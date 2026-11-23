import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { Button, PageHeader } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import { ParkingConfirmStep } from './components/parking-confirm-step';
import { ParkingSelectionGrid } from './components/parking-floor-grid';
import {
  ParkingHeaderKpis,
  ParkingModals,
} from './components/parking-header-kpis';
import {
  getSlotStatus,
  hasChargingPort,
  PARKING_NUMBERS,
  PARKING_ROWS,
  VEHICLE_OPTIONS,
  type ParkingExceptionMode,
} from './utils/parking-slots';

export const Route = createFileRoute('/student/_student/parking/')({
  component: ParkingReservationPage,
});

function ParkingReservationPage() {
  const navigate = useNavigate();
  const {
    hubs,
    policyConfig,
    activeParking,
    reserveParkingBay,
    cancelParkingReservation,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [hubId, setHubId] = useState(hubs[0].id);
  const [vehicleChoice, setVehicleChoice] = useState(VEHICLE_OPTIONS[0].value);
  const [arrivalDate, setArrivalDate] = useState('Wed. Oct 08, 2026');
  const [arrivalTime, setArrivalTime] = useState('16:30');
  const [durationHours, setDurationHours] = useState('3');
  const [floor, setFloor] = useState('1');
  const [selectedSlot, setSelectedSlot] = useState('A10');
  const [stepIndex, setStepIndex] = useState<0 | 1>(0);
  const [exceptionMode, setExceptionMode] =
    useState<ParkingExceptionMode>('NORMAL');
  const [termsOpen, setTermsOpen] = useState(false);
  const [cancelStep1Open, setCancelStep1Open] = useState(false);
  const [cancelStep2Open, setCancelStep2Open] = useState(false);

  const selectedHub = hubs.find((h) => h.id === hubId) ?? hubs[0];
  const freeParking =
    exceptionMode === 'HUB_FULL'
      ? 0
      : Math.max(0, selectedHub.coreBaysTotal - selectedHub.coreBaysOccupied);
  const occPct =
    exceptionMode === 'HUB_FULL'
      ? 100
      : Math.round(
          (selectedHub.coreBaysOccupied / selectedHub.coreBaysTotal) * 100,
        );

  const slots = useMemo(
    () =>
      PARKING_ROWS.flatMap((r) =>
        PARKING_NUMBERS.map((n) => ({
          code: `${r}${n}`,
          row: r,
          status: getSlotStatus(r, n, Number(floor)),
          charger: hasChargingPort(r, n),
        })),
      ),
    [floor],
  );

  const selectedHasCharger = hasChargingPort(
    selectedSlot[0],
    selectedSlot.slice(1),
  );
  const estCostVnd = Number(durationHours) * 5000;

  function handleProceedConfirm() {
    if (exceptionMode === 'HUB_FULL') {
      pushToast({
        tone: 'danger',
        title: 'Hub Full Capacity',
        description: `${selectedHub.shortName} has 0 available parking bays.`,
      });
      return;
    }
    if (exceptionMode === 'DUPLICATE_HOLD') {
      pushToast({
        tone: 'warn',
        title: 'Duplicate Hold Detected',
        description:
          'You already hold an active parking reservation (PRK-2026-041).',
      });
      return;
    }
    if (exceptionMode === 'DB_SYNC_FAILURE') {
      pushToast({
        tone: 'danger',
        title: 'Database Sync Failure',
        description:
          'Could not synchronize bay lock with station controller. Please retry.',
      });
      return;
    }
    setStepIndex(1);
  }

  function handleConfirmReserve() {
    const [vehicleModel, plateNumber] = vehicleChoice.split('|');
    const res = reserveParkingBay({
      hubId,
      bayCode: selectedSlot,
      floor: Number(floor),
      vehicleModel,
      plateNumber,
      arrivalDate,
      arrivalTime,
      durationHours: Number(durationHours),
    });
    if (!res.ok) {
      pushToast({
        tone: 'danger',
        title: 'Reservation blocked',
        description: res.error,
      });
      return;
    }
    pushToast({
      tone: 'ok',
      title: `Bay ${selectedSlot} reserved`,
      description: `Electronic e-Pass issued for ${selectedHub.shortName}.`,
    });
    navigate({ to: '/student/parking/pass' });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Reserve Parking Space"
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Personal Charging' },
          { label: 'Parking Reservations' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {activeParking && activeParking.parkingStatus !== 'CANCELLED' ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCancelStep1Open(true)}
              >
                Cancel Active Hold
              </Button>
            ) : null}
            <Link to="/student/parking/pass">
              <Button size="sm" variant="primary">
                View Check-in Code →
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <ParkingHeaderKpis
          selectedHub={selectedHub}
          freeParking={freeParking}
          occPct={occPct}
          gracePeriodMins={policyConfig.gracePeriodMins}
          stepIndex={stepIndex}
          exceptionMode={exceptionMode}
          onStepChange={setStepIndex}
          onExceptionChange={setExceptionMode}
        />

        {stepIndex === 0 ? (
          <ParkingSelectionGrid
            hubs={hubs}
            selectedHub={selectedHub}
            hubId={hubId}
            freeParking={freeParking}
            vehicleChoice={vehicleChoice}
            arrivalDate={arrivalDate}
            arrivalTime={arrivalTime}
            durationHours={durationHours}
            gracePeriodMins={policyConfig.gracePeriodMins}
            floor={floor}
            selectedSlot={selectedSlot}
            selectedHasCharger={selectedHasCharger}
            estCostVnd={estCostVnd}
            slots={slots}
            onHubChange={setHubId}
            onVehicleChange={setVehicleChoice}
            onArrivalDateChange={setArrivalDate}
            onArrivalTimeChange={setArrivalTime}
            onDurationChange={setDurationHours}
            onFloorChange={setFloor}
            onSelectSlot={setSelectedSlot}
            onOpenTerms={() => setTermsOpen(true)}
            onProceedConfirm={handleProceedConfirm}
          />
        ) : (
          <ParkingConfirmStep
            hubs={hubs}
            selectedHub={selectedHub}
            floor={floor}
            selectedSlot={selectedSlot}
            selectedHasCharger={selectedHasCharger}
            vehicleChoice={vehicleChoice}
            arrivalDate={arrivalDate}
            arrivalTime={arrivalTime}
            durationHours={durationHours}
            estCostVnd={estCostVnd}
            gracePeriodMins={policyConfig.gracePeriodMins}
            onEditSpot={() => setStepIndex(0)}
            onConfirmReserve={handleConfirmReserve}
          />
        )}
      </div>

      <ParkingModals
        termsOpen={termsOpen}
        cancelStep1Open={cancelStep1Open}
        cancelStep2Open={cancelStep2Open}
        gracePeriodMins={policyConfig.gracePeriodMins}
        activeParking={activeParking}
        onCloseTerms={() => setTermsOpen(false)}
        onCloseCancel1={() => setCancelStep1Open(false)}
        onProceedCancel2={() => {
          setCancelStep1Open(false);
          setCancelStep2Open(true);
        }}
        onCloseCancel2={() => setCancelStep2Open(false)}
        onConfirmCancel={() => {
          cancelParkingReservation();
          setCancelStep2Open(false);
          pushToast({
            tone: 'info',
            title: 'Parking reservation cancelled',
            description: 'Your reserved parking bay has been released.',
          });
        }}
      />
    </div>
  );
}
