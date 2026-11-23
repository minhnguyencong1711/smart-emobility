import {
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ParkingIcon,
  QrCodeIcon,
} from '@/components/icons';
import { DetailRow } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  CountdownTimer,
  StatusPill,
} from '@/components/ui';
import type { ActiveParkingAndCharging, MobilityHub } from '@/types';

export function EPassTicketView({
  activeParking,
  hub,
  bayShort,
  onCheckIn,
  onBookCharging,
  onOpenCancel,
}: {
  activeParking: ActiveParkingAndCharging | null;
  hub: MobilityHub;
  bayShort: string;
  onCheckIn: () => void;
  onBookCharging: () => void;
  onOpenCancel: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Card padding="md" className="space-y-4 xl:col-span-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label font-bold uppercase tracking-wider text-primary-700">
              Gate Check-in Code
            </p>
            <h2 className="text-title font-extrabold text-ink">
              {activeParking?.reservationId ?? 'SES-24081'}
            </h2>
          </div>
          <StatusPill
            tone={activeParking?.checkedIn ? 'ok' : 'info'}
            icon={
              activeParking?.checkedIn ? (
                <CheckCircleIcon size={12} />
              ) : (
                <ClockIcon size={12} />
              )
            }
          >
            {activeParking?.parkingStatus ?? 'CHECKED_IN'}
          </StatusPill>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-primary/25 bg-surface-2 p-5 text-center">
          <div className="flex size-44 items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-surface text-navy shadow-card">
            <QrCodeIcon size={120} />
          </div>
          <p className="mt-3 text-label font-bold uppercase tracking-wider text-ink-3">
            6-Digit Gate PIN
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {(activeParking?.pinCode ?? '376492')
              .replace(/\D/g, '')
              .padEnd(6, '0')
              .slice(0, 6)
              .split('')
              .map((digit, i) => (
                <span
                  key={`${digit}-${i}`}
                  className="flex size-9 items-center justify-center rounded-sm border border-line bg-surface font-mono text-title font-extrabold text-ink shadow-card"
                >
                  {digit}
                </span>
              ))}
          </div>
          <p className="mt-2 font-mono text-caption text-ink-3">
            {activeParking?.ePassCode ?? 'EPASS-VNU-ST01'}
          </p>
        </div>

        <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
          <DetailRow label="Hub Location" value={hub.name} />
          <DetailRow
            label="Assigned Bay"
            value={`Floor ${activeParking?.floor ?? 1} · ${activeParking?.bayCode ?? 'BAY-A02'}`}
            mono
          />
          <DetailRow
            label="Vehicle"
            value={`${activeParking?.vehicleModel ?? 'VinFast Feliz'} · ${activeParking?.plateNumber ?? '51H-228.08'}`}
            mono
          />
        </div>

        {!activeParking?.checkedIn ? (
          <CountdownTimer
            secondsRemaining={740}
            label="Arrival grace countdown"
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!activeParking?.checkedIn ? (
            <Button
              variant="primary"
              fullWidth
              leadingIcon={<ParkingIcon size={16} />}
              onClick={onCheckIn}
            >
              Confirm Gate Check-in
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              leadingIcon={<BoltIcon size={16} />}
              onClick={onBookCharging}
            >
              Proceed to Book Charging Session →
            </Button>
          )}
          <Button variant="secondary" fullWidth onClick={onOpenCancel}>
            Cancel Parking Hold
          </Button>
        </div>
      </Card>

      <Card padding="md" className="space-y-4 xl:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-title font-extrabold text-ink">
            Charging Session — Check-In Path ({bayShort})
          </h2>
          <Badge tone="eco">Gate → Bay {bayShort}</Badge>
        </div>

        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <svg
            viewBox="0 0 640 310"
            className="h-auto w-full rounded-md bg-surface"
            role="img"
            aria-label={`Navigation route from entrance gate to bay ${bayShort}`}
          >
            <rect
              x="10"
              y="10"
              width="620"
              height="290"
              rx="10"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <line
              x1="80"
              y1="155"
              x2="560"
              y2="155"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {['A01', 'A02', 'A03', 'A04', 'A05', 'A06'].map((bay, idx) => {
              const bx = 95 + idx * 82;
              const isTarget =
                bay === bayShort ||
                (idx === 1 &&
                  !['A01', 'A02', 'A03', 'A04', 'A05', 'A06'].includes(
                    bayShort,
                  ));
              return (
                <g key={bay}>
                  <rect
                    x={bx}
                    y="34"
                    width="68"
                    height="84"
                    rx="6"
                    fill={isTarget ? '#D1FAE5' : '#FFFFFF'}
                    stroke={isTarget ? '#10B981' : '#94A3B8'}
                    strokeWidth={isTarget ? '2.5' : '1.5'}
                  />
                  <text
                    x={bx + 34}
                    y="78"
                    textAnchor="middle"
                    fill={isTarget ? '#047857' : '#475569'}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {isTarget ? bayShort : bay}
                  </text>
                  <text
                    x={bx + 34}
                    y="98"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9.5"
                  >
                    {isTarget ? 'YOUR BAY' : 'EV CHARGER'}
                  </text>
                </g>
              );
            })}
            {['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].map((bay, idx) => {
              const bx = 95 + idx * 82;
              return (
                <g key={bay}>
                  <rect
                    x={bx}
                    y="192"
                    width="68"
                    height="84"
                    rx="6"
                    fill="#F1F5F9"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  <text
                    x={bx + 34}
                    y="238"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {bay}
                  </text>
                </g>
              );
            })}
            <rect x="22" y="128" width="60" height="54" rx="6" fill="#030391" />
            <text
              x="52"
              y="152"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="700"
            >
              ENTRY
            </text>
            <text
              x="52"
              y="166"
              textAnchor="middle"
              fill="#72BFF6"
              fontSize="9"
            >
              GATE 01
            </text>
            <path
              d="M 84 155 L 211 155 L 211 124"
              fill="none"
              stroke="#10B981"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon points="211,114 203,128 219,128" fill="#10B981" />
          </svg>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-surface-2 p-3">
            <p className="text-label font-bold uppercase text-ink-3">Step 1</p>
            <p className="mt-0.5 text-caption font-semibold text-ink">
              Scan QR or enter PIN at Entry Gate 01
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3">
            <p className="text-label font-bold uppercase text-ink-3">Step 2</p>
            <p className="mt-0.5 text-caption font-semibold text-ink">
              Follow green aisle markers to Row {bayShort[0]}
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-2 p-3">
            <p className="text-label font-bold uppercase text-ink-3">Step 3</p>
            <p className="mt-0.5 text-caption font-semibold text-ink">
              Plug connector &amp; start charging session
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
