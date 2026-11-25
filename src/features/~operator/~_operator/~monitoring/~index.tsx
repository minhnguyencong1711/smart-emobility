import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { RefreshIcon } from '@/components/icons';
import { CampusHubMap } from '@/components/shared';
import {
  Button,
  Callout,
  FilterChip,
  PageHeader,
  SearchBar,
} from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';
import type { HubStatus } from '@/types';
import { getHubPriorityRank } from '@/utils/hub-metrics';

import { HubPriorityQueue } from './components/hub-priority-queue';
import { LiveFleetTripsCard } from './components/live-fleet-trips-card';
import { MonitoringKpiRow } from './components/monitoring-kpi-row';

export const Route = createFileRoute('/operator/_operator/monitoring/')({
  component: NetworkMonitoringPage,
});

type StatusFilter = 'ALL' | HubStatus;

function NetworkMonitoringPage() {
  const navigate = useNavigate();
  const { hubs, incidents, policyConfig, hydrateFromBackend } =
    useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedHubId, setSelectedHubId] = useState<string>(hubs[0].id);
  const [refreshing, setRefreshing] = useState(false);

  const openIncidentsCount = incidents.filter(
    (inc) => inc.status === 'REPORTED' || inc.status === 'INVESTIGATING',
  ).length;
  const criticalHub = hubs.find((h) => h.status === 'CRITICAL') ?? hubs[0];

  const sortedAndFilteredHubs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...hubs]
      .filter((h) => {
        if (statusFilter !== 'ALL' && h.status !== statusFilter) return false;
        if (q) {
          const hay =
            `${h.name} ${h.shortName} ${h.code} ${h.location}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) => getHubPriorityRank(a.status) - getHubPriorityRank(b.status),
      );
  }, [hubs, statusFilter, searchQuery]);

  const totalSharedReady = hubs.reduce((acc, h) => acc + h.sharedEvsReady, 0);
  const totalShared = hubs.reduce((acc, h) => acc + h.sharedEvsTotal, 0);
  const totalCoreOcc = hubs.reduce((acc, h) => acc + h.coreBaysOccupied, 0);
  const totalCore = hubs.reduce((acc, h) => acc + h.coreBaysTotal, 0);
  const totalBufOcc = hubs.reduce((acc, h) => acc + h.bufferBaysOccupied, 0);
  const totalBuf = hubs.reduce((acc, h) => acc + h.bufferBaysTotal, 0);
  const totalOccupiedBays = totalCoreOcc + totalBufOcc;
  const totalBays = totalCore + totalBuf;
  const activeChargers = hubs.reduce((acc, h) => acc + h.chargerPortsActive, 0);
  const totalChargers = hubs.reduce((acc, h) => acc + h.chargerPortsTotal, 0);
  const totalGridCurrent = hubs.reduce((acc, h) => acc + h.gridCurrentKw, 0);
  const totalGridMax = hubs.reduce((acc, h) => acc + h.gridMaxKw, 0);
  const gridPct = Math.round((totalGridCurrent / totalGridMax) * 1000) / 10;

  const statusCounts = {
    ALL: hubs.length,
    CRITICAL: hubs.filter((h) => h.status === 'CRITICAL').length,
    WARNING: hubs.filter((h) => h.status === 'WARNING').length,
    NORMAL: hubs.filter((h) => h.status === 'NORMAL').length,
  };

  function handleRefresh() {
    setRefreshing(true);
    void hydrateFromBackend();
    window.setTimeout(() => {
      setRefreshing(false);
      pushToast({
        tone: 'info',
        title: 'Network telemetry synced',
        description: 'All 5 campus hubs polled via IoT Gateway.',
      });
    }, 350);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Network Overview Dashboard"
        breadcrumb={[
          { label: 'Home' },
          { label: 'Operations Management' },
          { label: 'Network Overview' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hub, bay, vehicle..."
              className="w-44 xl:w-52"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip
                tone="navy"
                active={statusFilter === 'ALL'}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({statusCounts.ALL})
              </FilterChip>
              <FilterChip
                tone="danger"
                active={statusFilter === 'CRITICAL'}
                onClick={() => setStatusFilter('CRITICAL')}
              >
                Critical ({statusCounts.CRITICAL})
              </FilterChip>
              <FilterChip
                tone="warn"
                active={statusFilter === 'WARNING'}
                onClick={() => setStatusFilter('WARNING')}
              >
                Warning ({statusCounts.WARNING})
              </FilterChip>
              <FilterChip
                tone="ok"
                active={statusFilter === 'NORMAL'}
                onClick={() => setStatusFilter('NORMAL')}
              >
                Normal ({statusCounts.NORMAL})
              </FilterChip>
            </div>
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<RefreshIcon size={14} />}
              isLoading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        {openIncidentsCount > 0 ? (
          <Callout
            tone="danger"
            title={`Active Safety Alert: ${openIncidentsCount} Open Incidents · ${criticalHub.name} Critical Saturation`}
            description={`Charger Port CP-B04 reported 38.4 mA earth leakage and ${criticalHub.shortName} feeder reached ${Math.round((criticalHub.gridCurrentKw / criticalHub.gridMaxKw) * 100)}% load.`}
            action={
              <div className="flex flex-wrap gap-2">
                <Link to="/operator/incidents">
                  <Button size="sm" variant="danger">
                    Inspect Incident Queue ({openIncidentsCount}) →
                  </Button>
                </Link>
                <Link
                  to="/operator/monitoring/$id"
                  params={{ id: criticalHub.id }}
                >
                  <Button size="sm" variant="secondary">
                    Open {criticalHub.shortName} →
                  </Button>
                </Link>
              </div>
            }
          />
        ) : null}

        <MonitoringKpiRow
          totalShared={totalShared}
          totalOccupiedBays={totalOccupiedBays}
          totalBays={totalBays}
          totalCoreOcc={totalCoreOcc}
          totalCore={totalCore}
          totalBufOcc={totalBufOcc}
          totalBuf={totalBuf}
          activeChargers={activeChargers}
          totalChargers={totalChargers}
          totalGridCurrent={totalGridCurrent}
          totalGridMax={totalGridMax}
          gridPct={gridPct}
          gridWarningThreshold={policyConfig.gridWarningThreshold}
        />

        <div className="grid items-start gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CampusHubMap
              hubs={sortedAndFilteredHubs}
              selectedHubId={selectedHubId}
              onSelectHub={(id) => {
                setSelectedHubId(id);
                navigate({ to: '/operator/monitoring/$id', params: { id } });
              }}
              variant="operator"
              className="h-[640px]"
            />
          </div>

          <HubPriorityQueue
            hubs={sortedAndFilteredHubs}
            totalSharedReady={totalSharedReady}
            selectedHubId={selectedHubId}
            onSelectHubId={setSelectedHubId}
          />
        </div>

        <LiveFleetTripsCard />
      </div>
    </div>
  );
}
