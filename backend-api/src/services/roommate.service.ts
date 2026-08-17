import { Prisma, RoommateGender } from '@prisma/client';

import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

interface ListRoommatePostsInput {
  gender?: RoommateGender;
  occupationId?: string;
  city?: string;
  state?: string;
  cityId?: string;
  stateId?: string;
}

interface CreateRoommatePostInput {
  userId: string;
  houseId: string;
  title: string;
  budgetCostSharing: string;
  gender: RoommateGender;
  occupationId: string;
  isLgbtqFriendly?: boolean;
  isCannabisFriendly?: boolean;
  isSmokingFriendly?: boolean;
  isNoSmoking?: boolean;
  isCatFriendly?: boolean;
  isDogFriendly?: boolean;
  isAlcoholFriendly?: boolean;
  likesNightOut?: boolean;
  likesHangoutEveryday?: boolean;
  hobbyPlayingGame?: boolean;
  hobbyWatchingMovies?: boolean;
  hobbySinging?: boolean;
  hobbyPlayingFootball?: boolean;
  hobbyRunning?: boolean;
  hobbyCooking?: boolean;
  hobbyReading?: boolean;
  hobbyFoodie?: boolean;
  hobbyChillWithOthers?: boolean;
  hobbyRelaxSilent?: boolean;
  hobbyPlayingGym?: boolean;
}

const ROOMMATE_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      profilePicturePath: true
    }
  },
  occupation: {
    select: {
      id: true,
      name: true
    }
  },
  house: {
    select: {
      id: true,
      title: true,
      city: {
        select: {
          id: true,
          name: true
        }
      },
      state: {
        select: {
          id: true,
          name: true
        }
      }
    }
  }
} as const;

const mapRoommatePost = (item: Prisma.RoommatePostGetPayload<{ include: typeof ROOMMATE_INCLUDE }>) => ({
  id: item.id,
  title: item.title,
  budgetCostSharing: item.budgetCostSharing,
  gender: item.gender,
  occupation: item.occupation,
  preferences: {
    isLgbtqFriendly: item.isLgbtqFriendly,
    isCannabisFriendly: item.isCannabisFriendly,
    isSmokingFriendly: item.isSmokingFriendly,
    isNoSmoking: item.isNoSmoking,
    isCatFriendly: item.isCatFriendly,
    isDogFriendly: item.isDogFriendly,
    isAlcoholFriendly: item.isAlcoholFriendly,
    likesNightOut: item.likesNightOut,
    likesHangoutEveryday: item.likesHangoutEveryday
  },
  hobbies: {
    hobbyPlayingGame: item.hobbyPlayingGame,
    hobbyWatchingMovies: item.hobbyWatchingMovies,
    hobbySinging: item.hobbySinging,
    hobbyPlayingFootball: item.hobbyPlayingFootball,
    hobbyRunning: item.hobbyRunning,
    hobbyCooking: item.hobbyCooking,
    hobbyReading: item.hobbyReading,
    hobbyFoodie: item.hobbyFoodie,
    hobbyChillWithOthers: item.hobbyChillWithOthers,
    hobbyRelaxSilent: item.hobbyRelaxSilent,
    hobbyPlayingGym: item.hobbyPlayingGym
  },
  user: item.user,
  house: item.house,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const buildWhere = (input: ListRoommatePostsInput): Prisma.RoommatePostWhereInput => {
  const where: Prisma.RoommatePostWhereInput = {};

  if (input.gender) {
    where.gender = input.gender;
  }

  if (input.occupationId) {
    where.occupationId = input.occupationId;
  }

  const houseWhere: Prisma.HouseWhereInput = {};

  if (input.cityId) {
    houseWhere.cityId = input.cityId;
  }

  if (input.stateId) {
    houseWhere.stateId = input.stateId;
  }

  if (input.city) {
    houseWhere.city = {
      name: {
        contains: input.city
      }
    };
  }

  if (input.state) {
    houseWhere.state = {
      name: {
        contains: input.state
      }
    };
  }

  if (Object.keys(houseWhere).length > 0) {
    where.house = houseWhere;
  }

  return where;
};

export const listRoommatePosts = async (input: ListRoommatePostsInput) => {
  const items = await prisma.roommatePost.findMany({
    where: buildWhere(input),
    include: ROOMMATE_INCLUDE,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return items.map(mapRoommatePost);
};

export const createRoommatePost = async (input: CreateRoommatePostInput) => {
  const [house, occupation] = await Promise.all([
    prisma.house.findUnique({
      where: {
        id: input.houseId
      },
      select: {
        id: true
      }
    }),
    prisma.occupation.findUnique({
      where: {
        id: input.occupationId
      },
      select: {
        id: true,
        isActive: true
      }
    })
  ]);

  if (!house) {
    throw new ApiError(404, 'HOUSE_NOT_FOUND', 'House not found.');
  }

  if (!occupation || !occupation.isActive) {
    throw new ApiError(400, 'OCCUPATION_NOT_AVAILABLE', 'Occupation is invalid or inactive.');
  }

  const created = await prisma.roommatePost.create({
    data: {
      userId: input.userId,
      houseId: input.houseId,
      title: input.title,
      budgetCostSharing: input.budgetCostSharing,
      gender: input.gender,
      occupationId: input.occupationId,
      isLgbtqFriendly: Boolean(input.isLgbtqFriendly),
      isCannabisFriendly: Boolean(input.isCannabisFriendly),
      isSmokingFriendly: Boolean(input.isSmokingFriendly),
      isNoSmoking: Boolean(input.isNoSmoking),
      isCatFriendly: Boolean(input.isCatFriendly),
      isDogFriendly: Boolean(input.isDogFriendly),
      isAlcoholFriendly: Boolean(input.isAlcoholFriendly),
      likesNightOut: Boolean(input.likesNightOut),
      likesHangoutEveryday: Boolean(input.likesHangoutEveryday),
      hobbyPlayingGame: Boolean(input.hobbyPlayingGame),
      hobbyWatchingMovies: Boolean(input.hobbyWatchingMovies),
      hobbySinging: Boolean(input.hobbySinging),
      hobbyPlayingFootball: Boolean(input.hobbyPlayingFootball),
      hobbyRunning: Boolean(input.hobbyRunning),
      hobbyCooking: Boolean(input.hobbyCooking),
      hobbyReading: Boolean(input.hobbyReading),
      hobbyFoodie: Boolean(input.hobbyFoodie),
      hobbyChillWithOthers: Boolean(input.hobbyChillWithOthers),
      hobbyRelaxSilent: Boolean(input.hobbyRelaxSilent),
      hobbyPlayingGym: Boolean(input.hobbyPlayingGym)
    },
    include: ROOMMATE_INCLUDE
  });

  return mapRoommatePost(created);
};
