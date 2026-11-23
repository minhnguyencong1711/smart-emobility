import {
  ActivityIcon,
  AlertTriangleIcon,
  BatteryIcon,
  BoltIcon,
  ChargingStationIcon,
  CheckCircleIcon,
  ClockIcon,
  PowerOffIcon,
  ReceiptIcon,
} from '@/components/icons';
import { DetailRow } from '@/components/shared';
import { Badge, Button, Card, ProgressBar, StatusPill } from '@/components/ui';
import type {
  ActiveParkingAndCharging,
  ChargingSessionStatus,
  MobilityHub,
} from '@/types';

export function ChargingKpiGrid({
  currentKw,
  soc,
  targetSoc,
  elapsedStr,
  energyKwh,
  estimatedCostVnd,
}: {
  currentKw: number;
  soc: number;
  targetSoc: number;
  elapsedStr: string;
  energyKwh: number;
  estimatedCostVnd: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <div className="rounded-lg border border-line bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between text-label font-bold uppercase text-ink-3">
          <span>Power Draw</span>
          <BoltIcon size={14} className="text-primary-700" />
        </div>
        <p className="mt-1.5 font-mono text-title font-extrabold text-ink">
          {currentKw} kW
        </p>
        <p className="text-[11px] text-ink-3">Instantaneous rate</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between text-label font-bold uppercase text-ink-3">
          <span>Average Power</span>
          <ActivityIcon size={14} className="text-navy" />
        </div>
        <p className="mt-1.5 font-mono text-title font-extrabold text-ink">
          6.7 kW
        </p>
        <p className="text-[11px] text-ink-3">Session mean</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between text-label font-bold uppercase text-ink-3">
          <span>Battery SoC</span>
          <BatteryIcon size={14} className="text-eco-700" />
        </div>
        <p className="mt-1.5 font-mono text-title font-extrabold text-eco-700">
          {soc}%
        </p>
        <p className="text-[11px] text-ink-3">Target {targetSoc}%</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between text-label font-bold uppercase text-ink-3">
          <span>Elapsed Time</span>
          <ClockIcon size={14} className="text-ink-3" />
        </div>
        <p className="mt-1.5 font-mono text-title font-extrabold text-ink">
          {elapsedStr}
        </p>
        <p className="text-[11px] text-ink-3">Active timer</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between text-label font-bold uppercase text-ink-3">
          <span>Energy Delivered</span>
          <ChargingStationIcon size={14} className="text-primary-700" />
        </div>
        <p className="mt-1.5 font-mono text-title font-extrabold text-ink">
          {energyKwh} kWh
        </p>
        <p className="text-[11px] text-ink-3">Metered total</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between text-label font-bold uppercase text-ink-3">
          <span>Estimated Cost</span>
          <ReceiptIcon size={14} className="text-warn-700" />
        </div>
        <p className="mt-1.5 font-mono text-title font-extrabold text-ink">
          {estimatedCostVnd.toLocaleString()} ₫
        </p>
        <p className="text-[11px] text-ink-3">3,570 VND/kWh</p>
      </div>
    </div>
  );
}

export function ChargingTelemetryWorkspace({
  hub,
  activeParking,
  status,
  soc,
  powerPoints,
  socPoints,
  onOpenStopModal,
}: {
  hub: MobilityHub;
  activeParking: ActiveParkingAndCharging | null;
  status: ChargingSessionStatus;
  soc: number;
  powerPoints: string;
  socPoints: string;
  onOpenStopModal: () => void;
}) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <Card padding="md" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-body-lg font-extrabold text-ink">
                Charging Power &amp; Battery SoC
              </h2>
              <p className="text-caption text-ink-3">
                Live dual-axis telemetry curve (
                {activeParking?.chargingPortCode ?? 'CP-A01'})
              </p>
            </div>
            <div className="flex items-center gap-4 text-caption font-semibold">
              <span className="inline-flex items-center gap-1.5 text-primary-700">
                <span className="h-0.5 w-4 bg-primary" />
                Power (kW)
              </span>
              <span className="inline-flex items-center gap-1.5 text-eco-700">
                <span className="h-0.5 w-4 bg-eco" />
                Battery SoC (%)
              </span>
            </div>
          </div>

          <div className="rounded-md border border-line bg-surface-2 p-3">
            <svg
              viewBox="0 0 470 175"
              className="h-52 w-full"
              role="img"
              aria-label="Charging Power kW and Battery SoC percentage over time"
            >
              {[
                { y: 30, kw: '10kW', socLabel: '100%' },
                { y: 65, kw: '7kW', socLabel: '75%' },
                { y: 100, kw: '4kW', socLabel: '50%' },
                { y: 135, kw: '0kW', socLabel: '25%' },
              ].map((row) => (
                <g key={row.y}>
                  <text x="2" y={row.y + 3} fill="#0D6DB5" fontSize="9">
                    {row.kw}
                  </text>
                  <line
                    x1="34"
                    y1={row.y}
                    x2="432"
                    y2={row.y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text x="437" y={row.y + 3} fill="#047857" fontSize="9">
                    {row.socLabel}
                  </text>
                </g>
              ))}
              <g transform="translate(24,0)">
                <polyline
                  fill="none"
                  stroke="#1488D8"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={powerPoints}
                />
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={socPoints}
                />
              </g>
              <text x="34" y="162" fill="#64748B" fontSize="10">
                00:00
              </text>
              <text x="155" y="162" fill="#64748B" fontSize="10">
                00:30
              </text>
              <text x="295" y="162" fill="#64748B" fontSize="10">
                01:00
              </text>
              <text x="405" y="162" fill="#64748B" fontSize="10">
                01:24
              </text>
            </svg>
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <h3 className="text-body-lg font-extrabold text-ink">
            Recent Session Events
          </h3>
          <div className="divide-y divide-line">
            <div className="flex items-start justify-between gap-3 py-2 text-caption">
              <span className="font-mono text-ink-3">[08:42:10]</span>
              <span className="flex-1 text-ink">
                {status === 'THROTTLED'
                  ? 'DLB throttled port output to 3.7 kW during campus peak.'
                  : status === 'INTERRUPTED'
                    ? 'Safety isolation triggered on port; bay lock preserved.'
                    : 'Nominal power delivery sustained at 6.8 kW.'}
              </span>
              <Badge
                tone={
                  status === 'INTERRUPTED'
                    ? 'danger'
                    : status === 'THROTTLED'
                      ? 'warn'
                      : 'ok'
                }
              >
                {status}
              </Badge>
            </div>
            <div className="flex items-start justify-between gap-3 py-2 text-caption">
              <span className="font-mono text-ink-3">[07:55:02]</span>
              <span className="flex-1 text-ink">
                Handshake completed on{' '}
                {activeParking?.chargingPortCode ?? 'CP-A01'} (Type 2 AC).
              </span>
              <Badge tone="primary">INFO</Badge>
            </div>
            <div className="flex items-start justify-between gap-3 py-2 text-caption">
              <span className="font-mono text-ink-3">[07:52:18]</span>
              <span className="flex-1 text-ink">
                Gate e-Pass verified for bay{' '}
                {activeParking?.bayCode ?? 'BAY-A04'}.
              </span>
              <Badge tone="eco">CHECKED_IN</Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-4">
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-lg font-extrabold text-ink">
              Session Status
            </h3>
            <StatusPill
              tone={status === 'INTERRUPTED' ? 'danger' : 'ok'}
              icon={
                status === 'INTERRUPTED' ? (
                  <AlertTriangleIcon size={12} />
                ) : (
                  <CheckCircleIcon size={12} />
                )
              }
            >
              {status === 'INTERRUPTED' ? 'Interrupted' : 'Active'}
            </StatusPill>
          </div>

          <ProgressBar
            value={soc}
            tone={status === 'INTERRUPTED' ? 'danger' : 'eco'}
            showLabel
          />

          <div className="border-ok/30 rounded-md border bg-ok-soft px-3 py-2 text-caption font-semibold text-ok-700">
            ● Telemetry connection healthy
          </div>

          <div className="rounded-md border border-line bg-surface-2 px-3.5 py-1">
            <DetailRow label="Hub" value={hub.shortName} />
            <DetailRow
              label="Bay & Floor"
              value={`Floor ${activeParking?.floor ?? 1} · ${activeParking?.bayCode ?? 'BAY-A04'}`}
              mono
            />
            <DetailRow
              label="Charger Port"
              value={activeParking?.chargingPortCode ?? 'CP-A01'}
              mono
            />
            <DetailRow
              label="Vehicle"
              value={activeParking?.plateNumber ?? '51H-228.08'}
              mono
            />
          </div>

          <Button
            variant="danger"
            fullWidth
            leadingIcon={<PowerOffIcon size={16} />}
            onClick={onOpenStopModal}
          >
            Stop Charging
          </Button>
        </Card>
      </div>
    </div>
  );
}
