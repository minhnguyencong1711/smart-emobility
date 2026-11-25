import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ListVehiclesQueryDto } from './dto/fleet.dto';
import { FleetService } from './fleet.service';

@ApiTags('Fleet & Hubs')
@Controller()
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('hubs')
  listHubs() {
    return this.fleetService.listHubs();
  }

  @Get('hubs/:id')
  getHub(@Param('id') id: string) {
    return this.fleetService.getHub(id);
  }

  @Get('vehicles')
  listVehicles(@Query() query: ListVehiclesQueryDto) {
    return this.fleetService.listVehicles(query);
  }

  @Get('vehicles/:id')
  getVehicle(@Param('id') id: string) {
    return this.fleetService.getVehicle(id);
  }
}
