import { useEffect, type RefObject } from 'react';

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function handlePointer(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!ref.current || (target && ref.current.contains(target))) {
        return;
      }
      handler();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handler();
      }
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, handler, enabled]);
}
