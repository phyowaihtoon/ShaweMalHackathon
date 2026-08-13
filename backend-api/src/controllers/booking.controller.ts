import { Request, Response } from 'express';
import { BookingStatus } from '@prisma/client';

import {
  getBookingById,
  listAdminBookings,
  listUserBookings,
  updateBookingStatus
} from '../services/booking.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireActor = (req: Request): { userId: string; roles: string[] } => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return {
    userId: req.auth.userId,
    roles: req.auth.roles
  };
};

export const listBookingsController = async (req: Request, res: Response): Promise<void> => {
  const { userId } = requireActor(req);
  const bookings = await listUserBookings(userId);
  sendSuccess(res, 200, 'Bookings fetched successfully', { items: bookings });
};

export const getBookingController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);
  const booking = await getBookingById(String(req.params.id ?? ''), actor.userId, actor.roles);
  sendSuccess(res, 200, 'Booking fetched successfully', { booking });
};

export const updateBookingStatusController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);
  const booking = await updateBookingStatus({
    bookingId: String(req.params.id ?? ''),
    actorUserId: actor.userId,
    actorRoles: actor.roles,
    status: req.body.status
  });

  sendSuccess(res, 200, 'Booking status updated successfully', { booking });
};

export const adminHouseBookingReportController = async (req: Request, res: Response): Promise<void> => {
  const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;
  const statusValue = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
  const status =
    statusValue === 'PENDING' || statusValue === 'CONFIRMED' || statusValue === 'CANCELLED'
      ? (statusValue as BookingStatus)
      : undefined;

  const items = await listAdminBookings({
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    status,
    houseId: typeof req.query.houseId === 'string' && req.query.houseId.trim() ? req.query.houseId.trim() : undefined,
    agentId: typeof req.query.agentId === 'string' && req.query.agentId.trim() ? req.query.agentId.trim() : undefined,
    userId: typeof req.query.userId === 'string' && req.query.userId.trim() ? req.query.userId.trim() : undefined
  });

  sendSuccess(res, 200, 'House booking report fetched successfully', { items });
};
