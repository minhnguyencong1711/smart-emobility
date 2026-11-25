import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { seedBaselineData } from '../../infrastructure/prisma/seed-baseline';
import type { UpdatePolicyDto } from './dto/policy.dto';

@Injectable()
export class PolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate() {
    return this.prisma.systemPolicy.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  update(dto: UpdatePolicyDto) {
    return this.prisma.systemPolicy.upsert({
      where: { id: 1 },
      update: dto,
      create: { id: 1, ...dto },
    });
  }

  async resetAllBaseline() {
    await seedBaselineData(this.prisma, { resetRuntimeRecords: true });
    return this.getOrCreate();
  }
}
