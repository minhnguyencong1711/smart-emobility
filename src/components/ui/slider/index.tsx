import { useId } from 'react';

import { cn } from '@/utils/cn';

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  minLabel,
  maxLabel,
  className,
}: SliderProps) {
  const id = useId();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-caption font-semibold text-ink">
          {label}
        </label>
        <span className="rounded-xs bg-primary-soft px-2 py-0.5 font-mono text-caption font-bold tabular-nums text-primary-700">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      />
      {minLabel || maxLabel ? (
        <div className="flex justify-between text-label text-ink-3">
          <span>{minLabel ?? `${min}${unit}`}</span>
          <span>{maxLabel ?? `${max}${unit}`}</span>
        </div>
      ) : null}
    </div>
  );
}

export default Slider;
