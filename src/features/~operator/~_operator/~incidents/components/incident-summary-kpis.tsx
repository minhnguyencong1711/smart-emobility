import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ShieldAlertIcon,
  WrenchIcon,
} from '@/components/icons';
import { StatCard } from '@/components/ui';
import type { IncidentRecord } from '@/types';

export function IncidentSummaryKpis({
  incidents,
}: {
  incidents: IncidentRecord[];
}) {
  const criticalCount = incidents.filter(
    (i) => i.severity === 'CRITICAL',
  ).length;
  const majorCount = incidents.filter((i) => i.severity === 'WARNING').length;
  const minorCount = incidents.filter((i) => i.severity === 'INFO').length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="TOTAL INCIDENTS"
        value={incidents.length}
        icon={<ShieldAlertIcon size={18} />}
        iconTone="navy"
        progress={100}
        progressTone="primary"
        footerLeft="Network queue"
        footerRight="Active audit"
      />
      <StatCard
        title="CRITICAL (P1)"
        value={criticalCount}
        badgeText="Immediate Action"
        badgeTone="danger"
        icon={<AlertTriangleIcon size={18} />}
        iconTone="danger"
        progress={75}
        progressTone="danger"
        footerLeft="Safety relay trips"
        footerRight="SLA 10m"
        footerRightTone="danger"
      />
      <StatCard
        title="MAJOR (P2)"
        value={majorCount}
        badgeText="SLA 30m"
        badgeTone="warn"
        icon={<WrenchIcon size={18} />}
        iconTone="warn"
        progress={50}
        progressTone="warn"
        footerLeft="Terminal / latch alerts"
        footerRight="Assigned"
        footerRightTone="warn"
      />
      <StatCard
        title="MINOR (P3)"
        value={minorCount}
        badgeText="Scheduled"
        badgeTone="primary"
        icon={<CheckCircleIcon size={18} />}
        iconTone="primary"
        progress={35}
        progressTone="eco"
        footerLeft="Sensor diagnostics"
        footerRight="Under repair"
      />
    </div>
  );
}
