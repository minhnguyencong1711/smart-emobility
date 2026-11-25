import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdaptersModule } from './infrastructure/adapters/adapters.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { ParkingChargingModule } from './modules/parking-charging/parking-charging.module';
import { PolicyModule } from './modules/policy/policy.module';
import { RentalsModule } from './modules/rentals/rentals.module';

@ApiTags('Health')
@Controller('health')
class HealthController {
  @Get()
  check() {
    return { ok: true, service: 'smart-emobility-backend', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    PrismaModule,
    AdaptersModule,
    AuthModule,
    PolicyModule,
    FleetModule,
    RentalsModule,
    ParkingChargingModule,
    IncidentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
