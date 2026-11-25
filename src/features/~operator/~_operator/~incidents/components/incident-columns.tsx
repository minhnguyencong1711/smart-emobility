import {
  Badge,
  Button,
  IncidentStatusPill,
  type Column,
} from '@/components/ui';
import type { IncidentRecord, IncidentStatus, MobilityHub } from '@/types';

export function buildIncidentColumns({
  hubs,
  onOpenIsolation,
  onInspectIncident,
}: {
  hubs: MobilityHub[];
  onOpenIsolation: (row: IncidentRecord) => void;
  onInspectIncident: (row: IncidentRecord) => void;
}): Column<IncidentRecord>[] {
  return [
    {
      key: 'code',
      header: 'INCIDENT ID',
      cell: (row) => (
        <span className="whitespace-nowrap font-mono text-body-sm font-bold text-ink">
          {row.code}
        </span>
      ),
    },
    {
      key: 'resource',
      header: 'TARGET DEVICE / EV',
      cell: (row) => (
        <span className="text-body-sm font-semibold text-ink">
          {row.resourceCode}
        </span>
      ),
    },
    {
      key: 'hub',
      header: 'HUB LOCATION',
      cell: (row) => {
        const hub = hubs.find((h) => h.id === row.hubId);
        return (
          <span className="text-body-sm text-ink-2">
            {hub?.shortName ?? row.hubId}
          </span>
        );
      },
    },
    {
      key: 'telemetry',
      header: 'DIAGNOSTIC / TELEMETRY',
      cell: (row) => (
        <div className="max-w-[280px] space-y-0.5">
          <p className="font-mono text-caption font-semibold text-danger-700">
            {row.telemetryReading}
          </p>
          <p
            title={row.description}
            className="line-clamp-1 text-caption text-ink-2"
          >
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'SEVERITY',
      cell: (row) => (
        <Badge
          tone={
            row.severity === 'CRITICAL'
              ? 'danger'
              : row.severity === 'WARNING'
                ? 'warn'
                : 'info'
          }
        >
          {row.severity === 'WARNING' ? 'MAJOR' : row.severity}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (row) => (
        <IncidentStatusPill status={row.status as IncidentStatus} />
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onInspectIncident(row)}
          >
            Inspect
          </Button>
          {row.status === 'REPORTED' ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onOpenIsolation(row)}
            >
              Remote Isolate →
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
}
