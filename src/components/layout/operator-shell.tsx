import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useMemo, useState, type ReactNode } from 'react';

import {
  HcmutLogo,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
} from '@/components/icons';
import { Button, Drawer, IconButton } from '@/components/ui';
import { useAuthStore, useMobilityStore, useToastStore } from '@/stores';
import { cn } from '@/utils/cn';

import {
  buildOperatorNavGroups,
  FieldCrewNavList,
  OperatorPolicyModal,
} from './operator-nav';
import { PortalSidebar } from './portal-sidebar';

export function OperatorShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const { policyConfig, updatePolicyConfig, incidents, resetDemoState } =
    useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);
  const navigate = useNavigate();
  const { pathname, searchStr } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr ?? '',
    }),
  });

  const isFieldCrew = user.role === 'FIELD_CREW';
  const activeIncidentsCount = incidents.filter(
    (inc) => inc.status === 'REPORTED' || inc.status === 'INVESTIGATING',
  ).length;

  const operatorGroups = useMemo(
    () => buildOperatorNavGroups(activeIncidentsCount),
    [activeIncidentsCount],
  );

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const renderSidebar = (collapsed: boolean, onItemClick?: () => void) => (
    <PortalSidebar
      subtitle="VNU-HCM Urban Console"
      ariaLabel="Operator console navigation"
      pathname={pathname}
      searchStr={searchStr}
      user={user}
      groups={operatorGroups}
      collapsed={collapsed}
      onToggleCollapse={
        onItemClick ? undefined : () => setRailCollapsed((prev) => !prev)
      }
      onItemClick={onItemClick}
      onLogout={handleLogout}
      overridesContent={
        isFieldCrew ? (
          <FieldCrewNavList
            collapsed={collapsed}
            pathname={pathname}
            searchStr={searchStr}
            onItemClick={onItemClick}
          />
        ) : undefined
      }
      topEntry={
        <Link
          to="/operator/monitoring"
          search={{ view: 'home' }}
          onClick={onItemClick}
          title={collapsed ? 'Home' : undefined}
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
      }
      renderGroupExtra={(groupTitle, isCollapsed) =>
        groupTitle === 'ANALYTICS & CONFIG' ? (
          <li>
            <button
              type="button"
              onClick={() => {
                setPolicyModalOpen(true);
                onItemClick?.();
              }}
              title={isCollapsed ? 'Threshold Settings' : undefined}
              className={cn(
                'flex w-full items-center rounded-sm py-2 text-body-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white',
                isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
              )}
            >
              <SettingsIcon size={17} />
              {!isCollapsed ? <span>Threshold Settings</span> : null}
            </button>
          </li>
        ) : null
      }
    />
  );

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden bg-navy transition-[width] duration-200 lg:block',
          railCollapsed ? 'w-16' : 'w-[256px] xl:w-[268px]',
        )}
      >
        {renderSidebar(railCollapsed)}
      </aside>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ariaLabel="Operator navigation drawer"
      >
        {renderSidebar(false, () => setDrawerOpen(false))}
      </Drawer>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[padding] duration-200',
          railCollapsed ? 'lg:pl-16' : 'lg:pl-[256px] xl:pl-[268px]',
        )}
      >
        <header className="sticky top-0 z-30 flex h-[59px] items-center justify-between gap-2 border-b border-line bg-surface px-4 shadow-card lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <IconButton
              aria-label="Open operator menu"
              aria-expanded={drawerOpen}
              tone="ghost"
              size="sm"
              icon={<MenuIcon size={20} />}
              onClick={() => setDrawerOpen(true)}
            />
            <HcmutLogo size={30} className="shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-body-sm font-extrabold leading-tight text-navy">
                Smart E-Mobility
              </p>
              <p className="truncate text-label text-ink-3">
                VNU-HCM Urban Console
              </p>
            </div>
          </div>

          {!isFieldCrew ? (
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<SettingsIcon size={14} />}
              onClick={() => setPolicyModalOpen(true)}
            >
              Policy
            </Button>
          ) : null}
        </header>

        <main className="w-full flex-1 pb-10">{children}</main>
      </div>

      <OperatorPolicyModal
        open={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        policyConfig={policyConfig}
        onUpdatePolicy={updatePolicyConfig}
        onResetDemo={() => {
          resetDemoState();
          pushToast({
            tone: 'info',
            title: 'Baseline Data Restored',
            description:
              'Restored policy thresholds and network telemetry to baseline.',
          });
        }}
        onApplyPolicy={() => {
          setPolicyModalOpen(false);
          pushToast({
            tone: 'ok',
            title: 'Policy Config Updated',
            description: `Grid thresholds set to ${policyConfig.gridWarningThreshold}% / ${policyConfig.gridCriticalThreshold}%.`,
          });
        }}
      />
    </div>
  );
}

export default OperatorShell;
