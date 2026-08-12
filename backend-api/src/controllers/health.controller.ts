import { Request, Response } from 'express';

import { sendSuccess } from '../utils/api-response';

export const healthController = (_req: Request, res: Response): void => {
  sendSuccess(res, 200, 'Service is healthy', {
    status: 'ok',
    timestamp: new Date().toISOString()
  });
};
