import { ApiError } from '../utils/api-error';
import { prisma } from '../prisma/client';

export const masterDataEntities = [
  'property-types',
  'states',
  'cities',
  'contract-types',
  'vehicle-types',
  'service-regions',
  'floor-levels',
  'occupations',
  'amenities',
  'status-codes',
  'roles'
] as const;

export type MasterDataEntity = (typeof masterDataEntities)[number];

export interface MasterDataListOptions {
  isActive?: boolean;
}

export type MasterDataCreateInputMap = {
  'property-types': { name: string; description?: string; isActive?: boolean };
  states: { name: string; countryCode: string; isActive?: boolean };
  cities: { name: string; stateId: string; countryCode: string; postalCodePrefix?: string; isActive?: boolean };
  'contract-types': { name: string; durationMonths: number; description?: string; isActive?: boolean };
  'vehicle-types': { name: string; capacityLabel?: string; maxLoadKg?: number; description?: string; isActive?: boolean };
  'service-regions': { name: string; code: string; description?: string; isActive?: boolean };
  'floor-levels': { name: string; levelNumber?: number; description?: string; isActive?: boolean };
  occupations: { name: string; description?: string; isActive?: boolean };
  amenities: { name: string; category?: string; description?: string; isActive?: boolean };
  'status-codes': { entityType: string; code: string; label: string; color?: string; isActive?: boolean };
  roles: { name: string; code: string; description?: string; isActive?: boolean };
};

export type MasterDataUpdateInputMap = {
  [K in MasterDataEntity]: Partial<MasterDataCreateInputMap[K]>;
};

const withIsActiveFilter = (isActive?: boolean) => {
  return typeof isActive === 'boolean' ? { isActive } : {};
};

export const listMasterData = async <T extends MasterDataEntity>(
  entity: T,
  options: MasterDataListOptions
) => {
  const where = withIsActiveFilter(options.isActive);

  switch (entity) {
    case 'property-types':
      return prisma.propertyType.findMany({ where, orderBy: { name: 'asc' } });
    case 'states':
      return prisma.state.findMany({ where, orderBy: { name: 'asc' } });
    case 'cities':
      return prisma.city.findMany({ where, include: { state: true }, orderBy: { name: 'asc' } });
    case 'contract-types':
      return prisma.contractType.findMany({ where, orderBy: { name: 'asc' } });
    case 'vehicle-types':
      return prisma.vehicleType.findMany({ where, orderBy: { name: 'asc' } });
    case 'service-regions':
      return prisma.serviceRegion.findMany({ where, orderBy: { name: 'asc' } });
    case 'floor-levels':
      return prisma.floorLevel.findMany({ where, orderBy: { name: 'asc' } });
    case 'occupations':
      return prisma.occupation.findMany({ where, orderBy: { name: 'asc' } });
    case 'amenities':
      return prisma.amenity.findMany({ where, orderBy: { name: 'asc' } });
    case 'status-codes':
      return prisma.statusCode.findMany({ where, orderBy: [{ entityType: 'asc' }, { code: 'asc' }] });
    case 'roles':
      return prisma.role.findMany({ where, orderBy: { name: 'asc' } });
    default:
      throw new ApiError(400, 'MASTER_DATA_INVALID_ENTITY', 'Unsupported master-data entity.');
  }
};

export const getMasterDataById = async <T extends MasterDataEntity>(entity: T, id: string) => {
  switch (entity) {
    case 'property-types':
      return prisma.propertyType.findUnique({ where: { id } });
    case 'states':
      return prisma.state.findUnique({ where: { id } });
    case 'cities':
      return prisma.city.findUnique({ where: { id }, include: { state: true } });
    case 'contract-types':
      return prisma.contractType.findUnique({ where: { id } });
    case 'vehicle-types':
      return prisma.vehicleType.findUnique({ where: { id } });
    case 'service-regions':
      return prisma.serviceRegion.findUnique({ where: { id } });
    case 'floor-levels':
      return prisma.floorLevel.findUnique({ where: { id } });
    case 'occupations':
      return prisma.occupation.findUnique({ where: { id } });
    case 'amenities':
      return prisma.amenity.findUnique({ where: { id } });
    case 'status-codes':
      return prisma.statusCode.findUnique({ where: { id } });
    case 'roles':
      return prisma.role.findUnique({ where: { id } });
    default:
      throw new ApiError(400, 'MASTER_DATA_INVALID_ENTITY', 'Unsupported master-data entity.');
  }
};

export const createMasterData = async <T extends MasterDataEntity>(
  entity: T,
  input: MasterDataCreateInputMap[T]
) => {
  switch (entity) {
    case 'property-types':
      return prisma.propertyType.create({ data: input as MasterDataCreateInputMap['property-types'] });
    case 'states':
      return prisma.state.create({ data: input as MasterDataCreateInputMap['states'] });
    case 'cities':
      return prisma.city.create({ data: input as MasterDataCreateInputMap['cities'] });
    case 'contract-types':
      return prisma.contractType.create({ data: input as MasterDataCreateInputMap['contract-types'] });
    case 'vehicle-types':
      return prisma.vehicleType.create({ data: input as MasterDataCreateInputMap['vehicle-types'] });
    case 'service-regions':
      return prisma.serviceRegion.create({ data: input as MasterDataCreateInputMap['service-regions'] });
    case 'floor-levels':
      return prisma.floorLevel.create({ data: input as MasterDataCreateInputMap['floor-levels'] });
    case 'occupations':
      return prisma.occupation.create({ data: input as MasterDataCreateInputMap['occupations'] });
    case 'amenities':
      return prisma.amenity.create({ data: input as MasterDataCreateInputMap['amenities'] });
    case 'status-codes':
      return prisma.statusCode.create({ data: input as MasterDataCreateInputMap['status-codes'] });
    case 'roles':
      return prisma.role.create({ data: input as MasterDataCreateInputMap['roles'] });
    default:
      throw new ApiError(400, 'MASTER_DATA_INVALID_ENTITY', 'Unsupported master-data entity.');
  }
};

export const updateMasterData = async <T extends MasterDataEntity>(
  entity: T,
  id: string,
  input: MasterDataUpdateInputMap[T]
) => {
  switch (entity) {
    case 'property-types':
      return prisma.propertyType.update({ where: { id }, data: input as MasterDataUpdateInputMap['property-types'] });
    case 'states':
      return prisma.state.update({ where: { id }, data: input as MasterDataUpdateInputMap['states'] });
    case 'cities':
      return prisma.city.update({ where: { id }, data: input as MasterDataUpdateInputMap['cities'] });
    case 'contract-types':
      return prisma.contractType.update({ where: { id }, data: input as MasterDataUpdateInputMap['contract-types'] });
    case 'vehicle-types':
      return prisma.vehicleType.update({ where: { id }, data: input as MasterDataUpdateInputMap['vehicle-types'] });
    case 'service-regions':
      return prisma.serviceRegion.update({ where: { id }, data: input as MasterDataUpdateInputMap['service-regions'] });
    case 'floor-levels':
      return prisma.floorLevel.update({ where: { id }, data: input as MasterDataUpdateInputMap['floor-levels'] });
    case 'occupations':
      return prisma.occupation.update({ where: { id }, data: input as MasterDataUpdateInputMap['occupations'] });
    case 'amenities':
      return prisma.amenity.update({ where: { id }, data: input as MasterDataUpdateInputMap['amenities'] });
    case 'status-codes':
      return prisma.statusCode.update({ where: { id }, data: input as MasterDataUpdateInputMap['status-codes'] });
    case 'roles':
      return prisma.role.update({ where: { id }, data: input as MasterDataUpdateInputMap['roles'] });
    default:
      throw new ApiError(400, 'MASTER_DATA_INVALID_ENTITY', 'Unsupported master-data entity.');
  }
};

export const softDeleteMasterData = async <T extends MasterDataEntity>(entity: T, id: string) => {
  return updateMasterData(entity, id, { isActive: false } as MasterDataUpdateInputMap[T]);
};
