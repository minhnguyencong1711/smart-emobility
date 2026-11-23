import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import type { HeatmapHubMetric } from '@/components/shared';
import { Button, PageHeader } from '@/components/ui';
import { useInterval } from '@/hooks';
import { useMobilityStore, useToastStore } from '@/stores';
import type { SimulationRecommendation } from '@/types';

import { SimulationAdvisoryView } from './components/simulation-advisory-view';
import { SimulationProgressView } from './components/simulation-progress-view';
import { SimulationResultsView } from './components/simulation-results-view';
import { SimulationStepBar } from './components/simulation-step-bar';

export const Route = createFileRoute('/operator/_operator/simulation/$id')({
  component: SimulationResultPage,
});

function SimulationResultPage() {
  const { id } = Route.useParams();
  const { simulations, hubs, approveSimulationRecommendationToM4 } =
    useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const sim = simulations.find((s) => s.id === id) ?? simulations[0];

  const [activeView, setActiveView] = useState<1 | 2 | 3>(
    sim.status === 'RUNNING' ? 1 : 2,
  );
  const [progressPct, setProgressPct] = useState(
    sim.status === 'RUNNING' ? 60 : 100,
  );
  const [selectedRec, setSelectedRec] =
    useState<SimulationRecommendation | null>(null);

  useInterval(
    () => setProgressPct((prev) => (prev >= 100 ? 100 : prev + 20)),
    activeView === 1 && progressPct < 100 ? 800 : null,
  );

  const heatmapData = useMemo(() => {
    const map: Record<string, HeatmapHubMetric> = {};
    hubs.forEach((h) => {
      const inScope = sim.selectedHubIds.includes(h.id);
      if (!inScope) {
        map[h.id] = {
          occupancyPct: 0,
          parkingPct: 0,
          chargingPct: 0,
          unservedTrips: 0,
          severity: 'OUTSIDE',
          note: 'Outside simulation scope',
        };
      } else if (h.id === 'hub-suoi-tien') {
        map[h.id] = {
          occupancyPct: 94,
          parkingPct: 94,
          chargingPct: 98,
          unservedTrips: 90,
          severity: 'CRITICAL',
          note: 'Critical bottleneck',
        };
      } else if (h.id === 'hub-dorm-a') {
        map[h.id] = {
          occupancyPct: 73,
          parkingPct: 73,
          chargingPct: 73,
          unservedTrips: 30,
          severity: 'WARNING',
          note: 'Demand pressure',
        };
      } else {
        map[h.id] = {
          occupancyPct: 52,
          parkingPct: 52,
          chargingPct: 49,
          unservedTrips: 15,
          severity: 'NORMAL',
          note: 'Within normal limits',
        };
      }
    });
    return map;
  }, [hubs, sim.selectedHubIds]);

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
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/operator/simulation">
              <Button size="sm" variant="secondary">
                Edit Scenario
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setActiveView(3)}
            >
              View Recommendations ({sim.recommendations.length}) →
            </Button>
          </div>
        }
      />

      <SimulationStepBar
        activeView={activeView}
        allowNavigate
        onSelectView={setActiveView}
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        {activeView === 1 ? (
          <SimulationProgressView
            sim={sim}
            progressPct={progressPct}
            onViewResults={() => setActiveView(2)}
          />
        ) : null}

        {activeView === 2 ? (
          <SimulationResultsView
            sim={sim}
            hubs={hubs}
            heatmapData={heatmapData}
            onViewRecommendations={() => setActiveView(3)}
          />
        ) : null}

        {activeView === 3 ? (
          <SimulationAdvisoryView
            sim={sim}
            selectedRec={selectedRec}
            onBackToResults={() => setActiveView(2)}
            onSelectRec={setSelectedRec}
            onCloseModal={() => setSelectedRec(null)}
            onApproveRec={(rec) => {
              approveSimulationRecommendationToM4(sim.id, rec.id);
              pushToast({
                tone: 'ok',
                title: 'Dispatched to Operations',
                description: `${rec.title} is now queued for execution.`,
              });
              setSelectedRec(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
