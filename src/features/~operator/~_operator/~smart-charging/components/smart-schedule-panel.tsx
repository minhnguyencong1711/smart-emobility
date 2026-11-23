import { BoltIcon, CheckCircleIcon } from '@/components/icons';
import { Badge, Button, Card, StatusPill } from '@/components/ui';
import type { ChargingQueueEntry } from '@/types';
import { cn } from '@/utils/cn';

const SCHEDULE_SLOTS = [
  {
    port: 'Port 1 (AC 7kW)',
    blocks: [
      '59A-12445 (Tier 1)',
      '59A-12346',
      '58A-13452',
      'Available',
      'Tier 3 Routine',
      'Idle',
    ],
  },
  {
    port: 'Port 2 (AC 7kW)',
    blocks: [
      'Tier 2 Booked',
      '59A-45907',
      'XMD-084',
      'Tier 3 Routine',
      '59A-12046',
      'Idle',
    ],
  },
  {
    port: 'Port 3 (AC 7kW)',
    blocks: [
      'Tier 2 Critical',
      '59A-78900',
      '58A-34560',
      '59A-12445',
      'Available',
      'Idle',
    ],
  },
  {
    port: 'Port 4 (DC 30kW)',
    blocks: [
      'Active Fast',
      '59A-46891',
      'XMD-085',
      'XMD-086',
      '58A-13527',
      'Fast Reserve',
    ],
  },
];

const EXTRA_TIER1 = [
  {
    id: 't1-1',
    plateNumber: '59A-12445',
    status: 'CONNECTED',
    socPercent: 15,
  },
  {
    id: 't1-2',
    plateNumber: '59A-12346',
    status: 'CONNECTED',
    socPercent: 42,
  },
];

export function SmartSchedulePanel({
  chargingQueue,
  tier2Items,
  tier3Items,
  generatedAt,
  chargingScheduleApplied,
  onGenerateSchedule,
  onApplySchedule,
}: {
  chargingQueue: ChargingQueueEntry[];
  tier2Items: ChargingQueueEntry[];
  tier3Items: ChargingQueueEntry[];
  generatedAt: string;
  chargingScheduleApplied: boolean;
  onGenerateSchedule: () => void;
  onApplySchedule: () => void;
}) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-12">
      <Card padding="md" className="space-y-4 lg:col-span-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-body-lg font-extrabold text-ink">
              Charging Demand Queue
            </h2>
            <p className="text-caption text-ink-3">3-Tier Priority Queue</p>
          </div>
          <Badge tone="navy">{chargingQueue.length + 2} EVs</Badge>
        </div>

        <div className="bg-primary-soft/25 space-y-2 rounded-md border border-primary/25 p-3">
          <p className="text-caption font-bold text-primary-700">
            Tier 1 (Personal EV)
          </p>
          <div className="space-y-1.5">
            {EXTRA_TIER1.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-sm border border-line bg-surface px-2.5 py-1.5 text-caption"
              >
                <span className="font-mono font-bold text-ink">
                  {item.plateNumber}
                </span>
                <Badge tone="primary">{item.status}</Badge>
                <span className="font-mono text-ink-2">
                  SoC: {item.socPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-danger/25 bg-danger-soft/25 space-y-2 rounded-md border p-3">
          <p className="text-caption font-bold text-danger-700">
            Tier 2 (Upcoming Booked EV)
          </p>
          <div className="space-y-1.5">
            {tier2Items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-sm border border-line bg-surface px-2.5 py-1.5 text-caption"
              >
                <span className="font-mono font-bold text-ink">
                  {item.plateNumber}
                </span>
                <Badge tone={item.status === 'CRITICAL' ? 'danger' : 'warn'}>
                  {item.status}
                </Badge>
                <span className="font-mono text-ink-2">
                  SoC: {item.socPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-line bg-surface-2 p-3">
          <p className="text-caption font-bold text-ink-2">
            Tier 3 (Routine Charging EV)
          </p>
          <div className="space-y-1.5">
            {tier3Items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-sm border border-line bg-surface px-2.5 py-1.5 text-caption"
              >
                <span className="font-mono font-bold text-ink">
                  {item.plateNumber}
                </span>
                <Badge tone={item.status === 'THROTTLED' ? 'warn' : 'eco'}>
                  {item.status}
                </Badge>
                <span className="font-mono text-ink-2">
                  SoC: {item.socPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          leadingIcon={<BoltIcon size={15} />}
          onClick={onGenerateSchedule}
        >
          Generate Charging Schedule
        </Button>
      </Card>

      <Card
        padding="md"
        className="flex flex-col justify-between gap-4 lg:col-span-8"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <h2 className="text-title font-extrabold text-ink">
                Schedule Grid
              </h2>
              <p className="text-caption text-ink-3">
                Ports / Time ({generatedAt})
              </p>
            </div>
            <div className="flex items-center gap-2">
              {chargingScheduleApplied ? (
                <StatusPill tone="ok" icon={<CheckCircleIcon size={12} />}>
                  Applied
                </StatusPill>
              ) : (
                <Badge tone="primary">Draft Matrix</Badge>
              )}
              <Button
                size="sm"
                variant="primary"
                disabled={chargingScheduleApplied}
                onClick={onApplySchedule}
              >
                {chargingScheduleApplied
                  ? 'Schedule Applied'
                  : 'Apply Schedule'}
              </Button>
            </div>
          </div>

          <div className="space-y-3 overflow-x-auto">
            <div className="grid min-w-[620px] grid-cols-[140px_repeat(6,1fr)] gap-2 text-center font-mono text-[11px] font-bold text-ink-3">
              <span className="text-left">Ports / Time</span>
              <span>08:00</span>
              <span>08:30</span>
              <span>09:00</span>
              <span>09:30</span>
              <span>10:00</span>
              <span>10:30</span>
            </div>
            {SCHEDULE_SLOTS.map((row) => (
              <div
                key={row.port}
                className="grid min-w-[620px] grid-cols-[140px_repeat(6,1fr)] items-center gap-2"
              >
                <span className="text-caption font-bold text-ink">
                  {row.port}
                </span>
                {row.blocks.map((blk, i) => {
                  const isCritical =
                    blk.includes('Critical') ||
                    blk.includes('59A-78900') ||
                    blk.includes('58A-34560');
                  const isTier1 =
                    blk.includes('Tier 1') ||
                    blk.includes('Active') ||
                    blk.includes('59A-12346');
                  const isIdle = blk === 'Idle' || blk === 'Available';
                  return (
                    <div
                      key={`${row.port}-${i}`}
                      className={cn(
                        'truncate rounded-sm border px-2 py-2.5 text-center text-[11px] font-semibold',
                        isCritical
                          ? 'border-danger/35 bg-danger-soft text-danger-700'
                          : isTier1
                            ? 'border-primary/35 bg-primary-soft text-primary-700'
                            : isIdle
                              ? 'border-line bg-surface-2 text-ink-3'
                              : 'border-eco/35 bg-eco-soft text-eco-700',
                      )}
                    >
                      {blk}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
