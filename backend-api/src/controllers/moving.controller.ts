import { Request, Response } from 'express';

import { createMovingRequest, getMovingRequestById, listMyMovingRequests, quoteMovingRequest } from '../services/moving.service';
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

const parseOptionalCoordinate = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseInventoryItems = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item: unknown) => {
    const inventoryItem = item as { inventoryItemTypeId?: unknown; count?: unknown };
    return {
      inventoryItemTypeId: String(inventoryItem.inventoryItemTypeId),
      count: Number(inventoryItem.count)
    };
  });
};

export const quoteMovingRequestController = async (req: Request, res: Response): Promise<void> => {
  requireActor(req);

  const quote = await quoteMovingRequest({
    pickupAddress: String(req.body.pickupAddress),
    dropoffAddress: String(req.body.dropoffAddress),
    pickupLatitude: parseOptionalCoordinate(req.body.pickupLatitude),
    pickupLongitude: parseOptionalCoordinate(req.body.pickupLongitude),
    dropoffLatitude: parseOptionalCoordinate(req.body.dropoffLatitude),
    dropoffLongitude: parseOptionalCoordinate(req.body.dropoffLongitude),
    pickupFloorLevelId: String(req.body.pickupFloorLevelId),
    dropoffFloorLevelId: String(req.body.dropoffFloorLevelId),
    vehicleTypeId: req.body.vehicleTypeId ? String(req.body.vehicleTypeId) : undefined,
    inventoryItems: parseInventoryItems(req.body.inventoryItems)
  });

  sendSuccess(res, 200, 'Moving quote calculated successfully', { quote });
};

export const createMovingRequestController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);

  const movingRequest = await createMovingRequest(actor.userId, {
    pickupAddress: String(req.body.pickupAddress),
    dropoffAddress: String(req.body.dropoffAddress),
    pickupLatitude: parseOptionalCoordinate(req.body.pickupLatitude),
    pickupLongitude: parseOptionalCoordinate(req.body.pickupLongitude),
    dropoffLatitude: parseOptionalCoordinate(req.body.dropoffLatitude),
    dropoffLongitude: parseOptionalCoordinate(req.body.dropoffLongitude),
    pickupFloorLevelId: String(req.body.pickupFloorLevelId),
    dropoffFloorLevelId: String(req.body.dropoffFloorLevelId),
    moveInDate: new Date(String(req.body.moveInDate)),
    vehicleTypeId: String(req.body.vehicleTypeId),
    remarks: req.body.remarks ? String(req.body.remarks) : undefined,
    damageChecklist: req.body.damageChecklist ? String(req.body.damageChecklist) : undefined,
    photos: Array.isArray(req.body.photos) ? req.body.photos.map((item: unknown) => String(item)) : [],
    inventoryItems: parseInventoryItems(req.body.inventoryItems)
  });

  sendSuccess(res, 201, 'Moving request created successfully', { movingRequest });
};

export const listMyMovingRequestsController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);
  const items = await listMyMovingRequests(actor.userId);

  sendSuccess(res, 200, 'Moving requests fetched successfully', { items });
};

export const getMovingRequestController = async (req: Request, res: Response): Promise<void> => {
  const actor = requireActor(req);
  const requestId = String(req.params.id ?? '');

  const movingRequest = await getMovingRequestById(requestId, actor);
  sendSuccess(res, 200, 'Moving request fetched successfully', { movingRequest });
};
