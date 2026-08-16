import { body, param, query } from 'express-validator';

import { masterDataEntities } from '../services/master-data.service';

const entityValues = [...masterDataEntities];

export const masterDataEntityParamValidator = [
  param('entity').isIn(entityValues).withMessage('Unsupported master-data entity.')
];

export const masterDataIdParamValidator = [param('id').trim().notEmpty().withMessage('id is required.')];

export const masterDataListValidator = [
  ...masterDataEntityParamValidator,
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean.')
];

const commonOptional = [body('isActive').optional().isBoolean().withMessage('isActive must be boolean.')];

const ensureCreateFieldsByEntity = body().custom((_, { req }) => {
  const entity = String(req.params?.entity ?? '');

  if (entity === 'status-codes') {
    if (typeof req.body.entityType !== 'string' || typeof req.body.code !== 'string' || typeof req.body.label !== 'string') {
      throw new Error('entityType, code, and label are required.');
    }

    return true;
  }

  if (entity === 'states') {
    if (typeof req.body.name !== 'string' || typeof req.body.countryCode !== 'string') {
      throw new Error('name and countryCode are required.');
    }

    return true;
  }

  if (entity === 'cities') {
    if (
      typeof req.body.name !== 'string' ||
      typeof req.body.stateId !== 'string' ||
      typeof req.body.countryCode !== 'string'
    ) {
      throw new Error('name, stateId, and countryCode are required.');
    }

    return true;
  }

  if (entity === 'contract-types') {
    if (typeof req.body.name !== 'string' || typeof req.body.durationMonths !== 'number') {
      throw new Error('name and durationMonths are required.');
    }

    return true;
  }

  if (entity === 'roles') {
    if (typeof req.body.name !== 'string' || typeof req.body.code !== 'string') {
      throw new Error('name and code are required.');
    }

    return true;
  }

  if (entity === 'moving-inventory-items') {
    if (
      typeof req.body.code !== 'string' ||
      typeof req.body.category !== 'string' ||
      typeof req.body.itemName !== 'string' ||
      typeof req.body.points !== 'number'
    ) {
      throw new Error('code, category, itemName, and points are required.');
    }

    return true;
  }

  if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
    throw new Error('name is required.');
  }

  return true;
});

export const masterDataCreateValidator = [
  ...masterDataEntityParamValidator,
  ensureCreateFieldsByEntity,
  ...commonOptional
];

export const masterDataUpdateValidator = [...masterDataEntityParamValidator, ...masterDataIdParamValidator, ...commonOptional];

export const masterDataGetValidator = [...masterDataEntityParamValidator, ...masterDataIdParamValidator];
