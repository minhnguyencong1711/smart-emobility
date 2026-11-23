import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

import { FieldShell } from '../field';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  size?: 'sm' | 'default';
  wrapperClassName?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      hint,
      options,
      size = 'default',
      wrapperClassName,
      className,
      id: idProp,
      required,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const isSmall = size === 'sm';

    return (
      <FieldShell
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={id}
        className={wrapperClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={id}
            data-custom-select=""
            required={required}
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full appearance-none rounded-sm border bg-surface text-ink shadow-card',
              'transition-[border-color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-2',
              isSmall
                ? 'h-8 py-1 pl-2.5 pr-8 text-caption font-medium'
                : 'py-2.5 pl-3.5 pr-9 text-body-sm',
              error
                ? 'border-danger focus:border-danger focus:ring-danger-soft'
                : 'border-line-strong hover:border-ink-3 focus:border-primary focus:ring-primary-soft',
              className,
            )}
            {...rest}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className={cn(
              'pointer-events-none absolute inset-y-0 flex items-center text-ink-3',
              isSmall ? 'right-2' : 'right-3',
            )}
          >
            <ChevronDownIcon size={isSmall ? 14 : 16} />
          </span>
        </div>
      </FieldShell>
    );
  },
);

export default Select;
