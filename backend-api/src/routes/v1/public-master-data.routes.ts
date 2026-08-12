import { Router } from 'express';

import { listPublicMasterDataController } from '../../controllers/public-master-data.controller';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { publicMasterDataListValidator } from '../../validators/public-master-data.validator';

const publicMasterDataRouter = Router();

publicMasterDataRouter.get(
  '/:entity',
  publicMasterDataListValidator,
  validateMiddleware,
  asyncHandler(listPublicMasterDataController)
);

export { publicMasterDataRouter };
