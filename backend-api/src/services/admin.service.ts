import { VerificationStatus } from '@prisma/client';

import { prisma } from '../prisma/client';
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

export const getAdminAgentRegistration = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: true } },
      agentProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  if (!user.agentProfile) {
    throw new ApiError(404, 'AGENT_PROFILE_NOT_FOUND', 'Agent registration profile was not found for this user.');
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      verificationStatus: user.verificationStatus,
      roles: user.userRoles.map((item) => item.role.name)
    },
    profile: {
      id: user.agentProfile.id,
      name: user.agentProfile.name,
      nrc: user.agentProfile.nrc,
      nrcFrontPhotoPath: user.agentProfile.nrcFrontPhotoPath,
      nrcBackPhotoPath: user.agentProfile.nrcBackPhotoPath,
      email: user.agentProfile.email,
      phone: user.agentProfile.phone,
      address1: user.agentProfile.address1,
      address2: user.agentProfile.address2,
      cityId: user.agentProfile.cityId,
      stateId: user.agentProfile.stateId,
      serviceRegionId: user.agentProfile.serviceRegionId,
      hasRentingExperience: user.agentProfile.hasRentingExperience
    }
  };
};

export const getAdminDriverRegistration = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: true } },
      driverProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  if (!user.driverProfile) {
    throw new ApiError(404, 'DRIVER_PROFILE_NOT_FOUND', 'Driver registration profile was not found for this user.');
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      verificationStatus: user.verificationStatus,
      roles: user.userRoles.map((item) => item.role.name)
    },
    profile: {
      id: user.driverProfile.id,
      name: user.driverProfile.name,
      companyName: user.driverProfile.companyName,
      nrc: user.driverProfile.nrc,
      nrcFrontPhotoPath: user.driverProfile.nrcFrontPhotoPath,
      nrcBackPhotoPath: user.driverProfile.nrcBackPhotoPath,
      drivingLicensePhotoPath: user.driverProfile.drivingLicensePhotoPath,
      profilePhotoPath: user.driverProfile.profilePhotoPath,
      phone: user.driverProfile.phone,
      currentAddress: user.driverProfile.currentAddress,
      vehicleTypeId: user.driverProfile.vehicleTypeId,
      vehicleLicensePlateNumber: user.driverProfile.vehicleLicensePlateNumber,
      vehiclePhotoPath: user.driverProfile.vehiclePhotoPath,
      wheelTaxPhotoPath: user.driverProfile.wheelTaxPhotoPath
    }
  };
};
