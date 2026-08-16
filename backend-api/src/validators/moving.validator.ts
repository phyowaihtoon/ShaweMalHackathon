import { body, param } from 'express-validator';

import { uploadedPathArrayItemValidator } from './upload-path.validator';

const optionalCoordinate = (field: string, min: number, max: number) =>
  body(field)
    .optional({ values: 'falsy' })
    .isFloat({ min, max })
    .withMessage(`${field} must be a valid coordinate.`);

const movingQuoteFields = [
  body('pickupAddress').trim().notEmpty().withMessage('pickupAddress is required.'),
  body('dropoffAddress').trim().notEmpty().withMessage('dropoffAddress is required.'),
  optionalCoordinate('pickupLatitude', -90, 90),
  optionalCoordinate('pickupLongitude', -180, 180),
  optionalCoordinate('dropoffLatitude', -90, 90),
  optionalCoordinate('dropoffLongitude', -180, 180),
  body('pickupFloorLevelId').trim().notEmpty().withMessage('pickupFloorLevelId is required.'),
  body('dropoffFloorLevelId').trim().notEmpty().withMessage('dropoffFloorLevelId is required.'),
  body('vehicleTypeId').optional().isString().withMessage('vehicleTypeId must be a string.'),
  body('inventoryItems').isArray({ min: 1 }).withMessage('inventoryItems must be a non-empty array.'),
  body('inventoryItems.*.inventoryItemTypeId')
    .trim()
    .notEmpty()
    .withMessage('Each inventory item type id is required.'),
  body('inventoryItems.*.count')
    .isInt({ min: 1 })
    .withMessage('Each inventory item count must be a positive integer.')
];

export const movingRequestQuoteValidator = [...movingQuoteFields];

export const movingRequestCreateValidator = [
  ...movingQuoteFields,
  body('moveInDate').isISO8601().withMessage('moveInDate must be a valid ISO date.'),
  body('vehicleTypeId').trim().notEmpty().withMessage('vehicleTypeId is required.'),
  body('remarks').optional().isString().withMessage('remarks must be a string.'),
  body('damageChecklist').optional().isString().withMessage('damageChecklist must be a string.'),
  body('photos').isArray({ min: 0, max: 5 }).withMessage('photos must be an array with at most 5 entries.'),
  uploadedPathArrayItemValidator('photos', 'moving')
];

export const movingRequestIdParamValidator = [
  param('id').trim().notEmpty().withMessage('Moving request id is required.')
];
