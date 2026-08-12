import crypto from 'crypto';

import { prisma } from '../prisma/client';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const REFRESH_TTL_DEFAULT_DAYS = 7;
const REFRESH_TTL_REMEMBER_ME_DAYS = 30;

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const nextExpiry = (rememberMe: boolean): Date => {
  const ttlDays = rememberMe ? REFRESH_TTL_REMEMBER_ME_DAYS : REFRESH_TTL_DEFAULT_DAYS;
  return new Date(Date.now() + ttlDays * ONE_DAY_MS);
};

export const createRefreshSession = async (userId: string, rememberMe: boolean) => {
  const token = crypto.randomUUID();
  const tokenHash = hashToken(token);

  const session = await prisma.refreshSession.create({
    data: {
      userId,
      rememberMe,
      tokenHash,
      expiresAt: nextExpiry(rememberMe)
    }
  });

  return {
    session,
    refreshToken: token
  };
};

export const getValidRefreshSessionByToken = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);

  return prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      }
    }
  });
};

export const revokeRefreshSession = async (sessionId: string, replacedById?: string) => {
  return prisma.refreshSession.update({
    where: { id: sessionId },
    data: {
      revokedAt: new Date(),
      replacedById
    }
  });
};

export const revokeAllUserSessions = async (userId: string) => {
  return prisma.refreshSession.updateMany({
    where: {
      userId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

export const isSessionUsable = (session: {
  revokedAt: Date | null;
  expiresAt: Date;
}): boolean => {
  return session.revokedAt === null && session.expiresAt.getTime() > Date.now();
};
