import { body, query } from 'express-validator';

const reviewTargetTypes = ['AGENT', 'DRIVER', 'agent', 'driver'];

export const createReviewValidator = [
  body('targetType').isIn(reviewTargetTypes).withMessage('targetType must be AGENT or DRIVER.'),
  body('targetUserId').trim().notEmpty().withMessage('targetUserId is required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer from 1 to 5.'),
  body('comment').optional().isString().withMessage('comment must be a string.').isLength({ max: 1000 }).withMessage('comment must be at most 1000 characters.')
];

export const listReviewsValidator = [
  query('targetType').isIn(reviewTargetTypes).withMessage('targetType must be AGENT or DRIVER.'),
  query('targetUserId').trim().notEmpty().withMessage('targetUserId is required.')
];
