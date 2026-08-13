import { Router } from 'express';

import {
  adminAssignMovingRequestController,
  adminCreateUserController,
  adminGetAgentRegistrationController,
  adminGetDriverRegistrationController,
  adminReportsOverviewController,
  adminUpdateAgentVerificationController,
  adminUpdateDriverVerificationController,
  adminUpdateUserRolesController
} from '../../controllers/admin.controller';
import { adminHouseBookingReportController } from '../../controllers/booking.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import {
  adminAssignMovingRequestValidator,
  adminCreateUserValidator,
  adminHouseBookingReportValidator,
  adminRegistrationLookupValidator,
  adminUpdateRolesValidator,
  adminVerificationValidator
} from '../../validators/admin.validator';

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.post('/users', adminCreateUserValidator, validateMiddleware, asyncHandler(adminCreateUserController));
adminRouter.patch('/users/:id/roles', adminUpdateRolesValidator, validateMiddleware, asyncHandler(adminUpdateUserRolesController));
adminRouter.get(
  '/agents/:userId',
  adminRegistrationLookupValidator,
  validateMiddleware,
  asyncHandler(adminGetAgentRegistrationController)
);
adminRouter.patch(
  '/agents/:userId/verification',
  adminVerificationValidator,
  validateMiddleware,
  asyncHandler(adminUpdateAgentVerificationController)
);
adminRouter.get(
  '/drivers/:userId',
  adminRegistrationLookupValidator,
  validateMiddleware,
  asyncHandler(adminGetDriverRegistrationController)
);
adminRouter.patch(
  '/drivers/:userId/verification',
  adminVerificationValidator,
  validateMiddleware,
  asyncHandler(adminUpdateDriverVerificationController)
);
adminRouter.post(
  '/moving/requests/:id/assign',
  adminAssignMovingRequestValidator,
  validateMiddleware,
  asyncHandler(adminAssignMovingRequestController)
);
adminRouter.get('/reports/overview', asyncHandler(adminReportsOverviewController));
adminRouter.get(
  '/reports/bookings',
  adminHouseBookingReportValidator,
  validateMiddleware,
  asyncHandler(adminHouseBookingReportController)
);

export { adminRouter };
