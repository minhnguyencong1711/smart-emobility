import { BoltIcon, ParkingIcon } from '@/components/icons';
import {
  Button,
  Callout,
  ConfirmDialog,
  FilterChip,
  Modal,
  StatCard,
  StepNav,
} from '@/components/ui';
import type { ActiveParkingAndCharging, MobilityHub } from '@/types';

import type { ParkingExceptionMode } from '../utils/parking-slots';

export function ParkingHeaderKpis({
  selectedHub,
  freeParking,
  occPct,
  gracePeriodMins,
  stepIndex,
  exceptionMode,
  onStepChange,
  onExceptionChange,
}: {
  selectedHub: MobilityHub;
  freeParking: number;
  occPct: number;
  gracePeriodMins: number;
  stepIndex: 0 | 1;
  exceptionMode: ParkingExceptionMode;
  onStepChange: (step: 0 | 1) => void;
  onExceptionChange: (mode: ParkingExceptionMode) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="AVAILABLE PARKING SPACES"
          value={freeParking}
          denominator={`/ ${selectedHub.coreBaysTotal} spaces`}
          badgeText={exceptionMode === 'HUB_FULL' ? 'Full' : selectedHub.status}
          badgeTone={
            exceptionMode === 'HUB_FULL' || occPct >= 90
              ? 'danger'
              : occPct >= 85
                ? 'warn'
                : 'ok'
          }
          icon={<ParkingIcon size={18} />}
          iconTone="primary"
          progress={occPct}
          progressTone={
            occPct >= 90 ? 'danger' : occPct >= 85 ? 'warn' : 'primary'
          }
          footerLeft={`${occPct}% Occupied`}
          footerRight={selectedHub.name}
        />
        <StatCard
          title="AVAILABLE CHARGING SPACES"
          value={18}
          denominator="/ 24 spaces"
          badgeText="Normal"
          badgeTone="eco"
          icon={<BoltIcon size={18} />}
          iconTone="eco"
          progress={25}
          progressTone="eco"
          footerLeft="25% Occupied"
          footerRight="Type 2 & DC Fast"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StepNav
          currentStepIndex={stepIndex}
          onStepClick={(idx) => onStepChange(idx as 0 | 1)}
          steps={[
            { id: 'select', label: 'Select Hub & Spot' },
            { id: 'confirm', label: 'Confirm Reservation' },
          ]}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-caption font-semibold text-ink-3">
            Validation State:
          </span>
          {(
            [
              ['NORMAL', 'Normal'],
              ['DUPLICATE_HOLD', 'Duplicate Hold'],
              ['DB_SYNC_FAILURE', 'DB Sync Error'],
              ['EXPIRED', 'Expired'],
              ['HUB_FULL', 'Hub Full'],
            ] as const
          ).map(([mode, label]) => (
            <FilterChip
              key={mode}
              size="sm"
              tone="navy"
              active={exceptionMode === mode}
              onClick={() => onExceptionChange(mode)}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      {exceptionMode !== 'NORMAL' ? (
        <Callout
          tone={exceptionMode === 'DUPLICATE_HOLD' ? 'warn' : 'danger'}
          title={
            exceptionMode === 'DUPLICATE_HOLD'
              ? 'Duplicate Parking Hold Blocked'
              : exceptionMode === 'DB_SYNC_FAILURE'
                ? 'Database Synchronization Failure'
                : exceptionMode === 'EXPIRED'
                  ? 'Previous Parking Reservation Expired'
                  : `${selectedHub.shortName} Has Reached Full Capacity`
          }
          description={
            exceptionMode === 'DUPLICATE_HOLD'
              ? 'A student account can hold only 1 active personal EV parking reservation at a time.'
              : exceptionMode === 'DB_SYNC_FAILURE'
                ? 'IoT barrier controller did not acknowledge bay reservation within timeout. Safe rollback applied.'
                : exceptionMode === 'EXPIRED'
                  ? `Grace period (${gracePeriodMins} mins) elapsed without gate check-in. Bay released automatically.`
                  : 'All core & dynamic buffer bays are occupied. Select another campus hub or try later.'
          }
        />
      ) : null}
    </>
  );
}

export function ParkingModals({
  termsOpen,
  cancelStep1Open,
  cancelStep2Open,
  gracePeriodMins,
  activeParking,
  onCloseTerms,
  onCloseCancel1,
  onProceedCancel2,
  onCloseCancel2,
  onConfirmCancel,
}: {
  termsOpen: boolean;
  cancelStep1Open: boolean;
  cancelStep2Open: boolean;
  gracePeriodMins: number;
  activeParking: ActiveParkingAndCharging | null;
  onCloseTerms: () => void;
  onCloseCancel1: () => void;
  onProceedCancel2: () => void;
  onCloseCancel2: () => void;
  onConfirmCancel: () => void;
}) {
  return (
    <>
      <Modal
        open={termsOpen}
        onClose={onCloseTerms}
        title="Parking Reservation Terms & Policy"
        size="sm"
      >
        <div className="space-y-3 text-body-sm text-ink-2">
          <p>
            1. Grace Period: Reservations are held for {gracePeriodMins} minutes
            past arrival time before automatic release.
          </p>
          <p>
            2. Decoupled Charging: Stopping a charging session does not force an
            immediate bay exit; your parking slot remains valid until checkout.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={onCloseTerms}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelStep1Open}
        onClose={onCloseCancel1}
        onConfirm={onProceedCancel2}
        title="Cancel Parking Reservation? (Step 1/2)"
        description={`Do you want to initiate cancellation for ${activeParking?.reservationId ?? 'PRK-2026-041'} (${activeParking?.bayCode ?? 'BAY-A04'})?`}
        confirmLabel="Continue Cancellation"
        cancelLabel="Keep Reservation"
        destructive
      />

      <ConfirmDialog
        open={cancelStep2Open}
        onClose={onCloseCancel2}
        onConfirm={onConfirmCancel}
        title="Final Confirmation: Release Bay? (Step 2/2)"
        description="Confirming will immediately release your reserved bay and invalidate your current Check-in Code."
        confirmLabel="Confirm Release Bay"
        cancelLabel="Go Back"
        destructive
      />
    </>
  );
}
