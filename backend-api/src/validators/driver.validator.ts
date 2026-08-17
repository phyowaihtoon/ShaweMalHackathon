import { body, param } from 'express-validator';

import { uploadedPathValidator } from './upload-path.validator';

const requestIdParam = [param('id').trim().notEmpty().withMessage('Moving request id is required.')];

export const driverProfileUpsertValidator = [
  body('name').trim().notEmpty().withMessage('name is required.'),
  body('companyName').optional().isString().withMessage('companyName must be a string.'),
  body('nrc').trim().isLength({ min: 15, max: 15 }).withMessage('nrc must be exactly 15 characters.'),
  uploadedPathValidator('nrcFrontPhotoPath', 'docs'),
  uploadedPathValidator('nrcBackPhotoPath', 'docs'),
  uploadedPathValidator('drivingLicensePhotoPath', 'docs'),
  uploadedPathValidator('profilePhotoPath', 'profile'),
  body('phone').trim().notEmpty().withMessage('phone is required.'),
  body('currentAddress').trim().notEmpty().withMessage('currentAddress is required.'),
  body('vehicleTypeId').trim().notEmpty().withMessage('vehicleTypeId is required.'),
  body('vehicleLicensePlateNumber').trim().notEmpty().withMessage('vehicleLicensePlateNumber is required.'),
  uploadedPathValidator('vehiclePhotoPath', 'docs'),
  uploadedPathValidator('wheelTaxPhotoPath', 'docs')
];

export const driverRequestIdValidator = [...requestIdParam];

export const driverRequestRejectValidator = [
  ...requestIdParam,
  body('notes').optional().isString().withMessage('notes must be a string.')
];

const DRIVER_STATUS_VALUES = [
  'driver_coming',
  'driver_arrived',
  'loading',
  'on_the_way',
  'unloading',
  'completed',
  'cancelled'
] as const;

const DRIVER_ETA_STAGES = ['driver_coming', 'driver_arrived', 'loading', 'on_the_way', 'unloading'] as const;

export const driverRequestEtaValidator = [
  ...requestIdParam,
  body('stage')
    .trim()
    .isIn([...DRIVER_ETA_STAGES])
    .withMessage(`stage must be one of: ${DRIVER_ETA_STAGES.join(', ')}.`),
  body('etaAt').isISO8601().withMessage('etaAt must be a valid ISO date.'),
  body('notes').optional().isString().withMessage('notes must be a string.')
];

export const driverRequestStatusValidator = [
  ...requestIdParam,
  body('status')
    .isIn([...DRIVER_STATUS_VALUES])
    .withMessage(`status must be one of: ${DRIVER_STATUS_VALUES.join(', ')}.`),
  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string.')
    .custom((value, { req }) => {
      if (String(req.body.status ?? '').toLowerCase() !== 'cancelled') {
        return true;
      }

      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('notes are required when cancelling a moving request.');
      }

      return true;
    })
];
