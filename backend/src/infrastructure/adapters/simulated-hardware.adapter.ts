import { Injectable, Logger } from '@nestjs/common';

import type {
  IBarrierGatePort,
  IChargingStationControllerPort,
  INotificationPort,
} from './hardware.ports';

@Injectable()
export class SimulatedChargingStationAdapter
  implements IChargingStationControllerPort
{
  private readonly logger = new Logger(SimulatedChargingStationAdapter.name);

  async cutPowerSafety(portCode: string, reason: string): Promise<void> {
    this.logger.warn(
      `[OCPP-SIM] Emergency relay cut on ${portCode}: ${reason}`,
    );
  }

  async lockPort(portCode: string): Promise<void> {
    this.logger.log(`[OCPP-SIM] Connector locked on ${portCode}`);
  }

  async setChargingCurrentLimit(
    portCode: string,
    limitKw: number,
  ): Promise<void> {
    this.logger.log(`[OCPP-SIM] Port ${portCode} throttled to ${limitKw} kW`);
  }
}

@Injectable()
export class SimulatedBarrierGateAdapter implements IBarrierGatePort {
  private readonly logger = new Logger(SimulatedBarrierGateAdapter.name);

  async openGate(hubId: string, ePassCode: string): Promise<void> {
    this.logger.log(
      `[GATE-SIM] Barrier opened at ${hubId} for pass ${ePassCode}`,
    );
  }

  async unlockSharedVehicle(vehicleCode: string): Promise<void> {
    this.logger.log(
      `[LOCK-SIM] Smart lock disengaged on shared EV ${vehicleCode}`,
    );
  }
}

@Injectable()
export class MockNotificationAdapter implements INotificationPort {
  private readonly logger = new Logger(MockNotificationAdapter.name);

  async sendUserAlert(
    userId: string,
    title: string,
    message: string,
  ): Promise<void> {
    this.logger.log(`[NOTIFY-SIM] To=${userId} | ${title}: ${message}`);
  }
}
