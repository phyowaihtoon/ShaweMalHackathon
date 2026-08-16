import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';
import { toMyReview } from './review.service';

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  profilePicturePath?: string | null;
}

const toSafeProfile = (user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicturePath: string | null;
  verificationStatus: string;
  userRoles: Array<{ role: { name: string } }>;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profilePicturePath: user.profilePicturePath,
  verificationStatus: user.verificationStatus,
  roles: user.userRoles.map((item) => item.role.name)
});

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  return toSafeProfile(user);
};

export const updateMyProfile = async (userId: string, input: UpdateProfileInput) => {
  const data: {
    name?: string;
    phone?: string;
    profilePicturePath?: string | null;
  } = {};

  if (typeof input.name === 'string') {
    data.name = input.name;
  }

  if (typeof input.phone === 'string') {
    data.phone = input.phone;
  }

  if (input.profilePicturePath !== undefined) {
    data.profilePicturePath = input.profilePicturePath;
  }

  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data,
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  return toSafeProfile(user);
};

export const getMyProfileHistory = async (userId: string) => {
  const [bookingHistory, movingHistory, unreadNotificationCount, totalNotificationCount, recentNotifications] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId
      },
      include: {
        house: {
          select: {
            id: true,
            title: true,
            availability: true,
            agentId: true,
            city: {
              select: {
                id: true,
                name: true
              }
            },
            state: {
              select: {
                id: true,
                name: true
              }
            },
            agent: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        ratingReview: {
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewerUserId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.movingRequest.findMany({
      where: {
        requesterUserId: userId
      },
      include: {
        vehicleType: {
          select: {
            id: true,
            name: true
          }
        },
        assignedDriver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        ratingReview: {
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewerUserId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    }),
    prisma.notification.count({
      where: {
        userId
      }
    }),
    prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
  ]);

  return {
    bookingHistory: bookingHistory.map((booking) => {
      const { ratingReview, ...rest } = booking;
      return {
        ...rest,
        myReview: toMyReview(ratingReview, userId)
      };
    }),
    movingHistory: movingHistory.map((item) => {
      const { ratingReview, ...rest } = item;
      return {
        ...rest,
        myReview: toMyReview(ratingReview, userId)
      };
    }),
    notifications: {
      total: totalNotificationCount,
      unread: unreadNotificationCount,
      recent: recentNotifications
    }
  };
};
