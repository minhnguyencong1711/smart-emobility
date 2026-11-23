import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import {
  ArrowLeftIcon,
  BikeIcon,
  BoltIcon,
  ParkingIcon,
} from '@/components/icons';
import {
  Button,
  FilterChip,
  PageHeader,
  Select,
  StatCard,
} from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import {
  HubChargerMatrix,
  type MatrixPort,
} from './components/hub-charger-matrix';
import {
  HubLoadDemandSidebar,
  OVERDUE_VEHICLES,
  OverdueVehiclesDrawer,
} from './components/hub-load-sidebar';

export const Route = createFileRoute('/operator/_operator/monitoring/$id')({
  component: HubDetailPage,
});

function HubDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { hubs, chargingPoints, policyConfig } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const hub = hubs.find((h) => h.id === id) ?? hubs[1];
  const [spikeMode, setSpikeMode] = useState(false);
  const [overdueDrawerOpen, setOverdueDrawerOpen] = useState(false);
  const [warnedPlates, setWarnedPlates] = useState<string[]>([]);

  const cpB04 = chargingPoints.find((cp) => cp.id === 'cp-b04');
  const isB04Isolated = cpB04?.status === 'ISOLATED';

  const currentKw = spikeMode
    ? Math.round(hub.gridMaxKw * 0.92)
    : hub.gridCurrentKw;
  const gridPct = Math.round((currentKw / hub.gridMaxKw) * 100);
  const parkingPct = Math.round(
    (hub.coreBaysOccupied / hub.coreBaysTotal) * 100,
  );
  const sharedPct = Math.round((hub.sharedEvsReady / hub.sharedEvsTotal) * 100);

  const matrixPorts: MatrixPort[] = [
    { code: 'CP-B01', spec: 'DC 30kW', kw: 24.5, status: 'CHARGING', soc: 82 },
    { code: 'CP-B02', spec: 'DC 30kW', kw: 28.1, status: 'CHARGING', soc: 45 },
    { code: 'CP-B03', spec: 'DC 30kW', kw: 14.0, status: 'THROTTLED' },
    {
      code: 'CP-B04',
      spec: isB04Isolated ? 'ISOLATED' : 'GROUND FAULT',
      kw: 0.0,
      status: isB04Isolated ? 'ISOLATED' : 'FAULT',
    },
    { code: 'CP-B05', spec: 'AC 7kW', kw: 6.8, status: 'CHARGING', soc: 91 },
    { code: 'CP-B06', spec: 'AC 7kW', kw: 7.0, status: 'CHARGING', soc: 60 },
    { code: 'CP-B07', spec: 'AC 7kW', kw: 0.0, status: 'IDLE' },
    { code: 'CP-B08', spec: 'AC 7kW', kw: 6.9, status: 'CHARGING', soc: 33 },
    { code: 'CP-B09', spec: 'AC 7kW', kw: 4.2, status: 'THROTTLED' },
    { code: 'CP-B10', spec: 'AC 7kW', kw: 0.0, status: 'IDLE' },
    { code: 'CP-B11', spec: 'AC 7kW', kw: 7.1, status: 'CHARGING', soc: 75 },
    { code: 'CP-B12', spec: 'AC 7kW', kw: 6.6, status: 'CHARGING', soc: 89 },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title={`Hub Capacity & Load — ${hub.shortName}`}
        breadcrumb={[
          { label: 'Home', to: '/operator/monitoring' },
          { label: 'Operations Management', to: '/operator/monitoring' },
          { label: hub.shortName },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={hub.id}
              onChange={(e) =>
                navigate({
                  to: '/operator/monitoring/$id',
                  params: { id: e.target.value },
                })
              }
              options={hubs.map((h) => ({
                value: h.id,
                label: `${h.code}: ${h.shortName} (${h.status})`,
              }))}
              className="w-60"
            />
            <Link to="/operator/monitoring">
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={<ArrowLeftIcon size={14} />}
              >
                Overview
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption font-semibold text-ink-3">
            Inspection Mode:
          </span>
          <FilterChip
            size="sm"
            tone="navy"
            active={!spikeMode}
            onClick={() => setSpikeMode(false)}
          >
            3-Zone Inspection
          </FilterChip>
          <FilterChip
            size="sm"
            tone="danger"
            active={spikeMode}
            onClick={() => setSpikeMode(true)}
          >
            Critical Grid Spike (92%)
          </FilterChip>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOverdueDrawerOpen(true)}
          >
            Overdue Vehicles ({OVERDUE_VEHICLES.length})
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            title="SHARED FLEET BAYS"
            value={hub.sharedEvsReady}
            denominator={`/ ${hub.sharedEvsTotal} Docks`}
            badgeText={`Available: ${sharedPct}%`}
            badgeTone="ok"
            icon={<BikeIcon size={18} />}
            iconTone="eco"
            progress={sharedPct}
            progressTone="eco"
            footerLeft={`Ready: ${hub.sharedEvsReady} EVs`}
            footerRight="Charging: 7 EVs"
          />
          <StatCard
            title="PERSONAL EV PARKING"
            value={hub.coreBaysOccupied}
            denominator={`/ ${hub.coreBaysTotal} Total Bays`}
            badgeText={`Saturation: ${parkingPct}%`}
            badgeTone={parkingPct >= 85 ? 'warn' : 'primary'}
            icon={<ParkingIcon size={18} />}
            iconTone="warn"
            progress={parkingPct}
            progressTone={parkingPct >= 85 ? 'warn' : 'primary'}
            footerLeft={`Occupied: ${hub.coreBaysOccupied}`}
            footerRight={`Free: ${hub.coreBaysTotal - hub.coreBaysOccupied} Bays`}
          />
          <StatCard
            title="SUBSTATION GRID LOAD"
            value={currentKw}
            denominator={`kW / ${hub.gridMaxKw} kW Cap`}
            badgeText={`Load: ${gridPct}%`}
            badgeTone={
              gridPct >= policyConfig.gridCriticalThreshold
                ? 'danger'
                : gridPct >= policyConfig.gridWarningThreshold
                  ? 'warn'
                  : 'ok'
            }
            icon={<BoltIcon size={18} />}
            iconTone={
              gridPct >= policyConfig.gridCriticalThreshold ? 'danger' : 'warn'
            }
            progress={gridPct}
            progressTone={
              gridPct >= policyConfig.gridCriticalThreshold ? 'danger' : 'warn'
            }
            footerLeft={`DLB Warn: ${policyConfig.gridWarningThreshold}%`}
            footerRight={`Critical: ${policyConfig.gridCriticalThreshold}%`}
            footerRightTone={
              gridPct >= policyConfig.gridCriticalThreshold ? 'danger' : 'warn'
            }
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <HubChargerMatrix
            hubName={hub.shortName}
            ports={matrixPorts}
            onInspectFault={() => navigate({ to: '/operator/incidents' })}
          />
          <HubLoadDemandSidebar
            currentKw={currentKw}
            gridPct={gridPct}
            spikeMode={spikeMode}
            isB04Isolated={isB04Isolated}
            policyConfig={policyConfig}
            onOpenOverdueDrawer={() => setOverdueDrawerOpen(true)}
          />
        </div>
      </div>

      <OverdueVehiclesDrawer
        open={overdueDrawerOpen}
        hub={hub}
        warnedPlates={warnedPlates}
        onClose={() => setOverdueDrawerOpen(false)}
        onSendWarning={(plate, owner) => {
          setWarnedPlates((prev) => [...prev, plate]);
          pushToast({
            tone: 'info',
            title: `Warning sent to ${owner}`,
            description: `Overdue notice dispatched for ${plate}.`,
          });
        }}
      />
    </div>
  );
}
