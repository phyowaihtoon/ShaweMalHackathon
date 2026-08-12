import { Prisma, HouseAvailabilityStatus, HousePostChannel } from '@prisma/client';

import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

interface ListHousesInput {
  city?: string;
  propertyType?: string;
  minBudget?: number;
  maxBudget?: number;
  page: number;
  pageSize: number;
}

interface CreateBookingInput {
  userId: string;
  houseId: string;
}

const toNumber = (value: Prisma.Decimal): number => Number(value);

const HOUSE_LIST_INCLUDE = {
  images: {
    select: {
      imagePath: true,
      sortOrder: true
    },
    orderBy: {
      sortOrder: 'asc' as const
    }
  },
  propertyType: {
    select: {
      id: true,
      name: true
    }
  },
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
} as const;

const HOUSE_DETAIL_INCLUDE = {
  images: {
    select: {
      id: true,
      imagePath: true,
      sortOrder: true
    },
    orderBy: {
      sortOrder: 'asc' as const
    }
  },
  amenities: {
    include: {
      amenity: {
        select: {
          id: true,
          name: true,
          category: true
        }
      }
    }
  },
  propertyType: {
    select: {
      id: true,
      name: true
    }
  },
  contractType: {
    select: {
      id: true,
      name: true,
      durationMonths: true
    }
  },
  floorLevel: {
    select: {
      id: true,
      name: true,
      levelNumber: true
    }
  },
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
  },
  agent: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      verificationStatus: true
    }
  }
} as const;

const mapHouseListItem = (
  house: Prisma.HouseGetPayload<{ include: typeof HOUSE_LIST_INCLUDE }>
) => ({
  id: house.id,
  title: house.title,
  postChannel: house.postChannel,
  availability: house.availability,
  monthlyFees: toNumber(house.monthlyFees),
  depositAmount: toNumber(house.depositAmount),
  bedrooms: house.bedrooms,
  bathrooms: house.bathrooms,
  propertyType: house.propertyType,
  city: house.city,
  state: house.state,
  thumbnail: house.images[0]?.imagePath ?? null,
  createdAt: house.createdAt
});

const mapHouseDetails = (
  house: Prisma.HouseGetPayload<{ include: typeof HOUSE_DETAIL_INCLUDE }>
) => ({
  id: house.id,
  title: house.title,
  description: house.description,
  postChannel: house.postChannel,
  availability: house.availability,
  monthlyFees: toNumber(house.monthlyFees),
  depositAmount: toNumber(house.depositAmount),
  areaSize: house.areaSize,
  bedrooms: house.bedrooms,
  bathrooms: house.bathrooms,
  houseRules: house.houseRules,
  contact: {
    phone: house.contactPhoneNumber,
    telegram: house.contactTelegram,
    viber: house.contactViber
  },
  location: {
    city: house.city,
    state: house.state,
    nearbyPlaces: house.nearbyPlaces
  },
  propertyType: house.propertyType,
  contractType: house.contractType,
  floorLevel: house.floorLevel,
  images: house.images,
  amenities: house.amenities.map((item) => item.amenity),
  agent: {
    id: house.agent.id,
    name: house.agent.name,
    phone: house.agent.phone,
    email: house.agent.email,
    verificationStatus: house.agent.verificationStatus
  },
  createdAt: house.createdAt,
  updatedAt: house.updatedAt
});

const buildHouseFilters = (input: ListHousesInput): Prisma.HouseWhereInput => {
  const where: Prisma.HouseWhereInput = {
    availability: HouseAvailabilityStatus.AVAILABLE
  };

  if (input.city) {
    where.city = {
      name: {
        contains: input.city
      }
    };
  }

  if (input.propertyType) {
    where.propertyType = {
      name: {
        contains: input.propertyType
      }
    };
  }

  if (typeof input.minBudget === 'number' || typeof input.maxBudget === 'number') {
    where.monthlyFees = {};

    if (typeof input.minBudget === 'number') {
      where.monthlyFees.gte = new Prisma.Decimal(input.minBudget);
    }

    if (typeof input.maxBudget === 'number') {
      where.monthlyFees.lte = new Prisma.Decimal(input.maxBudget);
    }
  }

  return where;
};

export const listHouses = async (input: ListHousesInput) => {
  const where = buildHouseFilters(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total] = await Promise.all([
    prisma.house.findMany({
      where,
      include: HOUSE_LIST_INCLUDE,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: input.pageSize
    }),
    prisma.house.count({ where })
  ]);

  return {
    items: items.map(mapHouseListItem),
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize))
  };
};

export const getHouseDetails = async (houseId: string) => {
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: HOUSE_DETAIL_INCLUDE
  });

  if (!house) {
    throw new ApiError(404, 'HOUSE_NOT_FOUND', 'House not found.');
  }

  return mapHouseDetails(house);
};

export const createBooking = async (input: CreateBookingInput) => {
  const house = await prisma.house.findUnique({
    where: { id: input.houseId },
    select: {
      id: true,
      title: true,
      availability: true
    }
  });

  if (!house) {
    throw new ApiError(404, 'HOUSE_NOT_FOUND', 'House not found.');
  }

  if (house.availability !== HouseAvailabilityStatus.AVAILABLE) {
    throw new ApiError(400, 'HOUSE_NOT_AVAILABLE', 'House is not available for booking.');
  }

  const booking = await prisma.booking.create({
    data: {
      userId: input.userId,
      houseId: input.houseId,
      status: 'PENDING'
    }
  });

  await prisma.notification.create({
    data: {
      userId: input.userId,
      title: 'Booking Confirmation',
      message: `Your booking request for "${house.title}" has been submitted.`
    }
  });

  return booking;
};

export const parsePostChannel = (value: unknown): HousePostChannel | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  if (value.toLowerCase() === 'agent') {
    return HousePostChannel.AGENT;
  }

  if (value.toLowerCase() === 'roommate') {
    return HousePostChannel.ROOMMATE;
  }

  return undefined;
};
