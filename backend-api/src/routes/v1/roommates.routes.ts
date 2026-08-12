import { Router } from 'express';

import { createRoommateController, listRoommatesController } from '../../controllers/roommate.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { createRoommateValidator, listRoommatesValidator } from '../../validators/roommate.validator';

const roommatesRouter = Router();

roommatesRouter.get('/', listRoommatesValidator, validateMiddleware, asyncHandler(listRoommatesController));
roommatesRouter.post('/', requireAuth, createRoommateValidator, validateMiddleware, asyncHandler(createRoommateController));

export { roommatesRouter };
