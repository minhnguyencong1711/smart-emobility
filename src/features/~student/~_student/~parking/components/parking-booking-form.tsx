import { Select } from '@/components/ui';
import type { MobilityHub } from '@/types';

import { VEHICLE_OPTIONS } from '../utils/parking-slots';

export function ParkingBookingForm({
  hubs,
  selectedHub,
  hubId,
  freeParking,
  vehicleChoice,
  arrivalDate,
  arrivalTime,
  durationHours,
  gracePeriodMins,
  onHubChange,
  onVehicleChange,
  onArrivalDateChange,
  onArrivalTimeChange,
  onDurationChange,
  onOpenTerms,
}: {
  hubs: MobilityHub[];
  selectedHub: MobilityHub;
  hubId: string;
  freeParking: number;
  vehicleChoice: string;
  arrivalDate: string;
  arrivalTime: string;
  durationHours: string;
  gracePeriodMins: number;
  onHubChange: (val: string) => void;
  onVehicleChange: (val: string) => void;
  onArrivalDateChange: (val: string) => void;
  onArrivalTimeChange: (val: string) => void;
  onDurationChange: (val: string) => void;
  onOpenTerms: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-label font-bold text-white">
            1
          </span>
          <h2 className="text-body font-bold text-ink">Select Mobility Hub</h2>
        </div>
        <Select
          value={hubId}
          onChange={(e) => onHubChange(e.target.value)}
          options={hubs.map((h) => ({
            value: h.id,
            label: `${h.name} (${Math.max(0, 100 - Math.round((h.coreBaysOccupied / h.coreBaysTotal) * 100))}% Available)`,
          }))}
        />
        <p className="text-caption text-ink-3">
          {selectedHub.location} · {freeParking} bays open
        </p>
      </div>

      <div className="space-y-2.5 border-t border-line pt-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-label font-bold text-white">
            2
          </span>
          <h2 className="text-body font-bold text-ink">
            Select Vehicle (Your Registered EV)
          </h2>
        </div>
        <Select
          value={vehicleChoice}
          onChange={(e) => onVehicleChange(e.target.value)}
          options={VEHICLE_OPTIONS}
        />
      </div>

      <div className="space-y-2.5 border-t border-line pt-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-label font-bold text-white">
            3
          </span>
          <h2 className="text-body font-bold text-ink">
            Estimated Arrival Time &amp; Parking Duration
          </h2>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Select
              label="Arrival Date"
              value={arrivalDate}
              onChange={(e) => onArrivalDateChange(e.target.value)}
              options={[
                { value: 'Wed. Oct 08, 2026', label: 'Wed. Oct 08, 2026' },
                { value: 'Thu. Oct 09, 2026', label: 'Thu. Oct 09, 2026' },
              ]}
            />
          </div>
          <Select
            label="Arrival Time"
            value={arrivalTime}
            onChange={(e) => onArrivalTimeChange(e.target.value)}
            options={[
              { value: '16:30', label: '16:30' },
              { value: '17:00', label: '17:00' },
              { value: '18:00', label: '18:00' },
            ]}
          />
          <Select
            label="Duration"
            value={durationHours}
            onChange={(e) => onDurationChange(e.target.value)}
            options={[
              { value: '2', label: '2 hours' },
              { value: '3', label: '3 hours' },
              { value: '4', label: '4 hours' },
            ]}
          />
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface-2 p-3 text-caption text-ink-2">
        <p className="font-bold text-ink">Parking Reservation Terms</p>
        <ul className="mt-1.5 space-y-1">
          <li>
            • Valid for a {gracePeriodMins}-minute grace period past scheduled
            arrival.
          </li>
          <li>• Check-in using the dynamic QR code or PIN at the gate.</li>
          <li>• Can be cancelled before arrival via active reservations.</li>
        </ul>
        <button
          type="button"
          onClick={onOpenTerms}
          className="mt-2 font-semibold text-primary-700 hover:underline"
        >
          View full terms and conditions →
        </button>
      </div>
    </div>
  );
}
