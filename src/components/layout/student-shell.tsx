import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useMemo, useState, type ReactNode } from 'react';

import {
  HcmutLogo,
  HelpCircleIcon,
  MenuIcon,
  NavigationIcon,
  ParkingIcon,
  SearchIcon,
  UserIcon,
} from '@/components/icons';
import { Drawer, IconButton } from '@/components/ui';
import { useAuthStore, useMobilityStore } from '@/stores';
import { cn } from '@/utils/cn';

import { PortalSidebar } from './portal-sidebar';
import {
  buildStudentNavGroups,
  StudentHelpModal,
  StudentProfileModal,
} from './student-nav';

export function StudentShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const activeHold = useMobilityStore((s) => s.activeVehicleHold);
  const activeParking = useMobilityStore((s) => s.activeParking);
  const navigate = useNavigate();
  const { pathname, searchStr } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr ?? '',
    }),
  });

  const navGroups = useMemo(
    () => buildStudentNavGroups(Boolean(activeHold)),
    [activeHold],
  );

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const renderSidebar = (onNavigate?: () => void) => (
    <PortalSidebar
      subtitle="VNU-HCM Urban Student Portal"
      ariaLabel="Student portal navigation"
      pathname={pathname}
      searchStr={searchStr}
      user={user}
      groups={navGroups}
      onItemClick={onNavigate}
      onLogout={handleLogout}
      extraSections={
        <div>
          <p className="mb-1.5 px-2.5 text-label font-bold uppercase tracking-wider text-white/45">
            SUPPORT
          </p>
          <button
            type="button"
            onClick={() => {
              setHelpOpen(true);
              onNavigate?.();
            }}
            className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-body-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <HelpCircleIcon size={17} />
            <span>Help &amp; Safety</span>
          </button>
        </div>
      }
    />
  );

  const isFindTab =
    pathname === '/student/vehicles' ||
    (pathname.startsWith('/student/vehicles/') &&
      pathname !== '/student/vehicles/trip');
  const isBookingsTab = pathname.startsWith('/student/parking');
  const isTripTab =
    pathname === '/student/vehicles/trip' ||
    pathname.startsWith('/student/charging');

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] bg-navy lg:block xl:w-[268px]">
        {renderSidebar()}
      </aside>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ariaLabel="Student navigation drawer"
      >
        {renderSidebar(() => setDrawerOpen(false))}
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[256px] xl:pl-[268px]">
        <header className="sticky top-0 z-30 flex h-[59px] items-center justify-between gap-3 border-b border-line bg-surface px-3.5 shadow-card lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <IconButton
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              tone="ghost"
              size="sm"
              icon={<MenuIcon size={20} />}
              onClick={() => setDrawerOpen(true)}
            />
            <div className="flex min-w-0 items-center gap-2">
              <HcmutLogo size={32} className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-body-sm font-extrabold leading-tight text-navy">
                  Smart E-Mobility
                </p>
                <p className="truncate text-label text-ink-3">
                  VNU-HCM • Student Portal
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Open student profile"
            onClick={() => setProfileOpen(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-caption font-bold text-white"
          >
            {user.initials}
          </button>
        </header>

        <main className="w-full flex-1 pb-24 lg:pb-8">{children}</main>

        <nav
          aria-label="Mobile quick actions"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface px-1 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-2 lg:hidden"
        >
          <Link
            to="/student/vehicles"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-xs py-1 text-caption font-semibold transition-colors',
              isFindTab ? 'text-primary-700' : 'text-ink-3 hover:text-ink',
            )}
          >
            <SearchIcon size={19} />
            <span>Find</span>
          </Link>
          <Link
            to="/student/parking"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-xs py-1 text-caption font-semibold transition-colors',
              isBookingsTab ? 'text-primary-700' : 'text-ink-3 hover:text-ink',
            )}
          >
            <ParkingIcon size={19} />
            <span>Bookings</span>
          </Link>
          <Link
            to="/student/vehicles/trip"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-xs py-1 text-caption font-semibold transition-colors',
              isTripTab ? 'text-primary-700' : 'text-ink-3 hover:text-ink',
            )}
          >
            <NavigationIcon size={19} />
            <span>Trip</span>
          </Link>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-xs py-1 text-caption font-semibold transition-colors',
              profileOpen ? 'text-primary-700' : 'text-ink-3 hover:text-ink',
            )}
          >
            <UserIcon size={19} />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      <StudentHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <StudentProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        activeParking={activeParking}
        onNavigateUnlock={() => {
          setProfileOpen(false);
          navigate({ to: '/student/vehicles/unlock' });
        }}
        onNavigateCharging={() => {
          setProfileOpen(false);
          navigate({ to: '/student/charging/live' });
        }}
        onOpenHelp={() => {
          setProfileOpen(false);
          setHelpOpen(true);
        }}
        onSignOut={() => {
          setProfileOpen(false);
          handleLogout();
        }}
      />
    </div>
  );
}

export default StudentShell;
