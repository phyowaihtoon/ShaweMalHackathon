import { body, param } from 'express-validator';

export const movingRequestCreateValidator = [
  body('pickupAddress').trim().notEmpty().withMessage('pickupAddress is required.'),
  body('dropoffAddress').trim().notEmpty().withMessage('dropoffAddress is required.'),
  body('moveInDate').isISO8601().withMessage('moveInDate must be a valid ISO date.'),
  body('vehicleTypeId').trim().notEmpty().withMessage('vehicleTypeId is required.'),
  body('remarks').optional().isString().withMessage('remarks must be a string.'),
  body('damageChecklist').optional().isString().withMessage('damageChecklist must be a string.'),
  body('photos').isArray({ min: 1, max: 5 }).withMessage('photos must be an array with 1 to 5 entries.'),
  body('photos.*').isString().withMessage('Each photo path must be a string.'),
  body('inventoryItems').isArray({ min: 1 }).withMessage('inventoryItems must be a non-empty array.'),
  body('inventoryItems.*.category').trim().notEmpty().withMessage('Each inventory item category is required.'),
  body('inventoryItems.*.itemName').trim().notEmpty().withMessage('Each inventory item name is required.'),
  body('inventoryItems.*.count').isInt({ min: 0 }).withMessage('Each inventory item count must be a non-negative integer.')
];

export const movingRequestIdParamValidator = [
  param('id').trim().notEmpty().withMessage('Moving request id is required.')
];
