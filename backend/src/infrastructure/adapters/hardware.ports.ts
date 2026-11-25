export const CHARGING_CONTROLLER_PORT = Symbol('CHARGING_CONTROLLER_PORT');
export const BARRIER_GATE_PORT = Symbol('BARRIER_GATE_PORT');
export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');

export interface IChargingStationControllerPort {
  cutPowerSafety(portCode: string, reason: string): Promise<void>;
  lockPort(portCode: string): Promise<void>;
  setChargingCurrentLimit(portCode: string, limitKw: number): Promise<void>;
}

export interface IBarrierGatePort {
  openGate(hubId: string, ePassCode: string): Promise<void>;
  unlockSharedVehicle(vehicleCode: string): Promise<void>;
}

export interface INotificationPort {
  sendUserAlert(userId: string, title: string, message: string): Promise<void>;
}
