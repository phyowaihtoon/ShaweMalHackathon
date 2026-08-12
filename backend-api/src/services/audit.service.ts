import { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';

interface AuditInput {
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

export const writeAuditLog = async (input: AuditInput) => {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata
    }
  });
};
