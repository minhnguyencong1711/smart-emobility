import { Button, RemovableFilterChip } from '@/components/ui';
import type { MobilityHub } from '@/types';

import type { VehicleFilterState } from '../hooks/use-vehicle-catalogue';

export function VehicleActiveFilterChips({
  filters,
  hubs,
  onRemoveType,
  onRemoveHub,
  onRemoveBattery,
  onClearAll,
  clearLabel = 'Clear all',
  className = '',
}: {
  filters: VehicleFilterState;
  hubs: MobilityHub[];
  onRemoveType: () => void;
  onRemoveHub: (hubId: string) => void;
  onRemoveBattery: () => void;
  onClearAll: () => void;
  clearLabel?: string;
  className?: string;
}) {
  const hasFilters =
    filters.type !== 'ALL' ||
    filters.hubIds.length > 0 ||
    filters.minBattery > 0;

  if (!hasFilters) return null;

  return (
    <div className={className}>
      {filters.type !== 'ALL' ? (
        <RemovableFilterChip
          category="Type"
          label={filters.type === 'E_BIKE' ? 'E-Bike' : 'E-Motorcycle'}
          onRemove={onRemoveType}
        />
      ) : null}
      {filters.hubIds.map((id) => (
        <RemovableFilterChip
          key={id}
          category="Hub"
          label={hubs.find((h) => h.id === id)?.shortName ?? id}
          onRemove={() => onRemoveHub(id)}
        />
      ))}
      {filters.minBattery > 0 ? (
        <RemovableFilterChip
          category="Battery"
          label={`≥ ${filters.minBattery}%`}
          onRemove={onRemoveBattery}
        />
      ) : null}
      <Button
        size="sm"
        variant="link"
        className="ml-auto text-caption"
        onClick={onClearAll}
      >
        {clearLabel}
      </Button>
    </div>
  );
}
