import { RefreshIcon } from '@/components/icons';
import { Button, Callout, FilterChip, Modal } from '@/components/ui';
import type { ActiveParkingAndCharging, ChargingSessionStatus } from '@/types';

export function ChargingStatusAlerts({
  status,
  activeParking,
  onSelectStatus,
  onResumeCharging,
  onReassignPort,
}: {
  status: ChargingSessionStatus;
  activeParking: ActiveParkingAndCharging | null;
  onSelectStatus: (status: ChargingSessionStatus, reason?: string) => void;
  onResumeCharging: () => void;
  onReassignPort: () => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-caption font-semibold text-ink-3">
          Telemetry State:
        </span>
        {(
          [
            ['CHARGING', 'Charging (Normal)', ''],
            [
              'THROTTLED',
              'Throttle Alert (DLB)',
              'Hub substation demand reached 88% — DLB capped output to 3.7 kW.',
            ],
            [
              'INTERRUPTED',
              'Interrupted (Recoverable)',
              'Port isolated or feeder trip detected. Your parking bay remains reserved.',
            ],
            ['CHARGING_COMPLETED', 'Charging Completed', ''],
          ] as const
        ).map(([key, label, reason]) => (
          <FilterChip
            key={key}
            size="sm"
            tone="navy"
            active={status === key}
            onClick={() => onSelectStatus(key, reason || undefined)}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      {status === 'THROTTLED' ? (
        <Callout
          tone="warn"
          title="Dynamic Load Balancing (DLB) Throttle Alert"
          description={
            activeParking?.interruptionReason ??
            'Grid demand exceeded 85%. Output temporarily throttled to 3.7 kW to prevent feeder overload.'
          }
        />
      ) : null}

      {status === 'INTERRUPTED' ? (
        <Callout
          tone="danger"
          title="Recoverable Interruption — Parking Bay Remains Reserved"
          description={
            activeParking?.interruptionReason ??
            'Charging paused due to port isolation or safety trip. Choose a recovery option below without losing your bay.'
          }
          action={
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="primary"
                leadingIcon={<RefreshIcon size={14} />}
                onClick={onResumeCharging}
              >
                Resume Charging
              </Button>
              <Button size="sm" variant="secondary" onClick={onReassignPort}>
                Reassign Port (CP-A02)
              </Button>
            </div>
          }
        />
      ) : null}

      {status === 'CHARGING_COMPLETED' ? (
        <Callout
          tone="ok"
          title="Charging Completed — Parking Bay Still Active"
          description="Your EV reached target SoC. Your parking bay remains reserved until you exit the hub."
        />
      ) : null}
    </>
  );
}

export function StopChargingModal({
  open,
  bayCode,
  onClose,
  onStopKeepParking,
  onStopAndExit,
}: {
  open: boolean;
  bayCode: string;
  onClose: () => void;
  onStopKeepParking: () => void;
  onStopAndExit: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stop Charging Session?"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-body-sm text-ink-2">
          You can stop power delivery while keeping your reserved parking bay{' '}
          <strong>{bayCode}</strong>, or stop and exit the hub immediately.
        </p>
        <div className="space-y-2">
          <Button variant="secondary" fullWidth onClick={onStopKeepParking}>
            Stop Charging Only (Keep Parking Bay)
          </Button>
          <Button variant="danger" fullWidth onClick={onStopAndExit}>
            Stop &amp; Exit Hub (Release Bay)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
