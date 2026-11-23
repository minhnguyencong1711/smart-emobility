import { CheckCircleIcon } from '@/components/icons';
import {
  Badge,
  Button,
  Callout,
  Card,
  CardRow,
  Modal,
  StatusPill,
} from '@/components/ui';
import type { SimulationRecommendation, SimulationScenario } from '@/types';

export function SimulationAdvisoryView({
  sim,
  selectedRec,
  onBackToResults,
  onSelectRec,
  onCloseModal,
  onApproveRec,
}: {
  sim: SimulationScenario;
  selectedRec: SimulationRecommendation | null;
  onBackToResults: () => void;
  onSelectRec: (rec: SimulationRecommendation) => void;
  onCloseModal: () => void;
  onApproveRec: (rec: SimulationRecommendation) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-title font-extrabold text-ink">
            Coordination Recommendations
          </h2>
          <Button size="sm" variant="secondary" onClick={onBackToResults}>
            ← Back to Results
          </Button>
        </div>

        <div className="space-y-3">
          {sim.recommendations.map((rec) => (
            <Card key={rec.id} padding="md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-3xl space-y-1">
                  <p className="text-label font-bold uppercase tracking-wider text-primary-700">
                    {rec.targetType === 'SCHEDULING'
                      ? 'SMART CHARGING'
                      : 'VEHICLE REDISTRIBUTION'}
                  </p>
                  <h3 className="text-body-lg font-extrabold text-ink">
                    {rec.title}
                  </h3>
                  <p className="text-body-sm text-ink-2">{rec.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {rec.approvedToM4 ? (
                    <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
                      Dispatched to Operations
                    </StatusPill>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onSelectRec(rec)}
                    >
                      Review Recommendation →
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Card padding="md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-3xl space-y-1">
                <p className="text-label font-bold uppercase tracking-wider text-ink-3">
                  PARKING GUIDANCE
                </p>
                <h3 className="text-body-lg font-extrabold text-ink">
                  Guide new parking requests to Dormitory Zone A
                </h3>
                <p className="text-body-sm text-ink-2">
                  During 08:00–10:00, suggest Zone A instead of Metro after a
                  live capacity check. Keep confirmed bookings unchanged.
                </p>
              </div>
              <Badge tone="neutral">Advisor Only</Badge>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(selectedRec)}
        onClose={onCloseModal}
        title={
          selectedRec?.targetType === 'SCHEDULING'
            ? 'Review Charging Plan'
            : 'Review Redistribution Plan'
        }
        size="md"
      >
        {selectedRec ? (
          <div className="space-y-4">
            <Callout
              tone="warn"
              title="Confirm Operational Dispatch"
              description="Approving this advisory item creates a live operational record in Smart Grid & Logistics without disrupting unrelated active sessions."
            />
            <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
              <CardRow>
                <span className="text-caption text-ink-2">Recommendation</span>
                <span className="text-body-sm font-bold text-ink">
                  {selectedRec.title}
                </span>
              </CardRow>
              <CardRow>
                <span className="text-caption text-ink-2">Target Workflow</span>
                <span className="font-mono text-body-sm font-semibold text-primary-700">
                  {selectedRec.targetType === 'SCHEDULING'
                    ? 'Smart Charging Schedule'
                    : 'Fleet Redistribution'}
                </span>
              </CardRow>
              <CardRow>
                <span className="text-caption text-ink-2">Expected Impact</span>
                <span className="font-mono text-body-sm font-bold text-eco-700">
                  -{selectedRec.expectedWaitReductionPct}% Wait Time
                </span>
              </CardRow>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => onApproveRec(selectedRec)}
              >
                Dispatch to Operations →
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
