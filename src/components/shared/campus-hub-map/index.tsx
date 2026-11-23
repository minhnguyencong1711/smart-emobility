import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

import { cn } from '@/utils/cn';

import { MapHeader, MapZoomControls } from './map-controls';
import type { CampusHubMapProps, HeatmapHubMetric } from './types';
import { useLeafletMap } from './use-leaflet-map';

export type { HeatmapHubMetric };

export function CampusHubMap({
  hubs,
  selectedHubId,
  onSelectHub,
  highlightedRoute,
  routeOverlay,
  vehicleCountsByHub,
  heatmapData,
  variant,
  mode = 'catalogue',
  title,
  hideHeader = false,
  className,
}: CampusHubMapProps) {
  const resolvedVariant = variant ?? (mode === 'mini' ? 'mini' : 'catalogue');
  const resolvedRoute = routeOverlay ?? highlightedRoute;
  const isMini = resolvedVariant === 'mini';
  const isHeatmap = resolvedVariant === 'heatmap';

  const focusedHub = useMemo(() => {
    if (selectedHubId) {
      return hubs.find((h) => h.id === selectedHubId) ?? hubs[0];
    }
    if (resolvedRoute) {
      return hubs.find((h) => h.id === resolvedRoute.toHubId) ?? hubs[0];
    }
    return hubs[0];
  }, [hubs, resolvedRoute, selectedHubId]);

  const {
    containerRef,
    isCompactViewport,
    zoomPct,
    isPannedAway,
    handleResetView,
    zoomIn,
    zoomOut,
  } = useLeafletMap({
    hubs,
    focusedHub,
    selectedHubId,
    onSelectHub,
    resolvedRoute,
    vehicleCountsByHub,
    heatmapData,
    resolvedVariant,
  });

  const headerTitle =
    title ??
    (isHeatmap
      ? 'Campus Bottleneck Heatmap'
      : mode === 'return'
        ? 'VNU-HCM CAMPUS MOBILITY HUB MAP'
        : isMini
          ? 'Pickup Hub Location'
          : 'SPATIAL MOBILITY HUB NETWORK (VNU-HCM CAMPUS)');

  return (
    <div
      className={cn(
        'relative isolate flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card',
        isMini ? 'h-56' : 'min-h-[340px]',
        className,
      )}
    >
      {!hideHeader ? (
        <MapHeader
          headerTitle={headerTitle}
          isMini={isMini}
          isHeatmap={isHeatmap}
        />
      ) : null}

      <div className="relative w-full flex-1">
        <div ref={containerRef} className="size-full min-h-[200px]" />

        {!isMini && !isCompactViewport ? (
          <div className="bg-surface/90 pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-ink-2 shadow-card backdrop-blur-sm">
            {isHeatmap
              ? 'VNU-HCM Campus · Selected vs reference hubs'
              : 'VNU-HCM Campus E-Mobility Network · 5 Operational Hubs'}
          </div>
        ) : null}

        <MapZoomControls
          zoomPct={zoomPct}
          isPannedAway={isPannedAway}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={handleResetView}
        />
      </div>
    </div>
  );
}
