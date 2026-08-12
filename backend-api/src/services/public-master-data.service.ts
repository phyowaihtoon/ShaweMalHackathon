import { masterDataEntities, type MasterDataEntity } from '../services/master-data.service';

export const publicMasterDataEntities = masterDataEntities.filter(
  (entity): entity is Exclude<MasterDataEntity, 'roles'> => entity !== 'roles'
);

export type PublicMasterDataEntity = (typeof publicMasterDataEntities)[number];
