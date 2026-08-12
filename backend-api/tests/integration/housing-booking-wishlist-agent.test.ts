import request from 'supertest';

import { app } from '../../src/app';
import { signJwt } from '../../src/utils/jwt';

interface MockRole {
  id: string;
  name: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  userRoles: Array<{ role: MockRole }>;
}

interface MockHouseImage {
  id: string;
  houseId: string;
  imagePath: string;
  sortOrder: number;
}

interface MockHouseAmenity {
  id: string;
  houseId: string;
  amenityId: string;
}

interface MockHouse {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  postChannel: 'AGENT' | 'ROOMMATE';
  propertyTypeId: string;
  monthlyFees: number;
  depositAmount: number;
  contractTypeId: string;
  areaSize?: string;
  floorLevelId?: string;
  bedrooms: number;
  bathrooms: number;
  houseRules?: string;
  contactTelegram?: string;
  contactViber?: string;
  contactPhoneNumber: string;
  cityId: string;
  stateId: string;
  nearbyPlaces?: string;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  createdAt: Date;
  updatedAt: Date;
}

interface MockBooking {
  id: string;
  userId: string;
  houseId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

interface MockWishlist {
  id: string;
  userId: string;
  houseId: string;
  createdAt: Date;
}

const roles = new Map<string, MockRole>([
  ['normal', { id: 'role-normal', name: 'normal' }],
  ['agent', { id: 'role-agent', name: 'agent' }]
]);

const users = new Map<string, MockUser>();
const houses = new Map<string, MockHouse>();
const houseImages: MockHouseImage[] = [];
const houseAmenities: MockHouseAmenity[] = [];
const bookings: MockBooking[] = [];
const wishlists: MockWishlist[] = [];
const notifications: Array<{ userId: string; title: string; message: string }> = [];

const propertyTypes = new Map<string, { id: string; name: string }>([
  ['ptype-apartment', { id: 'ptype-apartment', name: 'Apartment' }],
  ['ptype-condo', { id: 'ptype-condo', name: 'Condominium' }]
]);

const contractTypes = new Map<string, { id: string; name: string; durationMonths: number }>([
  ['contract-6m', { id: 'contract-6m', name: '6 months', durationMonths: 6 }]
]);

const floorLevels = new Map<string, { id: string; name: string; levelNumber: number }>([
  ['floor-1', { id: 'floor-1', name: '1st Floor', levelNumber: 1 }]
]);

const cities = new Map<string, { id: string; name: string }>([
  ['city-1', { id: 'city-1', name: 'Yangon' }],
  ['city-2', { id: 'city-2', name: 'Mandalay' }]
]);

const states = new Map<string, { id: string; name: string }>([
  ['state-1', { id: 'state-1', name: 'Yangon Region' }],
  ['state-2', { id: 'state-2', name: 'Mandalay Region' }]
]);

const amenities = new Map<string, { id: string; name: string; category?: string }>([
  ['amenity-wifi', { id: 'amenity-wifi', name: 'WIFI', category: 'Utility' }],
  ['amenity-parking', { id: 'amenity-parking', name: 'PARKING', category: 'Facility' }]
]);

const hydrateHouse = (house: MockHouse) => {
  const propertyType = propertyTypes.get(house.propertyTypeId) ?? { id: house.propertyTypeId, name: 'Unknown' };
  const contractType = contractTypes.get(house.contractTypeId) ?? {
    id: house.contractTypeId,
    name: 'Unknown',
    durationMonths: 0
  };
  const city = cities.get(house.cityId) ?? { id: house.cityId, name: 'Unknown City' };
  const state = states.get(house.stateId) ?? { id: house.stateId, name: 'Unknown State' };
  const floorLevel = house.floorLevelId
    ? floorLevels.get(house.floorLevelId) ?? { id: house.floorLevelId, name: 'Unknown Floor', levelNumber: 0 }
    : null;
  const agent = users.get(house.agentId);

  return {
    ...house,
    images: houseImages.filter((item) => item.houseId === house.id).sort((a, b) => a.sortOrder - b.sortOrder),
    amenities: houseAmenities
      .filter((item) => item.houseId === house.id)
      .map((item) => ({
        amenity: amenities.get(item.amenityId) ?? { id: item.amenityId, name: 'Unknown' }
      })),
    propertyType,
    contractType,
    floorLevel,
    city,
    state,
    agent: {
      id: agent?.id ?? 'unknown-agent',
      name: agent?.name ?? 'Unknown Agent',
      email: agent?.email ?? 'unknown@example.com',
      phone: agent?.phone ?? '0000000',
      verificationStatus: agent?.verificationStatus ?? 'PENDING'
    }
  };
};

const filterHouses = (where?: any) => {
  const all = Array.from(houses.values());

  return all.filter((house) => {
    if (where?.agentId && house.agentId !== where.agentId) {
      return false;
    }

    if (where?.availability && house.availability !== where.availability) {
      return false;
    }

    const cityName = cities.get(house.cityId)?.name ?? '';
    const typeName = propertyTypes.get(house.propertyTypeId)?.name ?? '';

    if (where?.city?.name?.contains) {
      const expected = String(where.city.name.contains).toLowerCase();
      if (!cityName.toLowerCase().includes(expected)) {
        return false;
      }
    }

    if (where?.propertyType?.name?.contains) {
      const expected = String(where.propertyType.name.contains).toLowerCase();
      if (!typeName.toLowerCase().includes(expected)) {
        return false;
      }
    }

    if (where?.monthlyFees?.gte !== undefined && house.monthlyFees < Number(where.monthlyFees.gte)) {
      return false;
    }

    if (where?.monthlyFees?.lte !== undefined && house.monthlyFees > Number(where.monthlyFees.lte)) {
      return false;
    }

    return true;
  });
};

jest.mock('../../src/prisma/client', () => {
  const prisma: any = {
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const user = users.get(where.id);
        if (!user) {
          return null;
        }

        return {
          ...user,
          userRoles: user.userRoles.map((item) => ({ role: { ...item.role } }))
        };
      })
    },
    house: {
      findMany: jest.fn(async ({ where, skip = 0, take }: { where?: any; skip?: number; take?: number }) => {
        const filtered = filterHouses(where).map((item) => hydrateHouse(item));
        const sliced = typeof take === 'number' ? filtered.slice(skip, skip + take) : filtered;
        return sliced;
      }),
      count: jest.fn(async ({ where }: { where?: any }) => {
        return filterHouses(where).length;
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const house = houses.get(where.id);
        if (!house) {
          return null;
        }

        return hydrateHouse(house);
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const id = `house-${houses.size + 1}`;

        const created: MockHouse = {
          id,
          agentId: data.agentId,
          title: data.title,
          description: data.description,
          postChannel: data.postChannel,
          propertyTypeId: data.propertyTypeId,
          monthlyFees: Number(data.monthlyFees),
          depositAmount: Number(data.depositAmount),
          contractTypeId: data.contractTypeId,
          areaSize: data.areaSize,
          floorLevelId: data.floorLevelId,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          houseRules: data.houseRules,
          contactTelegram: data.contactTelegram,
          contactViber: data.contactViber,
          contactPhoneNumber: data.contactPhoneNumber,
          cityId: data.cityId,
          stateId: data.stateId,
          nearbyPlaces: data.nearbyPlaces,
          availability: data.availability,
          createdAt: now,
          updatedAt: now
        };

        houses.set(id, created);

        for (const [index, image] of (data.images?.create ?? []).entries()) {
          houseImages.push({
            id: `img-${houseImages.length + 1}`,
            houseId: id,
            imagePath: image.imagePath,
            sortOrder: image.sortOrder ?? index + 1
          });
        }

        for (const amenity of data.amenities?.create ?? []) {
          houseAmenities.push({
            id: `ham-${houseAmenities.length + 1}`,
            houseId: id,
            amenityId: amenity.amenityId
          });
        }

        return hydrateHouse(created);
      }),
      update: jest.fn(),
      delete: jest.fn()
    },
    booking: {
      create: jest.fn(async ({ data }: { data: { userId: string; houseId: string; status: MockBooking['status'] } }) => {
        const booking: MockBooking = {
          id: `booking-${bookings.length + 1}`,
          userId: data.userId,
          houseId: data.houseId,
          status: data.status,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        bookings.push(booking);
        return booking;
      })
    },
    wishlist: {
      upsert: jest.fn(async ({ where, create }: { where: { userId_houseId: { userId: string; houseId: string } }; create: MockWishlist }) => {
        const existing = wishlists.find(
          (item) => item.userId === where.userId_houseId.userId && item.houseId === where.userId_houseId.houseId
        );

        if (existing) {
          return existing;
        }

        const created: MockWishlist = {
          id: `wishlist-${wishlists.length + 1}`,
          userId: create.userId,
          houseId: create.houseId,
          createdAt: new Date()
        };

        wishlists.push(created);
        return created;
      }),
      deleteMany: jest.fn(async ({ where }: { where: { userId: string; houseId: string } }) => {
        const initialLength = wishlists.length;
        const retained = wishlists.filter((item) => !(item.userId === where.userId && item.houseId === where.houseId));
        wishlists.length = 0;
        wishlists.push(...retained);
        return { count: initialLength - retained.length };
      }),
      findMany: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return wishlists
          .filter((item) => item.userId === where.userId)
          .map((item) => ({
            ...item,
            house: hydrateHouse(houses.get(item.houseId) as MockHouse)
          }));
      })
    },
    notification: {
      create: jest.fn(async ({ data }: { data: { userId: string; title: string; message: string } }) => {
        notifications.push(data);
        return { id: `notification-${notifications.length}` };
      })
    },
    houseImage: {
      deleteMany: jest.fn()
    },
    houseAmenity: {
      deleteMany: jest.fn()
    },
    agentProfile: {
      upsert: jest.fn(async ({ where, create, update }: { where: { userId: string }; create: any; update: any }) => {
        return {
          id: `profile-${where.userId}`,
          userId: where.userId,
          ...create,
          ...update
        };
      })
    },
    role: { upsert: jest.fn(), findMany: jest.fn() },
    userRole: { deleteMany: jest.fn(), createMany: jest.fn() },
    auditLog: { create: jest.fn() },
    refreshSession: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    propertyType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    state: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    city: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    contractType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    vehicleType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    serviceRegion: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    floorLevel: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    occupation: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    amenity: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    statusCode: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>): Promise<unknown> => callback(prisma))
  };

  return { prisma };
});

const normalUserToken = signJwt({ sub: 'user-normal', email: 'normal@example.com', roles: ['normal'] }, '1h');
const unverifiedAgentToken = signJwt({ sub: 'agent-pending', email: 'agent.pending@example.com', roles: ['agent'] }, '1h');
const verifiedAgentToken = signJwt({ sub: 'agent-verified', email: 'agent.verified@example.com', roles: ['agent'] }, '1h');

const seedBaseData = () => {
  users.clear();
  houses.clear();
  houseImages.length = 0;
  houseAmenities.length = 0;
  bookings.length = 0;
  wishlists.length = 0;
  notifications.length = 0;

  users.set('user-normal', {
    id: 'user-normal',
    name: 'Normal User',
    email: 'normal@example.com',
    phone: '0911111111',
    verificationStatus: 'VERIFIED',
    userRoles: [{ role: roles.get('normal') as MockRole }]
  });

  users.set('agent-pending', {
    id: 'agent-pending',
    name: 'Pending Agent',
    email: 'agent.pending@example.com',
    phone: '0922222222',
    verificationStatus: 'PENDING',
    userRoles: [{ role: roles.get('agent') as MockRole }]
  });

  users.set('agent-verified', {
    id: 'agent-verified',
    name: 'Verified Agent',
    email: 'agent.verified@example.com',
    phone: '0933333333',
    verificationStatus: 'VERIFIED',
    userRoles: [{ role: roles.get('agent') as MockRole }]
  });

  const now = new Date();

  houses.set('house-1', {
    id: 'house-1',
    agentId: 'agent-verified',
    title: 'Downtown Apartment',
    description: 'Near transport hub',
    postChannel: 'AGENT',
    propertyTypeId: 'ptype-apartment',
    monthlyFees: 500,
    depositAmount: 1000,
    contractTypeId: 'contract-6m',
    areaSize: '900 sqft',
    floorLevelId: 'floor-1',
    bedrooms: 2,
    bathrooms: 1,
    houseRules: 'No smoking indoors',
    contactTelegram: '@agent',
    contactViber: 'agent-viber',
    contactPhoneNumber: '0999999999',
    cityId: 'city-1',
    stateId: 'state-1',
    nearbyPlaces: 'Mall, Hospital',
    availability: 'AVAILABLE',
    createdAt: now,
    updatedAt: now
  });

  houseImages.push({ id: 'img-1', houseId: 'house-1', imagePath: '/houses/1.jpg', sortOrder: 1 });
  houseAmenities.push({ id: 'ha-1', houseId: 'house-1', amenityId: 'amenity-wifi' });
};

describe('Housing, booking, wishlist, and agent house APIs', () => {
  beforeEach(() => {
    seedBaseData();
  });

  it('lists houses with filters and returns house details', async () => {
    const listResponse = await request(app).get('/api/v1/houses').query({ city: 'Yangon', type: 'Apartment', minBudget: 400, maxBudget: 600 });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.items).toHaveLength(1);
    expect(listResponse.body.data.items[0].title).toBe('Downtown Apartment');

    const detailResponse = await request(app).get('/api/v1/houses/house-1');

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.success).toBe(true);
    expect(detailResponse.body.data.item.agent.name).toBe('Verified Agent');
    expect(detailResponse.body.data.item.amenities).toHaveLength(1);
  });

  it('requires auth for booking and creates booking when authenticated', async () => {
    const unauthResponse = await request(app).post('/api/v1/houses/house-1/bookings').send({});

    expect(unauthResponse.status).toBe(401);

    const bookingResponse = await request(app)
      .post('/api/v1/houses/house-1/bookings')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .send({});

    expect(bookingResponse.status).toBe(201);
    expect(bookingResponse.body.success).toBe(true);
    expect(bookings).toHaveLength(1);
    expect(notifications).toHaveLength(1);
  });

  it('adds, lists, and removes wishlist items for authenticated users', async () => {
    const addResponse = await request(app)
      .post('/api/v1/wishlist/house-1')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .send({});

    expect(addResponse.status).toBe(201);

    const listResponse = await request(app).get('/api/v1/wishlist').set('Authorization', `Bearer ${normalUserToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.items).toHaveLength(1);

    const removeResponse = await request(app)
      .delete('/api/v1/wishlist/house-1')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .send({});

    expect(removeResponse.status).toBe(200);

    const afterRemove = await request(app).get('/api/v1/wishlist').set('Authorization', `Bearer ${normalUserToken}`);
    expect(afterRemove.body.data.items).toHaveLength(0);
  });

  it('denies house create for unverified agent and allows verified agent', async () => {
    const payload = {
      title: 'New Agent Listing',
      postChannel: 'agent',
      propertyTypeId: 'ptype-apartment',
      monthlyFees: 650,
      depositAmount: 1300,
      contractTypeId: 'contract-6m',
      bedrooms: 2,
      bathrooms: 1,
      contactPhoneNumber: '0944444444',
      cityId: 'city-1',
      stateId: 'state-1',
      availability: 'available',
      imagePaths: ['/houses/new-1.jpg'],
      amenityIds: ['amenity-wifi']
    };

    const deniedResponse = await request(app)
      .post('/api/v1/agent/houses')
      .set('Authorization', `Bearer ${unverifiedAgentToken}`)
      .send(payload);

    expect(deniedResponse.status).toBe(403);
    expect(deniedResponse.body.errors.code).toBe('AGENT_NOT_VERIFIED');

    const allowedResponse = await request(app)
      .post('/api/v1/agent/houses')
      .set('Authorization', `Bearer ${verifiedAgentToken}`)
      .send(payload);

    expect(allowedResponse.status).toBe(201);
    expect(allowedResponse.body.success).toBe(true);
    expect(allowedResponse.body.data.house.title).toBe('New Agent Listing');
  });
});
