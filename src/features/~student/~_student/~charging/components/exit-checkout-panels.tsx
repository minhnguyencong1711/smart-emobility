import { Link } from '@tanstack/react-router';

import {
  ChargingStationIcon,
  CheckCircleIcon,
  ParkingIcon,
  QrCodeIcon,
  ReceiptIcon,
} from '@/components/icons';
import { DetailRow } from '@/components/shared';
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  CardRow,
  StatusPill,
} from '@/components/ui';
import type { ActiveParkingAndCharging } from '@/types';

export function PreExitOptionsView({
  activeParking,
  chargingStopped,
  onOpenStopConfirm,
  onOpenExitConfirm,
}: {
  activeParking: ActiveParkingAndCharging | null;
  chargingStopped: boolean;
  onOpenStopConfirm: () => void;
  onOpenExitConfirm: () => void;
}) {
  return (
    <div className="space-y-4">
      {chargingStopped ? (
        <Callout
          tone="ok"
          title="Charging Session Stopped — Parking Bay Still Active"
          description={`Port ${activeParking?.chargingPortCode ?? 'CP-A01'} has been freed for other EVs, while ${activeParking?.bayCode ?? 'BAY-A02'} remains reserved under your parking pass.`}
        />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card padding="md" className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <CardHeader
              icon={<ChargingStationIcon size={20} />}
              tone="primary"
              title="Stop Charging Only (Keep Parking)"
              description="Ends power delivery and frees the charger port while keeping your parking bay occupied."
              action={
                <StatusPill
                  tone={chargingStopped ? 'ok' : 'info'}
                  icon={<CheckCircleIcon size={12} />}
                >
                  {chargingStopped ? 'Stopped' : 'Active'}
                </StatusPill>
              }
            />
            <ul className="space-y-1.5 text-body-sm text-ink-2">
              <li>• Charger relay disconnects safely (0.0 kW).</li>
              <li>
                • Parking bay {activeParking?.bayCode ?? 'BAY-A02'} stays
                checked in.
              </li>
              <li>• Avoids overtime charging idle fees.</li>
            </ul>
          </div>
          <Button
            variant="secondary"
            fullWidth
            disabled={chargingStopped}
            onClick={onOpenStopConfirm}
          >
            {chargingStopped
              ? 'Charging Already Stopped'
              : 'Stop Charging Only'}
          </Button>
        </Card>

        <Card padding="md" className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <CardHeader
              icon={<ParkingIcon size={20} />}
              tone="navy"
              title="Exit Hub & Release Bay"
              description="Finalizes charging & parking, releases your bay, and displays your exit barrier path."
              action={<Badge tone="navy">Checkout</Badge>}
            />
            <ul className="space-y-1.5 text-body-sm text-ink-2">
              <li>• Stops any active power session immediately.</li>
              <li>
                • Releases {activeParking?.bayCode ?? 'BAY-A02'} back to hub
                capacity.
              </li>
              <li>• Generates combined Charging + Parking receipt.</li>
            </ul>
          </div>
          <Button variant="primary" fullWidth onClick={onOpenExitConfirm}>
            Exit Hub &amp; Generate Receipt →
          </Button>
        </Card>
      </div>
    </div>
  );
}

export function CompletedExitReceiptView({
  activeParking,
  bayShort,
  energyKwh,
  chargingFeeVnd,
  parkingFeeVnd,
  totalVnd,
}: {
  activeParking: ActiveParkingAndCharging | null;
  bayShort: string;
  energyKwh: number;
  chargingFeeVnd: number;
  parkingFeeVnd: number;
  totalVnd: number;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Card padding="md" className="space-y-4 xl:col-span-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <ReceiptIcon size={22} className="text-ok-700" />
            <h2 className="text-title font-extrabold text-ink">
              Charging Receipt &amp; Hub Exit
            </h2>
          </div>
          <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
            BAY RELEASED
          </StatusPill>
        </div>

        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow
            label="Reservation ID"
            value={activeParking?.reservationId ?? 'PRK-2026-041'}
            mono
          />
          <DetailRow
            label="Energy Delivered"
            value={`${energyKwh} kWh (${chargingFeeVnd.toLocaleString()} VND)`}
            mono
          />
          <DetailRow
            label="Parking Fee"
            value={`${activeParking?.durationHours ?? 3} hrs (${parkingFeeVnd.toLocaleString()} VND)`}
            mono
          />
          <CardRow>
            <span className="text-body-sm font-bold text-ink">Total Paid</span>
            <span className="font-mono text-title font-extrabold text-primary-700">
              {totalVnd.toLocaleString()} VND
            </span>
          </CardRow>
        </div>

        <div className="border-ok/30 bg-ok-soft/45 flex items-center gap-4 rounded-md border p-3.5">
          <div className="border-ok/35 flex size-16 shrink-0 items-center justify-center rounded-md border bg-surface text-ok-700">
            <QrCodeIcon size={44} />
          </div>
          <div>
            <p className="font-mono text-body-sm font-bold text-ink">
              EXIT-{activeParking?.reservationId ?? 'PRK-2026-041'}
            </p>
            <p className="text-caption text-ink-2">
              Scan at the exit barrier gate to raise the boom arm.
            </p>
          </div>
        </div>

        <Link to="/student/parking" className="block">
          <Button variant="primary" fullWidth>
            Back to Parking Reservations
          </Button>
        </Link>
      </Card>

      <Card padding="md" className="space-y-4 xl:col-span-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-title font-extrabold text-ink">
            Bay {bayShort} → Exit Gate Path
          </h3>
          <Badge tone="navy">EXIT GATE 02</Badge>
        </div>

        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <svg
            viewBox="0 0 600 290"
            className="h-auto w-full rounded-md bg-surface"
            role="img"
            aria-label={`Exit route from bay ${bayShort} to hub exit gate`}
          >
            <rect
              x="10"
              y="10"
              width="580"
              height="270"
              rx="10"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <line
              x1="60"
              y1="145"
              x2="515"
              y2="145"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {['A01', 'A02', 'A03', 'A04', 'A05'].map((bay, idx) => {
              const bx = 75 + idx * 84;
              const isOrigin = idx === 1;
              return (
                <g key={bay}>
                  <rect
                    x={bx}
                    y="32"
                    width="68"
                    height="80"
                    rx="6"
                    fill={isOrigin ? '#E0F2FE' : '#FFFFFF'}
                    stroke={isOrigin ? '#1488D8' : '#94A3B8'}
                    strokeWidth={isOrigin ? '2.5' : '1.5'}
                  />
                  <text
                    x={bx + 34}
                    y="76"
                    textAnchor="middle"
                    fill={isOrigin ? '#0D6DB5' : '#475569'}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {isOrigin ? bayShort : bay}
                  </text>
                </g>
              );
            })}
            <rect
              x="512"
              y="118"
              width="64"
              height="54"
              rx="6"
              fill="#10B981"
            />
            <text
              x="544"
              y="143"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="700"
            >
              EXIT
            </text>
            <text
              x="544"
              y="157"
              textAnchor="middle"
              fill="#ECFDF5"
              fontSize="9"
            >
              GATE 02
            </text>
            <path
              d="M 193 114 L 193 145 L 498 145"
              fill="none"
              stroke="#1488D8"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon points="508,145 494,137 494,153" fill="#1488D8" />
          </svg>
        </div>
      </Card>
    </div>
  );
}
