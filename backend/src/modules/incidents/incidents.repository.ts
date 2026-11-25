import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ListIncidentsQueryDto } from './dto/incidents.dto';

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  findMany(query: ListIncidentsQueryDto) {
    const search = query.search?.trim();
    return this.prisma.incident.findMany({
      where: {
        ...(query.hubId && query.hubId !== 'ALL' ? { hubId: query.hubId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { resourceCode: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.incident.findUnique({ where: { id } });
  }
}
