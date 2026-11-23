import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import {
  Button,
  ConfirmDialog,
  Drawer,
  Modal,
  PageHeader,
} from '@/components/ui';
import { useMobilityStore, useToastStore } from '@/stores';

import { DomainWidgetsSection } from './components/domain-widgets-section';
import { PrimitivesSection } from './components/primitives-section';

export const Route = createFileRoute('/design-system/')({
  component: DesignSystemGalleryPage,
});

function DesignSystemGalleryPage() {
  const hubs = useMobilityStore((s) => s.hubs);
  const pushToast = useToastStore((s) => s.pushToast);

  const [tab, setTab] = useState('all');
  const [switchVal, setSwitchVal] = useState(true);
  const [sliderVal, setSliderVal] = useState(90);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="mx-auto max-w-screen-xl space-y-10 p-4 sm:p-8">
      <PageHeader
        eyebrow="DESIGN SYSTEM V1 / PHASE 0 & PHASE 1"
        title="Smart E-Mobility Hub — UI & Icon Kit"
        subtitle="Tokenized Tailwind CSS, dedicated TSX icon components, and accessible primitives."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/student/vehicles">
              <Button variant="secondary" size="sm">
                Student Portal
              </Button>
            </Link>
            <Link to="/operator/monitoring">
              <Button variant="navy" size="sm">
                Operator Console
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">
                Auth Flow
              </Button>
            </Link>
          </div>
        }
      />

      <PrimitivesSection />

      <DomainWidgetsSection
        hubs={hubs}
        tab={tab}
        switchVal={switchVal}
        sliderVal={sliderVal}
        popoverOpen={popoverOpen}
        onTabChange={setTab}
        onSwitchChange={setSwitchVal}
        onSliderChange={setSliderVal}
        onPopoverToggle={() => setPopoverOpen((p) => !p)}
        onPopoverClose={() => setPopoverOpen(false)}
        onOpenModal={() => setModalOpen(true)}
        onOpenConfirm={() => setConfirmOpen(true)}
        onOpenDrawer={() => setDrawerOpen(true)}
        onTriggerToast={() =>
          pushToast({
            tone: 'ok',
            title: 'Telemetry Synced',
            description: 'All 5 VNU-HCM hubs reported nominal heartbeats.',
          })
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Inspect Design Modal"
      >
        <p className="text-body-sm text-ink-2">
          Uses native HTML5 dialog.showModal() with top-layer ::backdrop,
          overscroll containment, and Escape handling.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        destructive
        title="Confirm Equipment Isolation"
        description="Cancel button receives initial focus for destructive action safety."
        onConfirm={() => setConfirmOpen(false)}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="right"
        ariaLabel="Sample right inspection drawer"
      >
        <div className="p-6">
          <h3 className="text-title font-bold text-ink">Inspector Drawer</h3>
          <p className="mt-2 text-body-sm text-ink-2">
            Responsive native top-layer drawer with 100svh sheet height.
          </p>
        </div>
      </Drawer>
    </div>
  );
}
