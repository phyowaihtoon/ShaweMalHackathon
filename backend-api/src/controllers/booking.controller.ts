import { Request, Response } from 'express';

import { listUserBookings, updateBookingStatus } from '../services/booking.service';
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
