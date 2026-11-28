import { Link } from '@tanstack/react-router';

import {
  ActivityIcon,
  AlertTriangleIcon,
  BarChartIcon,
  BoltIcon,
  ChargingStationIcon,
  FlaskIcon,
  HomeIcon,
  ParkingIcon,
  PowerOffIcon,
  ShieldAlertIcon,
  TruckIcon,
} from '@/components/icons';
import { Button, Modal, Slider } from '@/components/ui';
import type { SystemPolicyConfig } from '@/types';
import { cn } from '@/utils/cn';

import type { PortalNavGroup } from './portal-sidebar';

export function buildOperatorNavGroups(
  activeIncidentsCount: number,
): PortalNavGroup[] {
  return [
    {
      title: 'OPERATIONS MANAGEMENT',
      items: [
        {
          id: 'network-overview',
          label: 'Network Overview',
          to: '/operator/monitoring',
          icon: <BarChartIcon size={17} />,
          isActive: (p, s) =>
            p === '/operator/monitoring' && !s.includes('view=home'),
        },
        {
          id: 'hub-capacity',
          label: 'Hub Capacity & Load',
          to: '/operator/monitoring/hub-dorm-a',
          icon: <ChargingStationIcon size={17} />,
          isActive: (p) => p.startsWith('/operator/monitoring/'),
        },
        {
          id: 'incident-queue',
          label: 'Incident Queue',
          to: '/operator/incidents',
          icon: <AlertTriangleIcon size={17} />,
          badgeText:
            activeIncidentsCount > 0 ? String(activeIncidentsCount) : undefined,
          badgeTone: 'danger',
          isActive: (p, s) =>
            p === '/operator/incidents' && !s.includes('view=isolation'),
        },
        {
          id: 'isolation-dispatch',
          label: 'Isolation and dispatch',
          to: '/operator/incidents',
          search: { view: 'isolation' },
          icon: <ShieldAlertIcon size={17} />,
          isActive: (p, s) =>
            p === '/operator/incidents' && s.includes('view=isolation'),
        },
      ],
    },
    {
      title: 'GRID & LOGISTICS',
      items: [
        {
          id: 'charging-reservations',
          label: 'Charging Reservations',
          to: '/operator/smart-charging',
          search: { tab: 'schedule' },
          icon: <ParkingIcon size={17} />,
          isActive: (p, s) =>
            p === '/operator/smart-charging' && s.includes('tab=schedule'),
        },
        {
          id: 'smart-grid',
          label: 'Smart Grid & DLB',
          to: '/operator/smart-charging',
          icon: <BoltIcon size={17} />,
          isActive: (p, s) =>
            p === '/operator/smart-charging' && !s.includes('tab=schedule'),
        },
        {
          id: 'fleet-redistribution',
          label: 'Fleet Redistribution',
          to: '/operator/redistribution',
          icon: <TruckIcon size={17} />,
          isActive: (p) => p === '/operator/redistribution',
        },
      ],
    },
    {
      title: 'ANALYTICS & CONFIG',
      items: [
        {
          id: 'what-if-sim',
          label: 'What-if Simulation',
          to: '/operator/simulation',
          icon: <FlaskIcon size={17} />,
          isActive: (p) => p.startsWith('/operator/simulation'),
        },
      ],
    },
  ];
}

export function FieldCrewNavList({
  collapsed,
  pathname,
  searchStr,
  onItemClick,
}: {
  collapsed: boolean;
  pathname: string;
  searchStr: string;
  onItemClick?: () => void;
}) {
  return (
    <ul className="space-y-1">
      <li>
        <Link
          to="/operator/redistribution"
          onClick={onItemClick}
          className={cn(
            'flex items-center rounded-sm py-2 text-body-sm font-medium transition-colors',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
            pathname === '/operator/redistribution'
              ? 'bg-primary text-white shadow-card'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          )}
        >
          <TruckIcon size={17} />
          {!collapsed ? <span>Fleet Redistribution</span> : null}
        </Link>
      </li>
      <li>
        <Link
          to="/operator/redistribution"
          search={{ view: 'home' }}
          onClick={onItemClick}
          className={cn(
            'flex items-center rounded-sm py-2 text-body-sm font-medium transition-colors',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
            searchStr.includes('view=home')
              ? 'bg-primary text-white shadow-card'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          )}
        >
          <HomeIcon size={17} />
          {!collapsed ? <span>Home</span> : null}
        </Link>
      </li>
    </ul>
  );
}

export function OperatorPolicyModal({
  open,
  onClose,
  policyConfig,
  onUpdatePolicy,
  onResetDemo,
  onApplyPolicy,
}: {
  open: boolean;
  onClose: () => void;
  policyConfig: SystemPolicyConfig;
  onUpdatePolicy: (partial: Partial<SystemPolicyConfig>) => void;
  onResetDemo: () => void;
  onApplyPolicy: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="System Policy Settings"
      size="md"
    >
      <div className="space-y-5">
        <p className="text-body-sm text-ink-2">
          Dynamic operational thresholds evaluated across all hubs and charging
          stations.
        </p>
        <Slider
          label="Reservation Grace Period"
          value={policyConfig.gracePeriodMins}
          min={5}
          max={30}
          unit=" mins"
          onChange={(val) => onUpdatePolicy({ gracePeriodMins: val })}
        />
        <Slider
          label="Grid Warning Threshold"
          value={policyConfig.gridWarningThreshold}
          min={70}
          max={90}
          unit="%"
          onChange={(val) => onUpdatePolicy({ gridWarningThreshold: val })}
        />
        <Slider
          label="Grid Critical Overload Threshold (DLB Trigger)"
          value={policyConfig.gridCriticalThreshold}
          min={85}
          max={98}
          unit="%"
          onChange={(val) => onUpdatePolicy({ gridCriticalThreshold: val })}
        />
        <Slider
          label="Minimum Dispatch Battery SoC"
          value={policyConfig.minDispatchSoC}
          min={10}
          max={40}
          unit="%"
          onChange={(val) => onUpdatePolicy({ minDispatchSoC: val })}
        />
        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<PowerOffIcon size={14} />}
            onClick={onResetDemo}
          >
            Reset Baseline Data
          </Button>
          <Button
            variant="primary"
            leadingIcon={<ActivityIcon size={16} />}
            onClick={onApplyPolicy}
          >
            Apply Policy
          </Button>
        </div>
      </div>
    </Modal>
  );
}
