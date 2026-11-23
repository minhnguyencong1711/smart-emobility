import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { PageHeader, SearchBar, Tabs } from '@/components/ui';
import { useAuthStore, useMobilityStore, useToastStore } from '@/stores';

import { DispatchSpatialPanel } from './components/dispatch-spatial-panel';
import {
  TICKET_EV_ITEMS,
  WorkTicketPanel,
} from './components/work-ticket-panel';

export const Route = createFileRoute('/operator/_operator/redistribution/')({
  component: RedistributionPage,
});

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

  const [verifiedEvs, setVerifiedEvs] = useState<string[]>([
    'XMD-123',
    'XMD-124',
    'XMD-128',
    'XMD-129',
  ]);
  const [ticketStep, setTicketStep] = useState<0 | 1 | 2>(1);

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
    pushToast({
      tone: 'ok',
      title: 'Redistribution Order Dispatched',
      description: `Reserved ${vehicleCount} inbound bays at ${destHub.shortName} & assigned ${assignedCrew}.`,
    });
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
            onUpdateOrderStatus={updateRedistributionOrderStatus}
          />
        ) : (
          <WorkTicketPanel
            ticketStep={ticketStep}
            verifiedEvs={verifiedEvs}
            onTicketStepChange={setTicketStep}
            onScanNext={() => {
              const nextUnverified = TICKET_EV_ITEMS.find(
                (e) => !verifiedEvs.includes(e.code),
              );
              if (nextUnverified) {
                setVerifiedEvs((prev) => [...prev, nextUnverified.code]);
                pushToast({
                  tone: 'ok',
                  title: `${nextUnverified.code} Verified`,
                  description: 'QR scan recorded on Work Ticket.',
                });
              } else {
                pushToast({
                  tone: 'info',
                  title: 'All 10 EVs already scanned',
                });
              }
            }}
            onScanAll={() => {
              setVerifiedEvs(TICKET_EV_ITEMS.map((e) => e.code));
              pushToast({
                tone: 'info',
                title: 'All 10 EVs Verified',
                description: 'Ready to close Work Ticket ORD-6767.',
              });
            }}
            onCloseTicket={() => {
              setTicketStep(2);
              pushToast({
                tone: 'ok',
                title: 'Work Ticket ORD-6767 Closed',
                description:
                  'Delivered EVs verified and destination bays updated.',
              });
            }}
            onVerifySingle={(code) => setVerifiedEvs((prev) => [...prev, code])}
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
