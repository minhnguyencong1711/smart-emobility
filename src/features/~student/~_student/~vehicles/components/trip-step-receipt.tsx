import { Link } from '@tanstack/react-router';

import { CheckCircleIcon, ReceiptIcon } from '@/components/icons';
import { DetailRow } from '@/components/shared';
import { Button, Callout, Card, Modal, StatusPill } from '@/components/ui';
import type { MobilityHub, SharedVehicle, TripHistoryItem } from '@/types';

export function TripStepReceipt({
  originHub,
  destHub,
  hasFault,
  tripHistory,
  onOpenReceipt,
  onFindAnother,
}: {
  originHub: MobilityHub;
  destHub: MobilityHub;
  hasFault: boolean;
  tripHistory: TripHistoryItem[];
  onOpenReceipt: () => void;
  onFindAnother: () => void;
}) {
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
              4.6 km
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3 text-center">
            <p className="text-caption text-ink-3">Estimated fare</p>
            <p className="mt-1 font-mono text-heading font-extrabold text-ink">
              12,000 VND
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3 text-center">
            <p className="text-caption text-ink-3">Reward points</p>
            <p className="mt-1 font-mono text-heading font-extrabold text-eco-700">
              +12 pts
            </p>
          </div>
        </div>

        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow label="Origin" value={`${originHub.name} · 10:40 AM`} />
          <DetailRow
            label="Return confirmed"
            value={`${destHub.name} · 11:08 AM`}
          />
          <DetailRow
            label="Final vehicle condition"
            value={
              hasFault
                ? 'Fault reported · OUT_OF_SERVICE'
                : 'Battery: 82% SoC · Eligible (AVAILABLE)'
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
              value={hasFault ? 'OUT_OF_SERVICE' : 'AVAILABLE'}
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

        <Link to="/student/vehicles" className="block">
          <Button variant="secondary" fullWidth>
            Back to Vehicle Catalogue
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export function TripReceiptModal({
  open,
  onClose,
  vehicle,
  originHub,
  destHub,
}: {
  open: boolean;
  onClose: () => void;
  vehicle: SharedVehicle;
  originHub: MobilityHub;
  destHub: MobilityHub;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Digital Trip Receipt · T-2408"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-body-sm text-ink-2">Completed · 24 Oct 2026</p>
        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow label="Trip ID" value="T-2408" mono />
          <DetailRow
            label="Vehicle"
            value={`${vehicle.code} · ${vehicle.model}`}
          />
          <DetailRow label="Origin Hub" value={originHub.name} />
          <DetailRow label="Return Hub" value={destHub.name} />
          <DetailRow label="Distance" value="4.6 km" />
          <DetailRow label="Estimated Fare" value="12,000 VND" />
          <DetailRow label="Reward Points" value="+12 pts" />
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
