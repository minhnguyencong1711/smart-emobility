import {
  AlertTriangleIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldAlertIcon,
} from '@/components/icons';
import { Badge, Card, StatusPill } from '@/components/ui';
import { cn } from '@/utils/cn';

export type MatrixPort = {
  code: string;
  spec: string;
  kw: number;
  status: 'CHARGING' | 'THROTTLED' | 'IDLE' | 'FAULT' | 'ISOLATED';
  soc?: number;
};

export function HubChargerMatrix({
  hubName,
  ports,
  onInspectFault,
}: {
  hubName: string;
  ports: MatrixPort[];
  onInspectFault: () => void;
}) {
  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-title font-extrabold text-ink">
            12-Port Charging Point Matrix
          </h2>
          <p className="text-caption text-ink-3">
            Real-time Telemetry &amp; Current Status per Port at {hubName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-ink-2">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-ok" /> Fast Active
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-warn" /> DLB Throttle
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-danger" /> Hardware Fault
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ports.map((port) => {
          const isFault = port.status === 'FAULT';
          const isIso = port.status === 'ISOLATED';
          return (
            <div
              key={port.code}
              onClick={() => {
                if (isFault) onInspectFault();
              }}
              className={cn(
                'rounded-md border p-3 transition-colors',
                isFault
                  ? 'bg-danger-soft/50 cursor-pointer border-danger hover:bg-danger-soft'
                  : isIso
                    ? 'border-warn/50 bg-warn-soft/50'
                    : 'border-line bg-surface',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-body-sm font-bold text-ink">
                  {port.code}
                </span>
                <Badge
                  tone={
                    isFault
                      ? 'danger'
                      : isIso
                        ? 'warn'
                        : port.spec.includes('DC')
                          ? 'primary'
                          : 'navy'
                  }
                >
                  {port.spec}
                </Badge>
              </div>
              <p className="mt-2 font-mono text-title font-extrabold text-ink">
                {port.kw.toFixed(1)} kW
              </p>
              <div className="mt-2">
                {port.status === 'CHARGING' ? (
                  <StatusPill tone="ok" icon={<BoltIcon size={11} />}>
                    Charging ({port.soc}%)
                  </StatusPill>
                ) : port.status === 'THROTTLED' ? (
                  <StatusPill
                    tone="warn"
                    icon={<AlertTriangleIcon size={11} />}
                  >
                    DLB Throttled
                  </StatusPill>
                ) : isFault ? (
                  <StatusPill
                    tone="danger"
                    icon={<ShieldAlertIcon size={11} />}
                  >
                    ERR_GROUND_FAULT
                  </StatusPill>
                ) : isIso ? (
                  <StatusPill tone="warn" icon={<ClockIcon size={11} />}>
                    OUT_OF_SERVICE
                  </StatusPill>
                ) : (
                  <StatusPill
                    tone="neutral"
                    icon={<CheckCircleIcon size={11} />}
                  >
                    Idle Ready
                  </StatusPill>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
