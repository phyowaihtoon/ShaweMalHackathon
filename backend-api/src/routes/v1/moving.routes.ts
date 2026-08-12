import { Router } from 'express';

import { createMovingRequestController, getMovingRequestController } from '../../controllers/moving.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { movingRequestCreateValidator, movingRequestIdParamValidator } from '../../validators/moving.validator';

const movingRouter = Router();

movingRouter.use(requireAuth);
movingRouter.post('/requests', movingRequestCreateValidator, validateMiddleware, asyncHandler(createMovingRequestController));
movingRouter.get('/requests/:id', movingRequestIdParamValidator, validateMiddleware, asyncHandler(getMovingRequestController));

export { movingRouter };
