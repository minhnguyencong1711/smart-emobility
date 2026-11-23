import { Button, Callout, CardRow, Drawer } from '@/components/ui';
import type { IncidentRecord } from '@/types';

export function IncidentInspectionDrawer({
  incident,
  onClose,
  onLaunchIsolation,
}: {
  incident: IncidentRecord | null;
  onClose: () => void;
  onLaunchIsolation: (incident: IncidentRecord) => void;
}) {
  return (
    <Drawer
      open={Boolean(incident)}
      onClose={onClose}
      side="right"
      ariaLabel={`Incident Inspection ${incident?.code ?? ''}`}
    >
      {incident ? (
        <div className="space-y-4 p-4">
          <h3 className="text-title font-extrabold text-ink">
            Incident Inspection · {incident.code}
          </h3>
          <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
            <CardRow>
              <span className="text-caption text-ink-2">Target Resource</span>
              <span className="font-mono text-body-sm font-bold text-ink">
                {incident.resourceCode}
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">Telemetry Reading</span>
              <span className="font-mono text-body-sm font-bold text-danger-700">
                {incident.telemetryReading}
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">Reported At</span>
              <span className="text-body-sm font-semibold text-ink">
                {incident.reportedAt}
              </span>
            </CardRow>
            <CardRow>
              <span className="text-caption text-ink-2">Assigned Crew</span>
              <span className="text-body-sm font-semibold text-ink">
                {incident.assignedCrew ?? 'Unassigned'}
              </span>
            </CardRow>
          </div>

          <Callout
            tone="info"
            title="Diagnostic Summary"
            description={incident.description}
          />

          {incident.status === 'REPORTED' ? (
            <Button
              variant="danger"
              fullWidth
              onClick={() => onLaunchIsolation(incident)}
            >
              Launch Emergency Isolation →
            </Button>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
