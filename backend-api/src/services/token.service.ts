import { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { signJwt } from '../utils/jwt';

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export const generateAccessToken = (payload: TokenPayload, rememberMe: boolean): string => {
  const expiresIn: SignOptions['expiresIn'] = rememberMe
    ? '30d'
    : (env.jwtExpiresIn as SignOptions['expiresIn']);

  return signJwt(
    {
      sub: payload.userId,
      email: payload.email,
      roles: payload.roles
    },
    expiresIn
  );
};
