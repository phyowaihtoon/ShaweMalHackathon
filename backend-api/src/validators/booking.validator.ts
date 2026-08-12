import { body, param } from 'express-validator';

export const bookingIdParamValidator = [param('id').trim().notEmpty().withMessage('Booking id is required.')];

export const bookingStatusUpdateValidator = [
  ...bookingIdParamValidator,
  body('status')
    .isIn(['CONFIRMED', 'CANCELLED'])
    .withMessage('status must be CONFIRMED or CANCELLED.')
];
