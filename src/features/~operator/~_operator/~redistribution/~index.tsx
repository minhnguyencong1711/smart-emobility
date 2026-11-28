import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { PageHeader, SearchBar, Tabs } from '@/components/ui';
import { isTerminalRedistributionStatus } from '@/services';
import { useAuthStore, useMobilityStore, useToastStore } from '@/stores';
import type { RedistributionOrder } from '@/types';
import { parseVehicleQrCode } from '@/utils/qr-payload';

import { DispatchSpatialPanel } from './components/dispatch-spatial-panel';
import {
  getTicketEvItemsForOrder,
  WorkTicketPanel,
} from './components/work-ticket-panel';

export const Route = createFileRoute('/operator/_operator/redistribution/')({
  component: RedistributionPage,
});

const DEFAULT_VERIFIED_EVS = ['XMD-123', 'XMD-124', 'XMD-128', 'XMD-129'];

function RedistributionPage() {
  const user = useAuthStore((s) => s.user);
  const {
    hubs,
    redistributionOrders,
    createRedistributionOrder,
    updateRedistributionOrderStatus,
  } = useMobilityStore();
  const pushToast = useToastStore((s) => s.pushToast);

  const isFieldCrew = user.role === 'FIELD_CREW';
  const [tab, setTab] = useState<'dispatch' | 'ticket'>(
    isFieldCrew ? 'ticket' : 'dispatch',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceHubId, setSourceHubId] = useState('hub-dorm-b');
  const [destinationHubId, setDestinationHubId] = useState('hub-suoi-tien');
  const [vehicleCount, setVehicleCount] = useState(10);
  const [assignedCrew, setAssignedCrew] = useState('Đinh Phạm Ngọc Phước');

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [verifiedByOrderId, setVerifiedByOrderId] = useState<
    Record<string, string[]>
  >({});
  const [stepByOrderId, setStepByOrderId] = useState<Record<string, 0 | 1 | 2>>(
    {},
  );

  const activeOrder = useMemo(() => {
    if (selectedOrderId) {
      const explicit = redistributionOrders.find(
        (o) => o.id === selectedOrderId,
      );
      if (explicit) return explicit;
    }
    return (
      redistributionOrders.find(
        (o) => !isTerminalRedistributionStatus(o.status),
      ) ?? redistributionOrders[0]
    );
  }, [redistributionOrders, selectedOrderId]);

  const ticketEvItems = useMemo(
    () => getTicketEvItemsForOrder(activeOrder?.vehicleCount ?? 10),
    [activeOrder?.vehicleCount],
  );

  const isOrderCompleted =
    activeOrder?.status === 'COMPLETED' ||
    activeOrder?.status === 'PARTIAL_COMPLETED';

  const verifiedEvs = useMemo(() => {
    if (!activeOrder) return DEFAULT_VERIFIED_EVS;
    if (isOrderCompleted) {
      return ticketEvItems.map((e) => e.code);
    }
    const stored = verifiedByOrderId[activeOrder.id];
    if (stored) return stored;
    const validCodes = new Set(ticketEvItems.map((e) => e.code));
    return DEFAULT_VERIFIED_EVS.filter((c) => validCodes.has(c));
  }, [activeOrder, isOrderCompleted, ticketEvItems, verifiedByOrderId]);

  const ticketStep: 0 | 1 | 2 = isOrderCompleted
    ? 2
    : (stepByOrderId[activeOrder?.id ?? ''] ?? 1);

  function setOrderVerifiedEvs(updater: (prev: string[]) => string[]) {
    if (!activeOrder) return;
    setVerifiedByOrderId((prev) => ({
      ...prev,
      [activeOrder.id]: updater(verifiedEvs),
    }));
  }

  function setOrderTicketStep(step: 0 | 1 | 2) {
    if (!activeOrder) return;
    setStepByOrderId((prev) => ({
      ...prev,
      [activeOrder.id]: step,
    }));
  }

  const destHub = hubs.find((h) => h.id === destinationHubId) ?? hubs[0];
  const destFreeBays = Math.max(
    0,
    destHub.coreBaysTotal - destHub.coreBaysOccupied,
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return redistributionOrders;
    return redistributionOrders.filter((order) => {
      const srcName =
        hubs.find((h) => h.id === order.sourceHubId)?.name ?? order.sourceHubId;
      const dstName =
        hubs.find((h) => h.id === order.destinationHubId)?.name ??
        order.destinationHubId;
      const hay =
        `${order.code} ${order.assignedCrew} ${order.status} ${srcName} ${dstName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [redistributionOrders, searchQuery, hubs]);

  function handleDispatch() {
    const res = createRedistributionOrder({
      sourceHubId,
      destinationHubId,
      vehicleCount,
      assignedCrew,
    });
    if (!res.ok) {
      pushToast({
        tone: 'danger',
        title: 'Dispatch blocked',
        description: res.error,
      });
      return;
    }
    const newest = useMobilityStore.getState().redistributionOrders[0];
    if (newest) {
      setSelectedOrderId(newest.id);
    }
    pushToast({
      tone: 'ok',
      title: `Order ${newest?.code ?? ''} Dispatched`,
      description: `Reserved ${vehicleCount} inbound bays at ${destHub.shortName} & assigned ${assignedCrew}.`,
    });
  }

  function handleUpdateOrderStatus(
    orderId: string,
    status: RedistributionOrder['status'],
  ) {
    const target = redistributionOrders.find((o) => o.id === orderId);
    if (!target) return;
    updateRedistributionOrderStatus(orderId, status);
    const dstName =
      hubs.find((h) => h.id === target.destinationHubId)?.shortName ??
      target.destinationHubId;
    if (status === 'COMPLETED') {
      pushToast({
        tone: 'ok',
        title: `Order ${target.code} Completed`,
        description: `${target.vehicleCount} EVs transferred to ${dstName} and inbound bay holds released.`,
      });
    } else if (status === 'PARTIAL_COMPLETED') {
      pushToast({
        tone: 'warn',
        title: `Order ${target.code} Partially Completed`,
        description: `Partial EV batch delivered to ${dstName}.`,
      });
    } else if (status === 'REROUTED') {
      pushToast({
        tone: 'info',
        title: `Order ${target.code} Re-routed`,
        description: `Transfer route flagged for alternate hub dispatch.`,
      });
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        variant="bar"
        title="Fleet Redistribution Dashboard"
        breadcrumb={[
          { label: 'Home', to: '/operator/monitoring' },
          { label: 'Grid & Logistics', to: '/operator/monitoring' },
          { label: 'Fleet Redistribution' },
        ]}
        actions={
          !isFieldCrew ? (
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hub, order ID..."
              className="w-60 xl:w-64"
            />
          ) : undefined
        }
      />

      <div className="space-y-5 p-4 sm:px-6 sm:py-5 lg:px-7">
        {!isFieldCrew ? (
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as 'dispatch' | 'ticket')}
            items={[
              { id: 'dispatch', label: 'Dispatch & Spatial Map' },
              { id: 'ticket', label: 'Work Ticket Tracking' },
            ]}
          />
        ) : null}

        {tab === 'dispatch' ? (
          <DispatchSpatialPanel
            hubs={hubs}
            redistributionOrders={filteredOrders}
            sourceHubId={sourceHubId}
            destinationHubId={destinationHubId}
            vehicleCount={vehicleCount}
            assignedCrew={assignedCrew}
            destHub={destHub}
            destFreeBays={destFreeBays}
            onSourceHubChange={setSourceHubId}
            onDestinationHubChange={setDestinationHubId}
            onVehicleCountChange={setVehicleCount}
            onAssignedCrewChange={setAssignedCrew}
            onDispatch={handleDispatch}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenWorkTicket={(orderId) => {
              setSelectedOrderId(orderId);
              setTab('ticket');
            }}
          />
        ) : (
          <WorkTicketPanel
            orders={redistributionOrders}
            activeOrder={activeOrder}
            hubs={hubs}
            ticketEvItems={ticketEvItems}
            ticketStep={ticketStep}
            verifiedEvs={verifiedEvs}
            onSelectOrder={setSelectedOrderId}
            onTicketStepChange={setOrderTicketStep}
            onScanNext={() => {
              const nextUnverified = ticketEvItems.find(
                (e) => !verifiedEvs.includes(e.code),
              );
              if (nextUnverified) {
                setOrderVerifiedEvs((prev) => [...prev, nextUnverified.code]);
                pushToast({
                  tone: 'ok',
                  title: `${nextUnverified.code} Verified`,
                  description: `QR scan recorded on Work Ticket ${activeOrder.code}.`,
                });
              } else {
                pushToast({
                  tone: 'info',
                  title: `All ${ticketEvItems.length} EVs already scanned`,
                });
              }
            }}
            onScanAll={() => {
              setOrderVerifiedEvs(() => ticketEvItems.map((e) => e.code));
              pushToast({
                tone: 'info',
                title: `All ${ticketEvItems.length} EVs Verified`,
                description: `Ready to close Work Ticket ${activeOrder.code}.`,
              });
            }}
            onCloseTicket={() => {
              setOrderTicketStep(2);
              setOrderVerifiedEvs(() => ticketEvItems.map((e) => e.code));
              updateRedistributionOrderStatus(activeOrder.id, 'COMPLETED');
              pushToast({
                tone: 'ok',
                title: `Work Ticket ${activeOrder.code} Closed`,
                description:
                  'Delivered EVs verified and destination bays updated.',
              });
            }}
            onVerifySingle={(code) => {
              setOrderVerifiedEvs((prev) =>
                prev.includes(code) ? prev : [...prev, code],
              );
              pushToast({
                tone: 'ok',
                title: `${code} Verified`,
                description: `QR scan recorded on Work Ticket ${activeOrder.code}.`,
              });
            }}
            onScanQrPayload={(rawValue) => {
              const code = parseVehicleQrCode(rawValue);
              const matched = ticketEvItems.find((e) => e.code === code);
              if (!matched) {
                pushToast({
                  tone: 'danger',
                  title: 'EV QR Not In Work Ticket',
                  description: `Decoded "${rawValue}" does not belong to ${activeOrder.code}.`,
                });
                return;
              }
              setOrderVerifiedEvs((prev) =>
                prev.includes(matched.code) ? prev : [...prev, matched.code],
              );
              pushToast({
                tone: 'ok',
                title: `${matched.code} Verified via QR`,
                description: `Status ${matched.status} · SoC ${matched.soc}% synced.`,
              });
            }}
            onReportStatus={(code, status, soc) =>
              pushToast({
                tone: 'info',
                title: `Status reported for ${code}`,
                description: `${status} · Battery ${soc}% logged.`,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
