import { Module } from '@nestjs/common';

import { FleetController } from './fleet.controller';
import { FleetRepository } from './fleet.repository';
import { FleetService } from './fleet.service';

@Module({
  controllers: [FleetController],
  providers: [FleetRepository, FleetService],
  exports: [FleetService],
})
export class FleetModule {}
