import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type JwtUserPayload,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  RecoverChargingDto,
  ReserveParkingDto,
  StartChargingDto,
} from './dto/parking-charging.dto';
import { ParkingChargingService } from './parking-charging.service';

@ApiTags('Parking & Charging')
@Controller()
export class ParkingChargingController {
  constructor(private readonly service: ParkingChargingService) {}

  @Get('charging/points')
  listChargingPoints() {
    return this.service.listChargingPoints();
  }

  @Get('parking/active')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getActive(@CurrentUser() user: JwtUserPayload) {
    return this.service.getActiveSession(user.sub);
  }

  @Post('parking/reservations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  reserveBay(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: ReserveParkingDto,
  ) {
    return this.service.reserveBay(user.sub, dto);
  }

  @Delete('parking/active')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  cancelActive(@CurrentUser() user: JwtUserPayload) {
    return this.service.cancelActive(user.sub);
  }

  @Post('parking/checkin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  checkIn(@CurrentUser() user: JwtUserPayload) {
    return this.service.checkIn(user.sub);
  }

  @Post('charging/start')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  startCharging(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: StartChargingDto,
  ) {
    return this.service.startCharging(user.sub, dto);
  }

  @Post('charging/progress')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  tickProgress(@CurrentUser() user: JwtUserPayload) {
    return this.service.tickProgress(user.sub);
  }

  @Post('charging/recover')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  recoverCharging(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: RecoverChargingDto,
  ) {
    return this.service.recoverCharging(user.sub, dto);
  }

  @Post('charging/stop')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  stopKeepParking(@CurrentUser() user: JwtUserPayload) {
    return this.service.stopKeepParking(user.sub);
  }

  @Post('charging/exit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  exitHubReleaseBay(@CurrentUser() user: JwtUserPayload) {
    return this.service.exitHubReleaseBay(user.sub);
  }
}
