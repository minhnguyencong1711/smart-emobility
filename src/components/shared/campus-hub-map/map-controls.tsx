import {
  MinusIcon,
  NavigationIcon,
  PlusIcon,
  RefreshIcon,
} from '@/components/icons';
import { cn } from '@/utils/cn';

type MapHeaderProps = {
  headerTitle: string;
  isMini: boolean;
  isHeatmap: boolean;
};

export function MapHeader({ headerTitle, isMini, isHeatmap }: MapHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        <NavigationIcon size={15} className="text-primary-700" />
        <span className="text-label font-bold uppercase tracking-wider text-ink">
          {headerTitle}
        </span>
      </div>

      {!isMini ? (
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-ok" />
            {isHeatmap ? 'Stable' : 'Normal < 85%'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-warn" />
            {isHeatmap ? 'Warning' : 'Warning 85–90%'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-danger" />
            {isHeatmap ? 'Critical' : 'Critical ≥ 90%'}
          </span>
          {isHeatmap ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ink-muted" />
              Outside scope
            </span>
          ) : null}
        </div>
      ) : (
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-700">
          VNU-HCM Campus
        </span>
      )}
    </div>
  );
}

type MapZoomControlsProps = {
  zoomPct: number;
  isPannedAway: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

export function MapZoomControls({
  zoomPct,
  isPannedAway,
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapZoomControlsProps) {
  return (
    <div className="absolute bottom-7 right-3 z-20 flex flex-col items-end gap-1.5">
      {zoomPct !== 100 || isPannedAway ? (
        <button
          type="button"
          aria-label="Reset map view to 100%"
          title="Reset view to default (100%)"
          onClick={onResetView}
          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-surface px-2.5 py-1 text-[11px] font-bold text-primary-700 shadow-1 transition-colors hover:bg-primary hover:text-white"
        >
          <RefreshIcon size={12} />
          <span>100%</span>
        </button>
      ) : null}

      <div className="flex flex-col items-center rounded-md border border-line bg-surface p-1 shadow-1">
        <button
          type="button"
          aria-label="Zoom in map"
          onClick={onZoomIn}
          className="flex size-7 items-center justify-center rounded-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <PlusIcon size={15} />
        </button>
        <button
          type="button"
          aria-label="Current zoom percentage"
          title="Click to reset zoom to 100%"
          onClick={onResetView}
          data-zoom-pct={zoomPct}
          className={cn(
            'my-0.5 w-10 rounded-xs py-0.5 text-center font-mono text-[10.5px] font-bold transition-colors',
            zoomPct === 100
              ? 'text-ink-3 hover:bg-surface-2 hover:text-ink'
              : 'bg-primary-soft text-primary-700 hover:bg-primary hover:text-white',
          )}
        >
          {zoomPct}%
        </button>
        <button
          type="button"
          aria-label="Zoom out map"
          onClick={onZoomOut}
          className="flex size-7 items-center justify-center rounded-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <MinusIcon size={15} />
        </button>
      </div>
    </div>
  );
}
