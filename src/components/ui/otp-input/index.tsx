import { useRef, type KeyboardEvent } from 'react';

import { cn } from '@/utils/cn';

type OtpInputProps = {
  length?: number;
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

export function OtpInput({
  length = 6,
  value,
  onChange,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleDigitChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...value];
      next[index] = '';
      onChange(next);
      return;
    }

    // Handle SMS / OS autofill (>= 3 digits in a single change event)
    if (cleaned.length > 2) {
      const slice = cleaned.slice(0, length).split('');
      const next = Array.from({ length }, (_, idx) => slice[idx] ?? '');
      onChange(next);
      const focusIdx = Math.min(slice.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    e.preventDefault();
    const slice = pasted.slice(0, length).split('');
    const next = Array.from({ length }, (_, idx) => slice[idx] ?? '');
    onChange(next);
    const focusIdx = Math.min(slice.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  return (
    <div className={cn('grid grid-cols-6 gap-2', className)}>
      {Array.from({ length }, (_, index) => {
        const digit = value[index] ?? '';
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={length}
            aria-label={`OTP digit ${index + 1}`}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              'h-12 w-full rounded-sm border bg-surface text-center font-mono text-title font-bold tabular-nums text-ink transition-colors',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft',
              digit ? 'border-primary-700' : 'border-line-strong',
            )}
          />
        );
      })}
    </div>
  );
}

export default OtpInput;
