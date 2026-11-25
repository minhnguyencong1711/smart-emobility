import { ConflictException } from '@nestjs/common';

import type { IBarrierGatePort } from '../../infrastructure/adapters/hardware.ports';
import { RentalsRepository } from './rentals.repository';
import { RentalsService } from './rentals.service';

describe('RentalsService', () => {
  let mockTx: {
    vehicleRental: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    sharedVehicle: { update: jest.Mock };
    mobilityHub: { findUnique: jest.Mock; update: jest.Mock };
    incident: { create: jest.Mock };
  };
  let repo: jest.Mocked<RentalsRepository>;
  let gatePort: jest.Mocked<IBarrierGatePort>;
  let service: RentalsService;

  beforeEach(() => {
    mockTx = {
      vehicleRental: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      sharedVehicle: { update: jest.fn() },
      mobilityHub: { findUnique: jest.fn(), update: jest.fn() },
      incident: { create: jest.fn() },
    };

    repo = {
      runTransaction: jest.fn((fn) => fn(mockTx as never)),
      findActiveRentalByUser: jest.fn(),
      findRentalHistoryByUser: jest.fn(),
      getPolicyConfig: jest.fn().mockResolvedValue({
        id: 1,
        gracePeriodMins: 20,
        gridWarningThreshold: 85,
        gridCriticalThreshold: 90,
        baySaturationThreshold: 85,
        minDispatchSoC: 20,
      }),
      findVehicleWithClient: jest.fn(),
      findHubWithClient: jest.fn(),
      updateVehicleStatus: jest.fn(),
      releaseVehicleBackToHub: jest.fn(),
      persistTripReturn: jest.fn((tx, params) =>
        RentalsRepository.prototype.persistTripReturn(tx, params),
      ),
    } as unknown as jest.Mocked<RentalsRepository>;

    gatePort = {
      openGate: jest.fn(),
      unlockSharedVehicle: jest.fn(),
    };

    service = new RentalsService(repo, gatePort);
  });

  it('rejects reservation if student already holds an active vehicle', async () => {
    mockTx.vehicleRental.findFirst.mockResolvedValue({
      id: 'rnt-1',
      status: 'CONFIRMED',
    });

    await expect(
      service.reserveVehicle('usr-sv-01', {
        vehicleId: 'veh-102',
        pickupDate: '24 Oct 2026',
        pickupTime: '10:30 AM',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('creates hold using configured gracePeriodMins from SystemPolicy', async () => {
    mockTx.vehicleRental.findFirst.mockResolvedValue(null);
    repo.findVehicleWithClient.mockResolvedValue({
      id: 'veh-102',
      code: 'EV-102',
      hubId: 'hub-hcmut-2',
      status: 'AVAILABLE',
    } as never);
    repo.findHubWithClient.mockResolvedValue({
      id: 'hub-hcmut-2',
      sharedEvsReady: 2,
    } as never);
    mockTx.vehicleRental.create.mockResolvedValue({
      reservationCode: 'RES-12345',
      vehicleId: 'veh-102',
      originHubId: 'hub-hcmut-2',
      pickupDate: '24 Oct 2026',
      pickupTime: '10:30 AM',
      deadlineLabel: '10:50 AM',
      deadlineAt: new Date(Date.now() + 20 * 60 * 1000),
      status: 'CONFIRMED',
      hasFault: false,
    });

    const res = await service.reserveVehicle('usr-sv-01', {
      vehicleId: 'veh-102',
      pickupDate: '24 Oct 2026',
      pickupTime: '10:30 AM',
    });

    expect(res.deadlineLabel).toBe('10:50 AM');
    expect(mockTx.sharedVehicle.update).toHaveBeenCalledWith({
      where: { id: 'veh-102' },
      data: { status: 'RESERVED' },
    });
  });

  it('marks vehicle OUT_OF_SERVICE and creates M3 incident when returned with fault', async () => {
    mockTx.vehicleRental.findFirst.mockResolvedValue({
      id: 'rnt-active',
      reservationCode: 'RES-90001',
      tripCode: 'T-2408',
      vehicleId: 'veh-102',
      originHubId: 'hub-hcmut-2',
      pickupDate: '24 Oct 2026',
      pickupTime: '10:30 AM',
      deadlineLabel: '10:50 AM',
      deadlineAt: new Date(),
      status: 'ACTIVE_TRIP',
      vehicle: {
        id: 'veh-102',
        code: 'EV-102',
        model: 'VinFast Klara S Campus E-Bike',
        batterySoC: 92,
      },
    });
    mockTx.mobilityHub.findUnique.mockResolvedValue({
      id: 'hub-dorm-a',
      shortName: 'Dormitory Zone A',
      coreBaysTotal: 80,
      coreBaysOccupied: 69,
      bufferBaysTotal: 15,
      bufferBaysOccupied: 13,
    });
    mockTx.vehicleRental.update.mockResolvedValue({
      reservationCode: 'RES-90001',
      tripCode: 'T-2408',
      vehicleId: 'veh-102',
      originHubId: 'hub-hcmut-2',
      destinationHubId: 'hub-dorm-a',
      pickupDate: '24 Oct 2026',
      pickupTime: '10:30 AM',
      deadlineLabel: '10:50 AM',
      deadlineAt: new Date(),
      status: 'RETURNED',
      hasFault: true,
    });

    const out = await service.returnVehicle('usr-sv-01', {
      destinationHubId: 'hub-dorm-a',
      hasFault: true,
      remarks: 'Loose rear brake lever',
    });

    expect(out.hasFault).toBe(true);
    expect(mockTx.sharedVehicle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'OUT_OF_SERVICE' }),
      }),
    );
    expect(mockTx.incident.create).toHaveBeenCalledTimes(1);
  });
});
