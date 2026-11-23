import L from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { MobilityHub } from '@/types';

import {
  computeDefaultZoom,
  computeZoomPct,
  resolveLodTier,
  VNU_HCM_CENTER,
} from './map-constants';
import {
  renderCardMarker,
  renderClusterMarker,
  renderDotMarker,
  renderPillMarker,
  resolveHubDisplayMetrics,
} from './map-markers';
import type { HeatmapHubMetric, MapVariant } from './types';

type UseLeafletMapParams = {
  hubs: MobilityHub[];
  focusedHub?: MobilityHub;
  selectedHubId?: string | null;
  onSelectHub?: (hubId: string) => void;
  resolvedRoute?: {
    fromHubId: string;
    toHubId: string;
  };
  vehicleCountsByHub?: Record<string, number>;
  heatmapData?: Record<string, HeatmapHubMetric>;
  resolvedVariant: MapVariant;
};

export function useLeafletMap({
  hubs,
  focusedHub,
  selectedHubId,
  onSelectHub,
  resolvedRoute,
  vehicleCountsByHub,
  heatmapData,
  resolvedVariant,
}: UseLeafletMapParams) {
  const isMini = resolvedVariant === 'mini';
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const defaultZoomRef = useRef<number>(isMini ? 16 : 14.5);
  const onSelectRef = useRef(onSelectHub);
  onSelectRef.current = onSelectHub;

  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [defaultZoom, setDefaultZoom] = useState<number>(isMini ? 16 : 14.5);
  const [currentZoom, setCurrentZoom] = useState<number>(isMini ? 16 : 14.5);
  const [isPannedAway, setIsPannedAway] = useState(false);

  const handleResetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const w = containerRef.current?.clientWidth || 720;
    const h = containerRef.current?.clientHeight || 460;
    const targetZoom = computeDefaultZoom(w, h, isMini);
    defaultZoomRef.current = targetZoom;
    setDefaultZoom(targetZoom);
    const targetCenter: [number, number] =
      isMini && focusedHub ? [focusedHub.lat, focusedHub.lng] : VNU_HCM_CENTER;
    map.stop();
    map.invalidateSize();
    map.setView(targetCenter, targetZoom, { animate: false });
    setCurrentZoom(map.getZoom());
    setIsPannedAway(false);
  }, [focusedHub, isMini]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const initialW = el.clientWidth || 720;
    const initialH = el.clientHeight || 460;
    const initialZoom = computeDefaultZoom(initialW, initialH, isMini);
    defaultZoomRef.current = initialZoom;
    setDefaultZoom(initialZoom);
    setCurrentZoom(initialZoom);
    setIsCompactViewport(initialW < 500 || initialH < 420);

    const map = L.map(el, {
      center:
        isMini && focusedHub
          ? [focusedHub.lat, focusedHub.lng]
          : VNU_HCM_CENTER,
      zoom: initialZoom,
      minZoom: isMini ? 13 : 11,
      maxZoom: 18,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: !isMini,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      const base =
        isMini && focusedHub
          ? { lat: focusedHub.lat, lng: focusedHub.lng }
          : { lat: VNU_HCM_CENTER[0], lng: VNU_HCM_CENTER[1] };
      const dist =
        Math.abs(center.lat - base.lat) + Math.abs(center.lng - base.lng);
      setIsPannedAway(dist > 0.0025);
    });

    let lastCompact = initialW < 500 || initialH < 420;
    let lastDefaultZoom = initialZoom;

    const handleResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const compact = w < 500 || h < 420;
      const nextDefaultZoom = computeDefaultZoom(w, h, isMini);
      setIsCompactViewport(compact);
      defaultZoomRef.current = nextDefaultZoom;
      setDefaultZoom(nextDefaultZoom);
      map.invalidateSize();

      if (
        !isMini &&
        (compact !== lastCompact || nextDefaultZoom !== lastDefaultZoom)
      ) {
        lastCompact = compact;
        lastDefaultZoom = nextDefaultZoom;
        map.setView(VNU_HCM_CENTER, nextDefaultZoom, { animate: false });
        setCurrentZoom(nextDefaultZoom);
        setIsPannedAway(false);
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, [isMini]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMini) return;
    if (resolvedRoute) {
      const from = hubs.find((h) => h.id === resolvedRoute.fromHubId);
      const to = hubs.find((h) => h.id === resolvedRoute.toHubId);
      if (from && to) {
        map.fitBounds(
          L.latLngBounds([
            [from.lat, from.lng],
            [to.lat, to.lng],
          ]),
          { padding: [36, 48], maxZoom: 15 },
        );
        return;
      }
    }
    if (focusedHub) {
      map.setView([focusedHub.lat, focusedHub.lng], 16, { animate: true });
    }
  }, [focusedHub, hubs, isMini, resolvedRoute]);

  const zoomPct = computeZoomPct(currentZoom, defaultZoom);
  const lodTier = resolveLodTier({
    isMini,
    isCompactViewport,
    currentZoom,
    defaultZoom,
  });

  useEffect(() => {
    const group = layerGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();

    if (resolvedRoute) {
      const from = hubs.find((h) => h.id === resolvedRoute.fromHubId);
      const to = hubs.find((h) => h.id === resolvedRoute.toHubId);
      if (from && to) {
        L.polyline(
          [
            [from.lat, from.lng],
            [to.lat, to.lng],
          ],
          {
            color: '#1488D8',
            weight: 3.5,
            dashArray: '8 6',
            opacity: 0.9,
          },
        ).addTo(group);
      }
    }

    const visibleHubs =
      isMini && focusedHub && !resolvedRoute ? [focusedHub] : hubs;
    const handleSelect = (hubId: string) => onSelectRef.current?.(hubId);

    visibleHubs.forEach((hub) => {
      const { status } = resolveHubDisplayMetrics({
        hub,
        vehicleCountsByHub,
        heatmapData,
      });
      renderDotMarker({
        group,
        hub,
        status,
        isSelected: selectedHubId === hub.id,
        onSelect: handleSelect,
      });
    });

    if (lodTier === 'cluster') {
      renderClusterMarker({ group, hubs, onResetView: handleResetView });
      return;
    }

    visibleHubs.forEach((hub) => {
      const { hm, status, occPct, readyCount, freeBays } =
        resolveHubDisplayMetrics({ hub, vehicleCountsByHub, heatmapData });
      const isSelected = selectedHubId === hub.id;

      if (lodTier === 'pill') {
        renderPillMarker({
          group,
          hub,
          status,
          occPct,
          readyCount,
          freeBays,
          isSelected,
          isMini,
          resolvedVariant,
          hm,
          onSelect: handleSelect,
        });
        return;
      }

      renderCardMarker({
        group,
        hub,
        status,
        occPct,
        readyCount,
        isSelected,
        resolvedVariant,
        hm,
        onSelect: handleSelect,
      });
    });
  }, [
    focusedHub,
    handleResetView,
    heatmapData,
    hubs,
    isMini,
    lodTier,
    resolvedRoute,
    resolvedVariant,
    selectedHubId,
    vehicleCountsByHub,
  ]);

  return {
    containerRef,
    isCompactViewport,
    zoomPct,
    isPannedAway,
    handleResetView,
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
  };
}
