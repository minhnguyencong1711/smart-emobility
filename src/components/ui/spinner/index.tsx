import { cn } from '@/utils/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: 'size-3.5 border-2',
  md: 'size-4 border-2',
  lg: 'size-6 border-[2.5px]',
};

export function Spinner({
  size = 'md',
  className,
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        SIZE_MAP[size],
        className,
      )}
    />
  );
}

export default Spinner;
