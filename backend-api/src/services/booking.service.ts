import { BookingStatus } from '@prisma/client';

import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

interface UpdateBookingStatusInput {
  bookingId: string;
  actorUserId: string;
  actorRoles: string[];
  status: 'CONFIRMED' | 'CANCELLED';
}

export const updateBookingStatus = async (input: UpdateBookingStatusInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: {
      house: {
        select: {
          id: true,
          title: true,
          agentId: true
        }
      },
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  }

  const isOwner = booking.userId === input.actorUserId;
  const isAgentOwner = booking.house.agentId === input.actorUserId;
  const isAdmin = input.actorRoles.includes('admin');

  if (!isOwner && !isAgentOwner && !isAdmin) {
    throw new ApiError(403, 'BOOKING_FORBIDDEN', 'You are not allowed to update this booking.');
  }

  if (booking.status !== BookingStatus.PENDING && input.status === BookingStatus.CONFIRMED) {
    throw new ApiError(400, 'BOOKING_INVALID_TRANSITION', 'Only pending bookings can be confirmed.');
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, 'BOOKING_ALREADY_CANCELLED', 'Booking is already cancelled.');
  }

  const updated = await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      status: input.status
    }
  });

  const notifyUserId = input.status === BookingStatus.CANCELLED ? booking.userId : booking.userId;
  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      title: input.status === BookingStatus.CONFIRMED ? 'Booking Confirmed' : 'Booking Cancelled',
      message:
        input.status === BookingStatus.CONFIRMED
          ? `Your booking for "${booking.house.title}" has been confirmed.`
          : `Your booking for "${booking.house.title}" has been cancelled.`
    }
  });

  return updated;
};

export const listUserBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      house: {
        select: {
          id: true,
          title: true,
          monthlyFees: true,
          city: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};
