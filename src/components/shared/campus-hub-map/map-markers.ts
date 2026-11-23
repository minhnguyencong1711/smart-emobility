import L from 'leaflet';

import type { MobilityHub } from '@/types';
import { getHubOccupancyPct } from '@/utils/hub-metrics';

import { MOBILE_PILL_ANCHORS, VNU_HCM_CENTER } from './map-constants';
import type { HeatmapHubMetric, MapVariant } from './types';

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderDotMarker(params: {
  group: L.LayerGroup;
  hub: MobilityHub;
  status: string;
  isSelected: boolean;
  onSelect: (hubId: string) => void;
}) {
  const { group, hub, status, isSelected, onSelect } = params;
  const dotIcon = L.divIcon({
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<span data-hub-dot="${status}"></span>`,
  });
  const dotMarker = L.marker([hub.lat, hub.lng], {
    icon: dotIcon,
    zIndexOffset: isSelected ? 400 : 100,
  }).addTo(group);

  dotMarker.on('click', () => onSelect(hub.id));
}

export function renderClusterMarker(params: {
  group: L.LayerGroup;
  hubs: MobilityHub[];
  onResetView: () => void;
}) {
  const { group, hubs, onResetView } = params;
  const critCount = hubs.filter((h) => h.status === 'CRITICAL').length;
  const warnCount = hubs.filter((h) => h.status === 'WARNING').length;
  const okCount = hubs.length - critCount - warnCount;

  const clusterHtml = `
    <button type="button" data-hub-cluster>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-size:12px;font-weight:800;color:#030391;">VNU-HCM Network</span>
        <span style="border-radius:9999px;background:#030391;color:#fff;padding:1px 7px;font-size:10px;font-weight:700;">${hubs.length} Hubs</span>
      </div>
      <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:6px;font-size:10.5px;font-weight:600;color:#475569;">
        <span style="color:#b91c1c;">● ${critCount} Critical</span>
        <span style="color:#b45309;">● ${warnCount} Warn</span>
        <span style="color:#15803d;">● ${okCount} Normal</span>
      </div>
      <div style="margin-top:5px;border-top:1px solid #e2e8f0;padding-top:4px;font-size:10.5px;font-weight:700;color:#0d6db5;">
        Zoom to 100% to inspect Hubs →
      </div>
    </button>
  `;
  const clusterIcon = L.divIcon({
    className: '',
    iconSize: [224, 78],
    iconAnchor: [112, 86],
    html: clusterHtml,
  });
  const clusterMarker = L.marker(VNU_HCM_CENTER, {
    icon: clusterIcon,
    zIndexOffset: 600,
  }).addTo(group);
  clusterMarker.on('click', onResetView);
}

export function renderPillMarker(params: {
  group: L.LayerGroup;
  hub: MobilityHub;
  status: string;
  occPct: number;
  readyCount: number;
  freeBays: number;
  isSelected: boolean;
  isMini: boolean;
  resolvedVariant: MapVariant;
  hm?: HeatmapHubMetric;
  onSelect: (hubId: string) => void;
}) {
  const {
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
    onSelect,
  } = params;

  const subText =
    resolvedVariant === 'heatmap' && hm
      ? hm.severity === 'OUTSIDE'
        ? 'Outside scope'
        : `${occPct}% load · ${hm.unservedTrips} trips`
      : resolvedVariant === 'operator'
        ? `${freeBays} free bays · ${occPct}%`
        : `${readyCount} available · ${occPct}%`;

  const pillHtml = `
    <button type="button" data-hub-pill data-status="${status}" data-selected="${String(isSelected)}">
      <span style="font-size:11px;font-weight:700;color:#0f172a;">${escapeHtml(hub.shortName)}</span>
      <span style="font-size:10px;font-weight:600;color:${status === 'OUTSIDE' ? '#64748b' : '#1488d8'};">${subText}</span>
    </button>
  `;
  const [mx, my] = isMini
    ? [65, -8]
    : (MOBILE_PILL_ANCHORS[hub.id] ?? [70, -8]);
  const pillIcon = L.divIcon({
    className: '',
    iconSize: [130, 38],
    iconAnchor: [mx, my],
    html: pillHtml,
  });
  const baseZ = isSelected ? 450 : 200;
  const pillMarker = L.marker([hub.lat, hub.lng], {
    icon: pillIcon,
    zIndexOffset: baseZ,
  }).addTo(group);

  pillMarker.on('click', () => onSelect(hub.id));
  pillMarker.on('mouseover', () => pillMarker.setZIndexOffset(900));
  pillMarker.on('mouseout', () => pillMarker.setZIndexOffset(baseZ));
}

function buildCardBodyHtml(params: {
  hub: MobilityHub;
  occPct: number;
  readyCount: number;
  resolvedVariant: MapVariant;
  hm?: HeatmapHubMetric;
}): string {
  const { hub, occPct, readyCount, resolvedVariant, hm } = params;
  const totalBays = hub.coreBaysTotal + hub.bufferBaysTotal;
  const occBays = hub.coreBaysOccupied + hub.bufferBaysOccupied;

  if (resolvedVariant === 'heatmap' && hm) {
    const isOutside = hm.severity === 'OUTSIDE';
    const subText = isOutside
      ? 'Not selected'
      : `Parking ${hm.parkingPct}% · Charging ${hm.chargingPct}%`;
    const noteColor =
      hm.severity === 'CRITICAL'
        ? '#b91c1c'
        : hm.severity === 'WARNING'
          ? '#b45309'
          : hm.severity === 'NORMAL'
            ? '#047857'
            : '#64748b';

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <span style="font-size:11px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(hub.name)}</span>
        <span style="font-size:11px;font-weight:700;color:${noteColor};">${isOutside ? '—' : `${occPct}%`}</span>
      </div>
      <div style="margin-top:2px;font-size:10px;color:#475569;">${subText}</div>
      <div style="margin-top:2px;font-size:10px;color:#475569;">${hm.unservedTrips > 0 ? `${hm.unservedTrips} unserved trips` : 'No simulation data'}</div>
      <div style="margin-top:4px;font-size:10px;font-weight:700;color:${noteColor};">${escapeHtml(hm.note)}</div>
    `;
  }

  if (resolvedVariant === 'operator') {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <span style="font-size:11px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(hub.name)}</span>
        <span style="font-size:11px;font-weight:800;color:#0f172a;">${occPct}%</span>
      </div>
      <div style="margin-top:4px;display:flex;flex-direction:column;gap:1.5px;font-size:10px;color:#475569;">
        <div style="display:flex;justify-content:space-between;"><span>Parking bays</span><strong style="color:#0f172a;">${occBays}/${totalBays}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>Available EVs</span><strong style="color:#0f172a;">${hub.sharedEvsReady} units</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>Charging active</span><strong style="color:#0f172a;">${hub.chargerPortsActive}/${hub.chargerPortsTotal} ports</strong></div>
      </div>
    `;
  }

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
      <span style="font-size:11px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(hub.name)}</span>
      <span style="font-size:11px;font-weight:800;color:#0f172a;">${occPct}%</span>
    </div>
    <div style="margin-top:3px;font-size:10px;color:#475569;">Available: <strong style="color:#0f172a;">${readyCount} ${readyCount === 1 ? 'vehicle' : 'vehicles'}</strong></div>
    <div style="margin-top:1px;font-size:10px;color:#475569;">Occupancy: <strong style="color:#0f172a;">${occPct}%</strong> · Walk: ${hub.walkMins} min</div>
    <div style="margin-top:5px;border-top:1px solid #e2e8f0;padding-top:4px;font-size:10px;font-weight:700;color:#0d6db5;">Select Hub to view vehicles →</div>
  `;
}

export function renderCardMarker(params: {
  group: L.LayerGroup;
  hub: MobilityHub;
  status: string;
  occPct: number;
  readyCount: number;
  isSelected: boolean;
  resolvedVariant: MapVariant;
  hm?: HeatmapHubMetric;
  onSelect: (hubId: string) => void;
}) {
  const {
    group,
    hub,
    status,
    occPct,
    readyCount,
    isSelected,
    resolvedVariant,
    hm,
    onSelect,
  } = params;

  const cardBodyHtml = buildCardBodyHtml({
    hub,
    occPct,
    readyCount,
    resolvedVariant,
    hm,
  });
  const [ax, ay] = hub.cardAnchorOffset ?? [90, -14];
  const cardIcon = L.divIcon({
    className: '',
    iconSize: [178, 88],
    iconAnchor: [ax, ay],
    html: `<button type="button" data-hub-card data-status="${status}" data-selected="${String(isSelected)}">${cardBodyHtml}</button>`,
  });

  const baseZ = isSelected ? 500 : 250;
  const cardMarker = L.marker([hub.lat, hub.lng], {
    icon: cardIcon,
    zIndexOffset: baseZ,
  }).addTo(group);

  cardMarker.on('click', () => onSelect(hub.id));
  cardMarker.on('mouseover', () => cardMarker.setZIndexOffset(900));
  cardMarker.on('mouseout', () => cardMarker.setZIndexOffset(baseZ));
}

export function resolveHubDisplayMetrics(params: {
  hub: MobilityHub;
  vehicleCountsByHub?: Record<string, number>;
  heatmapData?: Record<string, HeatmapHubMetric>;
}) {
  const { hub, vehicleCountsByHub, heatmapData } = params;
  const hm = heatmapData?.[hub.id];
  const status =
    hm?.severity ?? (hub.status === 'UNAVAILABLE' ? 'CRITICAL' : hub.status);
  const occPct = hm ? hm.occupancyPct : getHubOccupancyPct(hub);
  const readyCount = vehicleCountsByHub?.[hub.id] ?? hub.sharedEvsReady;
  const freeBays = Math.max(
    0,
    hub.coreBaysTotal +
      hub.bufferBaysTotal -
      (hub.coreBaysOccupied + hub.bufferBaysOccupied),
  );
  return { hm, status, occPct, readyCount, freeBays };
}
