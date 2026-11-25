import type {
  IChargingStationControllerPort,
  INotificationPort,
} from '../../infrastructure/adapters/hardware.ports';
import type { IncidentsRepository } from './incidents.repository';
import { IncidentsService } from './incidents.service';

describe('IncidentsService', () => {
  it('cuts power safely, isolates charging point, and interrupts active student sessions', async () => {
    const mockTx = {
      incident: {
        update: jest.fn().mockResolvedValue({
          id: 'inc-104',
          status: 'ISOLATED',
          assignedCrew: 'Đinh Phạm Ngọc Phước',
        }),
      },
      chargingPoint: {
        findUnique: jest.fn().mockResolvedValue({ id: 'cp-b04', code: 'CP-B04' }),
        update: jest.fn(),
      },
      parkingChargingSession: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'pcs-1', userId: 'usr-sv-01', bayCode: 'BAY-A04' },
        ]),
        update: jest.fn(),
      },
    };

    const repo = {
      findById: jest.fn().mockResolvedValue({
        id: 'inc-104',
        hubId: 'hub-dorm-b',
        resourceId: 'cp-b04',
        resourceCode: 'CP-B04 (DC 30kW Fast Charger)',
        telemetryReading: 'ERR_GROUND_FAULT · 38.4 mA',
        assignedCrew: 'Đinh Phạm Ngọc Phước',
      }),
      runTransaction: jest.fn((fn) => fn(mockTx as never)),
    } as unknown as jest.Mocked<IncidentsRepository>;

    const chargingController: jest.Mocked<IChargingStationControllerPort> = {
      cutPowerSafety: jest.fn().mockResolvedValue(undefined),
      lockPort: jest.fn(),
      setChargingCurrentLimit: jest.fn(),
    };
    const notificationPort: jest.Mocked<INotificationPort> = {
      sendUserAlert: jest.fn().mockResolvedValue(undefined),
    };

    const service = new IncidentsService(
      repo,
      chargingController,
      notificationPort,
    );

    const updated = await service.isolateEquipment('inc-104', {
      assignedCrew: 'Đinh Phạm Ngọc Phước',
    });

    expect(updated.status).toBe('ISOLATED');
    expect(chargingController.cutPowerSafety).toHaveBeenCalledWith(
      'CP-B04 (DC 30kW Fast Charger)',
      'ERR_GROUND_FAULT · 38.4 mA',
    );
    expect(mockTx.chargingPoint.update).toHaveBeenCalledWith({
      where: { id: 'cp-b04' },
      data: { status: 'ISOLATED', currentPowerKw: 0 },
    });
    expect(mockTx.parkingChargingSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pcs-1' },
        data: expect.objectContaining({ chargingStatus: 'INTERRUPTED' }),
      }),
    );
    expect(notificationPort.sendUserAlert).toHaveBeenCalledWith(
      'usr-sv-01',
      expect.any(String),
      expect.stringContaining('BAY-A04'),
    );
  });
});
