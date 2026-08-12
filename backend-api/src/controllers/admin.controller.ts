import { Request, Response } from 'express';

import { getAdminOverviewReport } from '../services/admin-report.service';
import { adminCreateUser, adminUpdateUserRoles, adminUpdateVerification } from '../services/admin.service';
import { assignMovingRequestByAdmin } from '../services/moving.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const hasPrismaCode = (error: unknown, code: string): boolean => {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === code;
};

const toSafeUser = (user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  verificationStatus: string;
  userRoles: Array<{ role: { name: string } }>;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  verificationStatus: user.verificationStatus,
  roles: user.userRoles.map((item) => item.role.name)
});

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

export const adminCreateUserController = async (req: Request, res: Response): Promise<void> => {
  const actorUserId = requireActor(req);

  try {
    const user = await adminCreateUser({
      actorUserId,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role
    });

    sendSuccess(res, 201, 'User created successfully', { user: toSafeUser(user) });
  } catch (error) {
    if (hasPrismaCode(error, 'P2002')) {
      throw new ApiError(409, 'AUTH_DUPLICATE_FIELD', 'Email or phone already exists.');
    }

    throw error;
  }
};

export const adminUpdateUserRolesController = async (req: Request, res: Response): Promise<void> => {
  const actorUserId = requireActor(req);
  const userId = String(req.params.id ?? '');

  const user = await adminUpdateUserRoles({
    actorUserId,
    userId,
    roles: req.body.roles
  });

  sendSuccess(res, 200, 'User roles updated successfully', { user: toSafeUser(user) });
};

export const adminUpdateAgentVerificationController = async (req: Request, res: Response): Promise<void> => {
  const actorUserId = requireActor(req);
  const userId = String(req.params.userId ?? '');

  const user = await adminUpdateVerification({
    actorUserId,
    userId,
    role: 'agent',
    status: req.body.status
  });

  sendSuccess(res, 200, 'Agent verification updated successfully', { user: toSafeUser(user) });
};

export const adminUpdateDriverVerificationController = async (req: Request, res: Response): Promise<void> => {
  const actorUserId = requireActor(req);
  const userId = String(req.params.userId ?? '');

  const user = await adminUpdateVerification({
    actorUserId,
    userId,
    role: 'driver',
    status: req.body.status
  });

  sendSuccess(res, 200, 'Driver verification updated successfully', { user: toSafeUser(user) });
};

export const adminAssignMovingRequestController = async (req: Request, res: Response): Promise<void> => {
  const actorUserId = requireActor(req);
  const movingRequestId = String(req.params.id ?? '');

  const movingRequest = await assignMovingRequestByAdmin({
    movingRequestId,
    driverUserId: String(req.body.driverUserId),
    actorUserId
  });

  sendSuccess(res, 200, 'Moving request assigned successfully', { movingRequest });
};

export const adminReportsOverviewController = async (req: Request, res: Response): Promise<void> => {
  const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;

  const report = await getAdminOverviewReport({
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined
  });

  sendSuccess(res, 200, 'Admin overview report fetched successfully', report);
};
