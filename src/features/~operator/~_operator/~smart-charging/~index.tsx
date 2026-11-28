import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { PageHeader, SearchBar, Tabs } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import { DlbTelemetryPanel } from './components/dlb-telemetry-panel';
import { SmartSchedulePanel } from './components/smart-schedule-panel';

export const Route = createFileRoute('/operator/_operator/smart-charging/')({
  component: SmartChargingPage,
});

function SmartChargingPage() {
  const {
    chargingQueue,
    dlbMode,
    chargingScheduleApplied,
    chargingScheduleGeneratedAt,
    chargingScheduleOptimized,
    dlbActivityLogs,
    policyConfig,
    setDlbMode,
    generateChargingSchedule,
    applyChargingSchedule,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);
  const searchStr = useRouterState({
    select: (s) => s.location.searchStr ?? '',
  });

  const [tab, setTab] = useState<'schedule' | 'dlb'>(
    searchStr.includes('tab=schedule') ? 'schedule' : 'dlb',
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchStr.includes('tab=schedule')) {
      setTab('schedule');
    } else if (searchStr === '') {
      setTab('dlb');
    }
  }, [searchStr]);

  const q = searchQuery.trim().toLowerCase();
  const tier2Items = chargingQueue.filter(
    (c) =>
      c.tier === 2 &&
      (!q ||
        c.plateNumber.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)),
  );
  const tier3Items = chargingQueue.filter(
    (c) =>
      c.tier === 3 &&
      (!q ||
        c.plateNumber.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Smart Grid & DLB Dashboard"
        breadcrumb={[
          { label: 'Home', to: '/operator/monitoring' },
          { label: 'Grid & Logistics', to: '/operator/monitoring' },
          { label: 'Smart Grid & DLB' },
        ]}
        actions={
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hub, bay ID, plate..."
            className="w-60 xl:w-64"
          />
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as 'schedule' | 'dlb')}
          items={[
            { id: 'schedule', label: 'Smart Charging Schedule' },
            { id: 'dlb', label: 'Real-Time Grid & DLB' },
          ]}
        />

        {tab === 'schedule' ? (
          <SmartSchedulePanel
            chargingQueue={chargingQueue}
            tier2Items={tier2Items}
            tier3Items={tier3Items}
            generatedAt={chargingScheduleGeneratedAt}
            scheduleOptimized={chargingScheduleOptimized}
            chargingScheduleApplied={chargingScheduleApplied}
            onGenerateSchedule={() => {
              generateChargingSchedule();
              pushToast({
                tone: 'info',
                title: 'Charging schedule generated',
                description:
                  'Allocated Ports 1–4 respecting Tier 1 & Tier 2 deadlines.',
              });
            }}
            onApplySchedule={() => {
              applyChargingSchedule();
              pushToast({
                tone: 'ok',
                title: 'Schedule Applied',
                description:
                  'Charging schedule dispatched to all 4 station ports.',
              });
            }}
          />
        ) : (
          <DlbTelemetryPanel
            dlbMode={dlbMode}
            gridWarningThreshold={policyConfig.gridWarningThreshold}
            dlbActivityLogs={dlbActivityLogs}
            onSelectMode={setDlbMode}
          />
        )}
      </div>
    </div>
  );
}
