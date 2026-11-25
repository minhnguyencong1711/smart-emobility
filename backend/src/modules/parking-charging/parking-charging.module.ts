import { Module } from '@nestjs/common';

import { ParkingChargingController } from './parking-charging.controller';
import { ParkingChargingRepository } from './parking-charging.repository';
import { ParkingChargingService } from './parking-charging.service';

@Module({
  controllers: [ParkingChargingController],
  providers: [ParkingChargingRepository, ParkingChargingService],
  exports: [ParkingChargingService],
})
export class ParkingChargingModule {}
