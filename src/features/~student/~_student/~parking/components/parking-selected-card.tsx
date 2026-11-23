import { BoltIcon, CheckCircleIcon } from '@/components/icons';
import { Button, Card, CardRow, StatusPill } from '@/components/ui';

export function ParkingSelectedCard({
  selectedSlot,
  selectedHasCharger,
  floor,
  durationHours,
  arrivalTime,
  estCostVnd,
  onProceedConfirm,
}: {
  selectedSlot: string;
  selectedHasCharger: boolean;
  floor: string;
  durationHours: string;
  arrivalTime: string;
  estCostVnd: number;
  onProceedConfirm: () => void;
}) {
  return (
    <Card padding="md" className="space-y-4 xl:col-span-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body-lg font-extrabold text-ink">
          Selected Parking
        </h2>
        <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
          Available
        </StatusPill>
      </div>

      <div className="bg-primary-soft/45 rounded-lg border border-primary/25 p-3.5 text-center">
        <p className="text-label font-bold uppercase text-ink-3">Bay ID</p>
        <p className="mt-0.5 font-mono text-display font-extrabold text-primary-700">
          {selectedSlot}
        </p>
        {selectedHasCharger ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-eco-soft px-2.5 py-0.5 text-[11px] font-semibold text-eco-700">
            <BoltIcon size={12} />
            Charging-enabled
          </span>
        ) : (
          <span className="mt-1 inline-block text-caption text-ink-3">
            Standard EV bay
          </span>
        )}
      </div>

      <div className="rounded-md border border-line bg-surface-2 px-3 py-1">
        <CardRow>
          <span className="text-caption text-ink-2">Floor</span>
          <span className="text-caption font-bold text-ink">Floor {floor}</span>
        </CardRow>
        <CardRow>
          <span className="text-caption text-ink-2">Duration</span>
          <span className="text-caption font-bold text-ink">
            {durationHours} hours
          </span>
        </CardRow>
        <CardRow>
          <span className="text-caption text-ink-2">Arrival</span>
          <span className="font-mono text-caption font-bold text-ink">
            {arrivalTime}
          </span>
        </CardRow>
        <CardRow>
          <span className="text-caption text-ink-2">Est. Cost</span>
          <span className="font-mono text-body-sm font-extrabold text-primary-700">
            ₫{estCostVnd.toLocaleString()}
          </span>
        </CardRow>
      </div>

      <Button variant="primary" fullWidth onClick={onProceedConfirm}>
        Select This Spot →
      </Button>
    </Card>
  );
}
