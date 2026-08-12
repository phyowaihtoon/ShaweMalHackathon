import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/api-error';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, 'ROUTE_NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
};
