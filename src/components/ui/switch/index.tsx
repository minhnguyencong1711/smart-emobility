import { useId } from 'react';

import { cn } from '@/utils/cn';

type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  const id = useId();

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3',
        disabled && 'opacity-60',
        className,
      )}
    >
      {label || description ? (
        <label htmlFor={id} className="cursor-pointer select-none">
          {label ? (
            <span className="block text-body-sm font-medium text-ink">
              {label}
            </span>
          ) : null}
          {description ? (
            <span className="block text-caption text-ink-3">{description}</span>
          ) : null}
        </label>
      ) : null}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          checked ? 'bg-primary' : 'bg-surface-3',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'size-5 rounded-full bg-surface shadow-card transition-transform duration-150',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export default Switch;
