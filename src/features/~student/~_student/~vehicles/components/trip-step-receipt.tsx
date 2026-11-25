import { CheckCircleIcon, ReceiptIcon } from '@/components/icons';
import { DetailRow } from '@/components/shared';
import { Button, Callout, Card, Modal, StatusPill } from '@/components/ui';
import type {
  ActiveVehicleHold,
  MobilityHub,
  SharedVehicle,
  TripHistoryItem,
} from '@/types';
import { formatDateShort, formatTime12h } from '@/utils/date-time';

export function TripStepReceipt({
  hold,
  vehicle,
  originHub,
  destHub,
  hasFault,
  tripHistory,
  onOpenReceipt,
  onFindAnother,
}: {
  hold: ActiveVehicleHold | null;
  vehicle: SharedVehicle;
  originHub: MobilityHub;
  destHub: MobilityHub;
  hasFault: boolean;
  tripHistory: TripHistoryItem[];
  onOpenReceipt: () => void;
  onFindAnother: () => void;
}) {
  const distanceKm = hold?.distanceKm ?? 0.3;
  const fareVnd = hold?.estimatedFareVnd ?? vehicle.ratePerMinVnd;
  const rewardPoints = hold?.rewardPoints ?? 2;
  const startedLabel = hold?.startedAt ?? formatTime12h();
  const endedLabel = hold?.endedAt ?? formatTime12h();

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
      <Card padding="md" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-title font-extrabold text-ink">
            Completed Trip Receipt
          </h2>
          <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
            COMPLETED
          </StatusPill>
        </div>

        <Callout
          tone="ok"
          title="Trip Completed Successfully"
          description="Your shared vehicle return was confirmed. The Trip, vehicle location and destination Hub information have been updated."
        />

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-line bg-surface-2 p-3 text-center">
            <p className="text-caption text-ink-3">Distance traveled</p>
            <p className="mt-1 font-mono text-heading font-extrabold text-ink">
              {distanceKm} km
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3 text-center">
            <p className="text-caption text-ink-3">Estimated fare</p>
            <p className="mt-1 font-mono text-heading font-extrabold text-ink">
              {fareVnd.toLocaleString()} VND
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3 text-center">
            <p className="text-caption text-ink-3">Reward points</p>
            <p className="mt-1 font-mono text-heading font-extrabold text-eco-700">
              +{rewardPoints} pts
            </p>
          </div>
        </div>

        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow
            label="Origin"
            value={`${originHub.name} · ${startedLabel}`}
          />
          <DetailRow
            label="Return confirmed"
            value={`${destHub.name} · ${endedLabel}`}
          />
          <DetailRow
            label="Final vehicle condition"
            value={
              hasFault
                ? 'Fault reported · OUT_OF_SERVICE'
                : `Battery: ${vehicle.batterySoC}% SoC · Eligible (${vehicle.status})`
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            leadingIcon={<ReceiptIcon size={15} />}
            onClick={onOpenReceipt}
          >
            View Receipt Details
          </Button>
          <Button variant="primary" onClick={onFindAnother}>
            Find Another Vehicle
          </Button>
        </div>
      </Card>

      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-title font-extrabold text-ink">
              Vehicle &amp; Hub Status
            </h3>
            <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
              Synced
            </StatusPill>
          </div>

          <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
            <DetailRow label="Trip status" value="COMPLETED" mono />
            <DetailRow label="Reservation" value="Consumed at pickup" />
            <DetailRow
              label="Vehicle state"
              value={hasFault ? 'OUT_OF_SERVICE' : vehicle.status}
              mono
            />
            <DetailRow label="Vehicle location" value={destHub.name} />
            <DetailRow label="Hub parking state" value="Updated" />
            <DetailRow
              label="Condition report"
              value={
                hasFault ? 'Fault logged for operations' : 'No issues reported'
              }
            />
          </div>

          {tripHistory.length > 0 ? (
            <div className="space-y-1.5 rounded-md border border-line p-3">
              <p className="text-label font-bold uppercase text-ink-3">
                Recent Completed Trips
              </p>
              {tripHistory.slice(0, 2).map((t) => (
                <div
                  key={t.tripId}
                  className="flex items-center justify-between text-caption"
                >
                  <span className="font-semibold text-ink">
                    {t.vehicleCode} · {t.fromHubName} → {t.toHubName}
                  </span>
                  <span className="font-mono text-ink-2">
                    {t.fareVnd.toLocaleString()} VND
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Button variant="secondary" fullWidth onClick={onFindAnother}>
          Back to Vehicle Catalogue
        </Button>
      </Card>
    </div>
  );
}

export function TripReceiptModal({
  open,
  onClose,
  hold,
  vehicle,
  originHub,
  destHub,
}: {
  open: boolean;
  onClose: () => void;
  hold: ActiveVehicleHold | null;
  vehicle: SharedVehicle;
  originHub: MobilityHub;
  destHub: MobilityHub;
}) {
  const tripId = hold?.tripId ?? 'T-RETURN';
  const durationMins = hold?.durationMins ?? 1;
  const distanceKm = hold?.distanceKm ?? 0.3;
  const fareVnd = hold?.estimatedFareVnd ?? vehicle.ratePerMinVnd;
  const rewardPoints = hold?.rewardPoints ?? 2;
  const tripDate = hold?.tripDate ?? formatDateShort(0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Digital Trip Receipt · ${tripId}`}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-body-sm text-ink-2">Completed · {tripDate}</p>
        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow label="Trip ID" value={tripId} mono />
          <DetailRow
            label="Vehicle"
            value={`${vehicle.code} · ${vehicle.model}`}
          />
          <DetailRow label="Origin Hub" value={originHub.name} />
          <DetailRow label="Return Hub" value={destHub.name} />
          <DetailRow label="Duration" value={`${durationMins} min`} mono />
          <DetailRow label="Distance" value={`${distanceKm} km`} />
          <DetailRow
            label="Estimated Fare"
            value={`${fareVnd.toLocaleString()} VND`}
          />
          <DetailRow label="Reward Points" value={`+${rewardPoints} pts`} />
        </div>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
