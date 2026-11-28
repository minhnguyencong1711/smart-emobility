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
  OverdueVehiclesDrawer,
} from './components/hub-load-sidebar';

export const Route = createFileRoute('/operator/_operator/monitoring/$id')({
  component: HubDetailPage,
});

const HUB_PORT_PREFIX: Record<string, string> = {
  'hub-suoi-tien': 'CP-A',
  'hub-dorm-a': 'CP-KA',
  'hub-dorm-b': 'CP-B',
  'hub-hcmut-2': 'CP-BK',
  'hub-vnu-admin': 'CP-VA',
};

function HubDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    hubs,
    chargingPoints,
    activeParking,
    dlbMode,
    policyConfig,
    overdueVehicles,
    warnedOverduePlates,
    warnOverdueVehicle,
    ejectOverdueParkingBay,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const hub = hubs.find((h) => h.id === id) ?? hubs[1];
  const [spikeMode, setSpikeMode] = useState(false);
  const [overdueDrawerOpen, setOverdueDrawerOpen] = useState(false);

  const hubOverdue = overdueVehicles.filter((v) => v.hubId === hub.id);

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

  const prefix = HUB_PORT_PREFIX[hub.id] ?? 'CP-X';
  const totalMatrixPorts = Math.min(12, Math.max(6, hub.chargerPortsTotal));
  const hubStoredPorts = chargingPoints.filter((cp) => cp.hubId === hub.id);

  const matrixPorts: MatrixPort[] = Array.from(
    { length: totalMatrixPorts },
    (_, idx) => {
      const numStr = String(idx + 1).padStart(2, '0');
      const code = `${prefix}${numStr}`;
      const matchedStored =
        hubStoredPorts.find((cp) => cp.code === code) ?? hubStoredPorts[idx];

      if (matchedStored) {
        const mappedStatus: MatrixPort['status'] =
          matchedStored.status === 'ISOLATED'
            ? 'ISOLATED'
            : matchedStored.status === 'FAULTY'
              ? 'FAULT'
              : matchedStored.status === 'THROTTLED'
                ? 'THROTTLED'
                : matchedStored.status === 'CHARGING'
                  ? 'CHARGING'
                  : 'IDLE';
        const isDlbThrottled =
          dlbMode === 'CRITICAL' && mappedStatus === 'CHARGING';
        return {
          code: matchedStored.code,
          spec:
            mappedStatus === 'ISOLATED'
              ? 'ISOLATED'
              : mappedStatus === 'FAULT'
                ? 'GROUND FAULT'
                : matchedStored.connectorType === 'DC_FAST'
                  ? 'DC 30kW'
                  : 'AC 7kW',
          kw: isDlbThrottled ? 3.5 : matchedStored.currentPowerKw,
          status: isDlbThrottled ? 'THROTTLED' : mappedStatus,
          soc: mappedStatus === 'CHARGING' ? 72 : undefined,
        };
      }

      if (
        activeParking &&
        activeParking.hubId === hub.id &&
        activeParking.chargingPortCode === code
      ) {
        const isCharging = activeParking.chargingStatus === 'CHARGING';
        const isThrottled = activeParking.chargingStatus === 'THROTTLED';
        const isInterrupted = activeParking.chargingStatus === 'INTERRUPTED';
        return {
          code,
          spec:
            activeParking.connectorType === 'DC_FAST' ? 'DC 30kW' : 'AC 7kW',
          kw: activeParking.currentKw,
          status: isInterrupted
            ? 'ISOLATED'
            : isThrottled
              ? 'THROTTLED'
              : isCharging
                ? 'CHARGING'
                : 'IDLE',
          soc: activeParking.socPercent,
        };
      }

      const isActiveSlot = idx < hub.chargerPortsActive;
      const isDc = idx < 3;
      const isThrottled =
        isActiveSlot &&
        !isDc &&
        (spikeMode || dlbMode === 'CRITICAL' || gridPct >= 85) &&
        idx % 2 === 0;

      return {
        code,
        spec: isDc ? 'DC 30kW' : 'AC 7kW',
        kw: !isActiveSlot ? 0.0 : isThrottled ? 3.5 : isDc ? 26.4 : 6.9,
        status: !isActiveSlot ? 'IDLE' : isThrottled ? 'THROTTLED' : 'CHARGING',
        soc: isActiveSlot ? 40 + ((idx * 13) % 52) : undefined,
      };
    },
  );

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
            Overdue Vehicles ({hubOverdue.length})
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
            hubId={hub.id}
            overdueCount={hubOverdue.length}
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
        overdueVehicles={hubOverdue}
        warnedPlates={warnedOverduePlates}
        onClose={() => setOverdueDrawerOpen(false)}
        onSendWarning={(plate, owner) => {
          warnOverdueVehicle(plate);
          pushToast({
            tone: 'info',
            title: `Warning sent to ${owner}`,
            description: `Overdue notice dispatched for ${plate}.`,
          });
        }}
        onEjectBay={(plate, bay) => {
          ejectOverdueParkingBay(hub.id, plate);
          pushToast({
            tone: 'ok',
            title: `Bay ${bay} Released`,
            description: `Ejected overdue vehicle ${plate} and freed 1 parking bay at ${hub.shortName}.`,
          });
        }}
      />
    </div>
  );
}
