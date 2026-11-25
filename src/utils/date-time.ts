const VN_TZ = 'Asia/Ho_Chi_Minh';

export function formatDateShort(offsetDays = 0): string {
  const target = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(target);
}

export function formatParkingDateLabel(offsetDays = 0): string {
  const target = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TZ,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(target);
}

export function formatTime12h(date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTime24h(date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function buildUpcomingPickupTimes(now = new Date()): string[] {
  const offsetsMins = [0, 15, 30, 45];
  return offsetsMins.map((mins) =>
    formatTime12h(new Date(now.getTime() + mins * 60_000)),
  );
}

export function buildUpcomingParkingTimes(now = new Date()): string[] {
  const offsetsMins = [0, 30, 60, 120];
  return offsetsMins.map((mins) =>
    formatTime24h(new Date(now.getTime() + mins * 60_000)),
  );
}

export function formatElapsedClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
