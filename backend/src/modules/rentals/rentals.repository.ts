import { Injectable } from '@nestjs/common';
import type { MobilityHub, Prisma, SharedVehicle, VehicleRental } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ReturnVehicleDto } from './dto/rentals.dto';
import { buildReturnFaultIncidentData } from './rentals.mapper';

@Injectable()
export class RentalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  findActiveRentalByUser(userId: string) {
    return this.prisma.vehicleRental.findFirst({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'ACTIVE_TRIP', 'EXPIRED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findRentalHistoryByUser(userId: string) {
    return this.prisma.vehicleRental.findMany({
      where: { userId, status: 'RETURNED' },
      include: { vehicle: true, originHub: true, destinationHub: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findAllActiveFleetRentals() {
    return this.prisma.vehicleRental.findMany({
      where: { status: { in: ['CONFIRMED', 'ACTIVE_TRIP'] } },
      include: { user: true, vehicle: true, originHub: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getPolicyConfig() {
    return this.prisma.systemPolicy.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  findVehicleWithClient(tx: Prisma.TransactionClient, vehicleId: string) {
    return tx.sharedVehicle.findUnique({ where: { id: vehicleId } });
  }

  findHubWithClient(tx: Prisma.TransactionClient, hubId: string) {
    return tx.mobilityHub.findUnique({ where: { id: hubId } });
  }

  updateVehicleStatus(id: string, status: string) {
    return this.prisma.sharedVehicle.update({
      where: { id },
      data: { status },
    });
  }

  async releaseVehicleBackToHub(
    tx: Prisma.TransactionClient,
    vehicleId: string,
    hubId: string,
  ) {
    await tx.sharedVehicle.update({
      where: { id: vehicleId },
      data: { status: 'AVAILABLE' },
    });
    await tx.mobilityHub.update({
      where: { id: hubId },
      data: { sharedEvsReady: { increment: 1 } },
    });
  }

  async persistTripReturn(
    tx: Prisma.TransactionClient,
    params: {
      rental: VehicleRental & { vehicle: SharedVehicle };
      destHub: MobilityHub;
      dto: ReturnVehicleDto;
      nextBattery: number;
      nextVehicleStatus: string;
      metrics: {
        endedAt: string;
        durationMins: number;
        distanceKm: number;
        fareVnd: number;
        rewardPoints: number;
      };
    },
  ) {
    const { rental, destHub, dto, nextBattery, nextVehicleStatus, metrics } =
      params;

    await tx.sharedVehicle.update({
      where: { id: rental.vehicleId },
      data: {
        hubId: dto.destinationHubId,
        batterySoC: nextBattery,
        status: nextVehicleStatus,
      },
    });

    const incCore = destHub.coreBaysOccupied < destHub.coreBaysTotal ? 1 : 0;
    const incBuffer = incCore === 0 ? 1 : 0;
    await tx.mobilityHub.update({
      where: { id: dto.destinationHubId },
      data: {
        coreBaysOccupied: destHub.coreBaysOccupied + incCore,
        bufferBaysOccupied: destHub.bufferBaysOccupied + incBuffer,
        ...(nextVehicleStatus === 'AVAILABLE'
          ? { sharedEvsReady: { increment: 1 } }
          : {}),
      },
    });

    if (dto.hasFault) {
      await tx.incident.create({
        data: buildReturnFaultIncidentData({
          destinationHubId: dto.destinationHubId,
          destHubShortName: destHub.shortName,
          vehicleId: rental.vehicle.id,
          vehicleCode: rental.vehicle.code,
          vehicleModel: rental.vehicle.model,
          remarks: dto.remarks,
        }),
      });
    }

    return tx.vehicleRental.update({
      where: { id: rental.id },
      data: {
        status: 'RETURNED',
        destinationHubId: dto.destinationHubId,
        endedAt: metrics.endedAt,
        durationMins: metrics.durationMins,
        distanceKm: metrics.distanceKm,
        fareVnd: metrics.fareVnd,
        rewardPoints: metrics.rewardPoints,
        hasFault: dto.hasFault,
        remarks: dto.remarks ?? null,
      },
    });
  }
}
