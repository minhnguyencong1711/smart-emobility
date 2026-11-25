import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ParkingChargingRepository {
  constructor(private readonly prisma: PrismaService) {}

  runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  listChargingPoints() {
    return this.prisma.chargingPoint.findMany({ orderBy: { code: 'asc' } });
  }

  findLatestSessionByUser(userId: string) {
    return this.prisma.parkingChargingSession.findFirst({
      where: {
        userId,
        parkingStatus: { in: ['RESERVED', 'CHECKED_IN', 'EXITED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveHoldByUser(userId: string) {
    return this.prisma.parkingChargingSession.findFirst({
      where: {
        userId,
        parkingStatus: { in: ['RESERVED', 'CHECKED_IN'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findHubById(id: string) {
    return this.prisma.mobilityHub.findUnique({ where: { id } });
  }

  findChargingPointById(id: string) {
    return this.prisma.chargingPoint.findUnique({ where: { id } });
  }
}
