import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  QrCodeIcon,
  UnlockIcon,
} from '@/components/icons';
import { QrCodeCard, QrScannerViewport } from '@/components/shared';
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
import { buildVehicleQrPayload } from '@/utils/qr-payload';

export function UnlockScannerView({
  targetVehicle,
  targetHub,
  cameraActive,
  manualCode,
  onCameraActiveChange,
  onManualCodeChange,
  onVerifyCode,
  onScanError,
}: {
  targetVehicle: SharedVehicle;
  targetHub: MobilityHub;
  cameraActive: boolean;
  manualCode: string;
  onCameraActiveChange: (active: boolean) => void;
  onManualCodeChange: (val: string) => void;
  onVerifyCode: (rawValue: string) => void;
  onScanError: (msg: string) => void;
}) {
  const expectedQr = buildVehicleQrPayload(targetVehicle.code, targetHub.code);

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
          Scan or upload the QR label on reserved vehicle{' '}
          <strong>{targetVehicle.code}</strong> at {targetHub.shortName}.
        </p>

        <QrScannerViewport
          badgeText="CAMERA READY"
          active={cameraActive}
          onActiveChange={onCameraActiveChange}
          onScanResult={onVerifyCode}
          onScanError={onScanError}
          hintText={`Verify vehicle ID ${targetVehicle.code} before smart lock release.`}
        />
      </Card>

      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title font-extrabold text-ink">
              Vehicle QR Sticker &amp; Verification
            </h3>
            <Badge tone="ok">{targetVehicle.code}</Badge>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface-2 p-3.5 sm:flex-row">
            <QrCodeCard
              value={expectedQr}
              size={104}
              downloadable
              downloadFileName={`${targetVehicle.code}-qr.png`}
            />
            <div className="flex-1 space-y-1.5 text-left">
              <p className="text-label font-bold uppercase tracking-wider text-ink-3">
                On-Bike QR Label
              </p>
              <p className="break-all font-mono text-caption font-semibold text-ink">
                {expectedQr}
              </p>
              <p className="text-caption text-ink-2">
                Download PNG to test Upload QR Image, or scan directly with your
                phone or webcam.
              </p>
            </div>
          </div>

          <Input
            label="Manual QR / Vehicle Sticker Code"
            value={manualCode}
            onChange={(e) => onManualCodeChange(e.target.value)}
            hint={`Accepts ${expectedQr} or vehicle ID (${targetVehicle.code}).`}
          />
        </div>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            fullWidth
            leadingIcon={<UnlockIcon size={16} />}
            onClick={() => onVerifyCode(manualCode)}
          >
            Verify QR &amp; Unlock
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onVerifyCode(expectedQr)}
            >
              Quick Match ({targetVehicle.code})
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onVerifyCode('VNU-EV|EV-999|WRONG')}
            >
              Test Mismatch QR
            </Button>
          </div>
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
          QR payload validated for <strong>{targetVehicle.code}</strong>.
          Synchronizing reservation, vehicle, and trip states...
        </p>
        <Badge tone="primary">Step 2 of 3 · Smart Lock Verification</Badge>
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
                Matched Student hold at {targetHub.shortName} (
                {targetVehicle.code}).
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
                Releasing smart lock
              </p>
              <p className="text-caption text-ink-2">
                Starting active trip for {targetVehicle.code}...
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
  scannedCode,
  onRequestAssistance,
  onRetryScan,
}: {
  targetVehicle: SharedVehicle;
  scannedCode?: string | null;
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
        title="QR Code Does Not Match Reserved Vehicle"
        description={`Expected ${targetVehicle.code}, but scanned payload "${scannedCode ?? 'UNKNOWN'}" could not be authorized.`}
      />

      <div className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-caption text-ink-2">
        QR_VEHICLE_MISMATCH · Expected: {targetVehicle.code}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: '1. Check vehicle ID',
            desc: `Compare sticker with ${targetVehicle.code}.`,
            icon: <AlertTriangleIcon size={18} className="text-warn-700" />,
          },
          {
            title: '2. Scan again',
            desc: 'Center QR code inside viewfinder.',
            icon: <QrCodeIcon size={18} className="text-primary-700" />,
          },
          {
            title: '3. Hub support',
            desc: 'Report damaged sticker to crew.',
            icon: <MapPinIcon size={18} className="text-eco-700" />,
          },
        ].map((step) => (
          <div key={step.title} className="rounded-md border border-line p-3">
            {step.icon}
            <p className="mt-1.5 text-body-sm font-bold text-ink">
              {step.title}
            </p>
            <p className="text-caption text-ink-3">{step.desc}</p>
          </div>
        ))}
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
