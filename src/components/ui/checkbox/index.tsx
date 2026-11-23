import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type ChoiceProps = {
  label: string;
  description?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>(
  function Checkbox(
    { label, description, className, id: idProp, ...rest },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer select-none items-start gap-2.5',
          className,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="mt-0.5 size-4 rounded-xs border-line-strong accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          {...rest}
        />
        <span className="flex flex-col">
          <span className="text-body-sm font-medium text-ink">{label}</span>
          {description ? (
            <span className="text-caption text-ink-3">{description}</span>
          ) : null}
        </span>
      </label>
    );
  },
);

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio(
  { label, description, className, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer select-none items-start gap-2.5',
        className,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="radio"
        className="mt-0.5 size-4 border-line-strong accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        {...rest}
      />
      <span className="flex flex-col">
        <span className="text-body-sm font-medium text-ink">{label}</span>
        {description ? (
          <span className="text-caption text-ink-3">{description}</span>
        ) : null}
      </span>
    </label>
  );
});
