import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { AlertTriangleIcon, BoltIcon } from '@/components/icons';
import { Button, PageHeader, StatusPill } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import {
  ChargingStatusAlerts,
  StopChargingModal,
} from './components/charging-status-banner';
import {
  ChargingKpiGrid,
  ChargingTelemetryWorkspace,
} from './components/charging-telemetry-panel';

export const Route = createFileRoute('/student/_student/charging/live')({
  component: LiveChargingPage,
});

function LiveChargingPage() {
  const navigate = useNavigate();
  const {
    hubs,
    activeParking,
    setChargingSessionStatus,
    tickChargingProgress,
    resumeInterruptedCharging,
    reassignChargingPort,
    stopChargingKeepParking,
    exitHubReleaseBay,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [stopModalOpen, setStopModalOpen] = useState(false);

  const hub =
    hubs.find((h) => h.id === (activeParking?.hubId ?? hubs[0].id)) ?? hubs[0];
  const status = activeParking?.chargingStatus ?? 'CHARGING';
  const soc = activeParking?.socPercent ?? 68;
  const targetSoc = activeParking?.targetSocPercent ?? 90;
  const currentKw =
    status === 'CHARGING'
      ? 6.8
      : status === 'THROTTLED'
        ? 3.7
        : (activeParking?.currentKw ?? 0);
  const energyKwh = activeParking?.energyDeliveredKwh ?? 9.38;
  const estimatedCostVnd = Math.round(energyKwh * 3570);

  const elapsedMins = activeParking?.chargingElapsedMins ?? 84;
  const elapsedStr = `${String(Math.floor(elapsedMins / 60)).padStart(2, '0')}:${String(elapsedMins % 60).padStart(2, '0')}:36`;

  const powerPoints =
    status === 'INTERRUPTED'
      ? '0,88 70,88 140,88 210,88 280,140 420,140'
      : status === 'THROTTLED'
        ? '0,104 70,86 140,84 210,86 280,115 350,116 420,116'
        : '0,108 70,88 140,84 210,82 280,82 350,80 420,80';
  const socPoints = '0,136 70,122 140,108 210,94 280,80 350,64 420,52';

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Live Charging Monitoring"
        breadcrumb={[
          { label: 'Home', to: '/student/vehicles' },
          { label: 'Personal Charging', to: '/student/parking' },
          { label: 'Charging Sessions' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill
              tone={
                status === 'INTERRUPTED'
                  ? 'danger'
                  : status === 'THROTTLED'
                    ? 'warn'
                    : 'ok'
              }
              icon={
                status === 'INTERRUPTED' ? (
                  <AlertTriangleIcon size={12} />
                ) : (
                  <BoltIcon size={12} />
                )
              }
              pulse={status === 'CHARGING'}
            >
              {status}
            </StatusPill>
            <Button
              size="sm"
              variant="secondary"
              disabled={status !== 'CHARGING' && status !== 'THROTTLED'}
              onClick={tickChargingProgress}
            >
              Simulate +10% SoC
            </Button>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <ChargingKpiGrid
          currentKw={currentKw}
          soc={soc}
          targetSoc={targetSoc}
          elapsedStr={elapsedStr}
          energyKwh={energyKwh}
          estimatedCostVnd={estimatedCostVnd}
        />

        <ChargingStatusAlerts
          status={status}
          activeParking={activeParking}
          onSelectStatus={setChargingSessionStatus}
          onResumeCharging={() => {
            resumeInterruptedCharging();
            pushToast({
              tone: 'ok',
              title: 'Charging Resumed',
              description: 'Power delivery restored cleanly.',
            });
          }}
          onReassignPort={() => {
            reassignChargingPort('CP-A02');
            pushToast({
              tone: 'info',
              title: 'Port Reassigned to CP-A02',
              description: 'Transferred to adjacent healthy port.',
            });
          }}
        />

        <ChargingTelemetryWorkspace
          hub={hub}
          activeParking={activeParking}
          status={status}
          soc={soc}
          powerPoints={powerPoints}
          socPoints={socPoints}
          onOpenStopModal={() => setStopModalOpen(true)}
        />
      </div>

      <StopChargingModal
        open={stopModalOpen}
        bayCode={activeParking?.bayCode ?? 'BAY-A04'}
        onClose={() => setStopModalOpen(false)}
        onStopKeepParking={() => {
          stopChargingKeepParking();
          setStopModalOpen(false);
          pushToast({
            tone: 'info',
            title: 'Charging stopped',
            description: 'Charger released; parking bay remains active.',
          });
          navigate({ to: '/student/charging/exit' });
        }}
        onStopAndExit={() => {
          exitHubReleaseBay();
          setStopModalOpen(false);
          pushToast({
            tone: 'ok',
            title: 'Exited Hub & Released Bay',
            description: 'Combined charging + parking receipt generated.',
          });
          navigate({ to: '/student/charging/exit' });
        }}
      />
    </div>
  );
}
