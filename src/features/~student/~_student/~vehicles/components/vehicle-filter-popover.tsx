import { useEffect, useRef, useState } from 'react';

import { CloseIcon, MapPinIcon } from '@/components/icons';
import {
  Badge,
  Button,
  Checkbox,
  IconButton,
  Modal,
  Radio,
  Tabs,
} from '@/components/ui';
import { useOnClickOutside } from '@/hooks';
import type { MobilityHub } from '@/types';

import type {
  MinBatteryFilter,
  VehicleFilterState,
  VehicleTypeFilter,
} from '../hooks/use-vehicle-catalogue';

import { VehicleActiveFilterChips } from './vehicle-active-filters';

type FilterTab = 'TYPE' | 'HUB' | 'BATTERY';

const EMPTY_DRAFT: VehicleFilterState = {
  type: 'ALL',
  hubIds: [],
  minBattery: 0,
};

const TYPE_OPTIONS: { value: VehicleTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All Vehicles' },
  { value: 'E_BIKE', label: 'E-Bike' },
  { value: 'E_MOTORCYCLE', label: 'E-Motorcycle' },
];

const BATTERY_OPTIONS: { value: MinBatteryFilter; label: string }[] = [
  { value: 0, label: 'Any battery level' },
  { value: 50, label: '50% SoC or higher' },
  { value: 75, label: '75% SoC or higher' },
  { value: 90, label: '90% SoC or higher' },
];

export function VehicleFilterPopover({
  isOpen,
  mode = 'popover',
  onClose,
  appliedFilters,
  hubs,
  vehicleCountsByHub,
  onApply,
  onSelectNearestHub,
}: {
  isOpen: boolean;
  mode?: 'popover' | 'modal';
  onClose: () => void;
  appliedFilters: VehicleFilterState;
  hubs: MobilityHub[];
  vehicleCountsByHub: Record<string, number>;
  onApply: (next: VehicleFilterState) => void;
  onSelectNearestHub: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<VehicleFilterState>(appliedFilters);
  const [activeTab, setActiveTab] = useState<FilterTab>('TYPE');

  useEffect(() => {
    if (isOpen) setDraft(appliedFilters);
  }, [isOpen, appliedFilters]);

  useOnClickOutside(panelRef, onClose, isOpen && mode === 'popover');

  if (!isOpen) return null;

  const draftCount =
    (draft.type !== 'ALL' ? 1 : 0) +
    draft.hubIds.length +
    (draft.minBattery > 0 ? 1 : 0);

  const toggleHub = (hubId: string) => {
    setDraft((prev) => ({
      ...prev,
      hubIds: prev.hubIds.includes(hubId)
        ? prev.hubIds.filter((id) => id !== hubId)
        : [...prev.hubIds, hubId],
    }));
  };

  const content = (
    <div className="space-y-3.5">
      {mode === 'popover' ? (
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <h3 className="text-body-sm font-extrabold text-ink">
            Filter Vehicles
          </h3>
          <IconButton
            aria-label="Close filters"
            tone="ghost"
            size="sm"
            icon={<CloseIcon size={15} />}
            onClick={onClose}
          />
        </div>
      ) : null}

      <VehicleActiveFilterChips
        filters={draft}
        hubs={hubs}
        onRemoveType={() => setDraft((p) => ({ ...p, type: 'ALL' }))}
        onRemoveHub={toggleHub}
        onRemoveBattery={() => setDraft((p) => ({ ...p, minBattery: 0 }))}
        onClearAll={() => setDraft(EMPTY_DRAFT)}
        clearLabel="Reset"
        className="flex flex-wrap items-center gap-1.5 rounded-md border border-line bg-surface-2 p-2.5"
      />

      <Tabs
        variant="underline"
        value={activeTab}
        onChange={(id) => setActiveTab(id as FilterTab)}
        items={[
          {
            id: 'TYPE',
            label: 'Type',
            count: draft.type !== 'ALL' ? 1 : undefined,
          },
          {
            id: 'HUB',
            label: 'Hub',
            count: draft.hubIds.length > 0 ? draft.hubIds.length : undefined,
          },
          {
            id: 'BATTERY',
            label: 'Battery',
            count: draft.minBattery > 0 ? 1 : undefined,
          },
        ]}
      />

      <div className="min-h-[140px]">
        {activeTab === 'TYPE' ? (
          <div className="space-y-2 py-1">
            {TYPE_OPTIONS.map((opt) => (
              <Radio
                key={opt.value}
                name="vehicle-filter-type"
                label={opt.label}
                checked={draft.type === opt.value}
                onChange={() => setDraft((p) => ({ ...p, type: opt.value }))}
              />
            ))}
          </div>
        ) : null}

        {activeTab === 'HUB' ? (
          <div className="space-y-2 py-1">
            <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {hubs.map((hub) => {
                const count = vehicleCountsByHub[hub.id] ?? 0;
                return (
                  <div
                    key={hub.id}
                    className="flex items-center justify-between gap-2 rounded-sm px-1.5 py-1 hover:bg-surface-2"
                  >
                    <Checkbox
                      label={hub.shortName}
                      checked={draft.hubIds.includes(hub.id)}
                      onChange={() => toggleHub(hub.id)}
                    />
                    <Badge size="sm" tone={count > 0 ? 'eco' : 'neutral'}>
                      {count} ready
                    </Badge>
                  </div>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="soft"
              fullWidth
              leadingIcon={<MapPinIcon size={13} />}
              onClick={() => {
                onSelectNearestHub();
                onClose();
              }}
            >
              Select Nearest Hub
            </Button>
          </div>
        ) : null}

        {activeTab === 'BATTERY' ? (
          <div className="space-y-2 py-1">
            {BATTERY_OPTIONS.map((opt) => (
              <Radio
                key={opt.value}
                name="vehicle-filter-battery"
                label={opt.label}
                checked={draft.minBattery === opt.value}
                onChange={() =>
                  setDraft((p) => ({ ...p, minBattery: opt.value }))
                }
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <Button size="sm" variant="ghost" onClick={() => setDraft(EMPTY_DRAFT)}>
          Reset
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          <span>Apply Filters</span>
          {draftCount > 0 ? (
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold tabular-nums text-primary">
              {draftCount}
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <Modal open={isOpen} onClose={onClose} title="Filter Vehicles" size="sm">
        {content}
      </Modal>
    );
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Filter Vehicles"
      className="ring-ink/5 absolute right-0 top-full z-[60] mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface p-4 shadow-2 ring-1"
    >
      {content}
    </div>
  );
}
