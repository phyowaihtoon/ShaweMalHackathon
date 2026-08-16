import { Request, Response } from 'express';
import { VerificationStatus } from '@prisma/client';

import { getAdminOverviewReport } from '../services/admin-report.service';
import {
  adminCreateUser,
  adminUpdateUserRoles,
  adminUpdateVerification,
  getAdminAgentRegistration,
  getAdminDriverRegistration,
  listAdminAgentRegistrations,
  listAdminDriverRegistrations
} from '../services/admin.service';
import { assignMovingRequestByAdmin } from '../services/moving.service';
import { toSafeUser } from '../services/user.service';
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

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseListStatus = (value: unknown): VerificationStatus | 'all' | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'ALL') {
    return 'all';
  }

  if (normalized === 'PENDING' || normalized === 'VERIFIED' || normalized === 'REJECTED') {
    return normalized;
  }

  return undefined;
};

const parseListQuery = (req: Request) => ({
  status: parseListStatus(req.query.status),
  q: typeof req.query.q === 'string' ? req.query.q : undefined,
  page: parsePositiveInt(req.query.page, 1),
  pageSize: Math.min(parsePositiveInt(req.query.pageSize, 20), 50)
});

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
    status: req.body.status,
    rejectionReason: req.body.rejectionReason
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
    status: req.body.status,
    rejectionReason: req.body.rejectionReason
  });

  sendSuccess(res, 200, 'Driver verification updated successfully', { user: toSafeUser(user) });
};

export const adminListAgentRegistrationsController = async (req: Request, res: Response): Promise<void> => {
  const payload = await listAdminAgentRegistrations(parseListQuery(req));
  sendSuccess(res, 200, 'Agent registrations fetched successfully', payload);
};

export const adminListDriverRegistrationsController = async (req: Request, res: Response): Promise<void> => {
  const payload = await listAdminDriverRegistrations(parseListQuery(req));
  sendSuccess(res, 200, 'Driver registrations fetched successfully', payload);
};

export const adminGetAgentRegistrationController = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId ?? '');
  const result = await getAdminAgentRegistration(userId);
  sendSuccess(res, 200, 'Agent registration fetched successfully', result);
};

export const adminGetDriverRegistrationController = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId ?? '');
  const result = await getAdminDriverRegistration(userId);
  sendSuccess(res, 200, 'Driver registration fetched successfully', result);
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
