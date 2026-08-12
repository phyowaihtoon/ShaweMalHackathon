import { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import { isValidUploadedPath, uploadedPathMessage, type UploadCategory } from '../utils/upload-path';

export const uploadedPathValidator = (field: string, category: UploadCategory): ValidationChain =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required.`)
    .custom((value: string) => isValidUploadedPath(value, category))
    .withMessage(uploadedPathMessage(category));

export const optionalUploadedPathValidator = (field: string, category: UploadCategory): ValidationChain =>
  body(field)
    .optional({ values: 'null' })
    .custom((value: unknown) => {
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error(`${field} must be a string when provided.`);
      }

      if (!isValidUploadedPath(value, category)) {
        throw new Error(uploadedPathMessage(category));
      }

      return true;
    });

export const uploadedPathArrayItemValidator = (field: string, category: UploadCategory): ValidationChain =>
  body(`${field}.*`)
    .isString()
    .withMessage(`Each ${field} entry must be a string.`)
    .custom((value: string) => isValidUploadedPath(value, category))
    .withMessage(uploadedPathMessage(category));
