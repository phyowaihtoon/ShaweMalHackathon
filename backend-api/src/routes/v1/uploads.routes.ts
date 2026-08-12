import { Router } from 'express';

import { uploadFilesController } from '../../controllers/upload.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { uploadFilesMiddleware } from '../../middleware/upload.middleware';
import { asyncHandler } from '../../utils/async-handler';

const uploadsRouter = Router();

uploadsRouter.post('/', requireAuth, uploadFilesMiddleware, asyncHandler(uploadFilesController));

export { uploadsRouter };
