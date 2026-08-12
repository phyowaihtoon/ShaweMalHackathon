import { prisma } from '../prisma/client';

const WISHLIST_ITEM_INCLUDE = {
  house: {
    include: {
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
    }
  }
} as const;

const mapWishlistItem = (
  item: {
    id: string;
    houseId: string;
    createdAt: Date;
    house: {
      id: string;
      title: string;
      monthlyFees: { toString: () => string };
      depositAmount: { toString: () => string };
      availability: string;
      propertyType: { id: string; name: string };
      city: { id: string; name: string };
      state: { id: string; name: string };
      images: Array<{ imagePath: string }>;
    };
  }
) => ({
  id: item.id,
  houseId: item.houseId,
  createdAt: item.createdAt,
  house: {
    id: item.house.id,
    title: item.house.title,
    monthlyFees: Number(item.house.monthlyFees.toString()),
    depositAmount: Number(item.house.depositAmount.toString()),
    availability: item.house.availability,
    propertyType: item.house.propertyType,
    city: item.house.city,
    state: item.house.state,
    thumbnail: item.house.images[0]?.imagePath ?? null
  }
});

export const addToWishlist = async (userId: string, houseId: string) => {
  return prisma.wishlist.upsert({
    where: {
      userId_houseId: {
        userId,
        houseId
      }
    },
    update: {},
    create: {
      userId,
      houseId
    }
  });
};

export const removeFromWishlist = async (userId: string, houseId: string) => {
  return prisma.wishlist.deleteMany({
    where: {
      userId,
      houseId
    }
  });
};

export const listWishlist = async (userId: string) => {
  const items = await prisma.wishlist.findMany({
    where: {
      userId
    },
    include: WISHLIST_ITEM_INCLUDE,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return items.map(mapWishlistItem);
};
