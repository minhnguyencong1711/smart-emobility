import { useEffect, useId, useRef, type ReactNode } from 'react';

import { CloseIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

type ModalProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title?: string;
  hideHeader?: boolean;
  closeOnBackdropClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const SIZE_MAP = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
} as const;

export function Modal({
  children,
  open,
  onClose,
  title,
  hideHeader = false,
  closeOnBackdropClick = true,
  size = 'md',
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      // Reset returnValue on close so stale button values never leak across opens.
      dialog.returnValue = '';
      onCloseRef.current();
    };

    const handleCancel = (event: Event) => {
      if (!closeOnBackdropClick) {
        event.preventDefault();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [closeOnBackdropClick]);

  // Progressive fallback for browsers (e.g. Safari) lacking <dialog closedby="any">
  const isOutsideDialog = (clientX: number, clientY: number) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      data-modal=""
      aria-labelledby={title && !hideHeader ? titleId : undefined}
      aria-label={!title || hideHeader ? (title ?? 'Dialog') : undefined}
      {...({
        closedby: closeOnBackdropClick ? 'any' : 'none',
      } as Record<string, string>)}
      onPointerDown={(e) => {
        if (!closeOnBackdropClick) return;
        pressedOutsideRef.current = isOutsideDialog(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (!closeOnBackdropClick) return;
        if (
          pressedOutsideRef.current &&
          isOutsideDialog(e.clientX, e.clientY)
        ) {
          dialogRef.current?.close();
        }
        pressedOutsideRef.current = false;
      }}
      className={cn(
        'fixed inset-x-0 bottom-0 top-auto m-0 w-full flex-col overflow-hidden border border-line bg-surface p-0 text-ink shadow-3 outline-none',
        'animate-rise rounded-t-xl sm:inset-0 sm:m-auto sm:max-h-[90dvh] sm:rounded-lg',
        'max-h-[92dvh]',
        SIZE_MAP[size],
        className,
      )}
    >
      {!hideHeader && title ? (
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-title font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close modal"
            className="rounded-xs p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        {children}
      </div>
    </dialog>
  );
}

export default Modal;
