import { useEffect, useRef, type ReactNode } from 'react';

import { CloseIcon } from '@/components/icons';
import { cn } from '@/utils/cn';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  ariaLabel: string;
  children: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  side = 'left',
  ariaLabel,
  children,
  className,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

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
      dialog.returnValue = '';
      onCloseRef.current();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      data-drawer=""
      aria-label={ariaLabel}
      onClick={(e) => {
        if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
          dialogRef.current?.close();
        }
      }}
      className={cn(
        'fixed inset-0 m-0 size-full bg-transparent p-0 outline-none',
        side === 'right' ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        ref={sheetRef}
        className={cn(
          'relative flex h-svh w-72 max-w-[82vw] flex-col overflow-y-auto shadow-3',
          side === 'left'
            ? 'animate-slide-in-left bg-navy text-white'
            : 'animate-slide-in-right border-l border-line bg-surface text-ink',
          className,
        )}
      >
        <button
          type="button"
          autoFocus
          aria-label="Close drawer"
          onClick={() => dialogRef.current?.close()}
          className={cn(
            'absolute right-3 top-3 z-10 rounded-xs p-1.5 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            side === 'left'
              ? 'text-white/80 hover:bg-white/15 hover:text-white'
              : 'text-ink-3 hover:bg-surface-2 hover:text-ink',
          )}
        >
          <CloseIcon size={18} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

export default Drawer;
