import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  IsolateIncidentDto,
  ListIncidentsQueryDto,
} from './dto/incidents.dto';
import { IncidentsService } from './incidents.service';

@ApiTags('Incidents & Safety Isolation')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  list(@Query() query: ListIncidentsQueryDto) {
    return this.incidentsService.listIncidents(query);
  }

  @Post(':id/isolate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  isolate(@Param('id') id: string, @Body() dto: IsolateIncidentDto) {
    return this.incidentsService.isolateEquipment(id, dto);
  }
}
