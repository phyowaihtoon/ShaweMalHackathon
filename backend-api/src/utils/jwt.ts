import jwt, { Algorithm, JwtPayload, SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { ApiError } from './api-error';

export interface AuthJwtPayload extends JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

const JWT_ALLOWLIST: Algorithm[] = ['HS256', 'HS384', 'HS512'];

if (!JWT_ALLOWLIST.includes(env.jwtAlgorithm)) {
  throw new Error(`JWT algorithm is not in allowlist: ${env.jwtAlgorithm}`);
}

export const signJwt = (
  payload: Pick<AuthJwtPayload, 'sub' | 'email' | 'roles'>,
  expiresIn: SignOptions['expiresIn']
): string => {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: env.jwtAlgorithm as Algorithm,
    expiresIn
  });
};

export const verifyJwt = (token: string): AuthJwtPayload => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: JWT_ALLOWLIST
    });

    if (typeof decoded === 'string') {
      throw new ApiError(401, 'AUTH_INVALID_TOKEN', 'Invalid token payload.');
    }

    if (!decoded.sub || typeof decoded.email !== 'string' || !Array.isArray(decoded.roles)) {
      throw new ApiError(401, 'AUTH_INVALID_TOKEN', 'Invalid token claims.');
    }

    const rolesAreStrings = decoded.roles.every((role) => typeof role === 'string');
    if (!rolesAreStrings) {
      throw new ApiError(401, 'AUTH_INVALID_TOKEN', 'Invalid token claims.');
    }

    return decoded as unknown as AuthJwtPayload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, 'AUTH_INVALID_TOKEN', 'Token is invalid or expired.');
  }
};
