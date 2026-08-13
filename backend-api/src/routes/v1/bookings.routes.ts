import { Router } from 'express';

import {
  getBookingController,
  listBookingsController,
  updateBookingStatusController
} from '../../controllers/booking.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { bookingIdParamValidator, bookingStatusUpdateValidator } from '../../validators/booking.validator';

const bookingsRouter = Router();

bookingsRouter.use(requireAuth);
bookingsRouter.get('/', asyncHandler(listBookingsController));
bookingsRouter.get('/:id', bookingIdParamValidator, validateMiddleware, asyncHandler(getBookingController));
bookingsRouter.patch(
  '/:id/status',
  bookingStatusUpdateValidator,
  validateMiddleware,
  asyncHandler(updateBookingStatusController)
);

export { bookingsRouter };
