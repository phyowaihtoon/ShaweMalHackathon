import { Request, Response } from 'express';

import { addToWishlist, listWishlist, removeFromWishlist } from '../services/wishlist.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

export const addWishlistController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);
  const houseId = String(req.params.houseId ?? '');

  const item = await addToWishlist(userId, houseId);
  sendSuccess(res, 201, 'Added to wishlist', { item });
};

export const removeWishlistController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);
  const houseId = String(req.params.houseId ?? '');

  await removeFromWishlist(userId, houseId);
  sendSuccess(res, 200, 'Removed from wishlist', { ok: true });
};

export const listWishlistController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);

  const items = await listWishlist(userId);
  sendSuccess(res, 200, 'Wishlist fetched successfully', { items });
};
