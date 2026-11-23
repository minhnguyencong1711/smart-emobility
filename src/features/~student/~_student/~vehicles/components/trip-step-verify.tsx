import { CheckCircleIcon } from '@/components/icons';
import { CampusHubMap } from '@/components/shared';
import { Button, Callout, Card, Select, StatusPill } from '@/components/ui';
import type { MobilityHub } from '@/types';

export function TripStepVerify({
  hubs,
  originHubId,
  destinationHubId,
  destHub,
  freeBays,
  onSelectDestinationHub,
  onContinue,
}: {
  hubs: MobilityHub[];
  originHubId: string;
  destinationHubId: string;
  destHub: MobilityHub;
  freeBays: number;
  onSelectDestinationHub: (hubId: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <CampusHubMap
        hubs={hubs}
        selectedHubId={destinationHubId}
        onSelectHub={onSelectDestinationHub}
        routeOverlay={{
          fromHubId: originHubId,
          toHubId: destinationHubId,
        }}
        variant="operator"
        title="VNU-HCM CAMPUS MOBILITY HUB MAP"
        className="h-[460px]"
      />

      <Card padding="md" className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-title font-extrabold text-ink">
              Verify Destination Hub &amp; Geofence
            </h2>
            <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
              Hub operational
            </StatusPill>
          </div>

          <Select
            label="Destination Mobility Hub"
            value={destinationHubId}
            onChange={(e) => onSelectDestinationHub(e.target.value)}
            options={hubs.map((h) => ({
              value: h.id,
              label: `${h.name} (${h.coreBaysTotal - h.coreBaysOccupied} free bays)`,
            }))}
          />

          <Callout
            tone={freeBays > 0 ? 'ok' : 'danger'}
            title={
              freeBays > 0
                ? 'Destination Hub detected'
                : 'Destination Hub at full capacity'
            }
            description={`Your selected return Hub is ${destHub.name}. ${freeBays} return bays available.`}
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          disabled={freeBays <= 0}
          onClick={onContinue}
        >
          Continue to Secure &amp; Report →
        </Button>
      </Card>
    </div>
  );
}
