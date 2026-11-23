import { ClockIcon } from '@/components/icons';
import { CampusHubMap, DetailRow } from '@/components/shared';
import {
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Radio,
  StatusPill,
  Textarea,
} from '@/components/ui';
import type { MobilityHub, SharedVehicle } from '@/types';

export function TripStepCondition({
  hubs,
  vehicle,
  originHub,
  destHub,
  tripId,
  durationMins,
  hasFault,
  remarks,
  physicalLockChecked,
  onHasFaultChange,
  onRemarksChange,
  onPhysicalLockChange,
  onBackStep,
  onConfirmReturn,
}: {
  hubs: MobilityHub[];
  vehicle: SharedVehicle;
  originHub: MobilityHub;
  destHub: MobilityHub;
  tripId: string;
  durationMins: number;
  hasFault: boolean;
  remarks: string;
  physicalLockChecked: boolean;
  onHasFaultChange: (val: boolean) => void;
  onRemarksChange: (val: string) => void;
  onPhysicalLockChange: (val: boolean) => void;
  onBackStep: () => void;
  onConfirmReturn: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
      <Card padding="md" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-title font-extrabold text-ink">
            Secure Vehicle &amp; Report Condition
          </h2>
          <Badge tone="navy">Manual secure</Badge>
        </div>

        <Callout
          tone="info"
          title="Finish the physical return before confirming"
          description="Park in the designated area and secure the vehicle using its built-in lock."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-line bg-surface-2 p-3">
            <p className="text-body-sm font-bold text-ink">
              1. Park at the return Hub
            </p>
            <p className="mt-0.5 text-caption text-ink-2">
              Use a designated shared-vehicle bay at {destHub.name}.
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3">
            <p className="text-body-sm font-bold text-ink">
              2. Secure the vehicle
            </p>
            <p className="mt-0.5 text-caption text-ink-2">
              Engage the physical lock and leave it safely parked.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-line p-4">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-bold text-ink">
              Vehicle Condition Report
            </span>
            <span className="text-caption text-ink-3">Latest SoC: 82%</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Radio
              name="vehicle-condition"
              label="No issues reported"
              checked={!hasFault}
              onChange={() => onHasFaultChange(false)}
            />
            <Radio
              name="vehicle-condition"
              label="Report fault / damage"
              checked={hasFault}
              onChange={() => onHasFaultChange(true)}
            />
          </div>

          <Textarea
            label="Additional remarks (optional)"
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="Add an issue description only if you observed any damage or unusual behavior."
            rows={3}
          />

          <Checkbox
            label="I have parked at the return bay and engaged the physical lock."
            checked={physicalLockChecked}
            onChange={(e) => onPhysicalLockChange(e.target.checked)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onBackStep}>
            Recheck Destination Hub
          </Button>
          <Button variant="primary" onClick={onConfirmReturn}>
            Confirm Vehicle Return
          </Button>
        </div>
      </Card>

      <Card padding="md" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-title font-extrabold text-ink">
            Return Verification
          </h3>
          <StatusPill tone="warn" icon={<ClockIcon size={12} />}>
            Pending commit
          </StatusPill>
        </div>

        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow label="Trip ID" value={tripId} mono />
          <DetailRow label="Vehicle ID" value={vehicle.code} mono />
          <DetailRow label="Starting Hub" value={originHub.name} />
          <DetailRow label="Destination Hub" value={destHub.name} />
          <DetailRow label="Current vehicle state" value="IN_USE" mono />
          <DetailRow label="Time elapsed" value={`${durationMins} min`} />
        </div>

        <CampusHubMap
          hubs={hubs}
          selectedHubId={destHub.id}
          routeOverlay={{
            fromHubId: originHub.id,
            toHubId: destHub.id,
          }}
          variant="mini"
        />
      </Card>
    </div>
  );
}
