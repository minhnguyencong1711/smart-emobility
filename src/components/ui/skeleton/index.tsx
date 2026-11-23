import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-skeleton rounded-sm bg-surface-2', className)}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-lg border border-line bg-surface p-5 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-7 w-24" />
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div
      aria-hidden
      className="divide-y divide-line rounded-lg border border-line bg-surface"
    >
      <div className="flex gap-4 bg-surface-2 px-4 py-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="ml-auto h-3 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
