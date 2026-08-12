import { Router } from 'express';

import { getHomePageController } from '../../controllers/home.controller';
import { asyncHandler } from '../../utils/async-handler';

const homeRouter = Router();

homeRouter.get('/', asyncHandler(getHomePageController));

export { homeRouter };
