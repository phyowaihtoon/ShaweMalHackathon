import { Router } from 'express';

import { addWishlistController, listWishlistController, removeWishlistController } from '../../controllers/wishlist.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { wishlistHouseParamValidator } from '../../validators/wishlist.validator';

const wishlistRouter = Router();

wishlistRouter.use(requireAuth);
wishlistRouter.post('/:houseId', wishlistHouseParamValidator, validateMiddleware, asyncHandler(addWishlistController));
wishlistRouter.delete('/:houseId', wishlistHouseParamValidator, validateMiddleware, asyncHandler(removeWishlistController));
wishlistRouter.get('/', asyncHandler(listWishlistController));

export { wishlistRouter };
