import { Request, Response } from 'express';

import { listMasterData } from '../services/master-data.service';
import { publicMasterDataEntities, type PublicMasterDataEntity } from '../services/public-master-data.service';
import { sendSuccess } from '../utils/api-response';

const isPublicMasterDataEntity = (value: string): value is PublicMasterDataEntity => {
  return (publicMasterDataEntities as readonly string[]).includes(value);
};

export const listPublicMasterDataController = async (req: Request, res: Response): Promise<void> => {
  const entity = String(req.params.entity ?? '');

  if (!isPublicMasterDataEntity(entity)) {
    sendSuccess(res, 200, 'Master data fetched successfully', { items: [] });
    return;
  }

  const items = await listMasterData(entity, { isActive: true });
  sendSuccess(res, 200, 'Master data fetched successfully', { items });
};
