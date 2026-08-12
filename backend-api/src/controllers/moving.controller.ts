import { Request, Response } from 'express';

import { createMovingRequest, getMovingRequestById } from '../services/moving.service';
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

export const createMovingRequestController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);

  const movingRequest = await createMovingRequest(actor.userId, {
    pickupAddress: String(req.body.pickupAddress),
    dropoffAddress: String(req.body.dropoffAddress),
    moveInDate: new Date(String(req.body.moveInDate)),
    vehicleTypeId: String(req.body.vehicleTypeId),
    remarks: req.body.remarks ? String(req.body.remarks) : undefined,
    damageChecklist: req.body.damageChecklist ? String(req.body.damageChecklist) : undefined,
    photos: Array.isArray(req.body.photos) ? req.body.photos.map((item: unknown) => String(item)) : [],
    inventoryItems: Array.isArray(req.body.inventoryItems)
      ? req.body.inventoryItems.map((item: unknown) => {
          const inventoryItem = item as { category?: unknown; itemName?: unknown; count?: unknown };
          return {
            category: String(inventoryItem.category),
            itemName: String(inventoryItem.itemName),
            count: Number(inventoryItem.count)
          };
        })
      : []
  });

  sendSuccess(res, 201, 'Moving request created successfully', { movingRequest });
};

export const getMovingRequestController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);
  const requestId = String(req.params.id ?? '');

  const movingRequest = await getMovingRequestById(requestId, actor);
  sendSuccess(res, 200, 'Moving request fetched successfully', { movingRequest });
};
