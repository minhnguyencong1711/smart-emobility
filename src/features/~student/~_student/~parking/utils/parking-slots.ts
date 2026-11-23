export type ParkingExceptionMode =
  'NORMAL' | 'DUPLICATE_HOLD' | 'DB_SYNC_FAILURE' | 'EXPIRED' | 'HUB_FULL';

export type SlotState = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';

export const VEHICLE_OPTIONS = [
  { value: 'VinFast Feliz|51H-228.08', label: 'VinFast Feliz · 51H-228.08' },
  { value: 'VinFast VF e34|59A-459.07', label: 'VinFast VF e34 · 59A-459.07' },
  {
    value: 'Yadea VoltGuard|59M1-882.10',
    label: 'Yadea VoltGuard · 59M1-882.10',
  },
];

export const PARKING_ROWS = ['A', 'B', 'C'] as const;
export const PARKING_NUMBERS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
];

export function getSlotStatus(
  row: string,
  num: string,
  floor: number,
): SlotState {
  const code = `${row}${num}`;
  if (floor === 1) {
    if (['A02', 'A05', 'B01', 'B06', 'B07', 'C03', 'C08'].includes(code)) {
      return 'OCCUPIED';
    }
    if (['A03', 'B04', 'C05'].includes(code)) return 'RESERVED';
  }
  if (floor === 2 && ['A01', 'B02', 'C04'].includes(code)) return 'OCCUPIED';
  return 'AVAILABLE';
}

export function hasChargingPort(row: string, num: string): boolean {
  return row === 'A' && Number(num) <= 10 && Number(num) >= 4;
}
