import { Link } from '@tanstack/react-router';

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FlaskIcon,
} from '@/components/icons';
import { CampusHubMap, type HeatmapHubMetric } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  DataTable,
  StatCard,
  type Column,
} from '@/components/ui';
import type { MobilityHub, SimulationScenario } from '@/types';

type HubImpactRow = {
  hubName: string;
  unservedTrips: string;
  parkingSat: string;
  chargingSat: string;
  status: 'CRITICAL' | 'WARNING' | 'STABLE';
};

const HUB_IMPACT_ROWS: HubImpactRow[] = [
  {
    hubName: 'Suoi Tien Metro Station',
    unservedTrips: '12 → 90',
    parkingSat: '72% → 94%',
    chargingSat: '70% → 98%',
    status: 'CRITICAL',
  },
  {
    hubName: 'Dormitory Zone A',
    unservedTrips: '5 → 30',
    parkingSat: '56% → 73%',
    chargingSat: '52% → 73%',
    status: 'WARNING',
  },
  {
    hubName: 'Dormitory Zone B',
    unservedTrips: '3 → 15',
    parkingSat: '40% → 52%',
    chargingSat: '35% → 49%',
    status: 'STABLE',
  },
];

const IMPACT_COLUMNS: Column<HubImpactRow>[] = [
  {
    key: 'hubName',
    header: 'Hub',
    cell: (r) => (
      <span className="text-caption font-bold text-ink">{r.hubName}</span>
    ),
  },
  {
    key: 'trips',
    header: 'Trips',
    cell: (r) => (
      <span className="whitespace-nowrap font-mono text-caption font-semibold text-ink">
        {r.unservedTrips}
      </span>
    ),
  },
  {
    key: 'parking',
    header: 'Parking',
    cell: (r) => (
      <span className="whitespace-nowrap font-mono text-caption">
        {r.parkingSat}
      </span>
    ),
  },
  {
    key: 'charging',
    header: 'Charging',
    cell: (r) => (
      <span className="whitespace-nowrap font-mono text-caption">
        {r.chargingSat}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Severity',
    cell: (r) => (
      <Badge
        size="sm"
        tone={
          r.status === 'CRITICAL'
            ? 'danger'
            : r.status === 'WARNING'
              ? 'warn'
              : 'ok'
        }
      >
        {r.status}
      </Badge>
    ),
  },
];

export function SimulationResultsView({
  sim,
  hubs,
  heatmapData,
  onViewRecommendations,
}: {
  sim: SimulationScenario;
  hubs: MobilityHub[];
  heatmapData: Record<string, HeatmapHubMetric>;
  onViewRecommendations: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-line bg-surface px-4 py-2 text-caption font-medium text-ink-2">
        <strong className="font-mono text-ink">SIM-0001</strong> ·{' '}
        {sim.selectedHubIds.length} Selected Hubs · 25 Oct 2026, 08:00 ICT ·
        Horizon: {sim.durationHours} hours · Step: {sim.timeStepMins} minutes
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Students Missing Trips"
          value={120}
          badgeText="+102 students"
          badgeTone="danger"
          icon={<AlertTriangleIcon size={18} />}
          iconTone="danger"
          footerLeft="Baseline: 18 students"
          footerRight="unique students"
        />
        <StatCard
          title="Average Charging Wait"
          value={22}
          denominator="min"
          badgeText="+14 min"
          badgeTone="warn"
          icon={<ClockIcon size={18} />}
          iconTone="warn"
          footerLeft="Baseline: 8 min"
          footerRight="completed wait obs."
        />
        <StatCard
          title="Vehicle Shortage Rate"
          value="15%"
          badgeText="+11 pp"
          badgeTone="danger"
          icon={<FlaskIcon size={18} />}
          iconTone="danger"
          footerLeft="Baseline: 4%"
          footerRight="135 / 900 trip requests"
        />
        <StatCard
          title="Parking Shortage Rate"
          value="10%"
          badgeText="+8 pp"
          badgeTone="warn"
          icon={<CheckCircleIcon size={18} />}
          iconTone="warn"
          footerLeft="Baseline: 2%"
          footerRight="52 / 520 parking req."
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <CampusHubMap
            hubs={hubs}
            heatmapData={heatmapData}
            variant="heatmap"
            className="h-[520px]"
          />
        </div>

        <div className="space-y-4 xl:col-span-6">
          <Card padding="md" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-body-lg font-extrabold text-ink">
                Baseline vs Simulated Shortages
              </h3>
              <div className="flex items-center gap-3 text-caption font-semibold">
                <span className="inline-flex items-center gap-1 text-ink-3">
                  <span className="size-2.5 rounded-xs bg-surface-3" />
                  Baseline
                </span>
                <span className="inline-flex items-center gap-1 text-primary-700">
                  <span className="size-2.5 rounded-xs bg-primary" />
                  Simulated
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 rounded-md border border-line bg-surface-2 p-4">
              <div className="flex flex-col items-center">
                <div className="flex h-28 items-end gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[11px] font-bold text-ink-2">
                      4%
                    </span>
                    <div className="h-5 w-8 rounded-t-xs bg-line-strong" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[11px] font-bold text-primary-700">
                      15%
                    </span>
                    <div className="h-20 w-8 rounded-t-xs bg-primary" />
                  </div>
                </div>
                <p className="mt-2 text-caption font-semibold text-ink">
                  Vehicle shortage
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-28 items-end gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[11px] font-bold text-ink-2">
                      2%
                    </span>
                    <div className="h-3 w-8 rounded-t-xs bg-line-strong" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[11px] font-bold text-primary-700">
                      10%
                    </span>
                    <div className="h-14 w-8 rounded-t-xs bg-primary" />
                  </div>
                </div>
                <p className="mt-2 text-caption font-semibold text-ink">
                  Parking shortage
                </p>
              </div>
            </div>
          </Card>

          <DataTable
            columns={IMPACT_COLUMNS}
            rows={HUB_IMPACT_ROWS}
            rowKey={(r) => r.hubName}
            caption="Hub Impact Breakdown"
            responsiveStack={false}
          />

          <div className="flex justify-end gap-2">
            <Link to="/operator/simulation">
              <Button variant="secondary" size="sm">
                Edit Scenario
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={onViewRecommendations}>
              View Recommendations →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
