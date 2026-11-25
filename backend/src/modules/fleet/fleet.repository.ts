import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ListVehiclesQueryDto } from './dto/fleet.dto';

@Injectable()
export class FleetRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllHubs() {
    return this.prisma.mobilityHub.findMany({ orderBy: { code: 'asc' } });
  }

  findHubById(id: string) {
    return this.prisma.mobilityHub.findUnique({ where: { id } });
  }

  findVehicles(query: ListVehiclesQueryDto) {
    const search = query.search?.trim();
    return this.prisma.sharedVehicle.findMany({
      where: {
        ...(query.hubId ? { hubId: query.hubId } : {}),
        ...(query.type ? { type: query.type } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(typeof query.minBattery === 'number'
          ? { batterySoC: { gte: query.minBattery } }
          : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { batterySoC: 'desc' },
    });
  }

  findVehicleById(id: string) {
    return this.prisma.sharedVehicle.findUnique({ where: { id } });
  }
}
