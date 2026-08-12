import { Request, Response } from 'express';
import { RoommateGender } from '@prisma/client';

import { createRoommatePost, listRoommatePosts } from '../services/roommate.service';
import { ApiError } from '../utils/api-error';
import { sendSuccess } from '../utils/api-response';

const requireActor = (req: Request): string => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  return req.auth.userId;
};

const parseRoommateGender = (value: unknown): RoommateGender | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const upper = value.toUpperCase();
  if (upper === 'MALE' || upper === 'FEMALE' || upper === 'ANY') {
    return upper as RoommateGender;
  }

  return undefined;
};

export const listRoommatesController = async (req: Request, res: Response): Promise<void> => {
  const items = await listRoommatePosts({
    gender: parseRoommateGender(req.query.gender),
    occupationId: typeof req.query.occupationId === 'string' ? req.query.occupationId : undefined,
    city: typeof req.query.city === 'string' ? req.query.city : undefined,
    state: typeof req.query.state === 'string' ? req.query.state : undefined,
    cityId: typeof req.query.cityId === 'string' ? req.query.cityId : undefined,
    stateId: typeof req.query.stateId === 'string' ? req.query.stateId : undefined
  });

  sendSuccess(res, 200, 'Roommate posts fetched successfully', { items });
};

export const createRoommateController = async (req: Request, res: Response): Promise<void> => {
  const userId = requireActor(req);

  const item = await createRoommatePost({
    userId,
    houseId: req.body.houseId,
    title: req.body.title,
    budgetCostSharing: req.body.budgetCostSharing,
    gender: parseRoommateGender(req.body.gender) as RoommateGender,
    occupationId: req.body.occupationId,
    isLgbtqFriendly: req.body.isLgbtqFriendly,
    isCannabisFriendly: req.body.isCannabisFriendly,
    isSmokingFriendly: req.body.isSmokingFriendly,
    isNoSmoking: req.body.isNoSmoking,
    isCatFriendly: req.body.isCatFriendly,
    isDogFriendly: req.body.isDogFriendly,
    isAlcoholFriendly: req.body.isAlcoholFriendly,
    likesNightOut: req.body.likesNightOut,
    likesHangoutEveryday: req.body.likesHangoutEveryday,
    hobbyPlayingGame: req.body.hobbyPlayingGame,
    hobbyWatchingMovies: req.body.hobbyWatchingMovies,
    hobbySinging: req.body.hobbySinging,
    hobbyPlayingFootball: req.body.hobbyPlayingFootball,
    hobbyRunning: req.body.hobbyRunning,
    hobbyCooking: req.body.hobbyCooking,
    hobbyReading: req.body.hobbyReading,
    hobbyFoodie: req.body.hobbyFoodie,
    hobbyChillWithOthers: req.body.hobbyChillWithOthers,
    hobbyRelaxSilent: req.body.hobbyRelaxSilent,
    hobbyPlayingGym: req.body.hobbyPlayingGym
  });

  sendSuccess(res, 201, 'Roommate post created successfully', { item });
};
