import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

export const listMyNotifications = async (userId: string) => {
  const items = await prisma.notification.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  });

  return {
    items,
    unreadCount
  };
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId
    },
    data: {
      isRead: true
    }
  });

  if (result.count === 0) {
    throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.');
  }

  const item = await prisma.notification.findUnique({
    where: {
      id: notificationId
    }
  });

  if (!item) {
    throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.');
  }

  return item;
};
