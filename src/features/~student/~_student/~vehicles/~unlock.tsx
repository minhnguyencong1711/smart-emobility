import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
  ArrowLeftIcon,
  BatteryIcon,
  BikeIcon,
  ClockIcon,
  MapPinIcon,
} from '@/components/icons';
import { Badge, Button, Callout, PageHeader, StatCard } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';
import { formatClockSeconds } from '@/utils/formatters';
import { buildVehicleQrPayload, parseVehicleQrCode } from '@/utils/qr-payload';

import {
  UnlockErrorView,
  UnlockingLoaderView,
  UnlockScannerView,
} from './components/unlock-qr-panel';

export const Route = createFileRoute('/student/_student/vehicles/unlock')({
  component: VehicleUnlockPage,
});

type ScanViewState = 'SCANNER' | 'UNLOCKING' | 'ERROR';

function VehicleUnlockPage() {
  const navigate = useNavigate();
  const {
    hubs,
    sharedVehicles,
    policyConfig,
    activeVehicleHold,
    reserveVehicle,
    unlockReservedVehicle,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const targetVehicle =
    sharedVehicles.find((v) => v.id === activeVehicleHold?.vehicleId) ??
    sharedVehicles[0];
  const targetHub = hubs.find((h) => h.id === targetVehicle.hubId) ?? hubs[0];

  const [scanState, setScanState] = useState<ScanViewState>('SCANNER');
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedMismatch, setScannedMismatch] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState(() =>
    buildVehicleQrPayload(targetVehicle.code, targetHub.code),
  );

  useEffect(() => {
    setManualCode(buildVehicleQrPayload(targetVehicle.code, targetHub.code));
  }, [targetVehicle.code, targetHub.code]);

  useEffect(() => {
    if (scanState !== 'UNLOCKING') return;
    const timer = window.setTimeout(() => {
      unlockReservedVehicle();
      pushToast({
        tone: 'ok',
        title: `Vehicle ${targetVehicle.code} unlocked`,
        description: 'Your shared EV trip is now active. Ride safely!',
      });
      navigate({ to: '/student/vehicles/trip' });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [
    scanState,
    unlockReservedVehicle,
    pushToast,
    targetVehicle.code,
    navigate,
  ]);

  function handleVerifyCode(rawValue: string) {
    setCameraActive(false);
    const parsedCode = parseVehicleQrCode(rawValue);
    if (parsedCode === targetVehicle.code.toUpperCase()) {
      setScannedMismatch(null);
      setScanState('UNLOCKING');
      return;
    }
    setScannedMismatch(rawValue.trim() || '(empty)');
    setScanState('ERROR');
    pushToast({
      tone: 'danger',
      title: 'QR verification failed',
      description: `Scanned "${rawValue.trim() || 'empty'}" does not match ${targetVehicle.code}.`,
    });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Pick Up / Unlock Vehicle"
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Shared Mobility', to: '/student/vehicles' },
          {
            label: 'My Reservations',
            to: `/student/vehicles/${targetVehicle.id}`,
          },
          { label: 'Vehicle Pickup' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/student/vehicles/$id" params={{ id: targetVehicle.id }}>
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={<ArrowLeftIcon size={14} />}
              >
                My Reservation
              </Button>
            </Link>
            <Badge tone="navy">{targetVehicle.code}</Badge>
            <Badge tone="neutral">{targetHub.name}</Badge>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        {!activeVehicleHold || activeVehicleHold.status !== 'CONFIRMED' ? (
          <Callout
            tone="info"
            title={`Previewing QR Unlock for ${targetVehicle.code}`}
            description="Create a reservation hold first or scan the vehicle QR sticker below to start your trip."
            action={
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  const res = await reserveVehicle(
                    targetVehicle.id,
                    '24 Oct 2026',
                    '10:30 AM',
                  );
                  if (res.ok) {
                    pushToast({
                      tone: 'ok',
                      title: 'Hold Created',
                      description: `${targetVehicle.code} is now reserved for pickup.`,
                    });
                  }
                }}
              >
                Hold {targetVehicle.code}
              </Button>
            }
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Selected Shared Vehicle"
            value={targetVehicle.code}
            badgeText={
              activeVehicleHold?.status === 'CONFIRMED'
                ? 'RESERVED'
                : targetVehicle.status
            }
            badgeTone="primary"
            icon={<BikeIcon size={18} />}
            iconTone="primary"
            progress={100}
            progressTone="primary"
            footerLeft={`Category: ${targetVehicle.type === 'E_BIKE' ? 'Electric bicycle' : 'E-Motorcycle'}`}
            footerRight="Ready to scan"
            footerRightTone="eco"
          />
          <StatCard
            title="Current Battery Level"
            value={targetVehicle.batterySoC}
            denominator="% SoC"
            badgeText="High battery"
            badgeTone="eco"
            icon={<BatteryIcon size={18} />}
            iconTone="eco"
            progress={targetVehicle.batterySoC}
            progressTone="eco"
            footerLeft="Latest sensor reading"
            footerRight="Ready for trip"
            footerRightTone="eco"
          />
          <StatCard
            title="Pickup Mobility Hub"
            value={targetHub.shortName}
            badgeText="Operational"
            badgeTone="ok"
            icon={<MapPinIcon size={18} />}
            iconTone="primary"
            progress={85}
            progressTone="primary"
            footerLeft={targetHub.code}
            footerRight={`~${targetHub.walkMins} min walk`}
          />
          <StatCard
            title="Reservation Grace Period"
            value={formatClockSeconds(
              activeVehicleHold?.remainingSeconds ??
                policyConfig.gracePeriodMins * 60,
            )}
            denominator="remaining"
            badgeText="Configurable"
            badgeTone="warn"
            icon={<ClockIcon size={18} />}
            iconTone="warn"
            progress={65}
            progressTone="warn"
            footerLeft={`Grace: ${policyConfig.gracePeriodMins}m`}
            footerRight="config.grace_period_mins"
          />
        </div>

        {scanState === 'SCANNER' ? (
          <UnlockScannerView
            targetVehicle={targetVehicle}
            targetHub={targetHub}
            cameraActive={cameraActive}
            manualCode={manualCode}
            onCameraActiveChange={setCameraActive}
            onManualCodeChange={setManualCode}
            onVerifyCode={handleVerifyCode}
            onScanError={(msg) =>
              pushToast({
                tone: 'warn',
                title: 'Scanner Notice',
                description: msg,
              })
            }
          />
        ) : null}

        {scanState === 'UNLOCKING' ? (
          <UnlockingLoaderView
            targetVehicle={targetVehicle}
            targetHub={targetHub}
          />
        ) : null}

        {scanState === 'ERROR' ? (
          <UnlockErrorView
            targetVehicle={targetVehicle}
            scannedCode={scannedMismatch}
            onRequestAssistance={() =>
              pushToast({
                tone: 'info',
                title: 'Assistance ticket logged',
                description: `Hub crew notified about QR label at ${targetHub.shortName}.`,
              })
            }
            onRetryScan={() => setScanState('SCANNER')}
          />
        ) : null}
      </div>
    </div>
  );
}
