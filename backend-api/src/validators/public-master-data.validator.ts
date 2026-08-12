import { param } from 'express-validator';

import { publicMasterDataEntities } from '../services/public-master-data.service';

export const publicMasterDataEntityParamValidator = [
  param('entity').isIn([...publicMasterDataEntities]).withMessage('Unsupported master-data entity.')
];

export const publicMasterDataListValidator = [...publicMasterDataEntityParamValidator];
