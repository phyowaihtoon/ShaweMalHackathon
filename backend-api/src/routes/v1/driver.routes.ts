import { Router } from 'express';

import {
  acceptDriverRequestController,
  addDriverRequestEtaController,
  listAvailableDriverRequestsController,
  rejectDriverRequestController,
  updateDriverRequestStatusController,
  upsertDriverProfileController
} from '../../controllers/driver.controller';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import {
  driverProfileUpsertValidator,
  driverRequestEtaValidator,
  driverRequestIdValidator,
  driverRequestRejectValidator,
  driverRequestStatusValidator
} from '../../validators/driver.validator';

const driverRouter = Router();

driverRouter.use(requireAuth, requireRole(['driver']));
driverRouter.post('/profile', driverProfileUpsertValidator, validateMiddleware, asyncHandler(upsertDriverProfileController));
driverRouter.get('/requests/available', asyncHandler(listAvailableDriverRequestsController));
driverRouter.post('/requests/:id/accept', driverRequestIdValidator, validateMiddleware, asyncHandler(acceptDriverRequestController));
driverRouter.post('/requests/:id/reject', driverRequestRejectValidator, validateMiddleware, asyncHandler(rejectDriverRequestController));
driverRouter.post('/requests/:id/eta', driverRequestEtaValidator, validateMiddleware, asyncHandler(addDriverRequestEtaController));
driverRouter.post('/requests/:id/status', driverRequestStatusValidator, validateMiddleware, asyncHandler(updateDriverRequestStatusController));

export { driverRouter };
