import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  QrCodeIcon,
  UnlockIcon,
} from '@/components/icons';
import {
  Badge,
  Button,
  Callout,
  Card,
  Input,
  Spinner,
  StatusPill,
} from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';
import { cn } from '@/utils/cn';

export function UnlockScannerView({
  targetVehicle,
  targetHub,
  torchOn,
  manualCode,
  onToggleTorch,
  onManualCodeChange,
  onSimulateScan,
  onSimulateError,
}: {
  targetVehicle: SharedVehicle;
  targetHub: MobilityHub;
  torchOn: boolean;
  manualCode: string;
  onToggleTorch: () => void;
  onManualCodeChange: (val: string) => void;
  onSimulateScan: () => void;
  onSimulateError: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <Card padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-title font-extrabold text-ink">
            Scan vehicle QR code
          </h2>
          <StatusPill tone="ok" icon={<QrCodeIcon size={12} />}>
            ACTIVE HOLD
          </StatusPill>
        </div>

        <p className="text-body-sm text-ink-2">
          Point your phone camera at the QR label on your reserved vehicle{' '}
          <strong>{targetVehicle.code}</strong> at {targetHub.shortName}.
        </p>

        <div className="relative flex min-h-[280px] flex-col items-center justify-between overflow-hidden rounded-lg border border-navy-700 bg-ink p-5 text-white">
          <div className="flex w-full items-center justify-between text-caption">
            <Badge tone="navy" className="bg-white/10 text-white">
              CAMERA PREVIEW
            </Badge>
            <button
              type="button"
              onClick={onToggleTorch}
              className={cn(
                'rounded-full border px-3 py-1 text-caption font-semibold transition-colors',
                torchOn
                  ? 'border-warn bg-warn text-ink'
                  : 'border-white/25 bg-white/10 text-white hover:bg-white/20',
              )}
            >
              {torchOn ? 'Flashlight On' : 'Flashlight'}
            </button>
          </div>

          <div className="relative my-4 flex size-44 items-center justify-center rounded-lg border-2 border-dashed border-primary-300 bg-white/5">
            <QrCodeIcon size={84} className="text-primary-300" />
            <span className="absolute -bottom-3 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
              Align QR code inside frame
            </span>
          </div>

          <p className="text-center text-caption text-white/75">
            Check that the vehicle ID on the bike matches {targetVehicle.code}.
            Pickup authorization is validated before unlock.
          </p>
        </div>
      </Card>

      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title font-extrabold text-ink">
              Vehicle &amp; Reservation
            </h3>
            <Badge tone="ok">Reservation valid</Badge>
          </div>

          <Input
            label="Manual QR / Vehicle Sticker Code"
            value={manualCode}
            onChange={(e) => onManualCodeChange(e.target.value)}
            hint="Manual scanning never bypasses reservation validation."
          />

          <Callout
            tone="info"
            title="Before you scan"
            description={`Check that the sticker matches ${targetVehicle.code} at ${targetHub.shortName}. Preview only — no physical lock is connected.`}
          />
        </div>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            fullWidth
            leadingIcon={<UnlockIcon size={16} />}
            onClick={onSimulateScan}
          >
            Simulate Scan
          </Button>
          <Button variant="danger" fullWidth onClick={onSimulateError}>
            Preview Scan Error
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function UnlockingLoaderView({
  targetVehicle,
  targetHub,
}: {
  targetVehicle: SharedVehicle;
  targetHub: MobilityHub;
}) {
  return (
    <Card padding="lg" className="mx-auto max-w-2xl space-y-5 text-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <h2 className="text-heading font-extrabold text-ink">
          Authorizing Vehicle Pickup
        </h2>
        <p className="text-body-sm text-ink-2">
          QR validated — completing pickup authorization. Synchronizing
          reservation, vehicle, and trip states...
        </p>
        <Badge tone="primary">
          Status: Awaiting confirmation · Step 2 of 3
        </Badge>
      </div>

      <div className="space-y-2.5 text-left">
        <div className="border-ok/30 flex items-center justify-between rounded-md border bg-ok-soft px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon size={18} className="text-ok-700" />
            <div>
              <p className="text-body-sm font-bold text-ink">
                QR &amp; identity verified
              </p>
              <p className="text-caption text-ink-2">
                Correct Student, Hub and reserved vehicle ({targetVehicle.code}
                ).
              </p>
            </div>
          </div>
          <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
            Passed
          </StatusPill>
        </div>

        <div className="border-ok/30 flex items-center justify-between rounded-md border bg-ok-soft px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon size={18} className="text-ok-700" />
            <div>
              <p className="text-body-sm font-bold text-ink">
                Safety check passed
              </p>
              <p className="text-caption text-ink-2">
                No operational restriction on {targetHub.shortName}.
              </p>
            </div>
          </div>
          <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
            Passed
          </StatusPill>
        </div>

        <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary-soft px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Spinner size="sm" />
            <div>
              <p className="text-body-sm font-bold text-ink">
                Trip activation pending
              </p>
              <p className="text-caption text-ink-2">
                Starting Trip T-2408 and unlocking smart lock...
              </p>
            </div>
          </div>
          <StatusPill tone="info" icon={<ClockIcon size={12} />}>
            Syncing
          </StatusPill>
        </div>
      </div>
    </Card>
  );
}

export function UnlockErrorView({
  targetVehicle,
  onRequestAssistance,
  onRetryScan,
}: {
  targetVehicle: SharedVehicle;
  onRequestAssistance: () => void;
  onRetryScan: () => void;
}) {
  return (
    <Card padding="lg" className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-heading font-extrabold text-ink">
          Pickup Scan Error
        </h2>
        <StatusPill tone="danger" icon={<AlertTriangleIcon size={12} />}>
          Pickup blocked
        </StatusPill>
      </div>

      <Callout
        tone="danger"
        title="QR Code Does Not Match"
        description={`The scanned QR label could not be matched to ${targetVehicle.code}. The pickup request was rejected and your trip has not started.`}
      />

      <div className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-caption text-ink-2">
        QR_VEHICLE_MISMATCH · Verification rejected
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-line p-3">
          <AlertTriangleIcon size={18} className="text-warn-700" />
          <p className="mt-1.5 text-body-sm font-bold text-ink">
            1. Check vehicle ID
          </p>
          <p className="text-caption text-ink-3">
            Compare the sticker label with {targetVehicle.code}.
          </p>
        </div>
        <div className="rounded-md border border-line p-3">
          <QrCodeIcon size={18} className="text-primary-700" />
          <p className="mt-1.5 text-body-sm font-bold text-ink">
            2. Scan again
          </p>
          <p className="text-caption text-ink-3">
            Hold the QR sticker steady inside the frame.
          </p>
        </div>
        <div className="rounded-md border border-line p-3">
          <MapPinIcon size={18} className="text-eco-700" />
          <p className="mt-1.5 text-body-sm font-bold text-ink">
            3. Request assistance
          </p>
          <p className="text-caption text-ink-3">
            Contact hub support if the QR label is damaged.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onRequestAssistance}>
          Request assistance
        </Button>
        <Button variant="primary" onClick={onRetryScan}>
          Scan Again
        </Button>
      </div>
    </Card>
  );
}
