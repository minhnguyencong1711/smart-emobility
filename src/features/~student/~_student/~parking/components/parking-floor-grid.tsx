import { BoltIcon } from '@/components/icons';
import { Badge, Card, Tabs } from '@/components/ui';
import type { MobilityHub } from '@/types';
import { cn } from '@/utils/cn';

import { PARKING_ROWS, type SlotState } from '../utils/parking-slots';

import { ParkingBookingForm } from './parking-booking-form';
import { ParkingSelectedCard } from './parking-selected-card';

export type ParkingSlotItem = {
  code: string;
  row: string;
  status: SlotState;
  charger: boolean;
};

type ParkingSelectionGridProps = {
  hubs: MobilityHub[];
  selectedHub: MobilityHub;
  hubId: string;
  freeParking: number;
  vehicleChoice: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: string;
  gracePeriodMins: number;
  floor: string;
  selectedSlot: string;
  selectedHasCharger: boolean;
  estCostVnd: number;
  slots: ParkingSlotItem[];
  onHubChange: (val: string) => void;
  onVehicleChange: (val: string) => void;
  onArrivalDateChange: (val: string) => void;
  onArrivalTimeChange: (val: string) => void;
  onDurationChange: (val: string) => void;
  onFloorChange: (val: string) => void;
  onSelectSlot: (code: string) => void;
  onOpenTerms: () => void;
  onProceedConfirm: () => void;
};

export function ParkingSelectionGrid(props: ParkingSelectionGridProps) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-12">
      <Card padding="md" className="xl:col-span-4">
        <ParkingBookingForm
          hubs={props.hubs}
          selectedHub={props.selectedHub}
          hubId={props.hubId}
          freeParking={props.freeParking}
          vehicleChoice={props.vehicleChoice}
          arrivalDate={props.arrivalDate}
          arrivalTime={props.arrivalTime}
          durationHours={props.durationHours}
          gracePeriodMins={props.gracePeriodMins}
          onHubChange={props.onHubChange}
          onVehicleChange={props.onVehicleChange}
          onArrivalDateChange={props.onArrivalDateChange}
          onArrivalTimeChange={props.onArrivalTimeChange}
          onDurationChange={props.onDurationChange}
          onOpenTerms={props.onOpenTerms}
        />
      </Card>

      <Card padding="md" className="space-y-4 xl:col-span-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-title font-extrabold text-ink">
              Parking Space Availability
            </h2>
            <p className="text-caption text-ink-3">{props.selectedHub.name}</p>
          </div>
          <Tabs
            value={props.floor}
            onChange={props.onFloorChange}
            items={[
              { id: '1', label: 'Floor 1' },
              { id: '2', label: 'Floor 2' },
              { id: '3', label: 'Floor 3' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-caption text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-xs border border-ok bg-ok-soft" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-xs border border-warn bg-warn-soft" />
            Reserved
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="border-danger/40 size-3 rounded-xs border bg-danger-soft" />
            Occupied
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-xs bg-primary" />
            Selected
          </span>
          <span className="inline-flex items-center gap-1 text-eco-700">
            <BoltIcon size={13} />
            Charging Port
          </span>
        </div>

        <div className="space-y-3">
          {PARKING_ROWS.map((row) => (
            <div key={row} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge tone="navy">{row}</Badge>
                {row === 'A' ? (
                  <span className="text-caption text-eco-700">
                    A04–A10 equipped with Charging Ports
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {props.slots
                  .filter((s) => s.row === row)
                  .map((slot) => {
                    const isSelected = props.selectedSlot === slot.code;
                    const isDisabled = slot.status !== 'AVAILABLE';
                    return (
                      <button
                        key={slot.code}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => props.onSelectSlot(slot.code)}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-sm border py-2 font-mono text-caption font-bold transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-1'
                            : slot.status === 'RESERVED'
                              ? 'border-warn/40 cursor-not-allowed bg-warn-soft text-warn-700'
                              : slot.status === 'OCCUPIED'
                                ? 'border-danger/25 cursor-not-allowed bg-danger-soft text-danger-700'
                                : 'border-ok/35 bg-ok-soft/45 text-ink hover:border-primary hover:bg-primary-soft',
                        )}
                      >
                        <span>{slot.code}</span>
                        {slot.charger ? (
                          <BoltIcon
                            size={11}
                            className={
                              isSelected ? 'text-white' : 'text-eco-700'
                            }
                          />
                        ) : (
                          <span className="h-[11px]" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <p className="border-t border-line pt-2.5 text-caption text-ink-3">
          Showing 30 of 60 parking spaces on Floor {props.floor}. Total
          available spaces on this floor: <strong>42 / 60</strong>.
        </p>
      </Card>

      <ParkingSelectedCard
        selectedSlot={props.selectedSlot}
        selectedHasCharger={props.selectedHasCharger}
        floor={props.floor}
        durationHours={props.durationHours}
        arrivalTime={props.arrivalTime}
        estCostVnd={props.estCostVnd}
        onProceedConfirm={props.onProceedConfirm}
      />
    </div>
  );
}
