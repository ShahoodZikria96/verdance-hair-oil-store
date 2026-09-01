import { PrismaClient } from '@prisma/client';
import { isProd } from '../config/env';

/**
 * Single shared Prisma client. A global is used in development so hot-reload
 * does not exhaust the connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
