import { TruckIcon } from '@/components/icons';
import { CampusHubMap } from '@/components/shared';
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  EmptyState,
  Pagination,
  Select,
  Slider,
} from '@/components/ui';
import { usePagination } from '@/hooks';
import type { MobilityHub, RedistributionOrder } from '@/types';

export function DispatchSpatialPanel({
  hubs,
  redistributionOrders,
  sourceHubId,
  destinationHubId,
  vehicleCount,
  assignedCrew,
  destHub,
  destFreeBays,
  onSourceHubChange,
  onDestinationHubChange,
  onVehicleCountChange,
  onAssignedCrewChange,
  onDispatch,
  onUpdateOrderStatus,
}: {
  hubs: MobilityHub[];
  redistributionOrders: RedistributionOrder[];
  sourceHubId: string;
  destinationHubId: string;
  vehicleCount: number;
  assignedCrew: string;
  destHub: MobilityHub;
  destFreeBays: number;
  onSourceHubChange: (id: string) => void;
  onDestinationHubChange: (id: string) => void;
  onVehicleCountChange: (count: number) => void;
  onAssignedCrewChange: (crew: string) => void;
  onDispatch: () => void;
  onUpdateOrderStatus: (
    orderId: string,
    status: RedistributionOrder['status'],
  ) => void;
}) {
  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(
    redistributionOrders,
    4,
  );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-12">
      <Card padding="md" className="space-y-4 lg:col-span-4">
        <CardHeader
          icon={<TruckIcon size={20} />}
          tone="navy"
          title="Redistribution Order"
          description="Reserve destination bays before dispatching field transport."
        />

        <Select
          label="Source Hub"
          value={sourceHubId}
          onChange={(e) => onSourceHubChange(e.target.value)}
          options={hubs.map((h) => ({
            value: h.id,
            label: `${h.name} (${h.sharedEvsReady} EVs ready)`,
          }))}
        />

        <Select
          label="Destination Hub"
          value={destinationHubId}
          onChange={(e) => onDestinationHubChange(e.target.value)}
          options={hubs.map((h) => ({
            value: h.id,
            label: `${h.name} (${h.coreBaysTotal - h.coreBaysOccupied} free bays)`,
          }))}
        />

        <Slider
          label="Number of EV"
          min={2}
          max={15}
          step={1}
          unit=" EVs"
          value={vehicleCount}
          onChange={onVehicleCountChange}
        />

        <Select
          label="Assigned Field Crew"
          value={assignedCrew}
          onChange={(e) => onAssignedCrewChange(e.target.value)}
          options={[
            {
              value: 'Đinh Phạm Ngọc Phước',
              label: 'Đinh Phạm Ngọc Phước (Truck #01)',
            },
            { value: 'Nguyễn Đức Trọng', label: 'Nguyễn Đức Trọng (Van #02)' },
          ]}
        />

        <Callout
          tone={vehicleCount <= destFreeBays ? 'info' : 'danger'}
          title={`Destination Bay Reservation Check: ${destFreeBays} bays free`}
          description={`Dispatching ${vehicleCount} EVs reserves ${vehicleCount} inbound bays at ${destHub.shortName} immediately.`}
        />

        <Button
          variant="primary"
          fullWidth
          disabled={vehicleCount > destFreeBays}
          onClick={onDispatch}
        >
          Approve and Dispatch
        </Button>
      </Card>

      <div className="space-y-4 lg:col-span-8">
        <CampusHubMap
          hubs={hubs}
          selectedHubId={destinationHubId}
          onSelectHub={onDestinationHubChange}
          routeOverlay={{
            fromHubId: sourceHubId,
            toHubId: destinationHubId,
          }}
          variant="operator"
          className="h-[520px]"
        />

        {pageItems.length > 0 ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {pageItems.map((order) => {
                const src =
                  hubs.find((h) => h.id === order.sourceHubId)?.shortName ??
                  order.sourceHubId;
                const dst =
                  hubs.find((h) => h.id === order.destinationHubId)
                    ?.shortName ?? order.destinationHubId;
                return (
                  <Card key={order.id} padding="sm" className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-body-sm font-bold text-ink">
                          {order.code}: {src} → {dst}
                        </p>
                        <p className="text-caption text-ink-3">
                          {order.vehicleCount} EVs ·{' '}
                          {order.reservedDestinationBays} bays reserved · Crew:{' '}
                          {order.assignedCrew}
                        </p>
                      </div>
                      <Badge
                        tone={
                          order.status === 'COMPLETED'
                            ? 'ok'
                            : order.status === 'REROUTED'
                              ? 'warn'
                              : 'primary'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 border-t border-line pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onUpdateOrderStatus(order.id, 'REROUTED')
                        }
                      >
                        Re-route Hub
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onUpdateOrderStatus(order.id, 'PARTIAL_COMPLETED')
                        }
                      >
                        Partial Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          onUpdateOrderStatus(order.id, 'COMPLETED')
                        }
                      >
                        Complete Order
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Pagination
              variant="compact"
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={4}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={<TruckIcon size={22} />}
            title="No matching redistribution orders"
            description="Adjust your search query to view active transfer orders."
          />
        )}
      </div>
    </div>
  );
}
