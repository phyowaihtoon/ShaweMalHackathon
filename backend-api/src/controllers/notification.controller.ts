import { Request, Response } from 'express';

import { listMyNotifications, markNotificationAsRead } from '../services/notification.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

export const listNotificationsController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);

  const payload = await listMyNotifications(userId);
  sendSuccess(res, 200, 'Notifications fetched successfully', payload);
};

export const markNotificationReadController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);
  const notificationId = String(req.params.id ?? '');

  const item = await markNotificationAsRead(userId, notificationId);
  sendSuccess(res, 200, 'Notification marked as read', { item });
};
