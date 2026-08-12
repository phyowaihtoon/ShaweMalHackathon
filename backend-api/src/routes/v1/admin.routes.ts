import { Router } from 'express';

import {
  adminAssignMovingRequestController,
  adminCreateUserController,
  adminReportsOverviewController,
  adminUpdateAgentVerificationController,
  adminUpdateDriverVerificationController,
  adminUpdateUserRolesController
} from '../../controllers/admin.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import {
  adminAssignMovingRequestValidator,
  adminCreateUserValidator,
  adminUpdateRolesValidator,
  adminVerificationValidator
} from '../../validators/admin.validator';

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.post('/users', adminCreateUserValidator, validateMiddleware, asyncHandler(adminCreateUserController));
adminRouter.patch('/users/:id/roles', adminUpdateRolesValidator, validateMiddleware, asyncHandler(adminUpdateUserRolesController));
adminRouter.patch(
  '/agents/:userId/verification',
  adminVerificationValidator,
  validateMiddleware,
  asyncHandler(adminUpdateAgentVerificationController)
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

export { adminRouter };
