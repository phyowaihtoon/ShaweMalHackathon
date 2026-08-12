import { Request, Response } from 'express';
import { ReviewTargetType } from '@prisma/client';

import { createReview, listReviews } from '../services/review.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

const parseTargetType = (value: unknown): ReviewTargetType | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const upper = value.toUpperCase();
  if (upper === 'AGENT' || upper === 'DRIVER') {
    return upper as ReviewTargetType;
  }

  return undefined;
};

export const createReviewController = async (req: Request, res: Response): Promise<void> => {
  const reviewerUserId = requireActor(req);

  const item = await createReview({
    reviewerUserId,
    targetType: parseTargetType(req.body.targetType) as ReviewTargetType,
    targetUserId: req.body.targetUserId,
    rating: Number(req.body.rating),
    comment: req.body.comment
  });

  sendSuccess(res, 201, 'Review submitted successfully', { item });
};

export const listReviewsController = async (req: Request, res: Response): Promise<void> => {
  const payload = await listReviews({
    targetType: parseTargetType(req.query.targetType) as ReviewTargetType,
    targetUserId: String(req.query.targetUserId ?? '')
  });

  sendSuccess(res, 200, 'Reviews fetched successfully', payload);
};
