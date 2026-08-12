import { Request, Response } from 'express';

import {
  MasterDataEntity,
  createMasterData,
  getMasterDataById,
  listMasterData,
  softDeleteMasterData,
  updateMasterData
} from '../services/master-data.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const hasPrismaCode = (error: unknown, code: string): boolean => {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === code;
};

const resolveEntity = (value: string): MasterDataEntity => {
  return value as MasterDataEntity;
};

const parseOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new ApiError(400, 'VALIDATION_FAILED', 'isActive query must be true or false.');
};

export const listMasterDataController = async (req: Request, res: Response): Promise<void> => {
  const entity = resolveEntity(String(req.params.entity ?? ''));
  const items = await listMasterData(entity, {
    isActive: parseOptionalBoolean(req.query.isActive)
  });

  sendSuccess(res, 200, 'Master data list', { items });
};

export const getMasterDataByIdController = async (req: Request, res: Response): Promise<void> => {
  const entity = resolveEntity(String(req.params.entity ?? ''));
  const item = await getMasterDataById(entity, String(req.params.id ?? ''));

  if (!item) {
    throw new ApiError(404, 'MASTER_DATA_NOT_FOUND', 'Master data record not found.');
  }

  sendSuccess(res, 200, 'Master data detail', { item });
};

export const createMasterDataController = async (req: Request, res: Response): Promise<void> => {
  const entity = resolveEntity(String(req.params.entity ?? ''));

  try {
    const item = await createMasterData(entity, req.body);

    sendSuccess(res, 201, 'Master data created successfully', { item });
  } catch (error) {
    if (hasPrismaCode(error, 'P2002')) {
      throw new ApiError(409, 'MASTER_DATA_DUPLICATE', 'Master data with the same unique field already exists.');
    }

    throw error;
  }
};

export const updateMasterDataController = async (req: Request, res: Response): Promise<void> => {
  const entity = resolveEntity(String(req.params.entity ?? ''));

  try {
    const item = await updateMasterData(entity, String(req.params.id ?? ''), req.body);

    sendSuccess(res, 200, 'Master data updated successfully', { item });
  } catch (error) {
    if (hasPrismaCode(error, 'P2025')) {
      throw new ApiError(404, 'MASTER_DATA_NOT_FOUND', 'Master data record not found.');
    }

    if (hasPrismaCode(error, 'P2002')) {
      throw new ApiError(409, 'MASTER_DATA_DUPLICATE', 'Master data with the same unique field already exists.');
    }

    throw error;
  }
};

export const deleteMasterDataController = async (req: Request, res: Response): Promise<void> => {
  const entity = resolveEntity(String(req.params.entity ?? ''));

  try {
    const item = await softDeleteMasterData(entity, String(req.params.id ?? ''));

    sendSuccess(res, 200, 'Master data deactivated successfully', { item });
  } catch (error) {
    if (hasPrismaCode(error, 'P2025')) {
      throw new ApiError(404, 'MASTER_DATA_NOT_FOUND', 'Master data record not found.');
    }

    throw error;
  }
};
