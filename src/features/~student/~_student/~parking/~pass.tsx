import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Button, ConfirmDialog, PageHeader, Tabs } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import {
  ChargingBookingPanel,
  type ChargingBookingException,
} from './components/charging-booking-panel';
import { EPassTicketView } from './components/epass-ticket-card';

export const Route = createFileRoute('/student/_student/parking/pass')({
  component: ElectronicPassAndChargingBookingPage,
});

function ElectronicPassAndChargingBookingPage() {
  const navigate = useNavigate();
  const {
    hubs,
    chargingPoints,
    activeParking,
    checkInParkingPass,
    cancelParkingReservation,
    bookChargingSession,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [activeTab, setActiveTab] = useState<'pass' | 'charging'>('pass');
  const [cancelOpen, setCancelOpen] = useState(false);

  const [connectorType, setConnectorType] = useState<
    'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC'
  >('TYPE_2');
  const [selectedPortId, setSelectedPortId] = useState('cp-a01');
  const [targetSoc, setTargetSoc] = useState(90);
  const [bookingException, setBookingException] =
    useState<ChargingBookingException>('NORMAL');

  const hub =
    hubs.find((h) => h.id === (activeParking?.hubId ?? hubs[0].id)) ?? hubs[0];
  const bayShort = (activeParking?.bayCode ?? 'BAY-A02').replace('BAY-', '');

  const compatiblePorts = chargingPoints.filter(
    (cp) =>
      cp.connectorType === connectorType &&
      cp.status !== 'ISOLATED' &&
      cp.status !== 'FAULTY',
  );

  function handleCheckIn() {
    checkInParkingPass();
    pushToast({
      tone: 'ok',
      title: 'Gate Check-in Confirmed',
      description: `Checked into ${activeParking?.bayCode ?? 'BAY-A02'} at ${hub.shortName}.`,
    });
  }

  function handleBookCharging() {
    if (bookingException !== 'NORMAL') {
      pushToast({
        tone: bookingException === 'OVERLAP_CONFLICT' ? 'warn' : 'danger',
        title: bookingException.replaceAll('_', ' '),
        description:
          'Unable to allocate charging port in this exception simulation.',
      });
      return;
    }

    const chosen =
      compatiblePorts.find((p) => p.id === selectedPortId) ??
      compatiblePorts[0] ??
      chargingPoints[1];

    bookChargingSession(chosen.id, chosen.code, connectorType, targetSoc);
    pushToast({
      tone: 'ok',
      title: `Charging Started on ${chosen.code}`,
      description: `Target SoC set to ${targetSoc}%.`,
    });
    navigate({ to: '/student/charging/live' });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Check-in Code & Charging Setup"
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Personal Charging', to: '/student/parking' },
          { label: 'Check-in Code' },
        ]}
        actions={
          <Link to="/student/charging/live">
            <Button size="sm" variant="primary">
              Go to Live Charging →
            </Button>
          </Link>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as 'pass' | 'charging')}
          items={[
            { id: 'pass', label: 'Check-in Code & Bay Path' },
            { id: 'charging', label: 'Book Charging Session' },
          ]}
        />

        {activeTab === 'pass' ? (
          <EPassTicketView
            activeParking={activeParking}
            hub={hub}
            bayShort={bayShort}
            onCheckIn={handleCheckIn}
            onBookCharging={() => setActiveTab('charging')}
            onOpenCancel={() => setCancelOpen(true)}
          />
        ) : (
          <ChargingBookingPanel
            activeParking={activeParking}
            connectorType={connectorType}
            selectedPortId={selectedPortId}
            targetSoc={targetSoc}
            bookingException={bookingException}
            compatiblePorts={compatiblePorts}
            onConnectorTypeChange={setConnectorType}
            onSelectedPortChange={setSelectedPortId}
            onTargetSocChange={setTargetSoc}
            onExceptionChange={setBookingException}
            onBookCharging={handleBookCharging}
          />
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          cancelParkingReservation();
          setCancelOpen(false);
          pushToast({
            tone: 'info',
            title: 'Reservation cancelled',
            description: 'Parking hold released.',
          });
          navigate({ to: '/student/parking' });
        }}
        title="Cancel Parking Reservation?"
        description="Cancelling will release your reserved bay and deactivate this Check-in Code."
        confirmLabel="Confirm Cancel"
        cancelLabel="Keep Pass"
        destructive
      />
    </div>
  );
}
