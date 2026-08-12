import { Router } from 'express';

import {
	loginController,
	logoutController,
	meController,
	refreshController,
	registerController,
	verifyController
} from '../../controllers/auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { loginValidator, logoutValidator, refreshValidator, registerValidator } from '../../validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', registerValidator, validateMiddleware, asyncHandler(registerController));
authRouter.post('/login', loginValidator, validateMiddleware, asyncHandler(loginController));
authRouter.post('/refresh', refreshValidator, validateMiddleware, asyncHandler(refreshController));
authRouter.post('/logout', logoutValidator, validateMiddleware, asyncHandler(logoutController));
authRouter.get('/me', requireAuth, asyncHandler(meController));
authRouter.get('/verify', requireAuth, asyncHandler(verifyController));

export { authRouter };
