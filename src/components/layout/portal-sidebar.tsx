import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HcmutLogo,
  LogoutIcon,
} from '@/components/icons';
import { Badge, IconButton } from '@/components/ui';
import type { UserProfile } from '@/types';
import { cn } from '@/utils/cn';

export type PortalNavEntry = {
  id: string;
  label: string;
  to: string;
  search?: Record<string, string>;
  icon: ReactNode;
  isActive: (pathname: string, searchStr: string) => boolean;
  badgeText?: string;
  badgeTone?: 'warn' | 'danger';
};

export type PortalNavGroup = {
  title: string;
  items: PortalNavEntry[];
};

type PortalSidebarProps = {
  subtitle: string;
  ariaLabel: string;
  pathname: string;
  searchStr: string;
  user: UserProfile;
  groups: PortalNavGroup[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: () => void;
  onLogout: () => void;
  topEntry?: ReactNode;
  renderGroupExtra?: (groupTitle: string, collapsed: boolean) => ReactNode;
  extraSections?: ReactNode;
  overridesContent?: ReactNode;
};

export function PortalSidebar({
  subtitle,
  ariaLabel,
  pathname,
  searchStr,
  user,
  groups,
  collapsed = false,
  onToggleCollapse,
  onItemClick,
  onLogout,
  topEntry,
  renderGroupExtra,
  extraSections,
  overridesContent,
}: PortalSidebarProps) {
  return (
    <div className="flex h-full flex-col justify-between px-3.5 py-4 text-white">
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            'flex items-center border-b border-white/15 pb-4',
            collapsed ? 'justify-center' : 'justify-between gap-2 px-1',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <HcmutLogo size={collapsed ? 38 : 40} className="shrink-0" />
            {!collapsed ? (
              <div className="min-w-0">
                <p className="text-body font-extrabold leading-tight tracking-tight text-white">
                  Smart E-Mobility
                </p>
                <p className="mt-0.5 text-[11px] font-medium leading-snug tracking-normal text-primary-300">
                  {subtitle}
                </p>
              </div>
            ) : null}
          </div>
          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden rounded-xs p-1 text-white/70 hover:bg-white/10 hover:text-white lg:inline-flex"
            >
              {collapsed ? (
                <ChevronRightIcon size={16} />
              ) : (
                <ChevronLeftIcon size={16} />
              )}
            </button>
          ) : null}
        </div>

        <nav
          data-sidebar-scroll
          aria-label={ariaLabel}
          className="mt-4 flex-1 space-y-4 overflow-y-auto"
        >
          {overridesContent ? (
            overridesContent
          ) : (
            <>
              {topEntry}
              {groups.map((group) => (
                <div key={group.title}>
                  {!collapsed ? (
                    <p className="mb-1.5 px-2.5 text-label font-bold uppercase tracking-wider text-white/45">
                      {group.title}
                    </p>
                  ) : null}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = item.isActive(pathname, searchStr);
                      return (
                        <li key={item.id}>
                          <Link
                            to={item.to}
                            search={item.search}
                            onClick={onItemClick}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                              'flex items-center rounded-sm py-2 text-body-sm font-medium transition-colors',
                              collapsed
                                ? 'justify-center px-2'
                                : 'justify-between gap-2 px-2.5',
                              active
                                ? 'bg-primary text-white shadow-card'
                                : 'text-white/80 hover:bg-white/10 hover:text-white',
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="shrink-0">{item.icon}</span>
                              {!collapsed ? (
                                <span className="truncate">{item.label}</span>
                              ) : null}
                            </span>
                            {!collapsed && item.badgeText ? (
                              <Badge
                                tone={item.badgeTone ?? 'warn'}
                                variant="solid"
                                size="sm"
                              >
                                {item.badgeText}
                              </Badge>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                    {renderGroupExtra?.(group.title, collapsed)}
                  </ul>
                </div>
              ))}
              {extraSections}
            </>
          )}
        </nav>
      </div>

      <div className="mt-4 border-t border-white/15 pt-3.5">
        <div
          className={cn(
            'flex items-center rounded-md bg-white/10 p-2.5',
            collapsed ? 'justify-center p-2' : 'justify-between gap-2',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-bold text-white">
              {user.initials}
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-caption font-bold text-white">
                  {user.fullName}
                </p>
                <p className="truncate text-label text-white/70">
                  {user.title}
                </p>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <IconButton
              aria-label="Log out"
              tone="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/15 hover:text-white"
              icon={<LogoutIcon size={16} />}
              onClick={onLogout}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
