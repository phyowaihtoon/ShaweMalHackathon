import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/api-error';
import { verifyJwt } from '../utils/jwt';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.header('authorization');

  if (!authHeader) {
    next(new ApiError(401, 'AUTH_REQUIRED', 'Authorization header is required.'));
    return;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    next(new ApiError(401, 'AUTH_INVALID_HEADER', 'Authorization header must use Bearer token.'));
    return;
  }

  const decoded = verifyJwt(token);
  req.auth = {
    userId: decoded.sub,
    email: decoded.email,
    roles: decoded.roles
  };

  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.'));
      return;
    }

    const hasRole = req.auth.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      next(new ApiError(403, 'AUTH_FORBIDDEN', 'You are not allowed to access this resource.'));
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);

export const authMiddleware = requireAuth;
