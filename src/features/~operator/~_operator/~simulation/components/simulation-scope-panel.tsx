import { RefreshIcon } from '@/components/icons';
import { Badge, Button, Callout, Card, CardRow, Modal } from '@/components/ui';
import type { MobilityHub, SystemPolicyConfig } from '@/types';
import { cn } from '@/utils/cn';

type SimulationScopePanelProps = {
  hubs: MobilityHub[];
  policyConfig: SystemPolicyConfig;
  scenarioName: string;
  durationHours: string;
  timeStepMins: string;
  travelDelta: number;
  chargingDelta: number;
  parkingDelta: number;
  selectedHubIds: string[];
  staleDataDemo: boolean;
  reviewModalOpen: boolean;
  onToggleHub: (id: string) => void;
  onToggleStaleData: () => void;
  onRefreshSampleData: () => void;
  onOpenReviewModal: () => void;
  onCloseReviewModal: () => void;
  onLaunchSandbox: () => void;
};

export function SimulationScopePanel(props: SimulationScopePanelProps) {
  const {
    hubs,
    policyConfig,
    scenarioName,
    durationHours,
    timeStepMins,
    travelDelta,
    chargingDelta,
    parkingDelta,
    selectedHubIds,
    staleDataDemo,
    reviewModalOpen,
  } = props;

  return (
    <>
      <Card
        padding="md"
        className="flex flex-col justify-between gap-4 xl:col-span-5"
      >
        <div className="space-y-4">
          <div>
            <h2 className="text-title font-extrabold text-ink">
              Simulation Scope
            </h2>
            <p className="text-caption text-ink-3">
              Select one or more mobility hubs ({selectedHubIds.length}/
              {hubs.length})
            </p>
          </div>

          {staleDataDemo ? (
            <Callout
              tone="warn"
              title="Snapshot Older Than 15 Minutes"
              description="Click Refresh Baseline Snapshot to capture latest hub occupancy before running the simulation."
            />
          ) : null}

          <div className="space-y-2">
            {hubs.map((hub) => {
              const active = selectedHubIds.includes(hub.id);
              const parkPct = Math.round(
                (hub.coreBaysOccupied / hub.coreBaysTotal) * 100,
              );
              const chargePct = Math.round(
                (hub.gridCurrentKw / hub.gridMaxKw) * 100,
              );
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => props.onToggleHub(hub.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left transition-colors',
                    active
                      ? 'bg-primary-soft/35 border-primary'
                      : 'border-line bg-surface hover:bg-surface-2',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-xs border text-[10px] font-bold',
                        active
                          ? 'border-primary bg-primary text-white'
                          : 'border-line-strong bg-surface',
                      )}
                    >
                      {active ? '✓' : ''}
                    </span>
                    <div>
                      <p className="text-body-sm font-bold text-ink">
                        {hub.name}
                      </p>
                      <p className="text-caption text-ink-3">
                        {hub.sharedEvsTotal} vehicles · Parking {parkPct}% ·
                        Charging {chargePct}%
                      </p>
                    </div>
                  </div>
                  <Badge tone={staleDataDemo ? 'warn' : 'eco'}>
                    {staleDataDemo ? 'Stale Snapshot' : 'Data Available'}
                  </Badge>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={props.onToggleStaleData}>
              Simulate Stale Snapshot
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<RefreshIcon size={13} />}
              onClick={props.onRefreshSampleData}
            >
              Refresh Baseline Snapshot
            </Button>
          </div>

          <div className="rounded-md border border-line bg-surface-2 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-caption font-bold text-ink">
                Reference Policy
              </span>
              <Badge tone="navy">Read-only</Badge>
            </div>
            <CardRow>
              <span className="text-caption text-ink-2">
                Vehicle Availability Threshold
              </span>
              <span className="font-mono text-caption font-bold text-ink">
                &lt; {policyConfig.minDispatchSoC}%
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">
                Parking Capacity Threshold
              </span>
              <span className="font-mono text-caption font-bold text-ink">
                &ge; {policyConfig.gridCriticalThreshold}%
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">
                Charging Utilization Threshold
              </span>
              <span className="font-mono text-caption font-bold text-ink">
                &ge; {policyConfig.gridWarningThreshold}%
              </span>
            </CardRow>
          </div>
        </div>

        <Button variant="primary" fullWidth onClick={props.onOpenReviewModal}>
          Review Scenario →
        </Button>
      </Card>

      <Modal
        open={reviewModalOpen}
        onClose={props.onCloseReviewModal}
        title="Confirm Simulation"
        size="md"
      >
        <div className="space-y-4">
          <Callout
            tone="info"
            title="Isolated Read-Only Snapshot"
            description="Executing this scenario will not mutate live hub occupancy, bookings, or charger allocations."
          />
          <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
            <CardRow>
              <span className="text-caption text-ink-2">Scenario Name</span>
              <span className="text-body-sm font-bold text-ink">
                {scenarioName}
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">Selected Hubs</span>
              <span className="font-mono text-body-sm font-semibold text-ink">
                {selectedHubIds.length} Selected Hubs · {durationHours}h (
                {timeStepMins}m step)
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">Demand Deltas</span>
              <span className="font-mono text-body-sm font-semibold text-primary-700">
                +{travelDelta}% Travel · +{chargingDelta}% Charge · +
                {parkingDelta}% Park
              </span>
            </CardRow>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={props.onCloseReviewModal}>
              Back to Configuration
            </Button>
            <Button variant="primary" onClick={props.onLaunchSandbox}>
              Run Simulation →
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
