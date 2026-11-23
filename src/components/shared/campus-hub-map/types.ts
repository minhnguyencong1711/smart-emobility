import type { MobilityHub } from '@/types';

export type HeatmapHubMetric = {
  occupancyPct: number;
  parkingPct: number;
  chargingPct: number;
  unservedTrips: number;
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL' | 'OUTSIDE';
  note: string;
};

export type MapVariant = 'catalogue' | 'operator' | 'heatmap' | 'mini';

export type LodTier = 'cluster' | 'pill' | 'card';

export type CampusHubMapProps = {
  hubs: MobilityHub[];
  selectedHubId?: string | null;
  onSelectHub?: (hubId: string) => void;
  highlightedRoute?: {
    fromHubId: string;
    toHubId: string;
  };
  routeOverlay?: {
    fromHubId: string;
    toHubId: string;
    label?: string;
  };
  vehicleCountsByHub?: Record<string, number>;
  heatmapData?: Record<string, HeatmapHubMetric>;
  variant?: MapVariant;
  mode?: 'catalogue' | 'return' | 'mini';
  title?: string;
  hideHeader?: boolean;
  className?: string;
};
