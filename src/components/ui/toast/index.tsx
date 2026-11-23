import type { ReactNode } from 'react';

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  ShieldAlertIcon,
} from '@/components/icons';
import { type ToastTone, useToastStore } from '@/stores/toast-store';
import { cn } from '@/utils/cn';

const TONE_MAP: Record<ToastTone, { border: string; icon: ReactNode }> = {
  info: {
    border: 'border-l-4 border-l-info',
    icon: <InfoIcon size={18} className="text-info-700" />,
  },
  ok: {
    border: 'border-l-4 border-l-ok',
    icon: <CheckCircleIcon size={18} className="text-ok-700" />,
  },
  warn: {
    border: 'border-l-4 border-l-warn',
    icon: <AlertTriangleIcon size={18} className="text-warn-700" />,
  },
  danger: {
    border: 'border-l-4 border-l-danger',
    icon: <ShieldAlertIcon size={18} className="text-danger-700" />,
  },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-5"
    >
      {toasts.map((toast) => {
        const cfg = TONE_MAP[toast.tone];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex animate-rise items-start gap-3 rounded-md border border-line bg-surface p-3.5 shadow-2',
              cfg.border,
            )}
          >
            <span className="mt-0.5 shrink-0">{cfg.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold text-ink">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="mt-0.5 text-caption text-ink-2">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-xs p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastViewport;
