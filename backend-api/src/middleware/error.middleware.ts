import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/api-error';
import { sendError } from '../utils/api-response';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message, err.details ? { code: err.code, details: err.details } : { code: err.code });
    return;
  }

  const error = err as Error;
  const exposeMessage = process.env.NODE_ENV !== 'production';

  sendError(res, 500, 'Internal server error', {
    code: 'INTERNAL_SERVER_ERROR',
    details: exposeMessage ? error.message : undefined
  });
};
