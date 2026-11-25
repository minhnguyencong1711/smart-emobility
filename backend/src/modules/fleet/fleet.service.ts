import { Injectable, NotFoundException } from '@nestjs/common';
import type { MobilityHub } from '@prisma/client';

import type { ListVehiclesQueryDto } from './dto/fleet.dto';
import { FleetRepository } from './fleet.repository';

function mapHubToDto(hub: MobilityHub) {
  const { anchorOffsetX, anchorOffsetY, ...rest } = hub;
  return {
    ...rest,
    cardAnchorOffset: [anchorOffsetX, anchorOffsetY] as [number, number],
  };
}

@Injectable()
export class FleetService {
  constructor(private readonly fleetRepository: FleetRepository) {}

  async listHubs() {
    const hubs = await this.fleetRepository.findAllHubs();
    return hubs.map(mapHubToDto);
  }

  async getHub(id: string) {
    const hub = await this.fleetRepository.findHubById(id);
    if (!hub) throw new NotFoundException(`Hub ${id} not found.`);
    return mapHubToDto(hub);
  }

  listVehicles(query: ListVehiclesQueryDto) {
    return this.fleetRepository.findVehicles(query);
  }

  async getVehicle(id: string) {
    const vehicle = await this.fleetRepository.findVehicleById(id);
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found.`);
    return vehicle;
  }
}
