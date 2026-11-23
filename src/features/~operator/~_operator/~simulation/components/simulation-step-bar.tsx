import { cn } from '@/utils/cn';

export const SIM_STEPS = [
  { id: 'config', num: 1, label: 'Scenario Configuration' },
  { id: 'progress', num: 2, label: 'Simulation Progress' },
  { id: 'results', num: 3, label: 'Results Comparison' },
  { id: 'recommend', num: 4, label: 'Coordination Recommendations' },
] as const;

export function SimulationStepBar({
  activeView,
  allowNavigate = false,
  onSelectView,
}: {
  activeView: number;
  allowNavigate?: boolean;
  onSelectView?: (idx: 1 | 2 | 3) => void;
}) {
  return (
    <div className="border-b border-line bg-surface px-4 sm:px-6 lg:px-7">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {SIM_STEPS.map((st, idx) => {
          const active = activeView === idx;
          const clickable = allowNavigate && idx >= 1;
          return (
            <button
              key={st.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelectView?.(idx as 1 | 2 | 3)}
              className={cn(
                'flex items-center gap-2 border-b-2 py-3 text-left text-caption font-semibold transition-colors',
                active
                  ? 'border-primary text-primary-700'
                  : clickable
                    ? 'border-transparent text-ink-2 hover:text-ink'
                    : 'cursor-default border-transparent text-ink-3',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  active
                    ? 'bg-primary text-white'
                    : idx < activeView
                      ? 'bg-eco text-white'
                      : 'bg-surface-2 text-ink-3',
                )}
              >
                {idx < activeView ? '✓' : st.num}
              </span>
              <span className="truncate">{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
