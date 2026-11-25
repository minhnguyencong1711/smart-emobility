import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { seedBaselineData } from '../src/infrastructure/prisma/seed-baseline';

const prisma = new PrismaClient();

async function main() {
  await seedBaselineData(prisma, { resetRuntimeRecords: false });
  console.log('Seeded Smart E-Mobility baseline data into PostgreSQL.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
