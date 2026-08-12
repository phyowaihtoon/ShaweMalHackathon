import { param } from 'express-validator';

export const notificationIdParamValidator = [param('id').trim().notEmpty().withMessage('Notification id is required.')];
