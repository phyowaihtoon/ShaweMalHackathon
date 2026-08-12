import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { sendError } from '../utils/api-response';

export const validateMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  const errors = result.array().map((item) => ({
    field: item.type === 'field' ? item.path : undefined,
    msg: item.msg,
    location: item.type === 'field' ? item.location : 'unknown',
    value: item.type === 'field' ? item.value : undefined
  }));

  sendError(res, 400, 'Validation failed', errors);
};
