import { VerificationStatus } from '@prisma/client';

import { ApiError } from '../utils/api-error';
import { hashPassword } from '../utils/password';
import { writeAuditLog } from './audit.service';
import { createUserWithDefaultRole, getUserById, replaceUserRoles, updateUserVerificationStatus } from './user.service';

interface AdminCreateUserInput {
  actorUserId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'normal' | 'agent' | 'driver' | 'admin';
}

interface UpdateRolesInput {
  actorUserId: string;
  userId: string;
  roles: Array<'normal' | 'agent' | 'driver' | 'admin'>;
}

interface UpdateVerificationInput {
  actorUserId: string;
  userId: string;
  role: 'agent' | 'driver';
  status: 'pending' | 'approve' | 'reject';
}

const hasRole = (roles: string[], target: string): boolean => {
  return roles.includes(target);
};

const normalizeVerificationStatus = (status: UpdateVerificationInput['status']): VerificationStatus => {
  if (status === 'approve') {
    return 'VERIFIED';
  }

  if (status === 'reject') {
    return 'REJECTED';
  }

  return 'PENDING';
};

export const adminCreateUser = async (input: AdminCreateUserInput) => {
  const passwordHash = await hashPassword(input.password);

  const user = await createUserWithDefaultRole({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    roles: [input.role]
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: 'ADMIN_USER_CREATED',
    targetType: 'User',
    targetId: user.id,
    metadata: {
      role: input.role
    }
  });

  return user;
};

export const adminUpdateUserRoles = async (input: UpdateRolesInput) => {
  const targetUser = await getUserById(input.userId);
  if (!targetUser) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  const updated = await replaceUserRoles(input.userId, input.roles);

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: 'ADMIN_ROLE_UPDATED',
    targetType: 'User',
    targetId: input.userId,
    metadata: {
      roles: input.roles
    }
  });

  return updated;
};

export const adminUpdateVerification = async (input: UpdateVerificationInput) => {
  const targetUser = await getUserById(input.userId);
  if (!targetUser) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  const targetRoles = targetUser.userRoles.map((item) => item.role.name);
  if (!hasRole(targetRoles, input.role)) {
    throw new ApiError(400, 'USER_ROLE_MISMATCH', `Target user does not have ${input.role} role.`);
  }

  const verificationStatus = normalizeVerificationStatus(input.status);

  const updated = await updateUserVerificationStatus(input.userId, verificationStatus);

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: `ADMIN_${input.role.toUpperCase()}_VERIFICATION_UPDATED`,
    targetType: 'User',
    targetId: input.userId,
    metadata: {
      role: input.role,
      verificationStatus
    }
  });

  return updated;
};
