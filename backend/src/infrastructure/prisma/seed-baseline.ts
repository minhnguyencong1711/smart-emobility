import type { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import {
  SEED_CHARGING_POINTS,
  SEED_HUBS,
  SEED_INCIDENTS,
  SEED_USERS,
  SEED_VEHICLES,
} from './seed-data';

export async function seedBaselineData(
  prisma: PrismaClient,
  options: { resetRuntimeRecords?: boolean } = {},
) {
  const { resetRuntimeRecords = false } = options;

  await prisma.systemPolicy.upsert({
    where: { id: 1 },
    update: {
      gracePeriodMins: 15,
      gridWarningThreshold: 85,
      gridCriticalThreshold: 90,
      baySaturationThreshold: 85,
      minDispatchSoC: 20,
    },
    create: {
      id: 1,
      gracePeriodMins: 15,
      gridWarningThreshold: 85,
      gridCriticalThreshold: 90,
      baySaturationThreshold: 85,
      minDispatchSoC: 20,
    },
  });

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.rawPassword, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        initials: user.initials,
        role: user.role,
        title: user.title,
        failedAttempts: 0,
        lockedUntil: null,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash,
        fullName: user.fullName,
        initials: user.initials,
        role: user.role,
        title: user.title,
      },
    });
  }

  if (resetRuntimeRecords) {
    await prisma.vehicleRental.deleteMany({});
    await prisma.parkingChargingSession.deleteMany({});
    await prisma.incident.deleteMany({});
  }

  for (const hub of SEED_HUBS) {
    await prisma.mobilityHub.upsert({
      where: { id: hub.id },
      update: hub,
      create: hub,
    });
  }

  for (const vehicle of SEED_VEHICLES) {
    await prisma.sharedVehicle.upsert({
      where: { id: vehicle.id },
      update: vehicle,
      create: vehicle,
    });
  }

  for (const cp of SEED_CHARGING_POINTS) {
    await prisma.chargingPoint.upsert({
      where: { id: cp.id },
      update: cp,
      create: cp,
    });
  }

  for (const inc of SEED_INCIDENTS) {
    await prisma.incident.upsert({
      where: { id: inc.id },
      update: inc,
      create: inc,
    });
  }

  await prisma.vehicleRental.upsert({
    where: { id: 'rental-seed-2394' },
    update: {},
    create: {
      id: 'rental-seed-2394',
      reservationCode: 'RES-2394',
      tripCode: 'T-2394',
      userId: 'usr-sv-01',
      vehicleId: 'veh-105',
      originHubId: 'hub-suoi-tien',
      destinationHubId: 'hub-hcmut-2',
      pickupDate: '24 Oct 2026',
      pickupTime: '08:15 AM',
      deadlineLabel: '08:30 AM',
      deadlineAt: new Date(Date.now() - 3600_000),
      status: 'RETURNED',
      startedAt: '08:15 AM',
      endedAt: '08:34 AM',
      durationMins: 19,
      distanceKm: 5.2,
      fareVnd: 16000,
      rewardPoints: 16,
      hasFault: false,
    },
  });

  await prisma.parkingChargingSession.upsert({
    where: { reservationId: 'PRK-2026-041' },
    update: resetRuntimeRecords
      ? {
          hubId: 'hub-suoi-tien',
          bayCode: 'BAY-A04',
          floor: 1,
          parkingStatus: 'CHECKED_IN',
          checkedIn: true,
          chargingPortId: 'cp-a01',
          chargingPortCode: 'CP-A01',
          connectorType: 'TYPE_2',
          chargingStatus: 'CHARGING',
          socPercent: 64,
          targetSocPercent: 90,
          currentKw: 11,
          energyDeliveredKwh: 8.4,
          chargingElapsedMins: 42,
          interruptionReason: null,
        }
      : {},
    create: {
      id: 'pcs-seed-041',
      reservationId: 'PRK-2026-041',
      userId: 'usr-sv-01',
      hubId: 'hub-suoi-tien',
      bayCode: 'BAY-A04',
      floor: 1,
      vehicleModel: 'VinFast Feliz',
      plateNumber: '51H-228.08',
      arrivalDate: 'Wed. Oct 08, 2024',
      arrivalTime: '16:30',
      durationHours: 3,
      ePassCode: 'EPASS-VNU-ST01',
      pinCode: '482-910',
      parkingStatus: 'CHECKED_IN',
      checkedIn: true,
      chargingPortId: 'cp-a01',
      chargingPortCode: 'CP-A01',
      connectorType: 'TYPE_2',
      chargingStatus: 'CHARGING',
      socPercent: 64,
      targetSocPercent: 90,
      currentKw: 11,
      energyDeliveredKwh: 8.4,
      chargingElapsedMins: 42,
    },
  });
}
