import { useCallback, useEffect, useMemo, useState } from 'react';

import { BikeIcon, ClockIcon, RefreshIcon } from '@/components/icons';
import { Badge, Button, Card, StatusPill } from '@/components/ui';
import { useInterval } from '@/hooks';
import { backendApi, getStoredAccessToken } from '@/services';
import { useAuthStore, useMobilityStore } from '@/stores';
import type { LiveFleetRental } from '@/types';
import { formatElapsedClock } from '@/utils/date-time';
import { formatClockSeconds } from '@/utils/formatters';

export function LiveFleetTripsCard() {
  const backendMode = useMobilityStore((s) => s.backendMode);
  const activeVehicleHold = useMobilityStore((s) => s.activeVehicleHold);
  const sharedVehicles = useMobilityStore((s) => s.sharedVehicles);
  const hubs = useMobilityStore((s) => s.hubs);
  const user = useAuthStore((s) => s.user);
  const [backendRentals, setBackendRentals] = useState<LiveFleetRental[]>([]);
  const [loading, setLoading] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const fetchLive = useCallback(async () => {
    if (!getStoredAccessToken()) return;
    setLoading(true);
    try {
      const items = await backendApi.getLiveFleetRentals();
      setBackendRentals(items);
    } catch {
      // Offline fallback or non-operator role: keep current list silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendMode === 'online') {
      void fetchLive();
    }
  }, [backendMode, fetchLive]);

  useInterval(() => void fetchLive(), backendMode === 'online' ? 5000 : null);

  const liveRentals = useMemo(() => {
    if (backendRentals.length > 0) return backendRentals;
    if (
      activeVehicleHold &&
      (activeVehicleHold.status === 'CONFIRMED' ||
        activeVehicleHold.status === 'ACTIVE_TRIP')
    ) {
      const vehicle = sharedVehicles.find(
        (v) => v.id === activeVehicleHold.vehicleId,
      );
      const hub = hubs.find((h) => h.id === activeVehicleHold.hubId);
      return [
        {
          id: activeVehicleHold.reservationId,
          reservationId: activeVehicleHold.reservationId,
          tripId: activeVehicleHold.tripId,
          status: activeVehicleHold.status,
          vehicleId: activeVehicleHold.vehicleId,
          vehicleCode: vehicle?.code ?? activeVehicleHold.vehicleId,
          vehicleModel: vehicle?.model ?? 'Shared EV',
          vehicleType: vehicle?.type ?? 'E_BIKE',
          batterySoC: vehicle?.batterySoC ?? 80,
          riderName: user.fullName,
          riderEmail: user.email,
          originHubId: activeVehicleHold.hubId,
          originHubName: hub?.shortName ?? activeVehicleHold.hubId,
          startedAt: activeVehicleHold.startedAt,
          startedAtIso: activeVehicleHold.startedAtIso,
          remainingSeconds: activeVehicleHold.remainingSeconds,
          elapsedSeconds: activeVehicleHold.elapsedSeconds,
        } satisfies LiveFleetRental,
      ];
    }
    return [];
  }, [backendRentals, activeVehicleHold, sharedVehicles, hubs, user]);

  useInterval(() => setNowMs(Date.now()), liveRentals.length > 0 ? 1000 : null);

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-sm bg-primary-soft text-primary-700">
            <BikeIcon size={17} />
          </span>
          <div>
            <h2 className="text-body-lg font-extrabold text-ink">
              Live Shared EV Trips &amp; Holds
            </h2>
            <p className="text-caption text-ink-3">
              Real-time active holds and in-progress rides synced from fleet
              telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone={liveRentals.length > 0 ? 'primary' : 'neutral'}>
            {liveRentals.length} Active
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={<RefreshIcon size={13} />}
            isLoading={loading}
            onClick={() => void fetchLive()}
          >
            Sync Live
          </Button>
        </div>
      </div>

      {liveRentals.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-surface-2 px-4 py-3 text-body-sm text-ink-3">
          No shared EV holds or active trips are currently running across the 5
          campus hubs.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {liveRentals.map((item) => {
            const isTrip = item.status === 'ACTIVE_TRIP';
            const liveSecs =
              isTrip && item.startedAtIso
                ? Math.max(
                    0,
                    Math.floor((nowMs - Date.parse(item.startedAtIso)) / 1000),
                  )
                : (item.elapsedSeconds ?? 0);

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-2.5 rounded-md border border-line bg-surface-2 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-body font-extrabold text-ink">
                      {item.vehicleCode}
                      {item.tripId ? ` · ${item.tripId}` : ''}
                    </p>
                    <p className="text-caption text-ink-2">
                      {item.riderName} ({item.riderEmail})
                    </p>
                  </div>
                  <StatusPill
                    tone={isTrip ? 'info' : 'warn'}
                    icon={<ClockIcon size={11} />}
                  >
                    {isTrip ? 'IN TRIP' : 'HOLD'}
                  </StatusPill>
                </div>

                <div className="flex items-center justify-between border-t border-line pt-2 text-caption">
                  <span className="text-ink-3">
                    {item.originHubName} · {item.batterySoC}% SoC
                  </span>
                  <span className="font-mono font-bold text-primary-700">
                    {isTrip
                      ? `${formatElapsedClock(liveSecs)} elapsed`
                      : `${formatClockSeconds(item.remainingSeconds)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
