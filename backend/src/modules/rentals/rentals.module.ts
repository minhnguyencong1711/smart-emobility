import { Module } from '@nestjs/common';

import { RentalsController } from './rentals.controller';
import { RentalsRepository } from './rentals.repository';
import { RentalsService } from './rentals.service';

@Module({
  controllers: [RentalsController],
  providers: [RentalsRepository, RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
