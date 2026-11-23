import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { Button, ConfirmDialog, PageHeader } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import {
  CompletedExitReceiptView,
  PreExitOptionsView,
} from './components/exit-checkout-panels';

export const Route = createFileRoute('/student/_student/charging/exit')({
  component: StopChargingAndExitPage,
});

function StopChargingAndExitPage() {
  const { activeParking, stopChargingKeepParking, exitHubReleaseBay } =
    useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const isExited = activeParking?.parkingStatus === 'EXITED';
  const chargingStopped =
    activeParking?.chargingStatus === 'CHARGING_COMPLETED';

  const bayShort = (activeParking?.bayCode ?? 'BAY-A02').replace('BAY-', '');
  const energyKwh = activeParking?.energyDeliveredKwh ?? 9.38;
  const chargingFeeVnd = Math.round(energyKwh * 3570);
  const parkingFeeVnd = (activeParking?.durationHours ?? 3) * 5000;
  const totalVnd = chargingFeeVnd + parkingFeeVnd;

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title={
          isExited ? 'Charging Receipt & Hub Exit' : 'Stop Charging & Hub Exit'
        }
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Charging Sessions', to: '/student/charging/live' },
          { label: isExited ? 'Receipt & Exit' : 'Stop / Exit' },
        ]}
        actions={
          <Link to="/student/charging/live">
            <Button size="sm" variant="secondary">
              Back to Live Monitor
            </Button>
          </Link>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        {!isExited ? (
          <PreExitOptionsView
            activeParking={activeParking}
            chargingStopped={chargingStopped}
            onOpenStopConfirm={() => setStopConfirmOpen(true)}
            onOpenExitConfirm={() => setExitConfirmOpen(true)}
          />
        ) : (
          <CompletedExitReceiptView
            activeParking={activeParking}
            bayShort={bayShort}
            energyKwh={energyKwh}
            chargingFeeVnd={chargingFeeVnd}
            parkingFeeVnd={parkingFeeVnd}
            totalVnd={totalVnd}
          />
        )}
      </div>

      <ConfirmDialog
        open={stopConfirmOpen}
        onClose={() => setStopConfirmOpen(false)}
        onConfirm={() => {
          stopChargingKeepParking();
          setStopConfirmOpen(false);
          pushToast({
            tone: 'info',
            title: 'Charging stopped',
            description: 'Your parking bay remains reserved.',
          });
        }}
        title="Stop Charging Session Only?"
        description="Power delivery will stop and the charger port will be freed, while your parking bay stays active."
        confirmLabel="Confirm Stop Charging"
        cancelLabel="Keep Charging"
      />

      <ConfirmDialog
        open={exitConfirmOpen}
        onClose={() => setExitConfirmOpen(false)}
        onConfirm={() => {
          exitHubReleaseBay();
          setExitConfirmOpen(false);
          pushToast({
            tone: 'ok',
            title: 'Hub Exit Confirmed',
            description: 'Parking bay released and exit receipt issued.',
          });
        }}
        title="Exit Hub & Release Parking Bay?"
        description="This will end any active charging session, release your parking bay, and generate your exit receipt."
        confirmLabel="Confirm Exit Hub"
        cancelLabel="Stay Parked"
      />
    </div>
  );
}
