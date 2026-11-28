import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
  DataTable,
  FilterChip,
  PageHeader,
  Pagination,
  SearchBar,
  Select,
} from '@/components/ui';
import { usePagination } from '@/hooks';
import { useMobilityStore, useToastStore } from '@/stores';
import type { IncidentRecord } from '@/types';

import { buildIncidentColumns } from './components/incident-columns';
import { IncidentInspectionDrawer } from './components/incident-inspection-drawer';
import { IncidentIsolationModal } from './components/incident-isolation-modal';
import { IncidentSummaryKpis } from './components/incident-summary-kpis';

export const Route = createFileRoute('/operator/_operator/incidents/')({
  component: IncidentsManagementPage,
});

type StatusTab = 'ALL' | 'OPEN' | 'ISOLATED' | 'UNDER_REPAIR';

function IncidentsManagementPage() {
  const { hubs, incidents, isolateIncidentEquipment } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);
  const searchStr = useRouterState({
    select: (s) => s.location.searchStr ?? '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [hubFilter, setHubFilter] = useState('ALL');
  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [inspectedIncident, setInspectedIncident] =
    useState<IncidentRecord | null>(null);

  const [isolationTarget, setIsolationTarget] = useState<IncidentRecord | null>(
    null,
  );
  const [isolationStep, setIsolationStep] = useState<0 | 1 | 2>(0);
  const [assignedCrew, setAssignedCrew] = useState('Đinh Phạm Ngọc Phước');
  const [safetyChecklist, setSafetyChecklist] = useState({
    lockConnector: true,
    notifyAffected: true,
  });
  const [dispatchNotes, setDispatchNotes] = useState(
    'Verify earth leakage relay & test insulation resistance before re-energizing.',
  );

  useEffect(() => {
    if (searchStr.includes('view=isolation') && !isolationTarget) {
      const firstOpen =
        incidents.find((i) => i.status === 'REPORTED') ?? incidents[0];
      if (firstOpen) {
        setIsolationTarget(firstOpen);
        setIsolationStep(0);
      }
    }
  }, [searchStr]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (hubFilter !== 'ALL' && inc.hubId !== hubFilter) return false;
      if (
        statusTab === 'OPEN' &&
        inc.status !== 'REPORTED' &&
        inc.status !== 'INVESTIGATING'
      ) {
        return false;
      }
      if (statusTab === 'ISOLATED' && inc.status !== 'ISOLATED') return false;
      if (statusTab === 'UNDER_REPAIR' && inc.status !== 'UNDER_REPAIR') {
        return false;
      }
      if (q) {
        const hay =
          `${inc.code} ${inc.resourceCode} ${inc.telemetryReading} ${inc.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [incidents, hubFilter, statusTab, searchQuery]);

  const openCount = incidents.filter(
    (i) => i.status === 'REPORTED' || i.status === 'INVESTIGATING',
  ).length;

  const {
    page,
    totalPages,
    totalItems,
    pageItems: pagedIncidents,
    setPage,
  } = usePagination(filteredIncidents, 5);

  function openIsolationModal(inc: IncidentRecord) {
    setIsolationTarget(inc);
    setIsolationStep(0);
  }

  function executeIsolation() {
    if (!isolationTarget) return;
    isolateIncidentEquipment(isolationTarget.id, assignedCrew, dispatchNotes);
    setIsolationStep(2);
    pushToast({
      tone: 'ok',
      title: `Remote Isolation Executed (${isolationTarget.code})`,
      description: `${isolationTarget.resourceCode} isolated & ticket assigned to ${assignedCrew}.`,
    });
  }

  const columns = buildIncidentColumns({
    hubs,
    onOpenIsolation: openIsolationModal,
    onInspectIncident: setInspectedIncident,
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Incident Queue & Dispatch"
        breadcrumb={[
          { label: 'Home', to: '/operator/monitoring' },
          { label: 'Operations Management', to: '/operator/monitoring' },
          { label: 'Incident Queue' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Incident ID, Device, Hub..."
              className="w-56 xl:w-64"
            />
            <Select
              value={hubFilter}
              onChange={(e) => setHubFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Campus Hubs' },
                ...hubs.map((h) => ({ value: h.id, label: h.name })),
              ]}
              className="w-52"
            />
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <IncidentSummaryKpis incidents={incidents} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ['ALL', `All Active (${incidents.length})`],
                ['OPEN', `Pending Triage (${openCount})`],
                [
                  'ISOLATED',
                  `Isolated (${incidents.filter((i) => i.status === 'ISOLATED').length})`,
                ],
                [
                  'UNDER_REPAIR',
                  `Under Repair (${incidents.filter((i) => i.status === 'UNDER_REPAIR').length})`,
                ],
              ] as const
            ).map(([key, label]) => (
              <FilterChip
                key={key}
                size="sm"
                tone="navy"
                active={statusTab === key}
                onClick={() => {
                  setStatusTab(key);
                  setPage(1);
                }}
              >
                {label}
              </FilterChip>
            ))}
          </div>

          <span className="text-caption font-medium text-ink-3">
            Telemetry Ingestion Active via IoT Gateway (5s Poll)
          </span>
        </div>

        <DataTable
          caption="Incident Management Queue"
          rows={pagedIncidents}
          columns={columns}
          rowKey={(row) => row.id}
        />

        <Pagination
          variant="default"
          itemLabel="incidents"
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={5}
          onPageChange={setPage}
        />
      </div>

      <IncidentInspectionDrawer
        incident={inspectedIncident}
        onClose={() => setInspectedIncident(null)}
        onLaunchIsolation={(target) => {
          setInspectedIncident(null);
          openIsolationModal(target);
        }}
      />

      <IncidentIsolationModal
        isolationTarget={isolationTarget}
        isolationStep={isolationStep}
        assignedCrew={assignedCrew}
        safetyChecklist={safetyChecklist}
        dispatchNotes={dispatchNotes}
        onClose={() => setIsolationTarget(null)}
        onStepChange={setIsolationStep}
        onAssignedCrewChange={setAssignedCrew}
        onChecklistChange={setSafetyChecklist}
        onDispatchNotesChange={setDispatchNotes}
        onExecuteIsolation={executeIsolation}
      />
    </div>
  );
}
