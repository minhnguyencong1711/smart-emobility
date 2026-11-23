import { Link } from '@tanstack/react-router';

import { Badge, Card, HubStatusPill, Pagination } from '@/components/ui';
import { usePagination } from '@/hooks';
import type { MobilityHub } from '@/types';
import { cn } from '@/utils/cn';
import { getHubOccupancyPct } from '@/utils/hub-metrics';

export function HubPriorityQueue({
  hubs,
  totalSharedReady,
  selectedHubId,
  onSelectHubId,
}: {
  hubs: MobilityHub[];
  totalSharedReady: number;
  selectedHubId: string;
  onSelectHubId: (id: string) => void;
}) {
  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(
    hubs,
    3,
  );

  return (
    <Card
      padding="md"
      className="flex min-h-[640px] flex-col justify-between gap-3 lg:col-span-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-body-lg font-extrabold text-ink">
                Hub Priority Queue
              </h2>
              <Badge size="sm" tone="navy">
                {hubs.length}
              </Badge>
            </div>
            <p className="text-caption text-ink-3">
              Sorted by alert priority · {totalSharedReady} shared units idle
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {pageItems.map((hub) => {
            const occ = getHubOccupancyPct(hub);
            const isSelected = selectedHubId === hub.id;
            return (
              <div
                key={hub.id}
                onClick={() => onSelectHubId(hub.id)}
                className={cn(
                  'cursor-pointer rounded-md border border-l-4 bg-surface p-3.5 transition-colors',
                  hub.status === 'CRITICAL'
                    ? 'border-l-danger'
                    : hub.status === 'WARNING'
                      ? 'border-l-warn'
                      : 'border-l-ok',
                  isSelected
                    ? 'bg-primary-soft/30 border-primary'
                    : 'border-line hover:bg-surface-2',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-body-sm font-bold text-ink">
                      {hub.name}
                    </p>
                    <p className="text-caption text-ink-3">{hub.code}</p>
                  </div>
                  <HubStatusPill status={hub.status} />
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-line pt-2 text-caption">
                  <div>
                    <p className="text-ink-3">Parking</p>
                    <p className="font-mono font-bold tabular-nums text-ink">
                      {hub.coreBaysOccupied}/{hub.coreBaysTotal} ({occ}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-3">Shared Fleet</p>
                    <p className="font-mono font-bold tabular-nums text-ink">
                      {hub.sharedEvsReady}/{hub.sharedEvsTotal} EVs
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-3">Charging</p>
                    <p className="font-mono font-bold tabular-nums text-ink">
                      {hub.chargerPortsActive}/{hub.chargerPortsTotal} Active
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex justify-end">
                  <Link to="/operator/monitoring/$id" params={{ id: hub.id }}>
                    <span className="text-caption font-bold text-primary-700 hover:underline">
                      View Hub Detail &amp; Capacity →
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Pagination
        variant="compact"
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={3}
        onPageChange={setPage}
        className="border-t border-line pt-3"
      />
    </Card>
  );
}
