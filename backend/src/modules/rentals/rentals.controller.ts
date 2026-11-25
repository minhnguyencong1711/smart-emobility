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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { HoldVehicleDto, ReturnVehicleDto } from './dto/rentals.dto';
import { RentalsService } from './rentals.service';

@ApiTags('Shared EV Rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get('active')
  getActive(@CurrentUser() user: JwtUserPayload) {
    return this.rentalsService.getActiveHold(user.sub);
  }

  @Get('history')
  getHistory(@CurrentUser() user: JwtUserPayload) {
    return this.rentalsService.getHistory(user.sub);
  }

  @Get('live')
  @UseGuards(RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  getLiveFleetRentals() {
    return this.rentalsService.getLiveFleetRentals();
  }

  @Post('hold')
  reserveVehicle(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: HoldVehicleDto,
  ) {
    return this.rentalsService.reserveVehicle(user.sub, dto);
  }

  @Delete('hold')
  cancelHold(@CurrentUser() user: JwtUserPayload) {
    return this.rentalsService.cancelHold(user.sub);
  }

  @Post('hold/expire')
  expireHold(@CurrentUser() user: JwtUserPayload) {
    return this.rentalsService.expireHold(user.sub);
  }

  @Post('unlock')
  unlockVehicle(@CurrentUser() user: JwtUserPayload) {
    return this.rentalsService.unlockVehicle(user.sub);
  }

  @Post('return')
  returnVehicle(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: ReturnVehicleDto,
  ) {
    return this.rentalsService.returnVehicle(user.sub, dto);
  }
}
