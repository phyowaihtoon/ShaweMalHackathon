import { Request, Response } from 'express';

import { changePassword } from '../services/auth.service';
import { getMyProfile, getMyProfileHistory, updateMyProfile } from '../services/profile.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const hasPrismaCode = (error: unknown, code: string): boolean => {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === code;
};

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

export const getMyProfileController = async (req: Request, res: Response): Promise<void> => {
  const user = await getMyProfile(requireActor(req));
  sendSuccess(res, 200, 'Profile fetched successfully', { user });
};

export const updateMyProfileController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);

  try {
    const user = await updateMyProfile(userId, {
      name: req.body.name,
      phone: req.body.phone,
      profilePicturePath: req.body.profilePicturePath
    });

    sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    if (hasPrismaCode(error, 'P2002')) {
      throw new ApiError(409, 'PROFILE_PHONE_EXISTS', 'Phone number is already in use.');
    }

    throw error;
  }
};

export const getMyProfileHistoryController = async (req: Request, res: Response): Promise<void> => {
  const history = await getMyProfileHistory(requireActor(req));
  sendSuccess(res, 200, 'Profile history fetched successfully', history);
};

export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  await changePassword({
    userId: requireActor(req),
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  });

  sendSuccess(res, 200, 'Password changed successfully', { ok: true });
};
