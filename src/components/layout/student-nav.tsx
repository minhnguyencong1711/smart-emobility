import {
  BikeIcon,
  BoltIcon,
  CalendarIcon,
  ChargingStationIcon,
  ClockIcon,
  HelpCircleIcon,
  HomeIcon,
  LogoutIcon,
  MapPinIcon,
  NavigationIcon,
  ParkingIcon,
  QrCodeIcon,
  SearchIcon,
  ShieldAlertIcon,
} from '@/components/icons';
import { Button, Modal } from '@/components/ui';
import type { ActiveParkingAndCharging, UserProfile } from '@/types';

import type { PortalNavGroup } from './portal-sidebar';

export function buildStudentNavGroups(
  hasActiveHold: boolean,
): PortalNavGroup[] {
  return [
    {
      title: 'HOME',
      items: [
        {
          id: 'home',
          label: 'Home',
          to: '/student/vehicles',
          search: { view: 'home' },
          icon: <HomeIcon size={17} />,
          isActive: (_p, s) => s.includes('view=home'),
        },
        {
          id: 'find-vehicles',
          label: 'Find Shared Vehicles',
          to: '/student/vehicles',
          icon: <SearchIcon size={17} />,
          isActive: (p, s) =>
            p === '/student/vehicles' &&
            !s.includes('view=home') &&
            !s.includes('view=hubs'),
        },
        {
          id: 'my-reservations',
          label: 'My Reservations',
          to: '/student/vehicles/unlock',
          icon: <CalendarIcon size={17} />,
          isActive: (p) => p === '/student/vehicles/unlock',
          badgeText: hasActiveHold ? 'Hold' : undefined,
          badgeTone: 'warn',
        },
        {
          id: 'active-trip',
          label: 'Active Trip',
          to: '/student/vehicles/trip',
          icon: <NavigationIcon size={17} />,
          isActive: (p, s) =>
            p === '/student/vehicles/trip' && !s.includes('tab=history'),
        },
        {
          id: 'trip-history',
          label: 'Trip History',
          to: '/student/vehicles/trip',
          search: { tab: 'history' },
          icon: <ClockIcon size={17} />,
          isActive: (p, s) =>
            p === '/student/vehicles/trip' && s.includes('tab=history'),
        },
      ],
    },
    {
      title: 'SHARED MOBILITY',
      items: [
        {
          id: 'hub-network',
          label: 'Hub Network',
          to: '/student/vehicles',
          search: { view: 'hubs' },
          icon: <MapPinIcon size={17} />,
          isActive: (p, s) =>
            p === '/student/vehicles' && s.includes('view=hubs'),
        },
        {
          id: 'rental-service',
          label: 'Vehicle Rental Service',
          to: '/student/vehicles/veh-102',
          icon: <BikeIcon size={17} />,
          isActive: (p) =>
            p.startsWith('/student/vehicles/') &&
            p !== '/student/vehicles/unlock' &&
            p !== '/student/vehicles/trip',
        },
      ],
    },
    {
      title: 'PERSONAL CHARGING',
      items: [
        {
          id: 'parking-reservations',
          label: 'Parking Reservations',
          to: '/student/parking',
          icon: <ParkingIcon size={17} />,
          isActive: (p) =>
            p === '/student/parking' || p === '/student/parking/pass',
        },
        {
          id: 'charging-sessions',
          label: 'Charging Sessions',
          to: '/student/charging/live',
          icon: <BoltIcon size={17} />,
          isActive: (p) =>
            p === '/student/charging/live' || p === '/student/charging/exit',
        },
      ],
    },
  ];
}

export function StudentHelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help & Safety — VNU-HCM E-Mobility"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-danger-soft/50 flex items-start gap-3 rounded-md border border-danger-300 p-3.5">
          <ShieldAlertIcon
            size={20}
            className="mt-0.5 shrink-0 text-danger-700"
          />
          <div>
            <p className="text-body-sm font-bold text-ink">
              Campus Emergency Dispatch: 028-3724-0000
            </p>
            <p className="mt-0.5 text-caption text-ink-2">
              24/7 rapid response for battery thermal alerts, traffic incidents,
              or jammed hub barrier gates across VNU-HCM.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-line bg-surface-2 p-3.5 text-body-sm text-ink-2">
          <p className="font-bold text-ink">Quick Student Guidelines</p>
          <ul className="list-disc space-y-1 pl-4 text-caption">
            <li>
              Held shared vehicles expire automatically after 15 minutes if not
              unlocked via QR code at the hub bay.
            </li>
            <li>
              Personal charging bays require e-Pass QR/PIN check-in within the
              reservation grace window.
            </li>
            <li>
              If DLB throttles routine power during campus peak demand, keep
              your EV plugged in — charging resumes automatically.
            </li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function StudentProfileModal({
  open,
  onClose,
  user,
  activeParking,
  onNavigateUnlock,
  onNavigateCharging,
  onOpenHelp,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  activeParking: ActiveParkingAndCharging | null;
  onNavigateUnlock: () => void;
  onNavigateCharging: () => void;
  onOpenHelp: () => void;
  onSignOut: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Student Account" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-line bg-surface-2 p-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-body font-bold text-white">
            {user.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-sm font-bold text-ink">
              {user.fullName}
            </p>
            <p className="truncate text-caption text-ink-2">{user.email}</p>
            <p className="truncate text-label text-ink-3">{user.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<QrCodeIcon size={15} />}
            onClick={onNavigateUnlock}
          >
            QR Pickup
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<ChargingStationIcon size={15} />}
            onClick={onNavigateCharging}
          >
            Live Charging
          </Button>
        </div>

        {activeParking ? (
          <div className="rounded-md border border-line bg-surface p-3 text-caption text-ink-2">
            Active Bay:{' '}
            <strong className="text-ink">{activeParking.bayCode}</strong> (
            {activeParking.chargingStatus})
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-line pt-3">
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<HelpCircleIcon size={15} />}
            onClick={onOpenHelp}
          >
            Help &amp; Safety
          </Button>
          <Button
            variant="danger"
            size="sm"
            leadingIcon={<LogoutIcon size={15} />}
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Modal>
  );
}
