import { Router } from 'express';

import { healthController, healthDbController } from '../../controllers/health.controller';
import { asyncHandler } from '../../utils/async-handler';

const healthRouter = Router();

healthRouter.get('/', healthController);
healthRouter.get('/db', asyncHandler(healthDbController));

export { healthRouter };
