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

export const driverRequestEtaValidator = [
  ...requestIdParam,
  body('stage').trim().notEmpty().withMessage('stage is required.'),
  body('etaAt').isISO8601().withMessage('etaAt must be a valid ISO date.'),
  body('notes').optional().isString().withMessage('notes must be a string.')
];

export const driverRequestStatusValidator = [
  ...requestIdParam,
  body('status')
    .isIn(['in_progress', 'completed', 'cancelled'])
    .withMessage('status must be one of: in_progress, completed, cancelled.'),
  body('notes').optional().isString().withMessage('notes must be a string.')
];
