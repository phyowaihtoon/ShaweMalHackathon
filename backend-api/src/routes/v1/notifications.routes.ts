import { Router } from 'express';

import { listNotificationsController, markNotificationReadController } from '../../controllers/notification.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { notificationIdParamValidator } from '../../validators/notification.validator';

const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get('/', asyncHandler(listNotificationsController));
notificationsRouter.patch('/:id/read', notificationIdParamValidator, validateMiddleware, asyncHandler(markNotificationReadController));

export { notificationsRouter };
