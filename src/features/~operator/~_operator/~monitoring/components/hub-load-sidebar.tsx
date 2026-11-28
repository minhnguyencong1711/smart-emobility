import { Link } from '@tanstack/react-router';

import { Badge, Button, Callout, Card, Drawer } from '@/components/ui';
import type { OverdueVehicleRecord } from '@/stores/mobility/types';
import type { MobilityHub, SystemPolicyConfig } from '@/types';

export function HubLoadDemandSidebar({
  hubId,
  overdueCount,
  currentKw,
  gridPct,
  spikeMode,
  isB04Isolated,
  policyConfig,
  onOpenOverdueDrawer,
}: {
  hubId: string;
  overdueCount: number;
  currentKw: number;
  gridPct: number;
  spikeMode: boolean;
  isB04Isolated: boolean;
  policyConfig: SystemPolicyConfig;
  onOpenOverdueDrawer: () => void;
}) {
  const loadPoints = spikeMode
    ? '10,68 45,62 80,54 115,44 150,36 185,26 220,20 265,16'
    : '10,70 45,64 80,56 115,48 150,40 185,34 220,30 265,28';

  return (
    <div className="space-y-4">
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-label font-bold uppercase tracking-wider text-ink-3">
              24H POWER LOAD DEMAND CURVE
            </p>
            <p className="font-mono text-heading font-extrabold text-ink">
              {currentKw}.0 kW
            </p>
          </div>
          <Badge tone={gridPct >= 85 ? 'warn' : 'ok'}>
            {gridPct >= 85 ? 'DLB ACTIVE (≥85%)' : 'Within Limit'}
          </Badge>
        </div>

        <div className="rounded-md border border-line bg-canvas p-3">
          <svg viewBox="0 0 280 90" className="h-36 w-full">
            <line
              x1="10"
              y1="18"
              x2="270"
              y2="18"
              stroke="#EF4444"
              strokeDasharray="3 2"
              strokeWidth="1"
            />
            <text x="190" y="14" fontSize="7" fill="#B91C1C">
              Critical {policyConfig.gridCriticalThreshold}%
            </text>

            <line
              x1="10"
              y1="28"
              x2="270"
              y2="28"
              stroke="#F59E0B"
              strokeDasharray="3 2"
              strokeWidth="1"
            />
            <text x="190" y="25" fontSize="7" fill="#B45309">
              DLB {policyConfig.gridWarningThreshold}%
            </text>

            <polyline
              fill="none"
              stroke={spikeMode ? '#EF4444' : '#D97706'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={loadPoints}
            />
            <circle
              cx="265"
              cy={spikeMode ? '16' : '28'}
              r="3.5"
              fill={spikeMode ? '#EF4444' : '#B45309'}
            />
            <text x="10" y="86" fontSize="7" fill="#64748B">
              06:00
            </text>
            <text x="95" y="86" fontSize="7" fill="#64748B">
              10:00
            </text>
            <text x="175" y="86" fontSize="7" fill="#64748B">
              14:00
            </text>
            <text x="235" y="86" fontSize="7" fill="#0F172A" fontWeight="700">
              Now
            </text>
          </svg>
        </div>
      </Card>

      <Card padding="md" className="space-y-3">
        <h3 className="text-body-lg font-extrabold text-ink">
          Operator Quick-Actions
        </h3>
        <div className="space-y-2">
          <Button variant="secondary" fullWidth onClick={onOpenOverdueDrawer}>
            Review &amp; Eject Overdue EVs ({overdueCount}) →
          </Button>
          <Link to="/operator/redistribution" className="block">
            <Button variant="secondary" fullWidth>
              Request EVs Transfer →
            </Button>
          </Link>
          {hubId === 'hub-dorm-b' ? (
            <Link to="/operator/incidents" className="block">
              <Button
                variant={isB04Isolated ? 'secondary' : 'danger'}
                fullWidth
              >
                {isB04Isolated
                  ? 'Port CP-B04 Isolated (View Queue)'
                  : 'Isolate Faulty Port CP-B04 (1 Alert) →'}
              </Button>
            </Link>
          ) : (
            <Link to="/operator/incidents" className="block">
              <Button variant="secondary" fullWidth>
                Inspect Hub Incident Queue →
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

export function OverdueVehiclesDrawer({
  open,
  hub,
  overdueVehicles,
  warnedPlates,
  onClose,
  onSendWarning,
  onEjectBay,
}: {
  open: boolean;
  hub: MobilityHub;
  overdueVehicles: OverdueVehicleRecord[];
  warnedPlates: string[];
  onClose: () => void;
  onSendWarning: (plate: string, owner: string) => void;
  onEjectBay: (plate: string, bay: string) => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      ariaLabel={`Overdue Parked EVs ${hub.shortName}`}
    >
      <div className="space-y-4 p-4">
        <h3 className="text-title font-extrabold text-ink">
          Overdue Parked EVs — {hub.shortName}
        </h3>
        <Callout
          tone="warn"
          title="Grace / Duration Exceeded"
          description="Vehicles below have exceeded their booked parking duration. Send push warning or release bay."
        />
        {overdueVehicles.length === 0 ? (
          <Card padding="sm">
            <p className="text-body-sm text-ink-2">
              No overdue vehicles currently occupying bays at {hub.shortName}.
            </p>
          </Card>
        ) : (
          overdueVehicles.map((item) => {
            const warned = warnedPlates.includes(item.plate);
            return (
              <Card key={item.plate} padding="sm" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-body-sm font-bold text-ink">
                    {item.plate} · {item.bay}
                  </span>
                  <Badge tone="danger">+{item.overdueMins}m overdue</Badge>
                </div>
                <p className="text-caption text-ink-2">Owner: {item.owner}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={warned ? 'secondary' : 'primary'}
                    disabled={warned}
                    onClick={() => onSendWarning(item.plate, item.owner)}
                  >
                    {warned ? 'Warning Sent' : 'Send Push Warning'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onEjectBay(item.plate, item.bay)}
                  >
                    Release Bay &amp; Eject
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Drawer>
  );
}
