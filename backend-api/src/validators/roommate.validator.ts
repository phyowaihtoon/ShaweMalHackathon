import { body, query } from 'express-validator';

const genderValues = ['MALE', 'FEMALE', 'ANY', 'male', 'female', 'any'];

export const listRoommatesValidator = [
  query('gender').optional().isIn(genderValues).withMessage('gender must be one of MALE, FEMALE, ANY.'),
  query('occupationId').optional().trim().notEmpty().withMessage('occupationId cannot be empty.'),
  query('city').optional().isString().withMessage('city must be a string.'),
  query('state').optional().isString().withMessage('state must be a string.'),
  query('cityId').optional().trim().notEmpty().withMessage('cityId cannot be empty.'),
  query('stateId').optional().trim().notEmpty().withMessage('stateId cannot be empty.')
];

export const createRoommateValidator = [
  body('houseId').trim().notEmpty().withMessage('houseId is required.'),
  body('title').trim().notEmpty().withMessage('title is required.').isLength({ max: 200 }).withMessage('title must be at most 200 characters.'),
  body('budgetCostSharing')
    .trim()
    .notEmpty()
    .withMessage('budgetCostSharing is required.')
    .isLength({ max: 500 })
    .withMessage('budgetCostSharing must be at most 500 characters.'),
  body('gender').isIn(genderValues).withMessage('gender must be one of MALE, FEMALE, ANY.'),
  body('occupationId').trim().notEmpty().withMessage('occupationId is required.'),
  body('isLgbtqFriendly').optional().isBoolean().withMessage('isLgbtqFriendly must be boolean.'),
  body('isCannabisFriendly').optional().isBoolean().withMessage('isCannabisFriendly must be boolean.'),
  body('isSmokingFriendly').optional().isBoolean().withMessage('isSmokingFriendly must be boolean.'),
  body('isNoSmoking').optional().isBoolean().withMessage('isNoSmoking must be boolean.'),
  body('isCatFriendly').optional().isBoolean().withMessage('isCatFriendly must be boolean.'),
  body('isDogFriendly').optional().isBoolean().withMessage('isDogFriendly must be boolean.'),
  body('isAlcoholFriendly').optional().isBoolean().withMessage('isAlcoholFriendly must be boolean.'),
  body('likesNightOut').optional().isBoolean().withMessage('likesNightOut must be boolean.'),
  body('likesHangoutEveryday').optional().isBoolean().withMessage('likesHangoutEveryday must be boolean.'),
  body('hobbyPlayingGame').optional().isBoolean().withMessage('hobbyPlayingGame must be boolean.'),
  body('hobbyWatchingMovies').optional().isBoolean().withMessage('hobbyWatchingMovies must be boolean.'),
  body('hobbySinging').optional().isBoolean().withMessage('hobbySinging must be boolean.'),
  body('hobbyPlayingFootball').optional().isBoolean().withMessage('hobbyPlayingFootball must be boolean.'),
  body('hobbyRunning').optional().isBoolean().withMessage('hobbyRunning must be boolean.'),
  body('hobbyCooking').optional().isBoolean().withMessage('hobbyCooking must be boolean.'),
  body('hobbyReading').optional().isBoolean().withMessage('hobbyReading must be boolean.'),
  body('hobbyFoodie').optional().isBoolean().withMessage('hobbyFoodie must be boolean.'),
  body('hobbyChillWithOthers').optional().isBoolean().withMessage('hobbyChillWithOthers must be boolean.'),
  body('hobbyRelaxSilent').optional().isBoolean().withMessage('hobbyRelaxSilent must be boolean.'),
  body('hobbyPlayingGym').optional().isBoolean().withMessage('hobbyPlayingGym must be boolean.')
];
