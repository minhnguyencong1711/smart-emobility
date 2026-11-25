import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  BARRIER_GATE_PORT,
  type IBarrierGatePort,
} from '../../infrastructure/adapters/hardware.ports';
import type { HoldVehicleDto, ReturnVehicleDto } from './dto/rentals.dto';
import {
  buildUnlockFallbackHoldData,
  computeDeadlineLabel,
  computeTripReturnMetrics,
  toHoldDto,
  toLiveFleetRentalDto,
  toRentalHistoryDto,
} from './rentals.mapper';
import { RentalsRepository } from './rentals.repository';

@Injectable()
export class RentalsService {
  constructor(
    private readonly rentalsRepository: RentalsRepository,
    @Inject(BARRIER_GATE_PORT) private readonly gatePort: IBarrierGatePort,
  ) {}

  async getActiveHold(userId: string) {
    const rental = await this.rentalsRepository.findActiveRentalByUser(userId);
    if (!rental) return null;

    if (
      rental.status === 'CONFIRMED' &&
      rental.deadlineAt.getTime() <= Date.now()
    ) {
      const expired = await this.expireHold(userId);
      return expired;
    }
    return toHoldDto(rental);
  }

  async getHistory(userId: string) {
    const rows = await this.rentalsRepository.findRentalHistoryByUser(userId);
    return rows.map(toRentalHistoryDto);
  }

  async getLiveFleetRentals() {
    const rows = await this.rentalsRepository.findAllActiveFleetRentals();
    return rows.map(toLiveFleetRentalDto);
  }

  async reserveVehicle(userId: string, dto: HoldVehicleDto) {
    const policy = await this.rentalsRepository.getPolicyConfig();
    return this.rentalsRepository.runTransaction(async (tx) => {
      const existing = await tx.vehicleRental.findFirst({
        where: { userId, status: { in: ['CONFIRMED', 'ACTIVE_TRIP'] } },
      });
      if (existing) {
        throw new ConflictException(
          'A student may hold only one active shared-vehicle reservation or trip at a time.',
        );
      }
      const vehicle = await this.rentalsRepository.findVehicleWithClient(
        tx,
        dto.vehicleId,
      );
      if (!vehicle) throw new NotFoundException('Selected vehicle was not found.');
      if (vehicle.status !== 'AVAILABLE') {
        throw new ConflictException(
          `Vehicle ${vehicle.code} is currently ${vehicle.status} and cannot be reserved.`,
        );
      }

      const hub = await this.rentalsRepository.findHubWithClient(
        tx,
        vehicle.hubId,
      );
      if (hub) {
        await tx.mobilityHub.update({
          where: { id: hub.id },
          data: { sharedEvsReady: Math.max(0, hub.sharedEvsReady - 1) },
        });
      }

      await tx.sharedVehicle.update({
        where: { id: vehicle.id },
        data: { status: 'RESERVED' },
      });

      const codeNum = Math.floor(10000 + Math.random() * 89999);
      const created = await tx.vehicleRental.create({
        data: {
          id: `rnt-${Date.now()}`,
          reservationCode: `RES-${codeNum}`,
          userId,
          vehicleId: vehicle.id,
          originHubId: vehicle.hubId,
          pickupDate: dto.pickupDate,
          pickupTime: dto.pickupTime,
          deadlineLabel: computeDeadlineLabel(
            dto.pickupTime,
            policy.gracePeriodMins,
          ),
          deadlineAt: new Date(
            Date.now() + policy.gracePeriodMins * 60 * 1000,
          ),
          status: 'CONFIRMED',
        },
      });

      return toHoldDto(created);
    });
  }

  async cancelHold(userId: string) {
    return this.rentalsRepository.runTransaction(async (tx) => {
      const rental = await tx.vehicleRental.findFirst({
        where: { userId, status: { in: ['CONFIRMED', 'EXPIRED'] } },
        orderBy: { createdAt: 'desc' },
      });
      if (!rental) return { ok: true };

      if (rental.status === 'CONFIRMED') {
        await this.rentalsRepository.releaseVehicleBackToHub(
          tx,
          rental.vehicleId,
          rental.originHubId,
        );
      }

      await tx.vehicleRental.update({
        where: { id: rental.id },
        data: { status: 'CANCELLED' },
      });
      return { ok: true };
    });
  }

  async expireHold(userId: string) {
    return this.rentalsRepository.runTransaction(async (tx) => {
      const rental = await tx.vehicleRental.findFirst({
        where: { userId, status: 'CONFIRMED' },
        orderBy: { createdAt: 'desc' },
      });
      if (!rental) return null;
      await this.rentalsRepository.releaseVehicleBackToHub(
        tx,
        rental.vehicleId,
        rental.originHubId,
      );
      const updated = await tx.vehicleRental.update({
        where: { id: rental.id },
        data: { status: 'EXPIRED' },
      });
      return toHoldDto(updated);
    });
  }

  async unlockVehicle(userId: string) {
    return this.rentalsRepository.runTransaction(async (tx) => {
      let rental = await tx.vehicleRental.findFirst({
        where: { userId, status: 'CONFIRMED' },
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!rental) {
        const fallback = await tx.sharedVehicle.findFirst({
          where: { status: 'AVAILABLE' },
        });
        if (!fallback) throw new NotFoundException('No available vehicle to unlock.');
        rental = await tx.vehicleRental.create({
          data: buildUnlockFallbackHoldData(userId, fallback.id, fallback.hubId),
          include: { vehicle: true },
        });
      }
      await this.gatePort.unlockSharedVehicle(rental.vehicle.code);
      await tx.sharedVehicle.update({
        where: { id: rental.vehicleId },
        data: { status: 'IN_USE' },
      });
      const updated = await tx.vehicleRental.update({
        where: { id: rental.id },
        data: {
          status: 'ACTIVE_TRIP',
          tripCode: `T-${Math.floor(2400 + Math.random() * 599)}`,
          startedAt: new Date().toISOString(),
          destinationHubId: 'hub-dorm-a',
        },
      });
      return toHoldDto(updated);
    });
  }

  async returnVehicle(userId: string, dto: ReturnVehicleDto) {
    const policy = await this.rentalsRepository.getPolicyConfig();

    return this.rentalsRepository.runTransaction(async (tx) => {
      const rental = await tx.vehicleRental.findFirst({
        where: { userId, status: { in: ['ACTIVE_TRIP', 'CONFIRMED'] } },
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!rental) {
        throw new NotFoundException('No active trip found to return.');
      }

      const destHub = await tx.mobilityHub.findUnique({
        where: { id: dto.destinationHubId },
      });
      if (!destHub) {
        throw new NotFoundException('Destination hub not found.');
      }

      const freeCore = destHub.coreBaysTotal - destHub.coreBaysOccupied;
      const freeBuffer = destHub.bufferBaysTotal - destHub.bufferBaysOccupied;
      if (freeCore + freeBuffer <= 0) {
        throw new BadRequestException(
          `${destHub.shortName} currently has 0 free bays. Choose an alternative hub or request field assistance.`,
        );
      }

      const nextBattery = Math.max(15, rental.vehicle.batterySoC - 10);
      const nextVehicleStatus =
        dto.hasFault || nextBattery < policy.minDispatchSoC
          ? 'OUT_OF_SERVICE'
          : 'AVAILABLE';

      const metrics = computeTripReturnMetrics({
        startedAt: rental.startedAt,
        fallbackUpdatedAt: rental.updatedAt,
        ratePerMinVnd: rental.vehicle.ratePerMinVnd,
      });

      const updated = await this.rentalsRepository.persistTripReturn(tx, {
        rental,
        destHub,
        dto,
        nextBattery,
        nextVehicleStatus,
        metrics,
      });

      return toHoldDto(updated);
    });
  }
}
