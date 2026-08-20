import { Request, Response } from 'express';

import { prisma } from '../prisma/client';
import { sendError, sendSuccess } from '../utils/api-response';

export const healthController = (_req: Request, res: Response): void => {
  sendSuccess(res, 200, 'Service is healthy', {
    status: 'ok',
    timestamp: new Date().toISOString()
  });
};

export const healthDbController = async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, 200, 'Database is reachable', {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('Database health check failed', error);
    sendError(res, 503, 'Database is unreachable', {
      code: 'DATABASE_UNAVAILABLE',
      details: message
    });
  }
};
