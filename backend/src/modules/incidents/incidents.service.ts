import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CHARGING_CONTROLLER_PORT,
  type IChargingStationControllerPort,
  type INotificationPort,
  NOTIFICATION_PORT,
} from '../../infrastructure/adapters/hardware.ports';
import type {
  IsolateIncidentDto,
  ListIncidentsQueryDto,
} from './dto/incidents.dto';
import { IncidentsRepository } from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly repo: IncidentsRepository,
    @Inject(CHARGING_CONTROLLER_PORT)
    private readonly chargingController: IChargingStationControllerPort,
    @Inject(NOTIFICATION_PORT)
    private readonly notificationPort: INotificationPort,
  ) {}

  listIncidents(query: ListIncidentsQueryDto) {
    return this.repo.findMany(query);
  }

  async isolateEquipment(id: string, dto: IsolateIncidentDto) {
    const incident = await this.repo.findById(id);
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found.`);
    }

    await this.chargingController.cutPowerSafety(
      incident.resourceCode,
      incident.telemetryReading,
    );

    const affectedSessions = await this.repo.runTransaction(async (tx) => {
      const updatedIncident = await tx.incident.update({
        where: { id },
        data: {
          status: 'ISOLATED',
          assignedCrew: dto.assignedCrew ?? incident.assignedCrew,
        },
      });

      const targetPort = await tx.chargingPoint.findUnique({
        where: { id: incident.resourceId },
      });
      if (targetPort) {
        await tx.chargingPoint.update({
          where: { id: targetPort.id },
          data: { status: 'ISOLATED', currentPowerKw: 0 },
        });
      }

      const activeSessions = await tx.parkingChargingSession.findMany({
        where: {
          parkingStatus: 'CHECKED_IN',
          chargingStatus: { in: ['CHARGING', 'THROTTLED'] },
          OR: [
            { chargingPortId: incident.resourceId },
            { hubId: incident.hubId },
          ],
        },
      });

      for (const s of activeSessions) {
        await tx.parkingChargingSession.update({
          where: { id: s.id },
          data: {
            chargingStatus: 'INTERRUPTED',
            currentKw: 0,
            interruptionReason: `${incident.resourceCode} remotely isolated by Operator due to safety fault (${incident.telemetryReading}). Your parking bay remains safely reserved.`,
          },
        });
      }

      return { updatedIncident, activeSessions };
    });

    for (const s of affectedSessions.activeSessions) {
      await this.notificationPort.sendUserAlert(
        s.userId,
        'Charging Interrupted (Safety Isolation)',
        `${incident.resourceCode} was isolated. Parking bay ${s.bayCode} remains reserved.`,
      );
    }

    return affectedSessions.updatedIncident;
  }
}
