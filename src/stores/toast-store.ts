import { create } from 'zustand';

export type ToastTone = 'info' | 'ok' | 'warn' | 'danger';

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastState = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>, durationMs?: number) => string;
  dismissToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (toast, durationMs = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    if (durationMs > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, durationMs);
    }
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
