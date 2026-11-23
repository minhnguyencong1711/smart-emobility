import {
  BikeIcon,
  BoltIcon,
  RefreshIcon,
  ShieldAlertIcon,
} from '@/components/icons';
import {
  Badge,
  Button,
  Card,
  CardRow,
  CountdownTimer,
  HubStatusPill,
  IconButton,
  IncidentStatusPill,
  ProgressBar,
  Section,
  Spinner,
} from '@/components/ui';

import { BRAND_COLOR_TOKENS } from '../constants/icon-gallery';

export function PrimitivesSection() {
  return (
    <>
      <Section
        title="1. Brand & Semantic Color Tokens"
        description="Aligned strictly with Figma_Tokens_Colors.html and VNU-HCM brand guidelines."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {BRAND_COLOR_TOKENS.map((token) => (
            <div
              key={token.name}
              className="rounded-md border border-line bg-surface p-2 shadow-card"
            >
              <div className={`h-12 rounded-xs ${token.bgClass}`} />
              <p className="mt-2 text-caption font-bold">{token.name}</p>
              <p className="font-mono text-label text-ink-3">{token.hex}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="2. Buttons, Badges, Status Pills & Timers">
        <Card>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" leadingIcon={<BikeIcon size={16} />}>
              Primary
            </Button>
            <Button variant="navy">Navy</Button>
            <Button variant="eco" leadingIcon={<BoltIcon size={16} />}>
              Eco Action
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="ghost">Ghost</Button>
            <Button
              variant="danger"
              leadingIcon={<ShieldAlertIcon size={16} />}
            >
              Danger
            </Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <IconButton
              aria-label="Refresh telemetry"
              icon={<RefreshIcon size={18} />}
            />
          </div>

          <CardRow className="mt-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-2">
              <HubStatusPill status="NORMAL" />
              <HubStatusPill status="WARNING" />
              <HubStatusPill status="CRITICAL" />
              <IncidentStatusPill status="ISOLATED" />
              <IncidentStatusPill status="UNDER_REPAIR" />
            </div>
            <CountdownTimer secondsRemaining={885} />
          </CardRow>

          <CardRow className="flex-wrap">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">Tier 1 Personal EV</Badge>
              <Badge tone="navy" variant="solid">
                HUB-BK04
              </Badge>
              <Badge tone="eco">92% SoC</Badge>
              <Badge tone="warn">Buffer Exhausted</Badge>
              <Badge tone="danger">38.4 mA Fault</Badge>
            </div>
            <Spinner />
          </CardRow>

          <CardRow className="flex-col items-stretch gap-3">
            <div className="flex items-center justify-between text-caption font-semibold text-ink-2">
              <span>
                Feeder Capacity Threshold Indicator (Warn 85% / Crit 90%)
              </span>
              <span className="font-mono">72% / 87% / 94%</span>
            </div>
            <ProgressBar value={72} showLabel />
            <ProgressBar value={87} showLabel />
            <ProgressBar value={94} showLabel />
          </CardRow>
        </Card>
      </Section>
    </>
  );
}
