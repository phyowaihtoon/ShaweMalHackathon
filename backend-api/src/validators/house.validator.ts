import { param, query } from 'express-validator';

export const houseIdParamValidator = [param('id').trim().notEmpty().withMessage('House id is required.')];

export const houseListValidator = [
  query('city').optional().isString().withMessage('city must be a string.'),
  query('type').optional().isString().withMessage('type must be a string.'),
  query('minBudget').optional().isFloat({ min: 0 }).withMessage('minBudget must be a non-negative number.'),
  query('maxBudget').optional().isFloat({ min: 0 }).withMessage('maxBudget must be a non-negative number.'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('pageSize').optional().isInt({ min: 1, max: 50 }).withMessage('pageSize must be between 1 and 50.'),
  query().custom((_, { req }) => {
    const reqQuery = req.query ?? {};
    const minBudgetValue = reqQuery.minBudget;
    const maxBudgetValue = reqQuery.maxBudget;

    if (minBudgetValue === undefined || maxBudgetValue === undefined) {
      return true;
    }

    const minBudget = Number(minBudgetValue);
    const maxBudget = Number(maxBudgetValue);

    if (Number.isFinite(minBudget) && Number.isFinite(maxBudget) && minBudget <= maxBudget) {
      return true;
    }

    throw new Error('minBudget must be less than or equal to maxBudget.');
  })
];

export const houseBookingValidator = [...houseIdParamValidator];
