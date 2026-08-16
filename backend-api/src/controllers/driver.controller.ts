import { MovingRequestStatus } from '@prisma/client';
import { Request, Response } from 'express';

import { upsertDriverProfile } from '../services/driver.service';
import {
  acceptMovingRequest,
  addMovingEta,
  listAvailableMovingRequestsForDriver,
  rejectMovingRequest,
  updateMovingStatus
} from '../services/moving.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireDriverId = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

const parseDriverStatus = (
  value: string
):
  | 'DRIVER_COMING'
  | 'DRIVER_ARRIVED'
  | 'LOADING'
  | 'ON_THE_WAY'
  | 'UNLOADING'
  | 'COMPLETED'
  | 'CANCELLED' => {
  const normalized = value.toLowerCase();

  if (normalized === 'driver_coming') {
    return MovingRequestStatus.DRIVER_COMING;
  }

  if (normalized === 'driver_arrived') {
    return MovingRequestStatus.DRIVER_ARRIVED;
  }

  if (normalized === 'loading') {
    return MovingRequestStatus.LOADING;
  }

  if (normalized === 'on_the_way') {
    return MovingRequestStatus.ON_THE_WAY;
  }

  if (normalized === 'unloading') {
    return MovingRequestStatus.UNLOADING;
  }

  if (normalized === 'completed') {
    return MovingRequestStatus.COMPLETED;
  }

  return MovingRequestStatus.CANCELLED;
};

export const upsertDriverProfileController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireDriverId(req);

  const profile = await upsertDriverProfile(userId, {
    name: String(req.body.name),
    companyName: req.body.companyName ? String(req.body.companyName) : undefined,
    nrc: String(req.body.nrc),
    nrcFrontPhotoPath: String(req.body.nrcFrontPhotoPath),
    nrcBackPhotoPath: String(req.body.nrcBackPhotoPath),
    drivingLicensePhotoPath: String(req.body.drivingLicensePhotoPath),
    profilePhotoPath: String(req.body.profilePhotoPath),
    phone: String(req.body.phone),
    currentAddress: String(req.body.currentAddress),
    vehicleTypeId: String(req.body.vehicleTypeId),
    vehicleLicensePlateNumber: String(req.body.vehicleLicensePlateNumber),
    vehiclePhotoPath: String(req.body.vehiclePhotoPath),
    wheelTaxPhotoPath: String(req.body.wheelTaxPhotoPath)
  });

  sendSuccess(res, 200, 'Driver profile saved successfully', { profile });
};

export const listAvailableDriverRequestsController = async (req: Request, res: Response): Promise<void> => {
  const driverUserId = requireDriverId(req);
  const items = await listAvailableMovingRequestsForDriver(driverUserId);

  sendSuccess(res, 200, 'Available moving requests fetched successfully', { items });
};

export const acceptDriverRequestController = async (req: Request, res: Response): Promise<void> => {
  const driverUserId = requireDriverId(req);
  const requestId = String(req.params.id ?? '');

  const movingRequest = await acceptMovingRequest(requestId, driverUserId);
  sendSuccess(res, 200, 'Moving request accepted successfully', { movingRequest });
};

export const rejectDriverRequestController = async (req: Request, res: Response): Promise<void> => {
  const driverUserId = requireDriverId(req);
  const requestId = String(req.params.id ?? '');

  await rejectMovingRequest({
    movingRequestId: requestId,
    driverUserId,
    notes: req.body.notes ? String(req.body.notes) : undefined
  });

  sendSuccess(res, 200, 'Moving request rejected successfully', { ok: true });
};

export const addDriverRequestEtaController = async (req: Request, res: Response): Promise<void> => {
  const driverUserId = requireDriverId(req);
  const requestId = String(req.params.id ?? '');

  const etaEntry = await addMovingEta({
    movingRequestId: requestId,
    driverUserId,
    stage: String(req.body.stage),
    etaAt: new Date(String(req.body.etaAt)),
    notes: req.body.notes ? String(req.body.notes) : undefined
  });

  sendSuccess(res, 200, 'Moving ETA saved successfully', { etaEntry });
};

export const updateDriverRequestStatusController = async (req: Request, res: Response): Promise<void> => {
  const driverUserId = requireDriverId(req);
  const requestId = String(req.params.id ?? '');

  const movingRequest = await updateMovingStatus({
    movingRequestId: requestId,
    driverUserId,
    status: parseDriverStatus(String(req.body.status)),
    notes: req.body.notes ? String(req.body.notes) : undefined
  });

  sendSuccess(res, 200, 'Moving request status updated successfully', { movingRequest });
};
