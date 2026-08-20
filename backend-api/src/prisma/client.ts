import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

import { env } from '../config/env';
import { toPrismaPgConfig } from '../config/database';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pool =
  globalForPrisma.pgPool ??
  new Pool(toPrismaPgConfig(env.databaseUrl, env.databaseTarget));

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});

globalForPrisma.pgPool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
