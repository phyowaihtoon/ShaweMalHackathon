import { body, param, query } from 'express-validator';

const allowedRoles = ['normal', 'agent', 'driver', 'admin'];
const verificationActions = ['pending', 'approve', 'reject'];

const userIdParamValidator = [param('userId').trim().notEmpty().withMessage('userId is required.')];

export const adminCreateUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Email is invalid.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required.')
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone length must be between 7 and 20.'),
  body('password').notEmpty().withMessage('Password is required.').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').isIn(allowedRoles).withMessage('Role is invalid.')
];

export const adminUpdateRolesValidator = [
  param('id').trim().notEmpty().withMessage('User id is required.'),
  body('roles').isArray({ min: 1 }).withMessage('Roles must be a non-empty array.'),
  body('roles.*').isIn(allowedRoles).withMessage('One or more roles are invalid.')
];

export const adminVerificationValidator = [
  ...userIdParamValidator,
  body('status').isIn(verificationActions).withMessage('Status must be pending, approve, or reject.')
];

export const adminRegistrationLookupValidator = [...userIdParamValidator];

export const adminAssignMovingRequestValidator = [
  param('id').trim().notEmpty().withMessage('Moving request id is required.'),
  body('driverUserId').trim().notEmpty().withMessage('driverUserId is required.')
];

export const adminHouseBookingReportValidator = [
  query('from').optional().isISO8601().withMessage('from must be a valid date.'),
  query('to').optional().isISO8601().withMessage('to must be a valid date.'),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'pending', 'confirmed', 'cancelled']).withMessage('status is invalid.'),
  query('houseId').optional().trim(),
  query('agentId').optional().trim(),
  query('userId').optional().trim()
];
