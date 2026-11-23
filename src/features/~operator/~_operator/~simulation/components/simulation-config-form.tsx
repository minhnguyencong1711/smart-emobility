import { FlaskIcon } from '@/components/icons';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Select,
  Slider,
} from '@/components/ui';
import type { SimulationScenarioType } from '@/types';

type SimulationConfigCardProps = {
  scenarioName: string;
  scenarioType: SimulationScenarioType;
  durationHours: string;
  timeStepMins: string;
  travelDelta: number;
  chargingDelta: number;
  parkingDelta: number;
  fleetDelta: number;
  disruption: string;
  onApplyPreset: (preset: 'peak' | 'storm' | 'metro') => void;
  onScenarioNameChange: (val: string) => void;
  onScenarioTypeChange: (val: SimulationScenarioType) => void;
  onDurationHoursChange: (val: string) => void;
  onTimeStepMinsChange: (val: string) => void;
  onTravelDeltaChange: (val: number) => void;
  onChargingDeltaChange: (val: number) => void;
  onParkingDeltaChange: (val: number) => void;
  onFleetDeltaChange: (val: number) => void;
  onDisruptionChange: (val: string) => void;
};

export function SimulationConfigForm(props: SimulationConfigCardProps) {
  return (
    <Card padding="md" className="space-y-4 xl:col-span-7">
      <CardHeader
        icon={<FlaskIcon size={20} />}
        tone="navy"
        title="Scenario Configuration"
        description="Configure hypothetical demand and disruption parameters relative to baseline hub telemetry"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => props.onApplyPreset('peak')}
        >
          ↗ Monday Morning Peak
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => props.onApplyPreset('storm')}
        >
          ☂ Storms / Flooding
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => props.onApplyPreset('metro')}
        >
          ⚑ Metro Station Event
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Scenario Name"
          value={props.scenarioName}
          onChange={(e) => props.onScenarioNameChange(e.target.value)}
        />
        <Select
          label="Scenario Type"
          value={props.scenarioType}
          onChange={(e) =>
            props.onScenarioTypeChange(e.target.value as SimulationScenarioType)
          }
          options={[
            { value: 'DEMAND_SURGE', label: 'Peak Travel Demand' },
            { value: 'PARKING_OVERLOAD', label: 'Parking Overload' },
            { value: 'CHARGING_SURGE', label: 'Charging Surge' },
            { value: 'CHARGER_FAILURE', label: 'Charger Failure' },
            { value: 'VEHICLE_IMBALANCE', label: 'Vehicle Imbalance' },
          ]}
        />
        <Select
          label="Simulation Duration"
          value={props.durationHours}
          onChange={(e) => props.onDurationHoursChange(e.target.value)}
          options={[
            { value: '12', label: 'Next 12 hours' },
            { value: '24', label: 'Next 24 hours' },
            { value: '48', label: 'Next 48 hours' },
          ]}
        />
        <Select
          label="Time Step"
          value={props.timeStepMins}
          onChange={(e) => props.onTimeStepMinsChange(e.target.value)}
          options={[
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
          ]}
        />
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <div>
          <h3 className="text-body-lg font-extrabold text-ink">
            Hypothetical Conditions
          </h3>
          <p className="text-caption text-ink-3">
            Changes relative to the baseline data of the selected hubs.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider
            label="Travel Demand"
            min={0}
            max={150}
            step={5}
            unit="%"
            value={props.travelDelta}
            onChange={props.onTravelDeltaChange}
          />
          <Slider
            label="Charging Demand"
            min={0}
            max={150}
            step={5}
            unit="%"
            value={props.chargingDelta}
            onChange={props.onChargingDeltaChange}
          />
          <Slider
            label="Parking Demand"
            min={0}
            max={150}
            step={5}
            unit="%"
            value={props.parkingDelta}
            onChange={props.onParkingDeltaChange}
          />
          <Slider
            label="Vehicle Concentration"
            min={0}
            max={100}
            step={5}
            unit="%"
            value={props.fleetDelta}
            onChange={props.onFleetDeltaChange}
          />
        </div>

        <Select
          label="Infrastructure Disruption"
          value={props.disruption}
          onChange={(e) => props.onDisruptionChange(e.target.value)}
          options={[
            {
              value: 'NONE',
              label: 'No Disruption (0 Unavailable Charging Points)',
            },
            {
              value: 'TWO_PORTS_OFFLINE',
              label: '2 DC Fast Charger Ports Offline',
            },
            {
              value: 'FEEDER_DERATE',
              label: 'Substation Feeder -20% Derating',
            },
          ]}
        />
      </div>
    </Card>
  );
}
