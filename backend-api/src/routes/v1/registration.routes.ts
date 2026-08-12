import { Router } from 'express';

import {
  registerAgentController,
  registerDriverController
} from '../../controllers/registration.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { agentProfileUpsertValidator } from '../../validators/agent.validator';
import { driverProfileUpsertValidator } from '../../validators/driver.validator';

const registrationRouter = Router();

registrationRouter.use(requireAuth);
registrationRouter.post(
  '/agent',
  agentProfileUpsertValidator,
  validateMiddleware,
  asyncHandler(registerAgentController)
);
registrationRouter.post(
  '/driver',
  driverProfileUpsertValidator,
  validateMiddleware,
  asyncHandler(registerDriverController)
);

export { registrationRouter };
