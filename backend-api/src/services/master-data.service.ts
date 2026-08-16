import { Prisma } from '@prisma/client';

import { ApiError } from '../utils/api-error';
import { prisma } from '../prisma/client';
import { vehiclePointRangesOverlap } from './moving-quote';

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
  'roles',
  'moving-inventory-items'
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
  'vehicle-types': {
    name: string;
    capacityLabel?: string;
    maxLoadKg?: number;
    description?: string;
    pointFrom?: number;
    pointTo?: number;
    pricePerKm?: number;
    isActive?: boolean;
  };
  'service-regions': { name: string; code: string; description?: string; isActive?: boolean };
  'floor-levels': {
    name: string;
    levelNumber?: number;
    surchargeAmount?: number;
    description?: string;
    isActive?: boolean;
  };
  occupations: { name: string; description?: string; isActive?: boolean };
  amenities: { name: string; category?: string; description?: string; isActive?: boolean };
  'status-codes': { entityType: string; code: string; label: string; color?: string; isActive?: boolean };
  roles: { name: string; code: string; description?: string; isActive?: boolean };
  'moving-inventory-items': {
    code: string;
    category: string;
    itemName: string;
    points: number;
    sortOrder?: number;
    isActive?: boolean;
  };
};

export type MasterDataUpdateInputMap = {
  [K in MasterDataEntity]: Partial<MasterDataCreateInputMap[K]>;
};

const withIsActiveFilter = (isActive?: boolean) => {
  return typeof isActive === 'boolean' ? { isActive } : {};
};

const assertVehiclePointRangeAvailable = async (
  input: { pointFrom?: number; pointTo?: number },
  excludeId?: string
) => {
  if (input.pointFrom === undefined && input.pointTo === undefined) {
    return;
  }

  const pointFrom = input.pointFrom;
  const pointTo = input.pointTo;
  if (pointFrom === undefined || pointTo === undefined) {
    throw new ApiError(400, 'VEHICLE_POINT_RANGE_INVALID', 'pointFrom and pointTo must be provided together.');
  }

  if (!Number.isInteger(pointFrom) || !Number.isInteger(pointTo) || pointFrom < 0 || pointTo < pointFrom) {
    throw new ApiError(400, 'VEHICLE_POINT_RANGE_INVALID', 'pointFrom must be less than or equal to pointTo.');
  }

  const others = await prisma.vehicleType.findMany({
    where: {
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {})
    },
    select: {
      id: true,
      name: true,
      pointFrom: true,
      pointTo: true
    }
  });

  const overlapping = others.find(
    (item) =>
      item.pointFrom !== null &&
      item.pointTo !== null &&
      vehiclePointRangesOverlap(pointFrom, pointTo, item.pointFrom, item.pointTo)
  );

  if (overlapping) {
    throw new ApiError(
      409,
      'VEHICLE_POINT_RANGE_OVERLAP',
      `Point range overlaps existing vehicle type ${overlapping.name}.`
    );
  }
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
      return prisma.floorLevel.findMany({ where, orderBy: { levelNumber: 'asc' } });
    case 'occupations':
      return prisma.occupation.findMany({ where, orderBy: { name: 'asc' } });
    case 'amenities':
      return prisma.amenity.findMany({ where, orderBy: { name: 'asc' } });
    case 'status-codes':
      return prisma.statusCode.findMany({ where, orderBy: [{ entityType: 'asc' }, { code: 'asc' }] });
    case 'roles':
      return prisma.role.findMany({ where, orderBy: { name: 'asc' } });
    case 'moving-inventory-items': {
      const items = await prisma.movingInventoryItemType.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { itemName: 'asc' }]
      });
      return items.map((item) => ({ ...item, name: item.itemName }));
    }
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
    case 'moving-inventory-items': {
      const item = await prisma.movingInventoryItemType.findUnique({ where: { id } });
      return item ? { ...item, name: item.itemName } : item;
    }
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
    case 'vehicle-types': {
      const vehicleInput = input as MasterDataCreateInputMap['vehicle-types'];
      await assertVehiclePointRangeAvailable(vehicleInput);
      return prisma.vehicleType.create({
        data: {
          name: vehicleInput.name,
          capacityLabel: vehicleInput.capacityLabel,
          maxLoadKg: vehicleInput.maxLoadKg,
          description: vehicleInput.description,
          pointFrom: vehicleInput.pointFrom,
          pointTo: vehicleInput.pointTo,
          pricePerKm:
            vehicleInput.pricePerKm === undefined ? undefined : new Prisma.Decimal(vehicleInput.pricePerKm),
          isActive: vehicleInput.isActive
        }
      });
    }
    case 'service-regions':
      return prisma.serviceRegion.create({ data: input as MasterDataCreateInputMap['service-regions'] });
    case 'floor-levels': {
      const floorInput = input as MasterDataCreateInputMap['floor-levels'];
      return prisma.floorLevel.create({
        data: {
          name: floorInput.name,
          levelNumber: floorInput.levelNumber,
          description: floorInput.description,
          isActive: floorInput.isActive,
          surchargeAmount:
            floorInput.surchargeAmount === undefined ? undefined : new Prisma.Decimal(floorInput.surchargeAmount)
        }
      });
    }
    case 'occupations':
      return prisma.occupation.create({ data: input as MasterDataCreateInputMap['occupations'] });
    case 'amenities':
      return prisma.amenity.create({ data: input as MasterDataCreateInputMap['amenities'] });
    case 'status-codes':
      return prisma.statusCode.create({ data: input as MasterDataCreateInputMap['status-codes'] });
    case 'roles':
      return prisma.role.create({ data: input as MasterDataCreateInputMap['roles'] });
    case 'moving-inventory-items':
      return prisma.movingInventoryItemType.create({
        data: input as MasterDataCreateInputMap['moving-inventory-items']
      });
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
    case 'vehicle-types': {
      const vehicleInput = input as MasterDataUpdateInputMap['vehicle-types'];
      if (vehicleInput.pointFrom !== undefined || vehicleInput.pointTo !== undefined) {
        const existing = await prisma.vehicleType.findUnique({
          where: { id },
          select: { pointFrom: true, pointTo: true }
        });
        await assertVehiclePointRangeAvailable(
          {
            pointFrom: vehicleInput.pointFrom ?? existing?.pointFrom ?? undefined,
            pointTo: vehicleInput.pointTo ?? existing?.pointTo ?? undefined
          },
          id
        );
      }

      return prisma.vehicleType.update({
        where: { id },
        data: {
          ...vehicleInput,
          pricePerKm:
            vehicleInput.pricePerKm === undefined ? undefined : new Prisma.Decimal(vehicleInput.pricePerKm)
        }
      });
    }
    case 'service-regions':
      return prisma.serviceRegion.update({ where: { id }, data: input as MasterDataUpdateInputMap['service-regions'] });
    case 'floor-levels': {
      const floorInput = input as MasterDataUpdateInputMap['floor-levels'];
      return prisma.floorLevel.update({
        where: { id },
        data: {
          ...floorInput,
          surchargeAmount:
            floorInput.surchargeAmount === undefined ? undefined : new Prisma.Decimal(floorInput.surchargeAmount)
        }
      });
    }
    case 'occupations':
      return prisma.occupation.update({ where: { id }, data: input as MasterDataUpdateInputMap['occupations'] });
    case 'amenities':
      return prisma.amenity.update({ where: { id }, data: input as MasterDataUpdateInputMap['amenities'] });
    case 'status-codes':
      return prisma.statusCode.update({ where: { id }, data: input as MasterDataUpdateInputMap['status-codes'] });
    case 'roles':
      return prisma.role.update({ where: { id }, data: input as MasterDataUpdateInputMap['roles'] });
    case 'moving-inventory-items':
      return prisma.movingInventoryItemType.update({
        where: { id },
        data: input as MasterDataUpdateInputMap['moving-inventory-items']
      });
    default:
      throw new ApiError(400, 'MASTER_DATA_INVALID_ENTITY', 'Unsupported master-data entity.');
  }
};

export const softDeleteMasterData = async <T extends MasterDataEntity>(entity: T, id: string) => {
  return updateMasterData(entity, id, { isActive: false } as MasterDataUpdateInputMap[T]);
};
