import { Prisma, ReviewTargetType } from '@prisma/client';

import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

interface CreateReviewInput {
  reviewerUserId: string;
  targetType: ReviewTargetType;
  targetUserId: string;
  rating: number;
  comment?: string;
}

interface ListReviewsInput {
  targetType: ReviewTargetType;
  targetUserId: string;
}

const mapReview = (
  item: Prisma.RatingReviewGetPayload<{
    include: {
      reviewer: {
        select: {
          id: true;
          name: true;
          profilePicturePath: true;
        };
      };
    };
  }>
) => ({
  id: item.id,
  targetType: item.targetType,
  targetUserId: item.targetUserId,
  rating: item.rating,
  comment: item.comment,
  reviewer: item.reviewer,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const ensureTargetUserValidForType = async (targetType: ReviewTargetType, targetUserId: string): Promise<void> => {
  const targetUser = await prisma.user.findUnique({
    where: {
      id: targetUserId
    },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!targetUser) {
    throw new ApiError(404, 'REVIEW_TARGET_NOT_FOUND', 'Review target user not found.');
  }

  const expectedRole = targetType === 'AGENT' ? 'agent' : 'driver';
  const hasExpectedRole = targetUser.userRoles.some((item) => item.role.name === expectedRole);

  if (!hasExpectedRole) {
    throw new ApiError(400, 'REVIEW_TARGET_ROLE_MISMATCH', `Target user is not a ${expectedRole}.`);
  }
};

export const createReview = async (input: CreateReviewInput) => {
  if (input.reviewerUserId === input.targetUserId) {
    throw new ApiError(400, 'REVIEW_SELF_NOT_ALLOWED', 'You cannot rate or review yourself.');
  }

  await ensureTargetUserValidForType(input.targetType, input.targetUserId);

  const created = await prisma.ratingReview.create({
    data: {
      reviewerUserId: input.reviewerUserId,
      targetType: input.targetType,
      targetUserId: input.targetUserId,
      rating: input.rating,
      comment: input.comment
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profilePicturePath: true
        }
      }
    }
  });

  return mapReview(created);
};

export const listReviews = async (input: ListReviewsInput) => {
  const [items, stats] = await Promise.all([
    prisma.ratingReview.findMany({
      where: {
        targetType: input.targetType,
        targetUserId: input.targetUserId
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            profilePicturePath: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.ratingReview.aggregate({
      where: {
        targetType: input.targetType,
        targetUserId: input.targetUserId
      },
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    })
  ]);

  return {
    items: items.map(mapReview),
    summary: {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count._all
    }
  };
};
