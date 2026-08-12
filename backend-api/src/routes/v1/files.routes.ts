import { Router } from 'express';

import { getProtectedFileController } from '../../controllers/files.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';

const filesRouter = Router();

filesRouter.get('/:category/:filename', requireAuth, asyncHandler(getProtectedFileController));

export { filesRouter };
