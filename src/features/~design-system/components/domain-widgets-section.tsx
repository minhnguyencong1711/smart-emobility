import { BoltIcon } from '@/components/icons';
import {
  Button,
  Callout,
  Card,
  CardHeader,
  Checkbox,
  DataTable,
  EmptyState,
  HubStatusPill,
  Input,
  PasswordInput,
  Popover,
  Radio,
  SearchBar,
  Section,
  Select,
  SkeletonCard,
  Slider,
  StatCard,
  StepNav,
  Switch,
  Tabs,
  Textarea,
  type Column,
} from '@/components/ui';
import type { MobilityHub } from '@/types';

import { ICON_GALLERY } from '../constants/icon-gallery';

const HUB_COLUMNS: Column<MobilityHub>[] = [
  {
    key: 'code',
    header: 'Hub Code',
    cell: (row) => (
      <span className="font-mono font-bold text-navy">{row.code}</span>
    ),
  },
  {
    key: 'name',
    header: 'Mobility Hub',
    cell: (row) => row.shortName,
  },
  {
    key: 'load',
    header: 'Grid Load (kW)',
    numeric: true,
    cell: (row) => `${row.gridCurrentKw} / ${row.gridMaxKw} kW`,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <HubStatusPill status={row.status} />,
  },
];

export function DomainWidgetsSection({
  hubs,
  tab,
  switchVal,
  sliderVal,
  popoverOpen,
  onTabChange,
  onSwitchChange,
  onSliderChange,
  onPopoverToggle,
  onPopoverClose,
  onOpenModal,
  onOpenConfirm,
  onOpenDrawer,
  onTriggerToast,
}: {
  hubs: MobilityHub[];
  tab: string;
  switchVal: boolean;
  sliderVal: number;
  popoverOpen: boolean;
  onTabChange: (val: string) => void;
  onSwitchChange: (val: boolean) => void;
  onSliderChange: (val: number) => void;
  onPopoverToggle: () => void;
  onPopoverClose: () => void;
  onOpenModal: () => void;
  onOpenConfirm: () => void;
  onOpenDrawer: () => void;
  onTriggerToast: () => void;
}) {
  return (
    <>
      <Section title="3. Forms, Overlays, KPI Stats & Callouts">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Interactive Form Controls" tone="primary" />
            <div className="mt-4 space-y-4">
              <SearchBar placeholder="Search Hub, bay ID, vehicle plate..." />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Scenario Name"
                  defaultValue="Monday Morning Peak"
                />
                <Select
                  label="Simulation Duration"
                  options={[
                    { value: '24', label: 'Next 24 hours' },
                    { value: '12', label: 'Next 12 hours' },
                    { value: '4', label: 'Next 4 hours' },
                  ]}
                />
              </div>
              <PasswordInput
                label="Operator Security PIN"
                defaultValue="123456"
              />
              <Textarea
                label="Incident Notes"
                placeholder="Describe physical inspection findings..."
              />
              <Slider
                label="Critical Grid Threshold"
                value={sliderVal}
                min={75}
                max={98}
                unit="%"
                onChange={onSliderChange}
              />
              <Switch
                checked={switchVal}
                onChange={onSwitchChange}
                label="Enable Dynamic Load Balancing (DLB)"
                description="Throttle Tier 3 routine EVs above warning threshold."
              />
              <div className="flex flex-wrap gap-6">
                <Checkbox defaultChecked label="Reserve destination bays" />
                <Radio name="scope" defaultChecked label="All 5 VNU Hubs" />
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <StatCard
              title="GRID TRANSFORMER LOAD"
              value="184"
              denominator="/ 200 kW"
              badgeText="92% Critical"
              badgeTone="danger"
              icon={<BoltIcon size={18} />}
              iconTone="danger"
              progress={92}
              footer={<span>Dormitory Zone A • Warning &gt;= 85%</span>}
            />
            <Callout
              tone="warn"
              title="Rebalancing Advisory"
              description="Hub Dormitory Zone A buffer bays exhausted. Recommend dispatch from HCMUT Campus 2."
            />
            <Card>
              <CardHeader
                title="Native <dialog> Modals, Drawer & Popover"
                description="Built with Modern Web Guidance top-layer containment."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" onClick={onOpenModal}>
                  Open Modal
                </Button>
                <Button variant="danger" onClick={onOpenConfirm}>
                  Open ConfirmDialog
                </Button>
                <Button variant="navy" onClick={onOpenDrawer}>
                  Open Drawer
                </Button>
                <Popover
                  open={popoverOpen}
                  onClose={onPopoverClose}
                  trigger={
                    <Button variant="secondary" onClick={onPopoverToggle}>
                      Toggle Popover
                    </Button>
                  }
                >
                  <p className="text-body-sm font-bold text-ink">
                    Suoi Tien Metro Station
                  </p>
                  <p className="mt-1 text-caption text-ink-2">
                    31 Shared EVs ready • 18 parking bays available
                  </p>
                </Popover>
                <Button variant="eco" onClick={onTriggerToast}>
                  Trigger Toast
                </Button>
              </div>
            </Card>
            <SkeletonCard />
          </div>
        </div>
      </Section>

      <Section title="4. Stepper, Tabs, Responsive DataTable & EmptyState">
        <StepNav
          steps={[
            { id: '1', label: 'Scenario Configuration' },
            { id: '2', label: 'Simulation Progress' },
            { id: '3', label: 'Results Comparison' },
            { id: '4', label: 'Recommendations' },
          ]}
          currentStepIndex={1}
        />
        <Tabs
          value={tab}
          onChange={onTabChange}
          items={[
            { id: 'all', label: 'All Hubs', count: 5 },
            { id: 'critical', label: 'Critical', count: 1 },
            { id: 'warning', label: 'Warning', count: 1 },
            { id: 'normal', label: 'Normal', count: 3 },
          ]}
        />
        <DataTable
          columns={HUB_COLUMNS}
          rows={hubs}
          rowKey={(h) => h.id}
          caption="VNU-HCM Mobility Hubs Overview"
        />
        <EmptyState
          title="No Matching Vehicles"
          description="Try clearing the battery threshold filter or inspecting nearby hubs."
          action={<Button variant="secondary">Reset Filters</Button>}
        />
      </Section>

      <Section
        title={`5. Dedicated TSX Icon Library (${ICON_GALLERY.length} Icons)`}
      >
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
          {ICON_GALLERY.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-line bg-surface p-3 text-ink-2 shadow-card"
            >
              <span className="text-ink">{item.icon}</span>
              <span className="w-full truncate text-center font-mono text-label text-ink-3">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
