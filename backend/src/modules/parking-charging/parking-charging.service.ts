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
import type {
  RecoverChargingDto,
  ReserveParkingDto,
  StartChargingDto,
} from './dto/parking-charging.dto';
import { getNominalKw, toSessionDto } from './parking-charging.mapper';
import { ParkingChargingRepository } from './parking-charging.repository';

@Injectable()
export class ParkingChargingService {
  constructor(
    private readonly repo: ParkingChargingRepository,
    @Inject(BARRIER_GATE_PORT) private readonly gatePort: IBarrierGatePort,
  ) {}

  listChargingPoints() {
    return this.repo.listChargingPoints();
  }

  async getActiveSession(userId: string) {
    const session = await this.repo.findLatestSessionByUser(userId);
    return session ? toSessionDto(session) : null;
  }

  async reserveBay(userId: string, dto: ReserveParkingDto) {
    return this.repo.runTransaction(async (tx) => {
      const active = await tx.parkingChargingSession.findFirst({
        where: { userId, parkingStatus: { in: ['RESERVED', 'CHECKED_IN'] } },
      });
      if (active) {
        throw new ConflictException(
          'You already hold an active parking reservation. Cancel or exit before booking another bay.',
        );
      }

      const hub = await tx.mobilityHub.findUnique({ where: { id: dto.hubId } });
      if (!hub) throw new NotFoundException('Selected hub was not found.');

      const freeCore = hub.coreBaysTotal - hub.coreBaysOccupied;
      const freeBuf = hub.bufferBaysTotal - hub.bufferBaysOccupied;
      if (freeCore + freeBuf <= 0) {
        throw new BadRequestException(
          `${hub.shortName} has reached full bay saturation (0 free bays).`,
        );
      }

      const incCore = freeCore > 0 ? 1 : 0;
      const incBuf = freeCore === 0 ? 1 : 0;
      await tx.mobilityHub.update({
        where: { id: hub.id },
        data: {
          coreBaysOccupied: hub.coreBaysOccupied + incCore,
          bufferBaysOccupied: hub.bufferBaysOccupied + incBuf,
        },
      });

      const created = await tx.parkingChargingSession.create({
        data: {
          id: `pcs-${Date.now()}`,
          reservationId: `PRK-2026-${Math.floor(100 + Math.random() * 899)}`,
          userId,
          hubId: dto.hubId,
          bayCode: `BAY-${dto.bayCode}`,
          floor: dto.floor,
          vehicleModel: dto.vehicleModel,
          plateNumber: dto.plateNumber,
          arrivalDate: dto.arrivalDate,
          arrivalTime: dto.arrivalTime,
          durationHours: dto.durationHours,
          ePassCode: `EPASS-VNU-${dto.bayCode}`,
          pinCode: '482-910',
          parkingStatus: 'RESERVED',
          checkedIn: false,
        },
      });

      return toSessionDto(created);
    });
  }

  async cancelActive(userId: string) {
    return this.repo.runTransaction(async (tx) => {
      const session = await tx.parkingChargingSession.findFirst({
        where: { userId, parkingStatus: { in: ['RESERVED', 'CHECKED_IN'] } },
        orderBy: { createdAt: 'desc' },
      });
      if (!session) return { ok: true };

      const hub = await tx.mobilityHub.findUnique({
        where: { id: session.hubId },
      });
      if (hub) {
        await tx.mobilityHub.update({
          where: { id: hub.id },
          data: { coreBaysOccupied: Math.max(0, hub.coreBaysOccupied - 1) },
        });
      }

      await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: { parkingStatus: 'CANCELLED', chargingStatus: 'CANCELLED' },
      });
      return { ok: true };
    });
  }

  async checkIn(userId: string) {
    const session = await this.repo.findActiveHoldByUser(userId);
    if (!session) {
      throw new NotFoundException('No active parking reservation to check in.');
    }
    await this.gatePort.openGate(session.hubId, session.ePassCode);

    return this.repo.runTransaction(async (tx) => {
      const updated = await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: { checkedIn: true, parkingStatus: 'CHECKED_IN' },
      });
      return toSessionDto(updated);
    });
  }

  async startCharging(userId: string, dto: StartChargingDto) {
    const session = await this.repo.findActiveHoldByUser(userId);
    if (!session) {
      throw new NotFoundException('No active parking session to attach.');
    }
    const port = await this.repo.findChargingPointById(dto.portId);
    if (port && (port.status === 'ISOLATED' || port.status === 'FAULTY')) {
      throw new ConflictException(
        `Charging port ${port.code} is ${port.status} and cannot start a session.`,
      );
    }

    const kw = getNominalKw(dto.connectorType);
    return this.repo.runTransaction(async (tx) => {
      const updated = await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: {
          checkedIn: true,
          parkingStatus: 'CHECKED_IN',
          chargingPortId: dto.portId,
          chargingPortCode: dto.portCode,
          connectorType: dto.connectorType,
          targetSocPercent: dto.targetSocPercent,
          chargingStatus: 'CHARGING',
          currentKw: kw,
          interruptionReason: null,
        },
      });
      return toSessionDto(updated);
    });
  }

  async tickProgress(userId: string) {
    const session = await this.repo.findActiveHoldByUser(userId);
    if (!session) return null;

    const nextSoc = Math.min(session.targetSocPercent, session.socPercent + 10);
    const done = nextSoc >= session.targetSocPercent;
    return this.repo.runTransaction(async (tx) => {
      const updated = await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: {
          socPercent: nextSoc,
          energyDeliveredKwh: +(session.energyDeliveredKwh + 1.45).toFixed(2),
          chargingElapsedMins: session.chargingElapsedMins + 12,
          chargingStatus: done ? 'CHARGING_COMPLETED' : session.chargingStatus,
          currentKw: done ? 0 : session.currentKw,
        },
      });
      return toSessionDto(updated);
    });
  }

  async recoverCharging(userId: string, dto: RecoverChargingDto) {
    const session = await this.repo.findActiveHoldByUser(userId);
    if (!session) {
      throw new NotFoundException('No active charging session found.');
    }
    return this.repo.runTransaction(async (tx) => {
      const updated = await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: {
          chargingStatus: 'CHARGING',
          currentKw: getNominalKw(session.connectorType),
          chargingPortCode:
            dto.mode === 'REASSIGN' && dto.newPortCode
              ? dto.newPortCode
              : session.chargingPortCode,
          interruptionReason: null,
        },
      });
      return toSessionDto(updated);
    });
  }

  async stopKeepParking(userId: string) {
    const session = await this.repo.findActiveHoldByUser(userId);
    if (!session) return null;
    return this.repo.runTransaction(async (tx) => {
      const updated = await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: { chargingStatus: 'CHARGING_COMPLETED', currentKw: 0 },
      });
      return toSessionDto(updated);
    });
  }

  async exitHubReleaseBay(userId: string) {
    const session = await this.repo.findActiveHoldByUser(userId);
    if (!session) return null;
    return this.repo.runTransaction(async (tx) => {
      const hub = await tx.mobilityHub.findUnique({
        where: { id: session.hubId },
      });
      if (hub) {
        await tx.mobilityHub.update({
          where: { id: hub.id },
          data: { coreBaysOccupied: Math.max(0, hub.coreBaysOccupied - 1) },
        });
      }
      const updated = await tx.parkingChargingSession.update({
        where: { id: session.id },
        data: {
          parkingStatus: 'EXITED',
          chargingStatus: 'CHARGING_COMPLETED',
          currentKw: 0,
        },
      });
      return toSessionDto(updated);
    });
  }
}
