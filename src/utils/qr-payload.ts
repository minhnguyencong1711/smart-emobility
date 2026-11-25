export function buildVehicleQrPayload(
  vehicleCode: string,
  hubCode?: string,
): string {
  const cleanCode = vehicleCode.trim().toUpperCase();
  const cleanHub = hubCode?.trim().toUpperCase();
  return cleanHub ? `VNU-EV|${cleanCode}|${cleanHub}` : `VNU-EV|${cleanCode}`;
}

export function parseVehicleQrCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase();
  if (!cleaned) return null;

  if (cleaned.startsWith('VNU-EV|')) {
    const [, code] = cleaned.split('|');
    return code ? normalizeVehicleCode(code) : null;
  }

  if (cleaned.startsWith('QR-VNU-')) {
    return normalizeVehicleCode(cleaned.slice('QR-VNU-'.length));
  }

  return normalizeVehicleCode(cleaned);
}

function normalizeVehicleCode(token: string): string | null {
  const compact = token.trim().toUpperCase();
  const match = /^([A-Z]{2,5})-?(\d{2,5})$/.exec(compact);
  if (!match) return compact || null;
  return `${match[1]}-${match[2]}`;
}

export function buildEPassQrPayload(params: {
  reservationId: string;
  hubCode: string;
  bayCode: string;
  pinCode: string;
}): string {
  return `VNU-EPASS|${params.reservationId}|${params.hubCode}|${params.bayCode}|PIN:${params.pinCode}`;
}

export function buildExitQrPayload(params: {
  reservationId: string;
  totalVnd: number;
}): string {
  return `VNU-EXIT|${params.reservationId}|${params.totalVnd}`;
}

export function buildWorkTicketQrPayload(params: {
  orderCode: string;
  route: string;
  count: number;
}): string {
  return `VNU-TICKET|${params.orderCode}|${params.route}|EVS:${params.count}`;
}
