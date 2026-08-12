import { Router } from 'express';

import {
  createMasterDataController,
  deleteMasterDataController,
  getMasterDataByIdController,
  listMasterDataController,
  updateMasterDataController
} from '../../controllers/master-data.controller';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import {
  masterDataCreateValidator,
  masterDataGetValidator,
  masterDataListValidator,
  masterDataUpdateValidator
} from '../../validators/master-data.validator';

const masterDataRouter = Router();

masterDataRouter.use(requireAuth, requireAdmin);

masterDataRouter.get('/:entity', masterDataListValidator, validateMiddleware, asyncHandler(listMasterDataController));
masterDataRouter.get('/:entity/:id', masterDataGetValidator, validateMiddleware, asyncHandler(getMasterDataByIdController));
masterDataRouter.post('/:entity', masterDataCreateValidator, validateMiddleware, asyncHandler(createMasterDataController));
masterDataRouter.patch('/:entity/:id', masterDataUpdateValidator, validateMiddleware, asyncHandler(updateMasterDataController));
masterDataRouter.delete('/:entity/:id', masterDataGetValidator, validateMiddleware, asyncHandler(deleteMasterDataController));

export { masterDataRouter };
