import { BoltIcon } from '@/components/icons';
import { DetailRow } from '@/components/shared';
import {
  Button,
  Callout,
  Card,
  FilterChip,
  Select,
  Slider,
} from '@/components/ui';
import type { ActiveParkingAndCharging, ChargingPoint } from '@/types';

export type ChargingBookingException =
  | 'NORMAL'
  | 'OVERLAP_CONFLICT'
  | 'NO_COMPATIBLE_PORT'
  | 'EXPIRED_SESSION'
  | 'DB_SYNC_FAILURE';

export function ChargingBookingPanel({
  activeParking,
  connectorType,
  selectedPortId,
  targetSoc,
  bookingException,
  compatiblePorts,
  onConnectorTypeChange,
  onSelectedPortChange,
  onTargetSocChange,
  onExceptionChange,
  onBookCharging,
}: {
  activeParking: ActiveParkingAndCharging | null;
  connectorType: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC';
  selectedPortId: string;
  targetSoc: number;
  bookingException: ChargingBookingException;
  compatiblePorts: ChargingPoint[];
  onConnectorTypeChange: (val: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC') => void;
  onSelectedPortChange: (val: string) => void;
  onTargetSocChange: (val: number) => void;
  onExceptionChange: (val: ChargingBookingException) => void;
  onBookCharging: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-caption font-semibold text-ink-3">
          Charging Booking State:
        </span>
        {(
          [
            ['NORMAL', 'Normal'],
            ['OVERLAP_CONFLICT', 'Overlap Conflict'],
            ['NO_COMPATIBLE_PORT', 'No Compatible Port'],
            ['EXPIRED_SESSION', 'Expired Session'],
            ['DB_SYNC_FAILURE', 'DB Sync Failure'],
          ] as const
        ).map(([mode, label]) => (
          <FilterChip
            key={mode}
            size="sm"
            tone="navy"
            active={bookingException === mode}
            onClick={() => onExceptionChange(mode)}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      {bookingException !== 'NORMAL' ? (
        <Callout
          tone="danger"
          title={`Charging Booking Exception: ${bookingException.replaceAll('_', ' ')}`}
          description="Booking validation preview. Switch back to Normal to proceed with charging."
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <Card padding="md" className="space-y-4">
          <h2 className="text-title font-extrabold text-ink">
            Configure Charging Session
          </h2>

          <Select
            label="Connector Standard"
            value={connectorType}
            onChange={(e) =>
              onConnectorTypeChange(
                e.target.value as 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC',
              )
            }
            options={[
              { value: 'TYPE_2', label: 'Type 2 AC (11 kW Standard)' },
              { value: 'DC_FAST', label: 'DC Fast (30–50 kW)' },
              {
                value: 'E_BIKE_AC',
                label: 'E-Bike / E-Moped AC (7.4 kW)',
              },
            ]}
          />

          <Select
            label="Available Charger Port"
            value={selectedPortId}
            onChange={(e) => onSelectedPortChange(e.target.value)}
            options={
              compatiblePorts.length > 0
                ? compatiblePorts.map((cp) => ({
                    value: cp.id,
                    label: `${cp.code} · ${cp.maxPowerKw} kW (${cp.status})`,
                  }))
                : [{ value: 'none', label: 'No compatible port available' }]
            }
          />

          <Slider
            label="Target State of Charge (SoC %)"
            min={60}
            max={100}
            step={5}
            unit="%"
            value={targetSoc}
            onChange={onTargetSocChange}
          />

          <Button
            variant="primary"
            fullWidth
            leadingIcon={<BoltIcon size={16} />}
            onClick={onBookCharging}
          >
            Start / Book Charging Session →
          </Button>
        </Card>

        <Card padding="md" className="space-y-4">
          <h3 className="text-title font-extrabold text-ink">
            Linked Parking &amp; DLB Summary
          </h3>
          <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
            <DetailRow
              label="Linked Bay"
              value={activeParking?.bayCode ?? 'BAY-A02'}
              mono
            />
            <DetailRow
              label="Current SoC"
              value={`${activeParking?.socPercent ?? 68}%`}
              mono
            />
            <DetailRow label="Target SoC" value={`${targetSoc}%`} mono />
          </div>
          <Callout
            tone="info"
            title="Dynamic Load Balancing Protection"
            description="If hub substation demand reaches 85%, routine sessions may throttle automatically to protect the feeder transformer."
          />
        </Card>
      </div>
    </div>
  );
}
