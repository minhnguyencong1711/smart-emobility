import { CheckIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

export type StepItem = {
  id: string;
  label: string;
  description?: string;
};

type StepNavProps = {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  align?: 'center' | 'start';
  className?: string;
};

export function StepNav({
  steps,
  currentStepIndex,
  onStepClick,
  align = 'center',
  className,
}: StepNavProps) {
  return (
    <nav aria-label="Workflow steps" className={cn('w-full', className)}>
      <ol
        className={cn(
          'flex flex-wrap items-center gap-2 sm:gap-3',
          align === 'center' ? 'justify-center' : 'justify-start',
        )}
      >
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const clickable = Boolean(onStepClick && idx <= currentStepIndex);

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => (clickable ? onStepClick?.(idx) : undefined)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-colors',
                  isCurrent
                    ? 'border-primary bg-primary-soft text-primary-700'
                    : isCompleted
                      ? 'border-ok/30 bg-ok-soft text-ok-700'
                      : 'border-line bg-surface text-ink-3',
                  clickable
                    ? 'cursor-pointer hover:border-primary'
                    : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-label font-bold',
                    isCurrent
                      ? 'bg-primary text-white'
                      : isCompleted
                        ? 'bg-ok-700 text-white'
                        : 'bg-surface-2 text-ink-3',
                  )}
                >
                  {isCompleted ? <CheckIcon size={12} /> : idx + 1}
                </span>
                <span className="text-caption font-semibold">{step.label}</span>
              </button>
              {idx < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="hidden h-px w-6 bg-line-strong sm:inline-block"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StepNav;
