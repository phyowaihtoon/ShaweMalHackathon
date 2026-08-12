import { Request, Response } from 'express';

import { registerAgent, registerDriver } from '../services/registration.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

export const registerAgentController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);
  const profile = await registerAgent(userId, req.body);
  sendSuccess(res, 201, 'Agent registration submitted successfully', { profile });
};

export const registerDriverController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);
  const profile = await registerDriver(userId, req.body);
  sendSuccess(res, 201, 'Driver registration submitted successfully', { profile });
};
