import { Global, Module } from '@nestjs/common';

import {
  BARRIER_GATE_PORT,
  CHARGING_CONTROLLER_PORT,
  NOTIFICATION_PORT,
} from './hardware.ports';
import {
  MockNotificationAdapter,
  SimulatedBarrierGateAdapter,
  SimulatedChargingStationAdapter,
} from './simulated-hardware.adapter';

@Global()
@Module({
  providers: [
    {
      provide: CHARGING_CONTROLLER_PORT,
      useClass: SimulatedChargingStationAdapter,
    },
    {
      provide: BARRIER_GATE_PORT,
      useClass: SimulatedBarrierGateAdapter,
    },
    {
      provide: NOTIFICATION_PORT,
      useClass: MockNotificationAdapter,
    },
  ],
  exports: [CHARGING_CONTROLLER_PORT, BARRIER_GATE_PORT, NOTIFICATION_PORT],
})
export class AdaptersModule {}
