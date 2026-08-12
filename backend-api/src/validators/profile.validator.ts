import { body } from 'express-validator';

import { optionalUploadedPathValidator } from './upload-path.validator';

export const updateProfileValidator = [
  body('name').optional().isString().withMessage('name must be a string.').trim().isLength({ min: 1, max: 120 }).withMessage('name must be between 1 and 120 characters.'),
  body('phone')
    .optional()
    .isString()
    .withMessage('phone must be a string.')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('phone length must be between 7 and 20.'),
  optionalUploadedPathValidator('profilePicturePath', 'profile'),
  body().custom((_, { req }) => {
    const hasAnyField = req.body.name !== undefined || req.body.phone !== undefined || req.body.profilePicturePath !== undefined;
    if (!hasAnyField) {
      throw new Error('At least one of name, phone, or profilePicturePath is required.');
    }

    return true;
  })
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.'),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm new password is required.')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('New passwords do not match.')
];
