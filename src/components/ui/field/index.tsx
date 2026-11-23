import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { EyeIcon, EyeOffIcon, SearchIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

const FIELD_BASE =
  'w-full rounded-sm border bg-surface px-3.5 py-2.5 text-body-sm text-ink shadow-card placeholder:text-ink-muted ' +
  'transition-[border-color,box-shadow] duration-150 ease-out ' +
  'focus:outline-none focus:ring-2 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3 disabled:shadow-none';

const FIELD_OK =
  'border-line-strong hover:border-ink-3 focus:border-primary focus:ring-primary-soft';
const FIELD_ERROR = 'border-danger focus:border-danger focus:ring-danger-soft';

type FieldShellProps = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  trailingLabel?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FieldShell({
  label,
  error,
  hint,
  required,
  htmlFor,
  trailingLabel,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label || trailingLabel ? (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label
              htmlFor={htmlFor}
              className="text-caption font-semibold text-ink"
            >
              {label}
              {required ? (
                <span aria-hidden className="ml-0.5 text-danger">
                  *
                </span>
              ) : null}
            </label>
          ) : (
            <span />
          )}
          {trailingLabel}
        </div>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-caption font-medium text-danger-700">
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
  trailingLabel?: ReactNode;
  wrapperClassName?: string;
  leadingIcon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    trailingLabel,
    wrapperClassName,
    leadingIcon,
    className,
    id: idProp,
    required,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;

  const control = (
    <input
      ref={ref}
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      className={cn(
        FIELD_BASE,
        error ? FIELD_ERROR : FIELD_OK,
        leadingIcon && 'pl-10',
        className,
      )}
      {...rest}
    />
  );

  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      trailingLabel={trailingLabel}
      htmlFor={id}
      className={wrapperClassName}
    >
      {leadingIcon ? (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-3 [&>svg]:size-4">
            {leadingIcon}
          </span>
          {control}
        </div>
      ) : (
        control
      )}
    </FieldShell>
  );
});

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type'>
>(function PasswordInput(
  {
    label,
    error,
    hint,
    trailingLabel,
    wrapperClassName,
    className,
    id: idProp,
    required,
    ...rest
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      trailingLabel={trailingLabel}
      htmlFor={id}
      className={wrapperClassName}
    >
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            FIELD_BASE,
            'pr-16',
            error ? FIELD_ERROR : FIELD_OK,
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-1 right-1.5 inline-flex items-center gap-1 rounded-xs px-2 text-caption font-semibold text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          {visible ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
          <span>{visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
    </FieldShell>
  );
});

type TextareaProps = {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      hint,
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

    return (
      <FieldShell
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={id}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            FIELD_BASE,
            'min-h-24 resize-y',
            error ? FIELD_ERROR : FIELD_OK,
            className,
          )}
          {...rest}
        />
      </FieldShell>
    );
  },
);

type SearchBarProps = {
  wrapperClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ wrapperClassName, className, ...rest }, ref) {
    return (
      <div
        className={cn(
          'flex h-10 items-center gap-2 rounded-sm border border-line-strong bg-surface px-3 shadow-card',
          'transition-[border-color,box-shadow] duration-150 ease-out hover:border-ink-3',
          'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft',
          wrapperClassName,
        )}
      >
        <SearchIcon size={16} className="shrink-0 text-ink-3" />
        <input
          ref={ref}
          type="search"
          className={cn(
            'size-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ink-muted',
            className,
          )}
          {...rest}
        />
      </div>
    );
  },
);
