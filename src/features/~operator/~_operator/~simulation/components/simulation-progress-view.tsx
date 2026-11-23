import { Link } from '@tanstack/react-router';

import { Button, Callout, Card, ProgressBar } from '@/components/ui';
import type { SimulationScenario } from '@/types';
import { cn } from '@/utils/cn';

const PROGRESS_STEPS = [
  { label: 'Extract Read-only Snapshot', threshold: 20 },
  { label: 'Initialize Isolated Sandbox', threshold: 40 },
  { label: 'Compute Hypothetical State', threshold: 60 },
  { label: 'Analyze Impacts and Recommendations', threshold: 80 },
  { label: 'Save Simulation Results', threshold: 100 },
];

export function SimulationProgressView({
  sim,
  progressPct,
  onViewResults,
}: {
  sim: SimulationScenario;
  progressPct: number;
  onViewResults: () => void;
}) {
  return (
    <Card padding="lg" className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-label font-bold uppercase tracking-wider text-primary-700">
            {progressPct >= 100 ? 'COMPLETED' : 'RUNNING'}
          </p>
          <h2 className="text-title font-extrabold text-ink">
            Analysing scenario: {sim.name}
          </h2>
          <p className="text-caption text-ink-3">
            {sim.durationHours} hours · {sim.selectedHubIds.length} Hubs
          </p>
        </div>
        <span className="font-mono text-heading font-extrabold text-primary-700">
          {progressPct}%
        </span>
      </div>

      <ProgressBar
        value={progressPct}
        tone={progressPct >= 100 ? 'ok' : 'primary'}
      />

      <div className="space-y-2">
        {PROGRESS_STEPS.map((st) => {
          const done = progressPct >= st.threshold;
          const running = !done && progressPct >= st.threshold - 20;
          return (
            <div
              key={st.label}
              className={cn(
                'flex items-center justify-between rounded-md border px-3.5 py-2.5 text-body-sm',
                done
                  ? 'border-ok/30 bg-ok-soft text-ok-700'
                  : running
                    ? 'border-primary/35 bg-primary-soft text-primary-700'
                    : 'border-line bg-surface-2 text-ink-3',
              )}
            >
              <span className="font-semibold">{st.label}</span>
              <span>{done ? '✓' : running ? '◉' : '○'}</span>
            </div>
          );
        })}
      </div>

      <Callout
        tone="info"
        title="Live operational data remains unchanged"
        description="Progress and results run inside an isolated snapshot sandbox."
      />

      <div className="flex justify-between">
        <Link to="/operator/simulation">
          <Button variant="secondary">Back to Configuration</Button>
        </Link>
        <Button variant="primary" onClick={onViewResults}>
          View Results Comparison →
        </Button>
      </div>
    </Card>
  );
}
