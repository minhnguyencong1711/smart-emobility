import { ActivityIcon } from '@/components/icons';
import {
  Badge,
  Card,
  CardHeader,
  FilterChip,
  Pagination,
} from '@/components/ui';
import { usePagination } from '@/hooks';
import type { DlbLogEntry, DlbMode } from '@/types';
import { cn } from '@/utils/cn';

export function DlbTelemetryPanel({
  dlbMode,
  gridWarningThreshold,
  dlbActivityLogs,
  onSelectMode,
}: {
  dlbMode: DlbMode;
  gridWarningThreshold: number;
  dlbActivityLogs: DlbLogEntry[];
  onSelectMode: (mode: DlbMode) => void;
}) {
  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(
    dlbActivityLogs,
    5,
  );
  const currentLoadPct =
    dlbMode === 'CRITICAL' ? 88 : dlbMode === 'RECOVERY' ? 72 : 65;

  const loadPoints =
    dlbMode === 'CRITICAL'
      ? '10,64 45,56 80,48 115,38 150,28 185,20 220,16 265,14'
      : dlbMode === 'RECOVERY'
        ? '10,60 45,42 80,22 115,18 150,26 185,34 220,38 265,42'
        : '10,66 45,62 80,58 115,54 150,50 185,48 220,46 265,45';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-caption font-semibold text-ink-3">
          DLB Operating Mode:
        </span>
        {(
          [
            ['NORMAL', 'System Normal (65%)'],
            ['CRITICAL', 'Critical Overload (88% · Throttle)'],
            ['RECOVERY', 'Load Recovered (72%)'],
          ] as const
        ).map(([mode, label]) => (
          <FilterChip
            key={mode}
            size="sm"
            tone="navy"
            active={dlbMode === mode}
            onClick={() => onSelectMode(mode)}
          >
            {label}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card padding="md" className="space-y-3 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-title font-extrabold text-ink">
                Real-Time Grid Load
              </h3>
              <p className="text-caption text-ink-3">
                Transformer Load Capacity (%) · Safety Threshold{' '}
                {gridWarningThreshold}%
              </p>
            </div>
            <span
              className={cn(
                'font-mono text-heading font-extrabold',
                dlbMode === 'CRITICAL'
                  ? 'text-danger-700'
                  : dlbMode === 'RECOVERY'
                    ? 'text-primary-700'
                    : 'text-eco-700',
              )}
            >
              {currentLoadPct}%
            </span>
          </div>
          <div className="rounded-md border border-line bg-canvas p-3">
            <svg viewBox="0 0 280 95" className="h-44 w-full">
              <line
                x1="10"
                y1="24"
                x2="270"
                y2="24"
                stroke="#EF4444"
                strokeDasharray="3 2"
                strokeWidth="1"
              />
              <text x="175" y="20" fontSize="7" fill="#B91C1C">
                Safety Threshold {gridWarningThreshold}%
              </text>
              <polyline
                fill="none"
                stroke={
                  dlbMode === 'CRITICAL'
                    ? '#EF4444'
                    : dlbMode === 'RECOVERY'
                      ? '#1488D8'
                      : '#10B981'
                }
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={loadPoints}
              />
              <text x="10" y="90" fontSize="7" fill="#64748B">
                07:30
              </text>
              <text x="95" y="90" fontSize="7" fill="#64748B">
                07:50
              </text>
              <text x="175" y="90" fontSize="7" fill="#64748B">
                08:10
              </text>
              <text x="242" y="90" fontSize="7" fill="#0F172A">
                08:30
              </text>
            </svg>
          </div>
        </Card>

        <Card padding="md" className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-title font-extrabold text-ink">
              Detailed Ports
            </h3>
            <Badge tone="eco">12 / 12 Active</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, idx) => {
              const throttled = dlbMode === 'CRITICAL' && idx >= 6;
              return (
                <div
                  key={idx}
                  className={cn(
                    'rounded-md border p-2 text-center',
                    throttled
                      ? 'border-warn bg-warn-soft'
                      : 'bg-navy-soft/75 border-navy/25',
                  )}
                >
                  <p className="font-mono text-caption font-bold text-ink">
                    Port {idx + 1}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 text-[11px] font-semibold',
                      throttled ? 'text-warn-700' : 'text-navy',
                    )}
                  >
                    {throttled ? 'Throttled (3.5kW)' : 'Charging (7kW)'}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-4 rounded-lg px-5 py-4 text-white shadow-card',
          dlbMode === 'CRITICAL'
            ? 'bg-danger'
            : dlbMode === 'RECOVERY'
              ? 'bg-primary'
              : 'bg-eco-700',
        )}
      >
        <div>
          <p className="text-body font-extrabold uppercase tracking-wide">
            {dlbMode === 'CRITICAL'
              ? 'DLB ACTIVE — CRITICAL GRID OVERLOAD PROTECTION'
              : dlbMode === 'RECOVERY'
                ? 'LOAD RECOVERED — RESTORING NOMINAL OUTPUT'
                : 'SYSTEM NORMAL — BALANCED FEEDER LOAD'}
          </p>
          <p className="mt-0.5 text-caption text-white/90">
            {dlbMode === 'CRITICAL'
              ? 'Tier-3 routine EVs throttled to 3.5 kW automatically. Active student charging sessions notified.'
              : dlbMode === 'RECOVERY'
                ? 'Feeder demand stabilized below 85% threshold; queued ports ramping back to 7 kW.'
                : 'Grid load at safe levels. No throttling required across any hub ports.'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-heading font-extrabold">
            {currentLoadPct}%
          </p>
          <p className="text-[11px] font-semibold uppercase text-white/80">
            Current Load
          </p>
        </div>
      </div>

      <Card padding="md" className="space-y-3">
        <CardHeader
          icon={<ActivityIcon size={18} />}
          tone="navy"
          title="DLB Activity Log"
          description="Automated substation telemetry and throttling audit trail"
        />
        <div className="space-y-1.5 rounded-md border border-line bg-canvas p-3 font-mono text-caption">
          {pageItems.map((log) => (
            <div key={log.id} className="flex flex-wrap gap-2">
              <span className="text-ink-3">{log.time}</span>
              <span
                className={cn(
                  'font-bold',
                  log.level === 'CRITICAL'
                    ? 'text-danger-700'
                    : log.level === 'SYSTEM'
                      ? 'text-navy'
                      : 'text-primary-700',
                )}
              >
                {log.level}:
              </span>
              <span className="text-ink">{log.message}</span>
            </div>
          ))}
        </div>
        <Pagination
          variant="compact"
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={5}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
