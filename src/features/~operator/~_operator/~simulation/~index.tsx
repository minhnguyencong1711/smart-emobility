import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';
import type { SimulationScenarioType } from '@/types';

import { SimulationConfigForm } from './components/simulation-config-form';
import { SimulationScopePanel } from './components/simulation-scope-panel';
import { SimulationStepBar } from './components/simulation-step-bar';

export const Route = createFileRoute('/operator/_operator/simulation/')({
  component: SimulationConfigPage,
});

function SimulationConfigPage() {
  const navigate = useNavigate();
  const { hubs, policyConfig, createSimulationScenario } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const [scenarioName, setScenarioName] = useState('Monday Morning Peak');
  const [scenarioType, setScenarioType] =
    useState<SimulationScenarioType>('DEMAND_SURGE');
  const [durationHours, setDurationHours] = useState('24');
  const [timeStepMins, setTimeStepMins] = useState('15');
  const [travelDelta, setTravelDelta] = useState(80);
  const [chargingDelta, setChargingDelta] = useState(40);
  const [parkingDelta, setParkingDelta] = useState(30);
  const [fleetDelta, setFleetDelta] = useState(20);
  const [disruption, setDisruption] = useState('NONE');
  const [selectedHubIds, setSelectedHubIds] = useState<string[]>([
    'hub-suoi-tien',
    'hub-dorm-a',
    'hub-dorm-b',
  ]);
  const [staleDataDemo, setStaleDataDemo] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  function toggleHub(id: string) {
    setSelectedHubIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function applyPreset(preset: 'peak' | 'storm' | 'metro') {
    if (preset === 'peak') {
      setScenarioName('Monday Morning Peak');
      setScenarioType('DEMAND_SURGE');
      setTravelDelta(80);
      setChargingDelta(40);
      setParkingDelta(30);
      setDisruption('NONE');
    } else if (preset === 'storm') {
      setScenarioName('Storms / Flooding');
      setScenarioType('CHARGER_FAILURE');
      setTravelDelta(25);
      setChargingDelta(60);
      setParkingDelta(50);
      setDisruption('TWO_PORTS_OFFLINE');
    } else {
      setScenarioName('Metro Station Event');
      setScenarioType('PARKING_OVERLOAD');
      setTravelDelta(95);
      setChargingDelta(55);
      setParkingDelta(85);
      setDisruption('NONE');
    }
  }

  function handleLaunchSandbox() {
    if (selectedHubIds.length === 0) {
      pushToast({
        tone: 'warn',
        title: 'Select at least 1 hub',
        description: 'Choose one or more mobility hubs in Simulation Scope.',
      });
      return;
    }

    const id = `sim-${Date.now()}`;
    createSimulationScenario({
      id,
      name: scenarioName,
      type: scenarioType,
      selectedHubIds,
      demandMultiplier: +(1 + travelDelta / 100).toFixed(2),
      durationHours: Number(durationHours),
      timeStepMins: Number(timeStepMins),
      status: 'RUNNING',
      utilizationRatePct: 91.4,
      avgWaitingTimeMins: 22,
      recommendations: [
        {
          id: `rec-sc-${Date.now()}`,
          title: 'Move 4 flexible charging sessions to 10:00–12:00',
          targetType: 'SCHEDULING',
          summary:
            'At Suoi Tien Metro, shift these sessions from 08:00–10:00 to reduce peak congestion. Operations must verify booking constraints before applying.',
          expectedWaitReductionPct: 24,
          approvedToM4: false,
        },
        {
          id: `rec-rd-${Date.now()}`,
          title: 'Transfer 8 vehicles from Dormitory Zone B to Metro',
          targetType: 'REDISTRIBUTION',
          summary:
            'Propose arrival before 08:00 to support the morning peak. Confirm eligible vehicles, transport time, and destination capacity in Fleet Redistribution.',
          expectedWaitReductionPct: 34,
          approvedToM4: false,
        },
      ],
    });
    setReviewModalOpen(false);
    navigate({ to: '/operator/simulation/$id', params: { id } });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="What-if Simulation"
        breadcrumb={[
          { label: 'Home', to: '/operator/monitoring' },
          { label: 'Analytics & Config' },
          { label: 'What-if Simulation' },
        ]}
      />
      <SimulationStepBar activeView={0} />
      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <div className="grid items-start gap-5 xl:grid-cols-12">
          <SimulationConfigForm
            scenarioName={scenarioName}
            scenarioType={scenarioType}
            durationHours={durationHours}
            timeStepMins={timeStepMins}
            travelDelta={travelDelta}
            chargingDelta={chargingDelta}
            parkingDelta={parkingDelta}
            fleetDelta={fleetDelta}
            disruption={disruption}
            onApplyPreset={applyPreset}
            onScenarioNameChange={setScenarioName}
            onScenarioTypeChange={setScenarioType}
            onDurationHoursChange={setDurationHours}
            onTimeStepMinsChange={setTimeStepMins}
            onTravelDeltaChange={setTravelDelta}
            onChargingDeltaChange={setChargingDelta}
            onParkingDeltaChange={setParkingDelta}
            onFleetDeltaChange={setFleetDelta}
            onDisruptionChange={setDisruption}
          />
          <SimulationScopePanel
            hubs={hubs}
            policyConfig={policyConfig}
            scenarioName={scenarioName}
            durationHours={durationHours}
            timeStepMins={timeStepMins}
            travelDelta={travelDelta}
            chargingDelta={chargingDelta}
            parkingDelta={parkingDelta}
            selectedHubIds={selectedHubIds}
            staleDataDemo={staleDataDemo}
            reviewModalOpen={reviewModalOpen}
            onToggleHub={toggleHub}
            onToggleStaleData={() => setStaleDataDemo((v) => !v)}
            onRefreshSampleData={() => {
              setStaleDataDemo(false);
              pushToast({
                tone: 'info',
                title: 'Baseline snapshot refreshed',
                description: 'Latest operational baseline captured.',
              });
            }}
            onOpenReviewModal={() => setReviewModalOpen(true)}
            onCloseReviewModal={() => setReviewModalOpen(false)}
            onLaunchSandbox={handleLaunchSandbox}
          />
        </div>
      </div>
    </div>
  );
}
