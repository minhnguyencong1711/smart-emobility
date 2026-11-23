import type { LodTier } from './types';

export const VNU_HCM_CENTER: [number, number] = [10.8768, 106.7985];

export const MOBILE_PILL_ANCHORS: Record<string, [number, number]> = {
  'hub-dorm-b': [14, -10],
  'hub-hcmut-2': [126, 46],
  'hub-suoi-tien': [132, -8],
  'hub-dorm-a': [45, -52],
  'hub-vnu-admin': [70, -10],
};

export function computeDefaultZoom(
  w: number,
  h: number,
  isMini: boolean,
): number {
  if (isMini) return 16;
  const compact = w < 500 || h < 420;
  if (compact) return 13.75;
  if (w < 580) return 14;
  return 14.5;
}

export function computeZoomPct(
  currentZoom: number,
  defaultZoom: number,
): number {
  const zoomDiff = currentZoom - defaultZoom;
  const rawPct = Math.pow(2, zoomDiff) * 100;
  return Math.abs(zoomDiff) < 0.05
    ? 100
    : Math.max(10, Math.round(rawPct / 5) * 5);
}

export function resolveLodTier(params: {
  isMini: boolean;
  isCompactViewport: boolean;
  currentZoom: number;
  defaultZoom: number;
}): LodTier {
  const { isMini, isCompactViewport, currentZoom, defaultZoom } = params;
  if (isMini) return 'pill';
  const zoomDiff = currentZoom - defaultZoom;
  if (zoomDiff <= -0.9) return 'cluster';
  if (isCompactViewport || zoomDiff <= -0.25) return 'pill';
  return 'card';
}
