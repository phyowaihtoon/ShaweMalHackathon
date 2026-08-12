import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';
import { upsertAgentProfile, type AgentProfileInput } from './agent.service';
import { upsertDriverProfile, type DriverProfileInput } from './driver.service';
import { addUserRole } from './user.service';

export type { AgentProfileInput, DriverProfileInput };

const notifyRegistrationSubmitted = async (userId: string, roleLabel: string) => {
  await prisma.notification.create({
    data: {
      userId,
      title: `${roleLabel} Registration Submitted`,
      message: `Your ${roleLabel.toLowerCase()} registration has been submitted and is pending admin verification.`
    }
  });
};

export const registerAgent = async (userId: string, input: AgentProfileInput) => {
  const existingProfile = await prisma.agentProfile.findUnique({
    where: { userId },
    select: { id: true }
  });

  if (existingProfile) {
    throw new ApiError(409, 'AGENT_ALREADY_REGISTERED', 'Agent registration already exists for this user.');
  }

  await addUserRole(userId, 'agent');

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: 'PENDING'
    }
  });

  const profile = await upsertAgentProfile(userId, input);
  await notifyRegistrationSubmitted(userId, 'Agent');

  return profile;
};

export const registerDriver = async (userId: string, input: DriverProfileInput) => {
  const existingProfile = await prisma.driverProfile.findUnique({
    where: { userId },
    select: { id: true }
  });

  if (existingProfile) {
    throw new ApiError(409, 'DRIVER_ALREADY_REGISTERED', 'Driver registration already exists for this user.');
  }

  await addUserRole(userId, 'driver');

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: 'PENDING'
    }
  });

  const profile = await upsertDriverProfile(userId, input);
  await notifyRegistrationSubmitted(userId, 'Driver');

  return profile;
};
