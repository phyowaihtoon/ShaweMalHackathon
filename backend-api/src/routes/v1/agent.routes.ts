import { Router } from 'express';

import {
  createAgentHouseController,
  deleteAgentHouseController,
  listAgentBookingsController,
  listAgentHousesController,
  updateAgentHouseController,
  upsertAgentProfileController
} from '../../controllers/agent.controller';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import {
  agentHouseCreateValidator,
  agentHouseIdParamValidator,
  agentHouseUpdateValidator,
  agentProfileUpsertValidator
} from '../../validators/agent.validator';

const agentRouter = Router();

agentRouter.use(requireAuth, requireRole(['agent']));
agentRouter.post('/profile', agentProfileUpsertValidator, validateMiddleware, asyncHandler(upsertAgentProfileController));
agentRouter.post('/houses', agentHouseCreateValidator, validateMiddleware, asyncHandler(createAgentHouseController));
agentRouter.get('/houses', asyncHandler(listAgentHousesController));
agentRouter.get('/bookings', asyncHandler(listAgentBookingsController));
agentRouter.patch('/houses/:id', agentHouseUpdateValidator, validateMiddleware, asyncHandler(updateAgentHouseController));
agentRouter.delete('/houses/:id', agentHouseIdParamValidator, validateMiddleware, asyncHandler(deleteAgentHouseController));

export { agentRouter };
