import {
  Button,
  Callout,
  CardRow,
  Checkbox,
  Modal,
  Select,
  StepNav,
  Textarea,
} from '@/components/ui';
import type { IncidentRecord } from '@/types';

export function IncidentIsolationModal({
  isolationTarget,
  isolationStep,
  assignedCrew,
  safetyChecklist,
  dispatchNotes,
  onClose,
  onStepChange,
  onAssignedCrewChange,
  onChecklistChange,
  onDispatchNotesChange,
  onExecuteIsolation,
}: {
  isolationTarget: IncidentRecord | null;
  isolationStep: 0 | 1 | 2;
  assignedCrew: string;
  safetyChecklist: { lockConnector: boolean; notifyAffected: boolean };
  dispatchNotes: string;
  onClose: () => void;
  onStepChange: (step: 0 | 1 | 2) => void;
  onAssignedCrewChange: (val: string) => void;
  onChecklistChange: (val: {
    lockConnector: boolean;
    notifyAffected: boolean;
  }) => void;
  onDispatchNotesChange: (val: string) => void;
  onExecuteIsolation: () => void;
}) {
  return (
    <Modal
      open={Boolean(isolationTarget)}
      onClose={onClose}
      title={`Emergency Remote Isolation: ${isolationTarget?.resourceCode ?? ''}`}
      size="lg"
    >
      {isolationTarget ? (
        <div className="space-y-4">
          <StepNav
            currentStepIndex={isolationStep}
            steps={[
              { id: 'impact', label: 'Step 1: Impact & Auto-Reroute' },
              { id: 'dispatch', label: 'Step 2: Dispatch Ticket Form' },
              { id: 'done', label: 'Step 3: Success Outcome' },
            ]}
          />

          {isolationStep === 0 ? (
            <div className="space-y-3">
              <Callout
                tone="danger"
                title="Remote Isolation Safety Cut-off"
                description="System will issue a software request to ChargingStationController to safely lock the connector, de-energize the relay, and mark OUT_OF_SERVICE."
              />
              <Callout
                tone="info"
                title="Automated Reservation Re-routing (Booking Protection)"
                description="Detected 1 Upcoming Reservation (#BK-8821). System automatically transfers reservation to Adjacent Port CP-B02 (DC 30kW) and notifies the student."
              />
              <div className="rounded-md border border-line bg-surface-2 px-4 py-1 font-mono text-caption">
                <CardRow>
                  <span>Target Resource</span>
                  <span className="font-bold text-danger-700">
                    FAULTY → OUT_OF_SERVICE (ISOLATED)
                  </span>
                </CardRow>
                <CardRow>
                  <span>Incident {isolationTarget.code}</span>
                  <span className="font-bold text-warn-700">
                    OPEN → ISOLATED
                  </span>
                </CardRow>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => onStepChange(1)}>
                  Confirm Isolation &amp; Issue Ticket →
                </Button>
              </div>
            </div>
          ) : null}

          {isolationStep === 1 ? (
            <div className="space-y-3">
              <Select
                label="Assign Field Operations Crew"
                value={assignedCrew}
                onChange={(e) => onAssignedCrewChange(e.target.value)}
                options={[
                  {
                    value: 'Đinh Phạm Ngọc Phước',
                    label: 'Đinh Phạm Ngọc Phước (High-Voltage Certified)',
                  },
                  {
                    value: 'Nguyễn Đức Trọng',
                    label: 'Nguyễn Đức Trọng (Telemetry & Lock Spec)',
                  },
                ]}
              />
              <Checkbox
                label="Lock charger connector & cut off 400V DC relay"
                checked={safetyChecklist.lockConnector}
                onChange={(e) =>
                  onChecklistChange({
                    ...safetyChecklist,
                    lockConnector: e.target.checked,
                  })
                }
              />
              <Checkbox
                label="Notify affected student charging sessions & trigger recovery"
                checked={safetyChecklist.notifyAffected}
                onChange={(e) =>
                  onChecklistChange({
                    ...safetyChecklist,
                    notifyAffected: e.target.checked,
                  })
                }
              />
              <Textarea
                label="Field Technician Dispatch Notes"
                value={dispatchNotes}
                onChange={(e) => onDispatchNotesChange(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => onStepChange(0)}>
                  Back
                </Button>
                <Button variant="danger" onClick={onExecuteIsolation}>
                  Execute Isolation &amp; Dispatch Crew
                </Button>
              </div>
            </div>
          ) : null}

          {isolationStep === 2 ? (
            <div className="space-y-4">
              <Callout
                tone="ok"
                title="Isolation Executed & Dispatch Ticket #TK-2026-104 Issued"
                description={`${isolationTarget.resourceCode} is now ISOLATED across the hub charger matrix and affected student sessions. Crew ${assignedCrew} has been dispatched.`}
              />
              <div className="flex justify-end">
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
