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
  passwordHash: string;
  userRoles: Array<{ role: MockRole }>;
}

interface MockAgentProfile {
  id: string;
  userId: string;
  name: string;
  nrc: string;
  nrcFrontPhotoPath: string;
  nrcBackPhotoPath: string;
  email: string;
  phone: string;
  telegram: string | null;
  viber: string | null;
  address1: string;
  address2: string | null;
  cityId: string;
  stateId: string;
  serviceRegionId: string;
  hasRentingExperience: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

interface MockDriverProfile {
  id: string;
  userId: string;
  name: string;
  companyName: string | null;
  nrc: string;
  nrcFrontPhotoPath: string;
  nrcBackPhotoPath: string;
  drivingLicensePhotoPath: string;
  profilePhotoPath: string;
  phone: string;
  currentAddress: string;
  vehicleTypeId: string;
  vehicleLicensePlateNumber: string;
  vehiclePhotoPath: string;
  wheelTaxPhotoPath: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

interface PropertyTypeRecord {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const roles = new Map<string, MockRole>([
  ['normal', { id: 'role-normal', name: 'normal' }],
  ['agent', { id: 'role-agent', name: 'agent' }],
  ['driver', { id: 'role-driver', name: 'driver' }],
  ['admin', { id: 'role-admin', name: 'admin' }]
]);
const users = new Map<string, MockUser>();
const agentProfiles = new Map<string, MockAgentProfile>();
const driverProfiles = new Map<string, MockDriverProfile>();
const propertyTypes = new Map<string, PropertyTypeRecord>();
const auditEntries: Array<{ action: string; targetId?: string }> = [];
const notifications: Array<{ userId: string; title: string; message: string }> = [];

const namedCity = { id: 'city-1', name: 'Yangon' };
const namedState = { id: 'state-1', name: 'Yangon Region' };
const namedRegion = { id: 'region-1', name: 'Downtown' };
const namedVehicle = { id: 'vt-1', name: 'Light Truck' };

const cloneUser = (user: MockUser) => {
  const agent = agentProfiles.get(user.id);
  const driver = driverProfiles.get(user.id);

  return {
    ...user,
    userRoles: user.userRoles.map((entry) => ({ role: { ...entry.role } })),
    agentProfile: agent
      ? {
          ...agent,
          city: namedCity,
          state: namedState,
          serviceRegion: namedRegion
        }
      : null,
    driverProfile: driver
      ? {
          ...driver,
          vehicleType: namedVehicle
        }
      : null
  };
};

const matchesQuery = (value: string, q?: string) => {
  if (!q) {
    return true;
  }

  return value.toLowerCase().includes(q.toLowerCase());
};

const extractContains = (orFilters?: Array<Record<string, unknown>>): string | undefined => {
  if (!orFilters) {
    return undefined;
  }

  for (const filter of orFilters) {
    for (const value of Object.values(filter)) {
      if (value && typeof value === 'object' && 'contains' in value) {
        return String((value as { contains: string }).contains);
      }
    }
  }

  return undefined;
};

jest.mock('../../src/prisma/client', () => {
  const prisma: any = {
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id) {
          const byId = users.get(where.id);
          return byId ? cloneUser(byId) : null;
        }

        if (where.email) {
          const byEmail = Array.from(users.values()).find((item) => item.email === where.email);
          return byEmail ? cloneUser(byEmail) : null;
        }

        return null;
      }),
      create: jest.fn(
        async ({
          data
        }: {
          data: { name: string; email: string; phone: string; passwordHash: string; userRoles: { create: Array<{ roleId: string }> } };
        }) => {
          const createdRoles = data.userRoles.create.map((entry) => {
            const role = Array.from(roles.values()).find((item) => item.id === entry.roleId);
            if (!role) {
              throw new Error('Role not found');
            }

            return { role };
          });

          const created: MockUser = {
            id: `user-${users.size + 1}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash: data.passwordHash,
            userRoles: createdRoles
          };

          users.set(created.id, created);
          return cloneUser(created);
        }
      ),
      update: jest.fn(async ({ where }: { where: { id: string } }) => {
        const found = users.get(where.id);
        if (!found) {
          throw new Error('User not found');
        }

        return cloneUser(found);
      })
    },
    role: {
      upsert: jest.fn(async ({ where, create }: { where: { name: string }; create: { name: string } }) => {
        const found = roles.get(where.name);
        if (found) {
          return found;
        }

        const role = { id: `role-${create.name}`, name: create.name };
        roles.set(create.name, role);
        return role;
      }),
      findMany: jest.fn(async ({ where }: { where: { name: { in: string[] } } }) => {
        return where.name.in.map((name) => roles.get(name)).filter((item): item is MockRole => Boolean(item));
      })
    },
    userRole: {
      deleteMany: jest.fn(async ({ where }: { where: { userId: string } }) => {
        const target = users.get(where.userId);
        if (target) {
          target.userRoles = [];
          users.set(target.id, target);
        }

        return { count: 1 };
      }),
      createMany: jest.fn(async ({ data }: { data: Array<{ userId: string; roleId: string }> }) => {
        for (const entry of data) {
          const target = users.get(entry.userId);
          const role = Array.from(roles.values()).find((item) => item.id === entry.roleId);
          if (target && role) {
            target.userRoles.push({ role });
            users.set(target.id, target);
          }
        }

        return { count: data.length };
      })
    },
    auditLog: {
      create: jest.fn(async ({ data }: { data: { action: string; targetId?: string } }) => {
        auditEntries.push({ action: data.action, targetId: data.targetId });
        return { id: `audit-${auditEntries.length}` };
      })
    },
    notification: {
      create: jest.fn(async ({ data }: { data: { userId: string; title: string; message: string } }) => {
        notifications.push(data);
        return { id: `notification-${notifications.length}`, ...data };
      })
    },
    agentProfile: {
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => agentProfiles.get(where.userId) ?? null),
      update: jest.fn(
        async ({
          where,
          data
        }: {
          where: { userId: string };
          data: {
            verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
            rejectionReason: string | null;
            reviewedAt: Date | null;
          };
        }) => {
          const found = agentProfiles.get(where.userId);
          if (!found) {
            throw new Error('Agent profile not found');
          }

          const updated = { ...found, ...data };
          agentProfiles.set(where.userId, updated);
          return updated;
        }
      ),
      findMany: jest.fn(
        async ({
          where,
          skip = 0,
          take
        }: {
          where?: {
            verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
            OR?: Array<Record<string, unknown>>;
          };
          skip?: number;
          take?: number;
        }) => {
          let items = Array.from(agentProfiles.values());
          if (where?.verificationStatus) {
            items = items.filter((item) => item.verificationStatus === where.verificationStatus);
          }

          const q = typeof where?.OR?.[0] === 'object' ? extractContains(where.OR) : undefined;
          if (q) {
            items = items.filter((item) => {
              const user = users.get(item.userId);
              return (
                matchesQuery(item.name, q) ||
                matchesQuery(item.nrc, q) ||
                matchesQuery(item.email, q) ||
                matchesQuery(item.phone, q) ||
                matchesQuery(user?.name ?? '', q) ||
                matchesQuery(user?.email ?? '', q) ||
                matchesQuery(user?.phone ?? '', q)
              );
            });
          }

          return items.slice(skip, typeof take === 'number' ? skip + take : undefined).map((profile) => ({
            ...profile,
            user: users.get(profile.userId),
            city: namedCity,
            state: namedState,
            serviceRegion: namedRegion
          }));
        }
      ),
      count: jest.fn(async ({ where }: { where?: { verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' } }) => {
        let items = Array.from(agentProfiles.values());
        if (where?.verificationStatus) {
          items = items.filter((item) => item.verificationStatus === where.verificationStatus);
        }
        return items.length;
      })
    },
    driverProfile: {
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => driverProfiles.get(where.userId) ?? null),
      update: jest.fn(
        async ({
          where,
          data
        }: {
          where: { userId: string };
          data: {
            verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
            rejectionReason: string | null;
            reviewedAt: Date | null;
          };
        }) => {
          const found = driverProfiles.get(where.userId);
          if (!found) {
            throw new Error('Driver profile not found');
          }

          const updated = { ...found, ...data };
          driverProfiles.set(where.userId, updated);
          return updated;
        }
      ),
      findMany: jest.fn(
        async ({
          where,
          skip = 0,
          take
        }: {
          where?: { verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' };
          skip?: number;
          take?: number;
        }) => {
          let items = Array.from(driverProfiles.values());
          if (where?.verificationStatus) {
            items = items.filter((item) => item.verificationStatus === where.verificationStatus);
          }

          return items.slice(skip, typeof take === 'number' ? skip + take : undefined).map((profile) => ({
            ...profile,
            user: users.get(profile.userId),
            vehicleType: namedVehicle
          }));
        }
      ),
      count: jest.fn(async ({ where }: { where?: { verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' } }) => {
        let items = Array.from(driverProfiles.values());
        if (where?.verificationStatus) {
          items = items.filter((item) => item.verificationStatus === where.verificationStatus);
        }
        return items.length;
      })
    },
    propertyType: {
      findMany: jest.fn(async ({ where }: { where: { isActive?: boolean } }) => {
        const all = Array.from(propertyTypes.values());
        if (typeof where.isActive === 'boolean') {
          return all.filter((item) => item.isActive === where.isActive);
        }

        return all;
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return propertyTypes.get(where.id) ?? null;
      }),
      create: jest.fn(async ({ data }: { data: { name: string; description?: string; isActive?: boolean } }) => {
        const created: PropertyTypeRecord = {
          id: `pt-${propertyTypes.size + 1}`,
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true
        };

        propertyTypes.set(created.id, created);
        return created;
      }),
      update: jest.fn(async ({ where, data }: { where: { id: string }; data: Partial<PropertyTypeRecord> }) => {
        const found = propertyTypes.get(where.id);
        if (!found) {
          const missing = new Error('Missing') as Error & { code?: string };
          missing.code = 'P2025';
          throw missing;
        }

        const updated = { ...found, ...data };
        propertyTypes.set(found.id, updated);
        return updated;
      })
    },
    state: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    city: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    contractType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    vehicleType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    serviceRegion: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    floorLevel: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    occupation: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    amenity: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    statusCode: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    movingInventoryItemType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    refreshSession: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>): Promise<unknown> => callback(prisma))
  };

  return { prisma };
});

const adminToken = signJwt({ sub: 'admin-user', email: 'admin@example.com', roles: ['admin'] }, '1h');

const seedUser = (input: MockUser) => {
  users.set(input.id, input);
};

describe('Admin endpoints', () => {
  beforeEach(() => {
    users.clear();
    agentProfiles.clear();
    driverProfiles.clear();
    propertyTypes.clear();
    auditEntries.length = 0;
    notifications.length = 0;

    seedUser({
      id: 'agent-user',
      name: 'Agent User',
      email: 'agent@example.com',
      phone: '0910000001',
      passwordHash: 'x',
      userRoles: [{ role: { id: 'role-agent', name: 'agent' } }]
    });
    agentProfiles.set('agent-user', {
      id: 'agent-profile-1',
      userId: 'agent-user',
      name: 'Agent User',
      nrc: '12/YGN(N)123456',
      nrcFrontPhotoPath: 'uploads/docs/nrc-front.jpg',
      nrcBackPhotoPath: 'uploads/docs/nrc-back.jpg',
      email: 'agent@example.com',
      phone: '0910000001',
      telegram: null,
      viber: null,
      address1: 'Street 1',
      address2: null,
      cityId: 'city-1',
      stateId: 'state-1',
      serviceRegionId: 'region-1',
      hasRentingExperience: true,
      verificationStatus: 'PENDING',
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date('2026-08-01T00:00:00.000Z')
    });

    seedUser({
      id: 'driver-user',
      name: 'Driver User',
      email: 'driver@example.com',
      phone: '0910000002',
      passwordHash: 'x',
      userRoles: [{ role: { id: 'role-driver', name: 'driver' } }]
    });
    driverProfiles.set('driver-user', {
      id: 'driver-profile-1',
      userId: 'driver-user',
      name: 'Driver User',
      companyName: null,
      nrc: '12/YGN(N)654321',
      nrcFrontPhotoPath: 'uploads/docs/d-nrc-front.jpg',
      nrcBackPhotoPath: 'uploads/docs/d-nrc-back.jpg',
      drivingLicensePhotoPath: 'uploads/docs/license.jpg',
      profilePhotoPath: 'uploads/profile/driver.jpg',
      phone: '0910000002',
      currentAddress: 'Yangon',
      vehicleTypeId: 'vt-1',
      vehicleLicensePlateNumber: 'YGN-1234',
      vehiclePhotoPath: 'uploads/docs/vehicle.jpg',
      wheelTaxPhotoPath: 'uploads/docs/wheeltax.jpg',
      verificationStatus: 'PENDING',
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date('2026-08-02T00:00:00.000Z')
    });

    seedUser({
      id: 'dual-user',
      name: 'Dual User',
      email: 'dual@example.com',
      phone: '0910000003',
      passwordHash: 'x',
      userRoles: [
        { role: { id: 'role-agent', name: 'agent' } },
        { role: { id: 'role-driver', name: 'driver' } }
      ]
    });
    agentProfiles.set('dual-user', {
      id: 'agent-profile-dual',
      userId: 'dual-user',
      name: 'Dual User',
      nrc: '12/YGN(N)111111',
      nrcFrontPhotoPath: 'uploads/docs/dual-nrc-front.jpg',
      nrcBackPhotoPath: 'uploads/docs/dual-nrc-back.jpg',
      email: 'dual@example.com',
      phone: '0910000003',
      telegram: null,
      viber: null,
      address1: 'Street 2',
      address2: null,
      cityId: 'city-1',
      stateId: 'state-1',
      serviceRegionId: 'region-1',
      hasRentingExperience: false,
      verificationStatus: 'PENDING',
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date('2026-08-03T00:00:00.000Z')
    });
    driverProfiles.set('dual-user', {
      id: 'driver-profile-dual',
      userId: 'dual-user',
      name: 'Dual User',
      companyName: 'Dual Co',
      nrc: '12/YGN(N)111111',
      nrcFrontPhotoPath: 'uploads/docs/dual-nrc-front.jpg',
      nrcBackPhotoPath: 'uploads/docs/dual-nrc-back.jpg',
      drivingLicensePhotoPath: 'uploads/docs/dual-license.jpg',
      profilePhotoPath: 'uploads/profile/dual.jpg',
      phone: '0910000003',
      currentAddress: 'Yangon',
      vehicleTypeId: 'vt-1',
      vehicleLicensePlateNumber: 'YGN-9999',
      vehiclePhotoPath: 'uploads/docs/dual-vehicle.jpg',
      wheelTaxPhotoPath: 'uploads/docs/dual-wheeltax.jpg',
      verificationStatus: 'PENDING',
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date('2026-08-03T00:00:00.000Z')
    });
  });

  it('creates admin user and updates roles', async () => {
    const createResponse = await request(app).post('/api/v1/admin/users').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'New Driver',
      email: 'newdriver@example.com',
      phone: '0911111111',
      password: 'Passw0rd!',
      role: 'driver'
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.user.roles).toEqual(['driver']);

    const targetId = createResponse.body.data.user.id as string;

    const roleResponse = await request(app)
      .patch(`/api/v1/admin/users/${targetId}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roles: ['normal', 'agent'] });

    expect(roleResponse.status).toBe(200);
    expect(roleResponse.body.data.user.roles).toEqual(expect.arrayContaining(['normal', 'agent']));
  });

  it('lists pending agent registrations without requiring a user id (FR-ADMIN-001)', async () => {
    const response = await request(app).get('/api/v1/admin/agents').set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: 'agent-user',
          nrc: '12/YGN(N)123456',
          verificationStatus: 'PENDING',
          city: namedCity
        })
      ])
    );
  });

  it('updates agent and driver verification independently and notifies on reject (FR-ADMIN-001, FR-ADMIN-002)', async () => {
    const agentResponse = await request(app)
      .patch('/api/v1/admin/agents/agent-user/verification')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approve' });

    expect(agentResponse.status).toBe(200);
    expect(agentResponse.body.data.user.agentVerificationStatus).toBe('VERIFIED');
    expect(agentResponse.body.data.user.driverVerificationStatus).toBeNull();

    const driverResponse = await request(app)
      .patch('/api/v1/admin/drivers/driver-user/verification')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'reject', rejectionReason: 'Unreadable license photo' });

    expect(driverResponse.status).toBe(200);
    expect(driverResponse.body.data.user.driverVerificationStatus).toBe('REJECTED');
    expect(auditEntries.length).toBeGreaterThanOrEqual(2);
    expect(notifications.some((item) => item.userId === 'driver-user' && item.message.includes('Unreadable license photo'))).toBe(
      true
    );
  });

  it('approves agent verification without changing driver status on a dual-role user (FR-ADMIN-001, FR-ADMIN-002)', async () => {
    const response = await request(app)
      .patch('/api/v1/admin/agents/dual-user/verification')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approve' });

    expect(response.status).toBe(200);
    expect(response.body.data.user.agentVerificationStatus).toBe('VERIFIED');
    expect(response.body.data.user.driverVerificationStatus).toBe('PENDING');
  });

  it('supports property-types CRUD and validation failure', async () => {
    const invalidCreate = await request(app)
      .post('/api/v1/admin/master-data/property-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(invalidCreate.status).toBe(400);

    const createResponse = await request(app)
      .post('/api/v1/admin/master-data/property-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Apartment', description: 'Apartment type' });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body.data.item.id as string;

    const listResponse = await request(app)
      .get('/api/v1/admin/master-data/property-types')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.items.length).toBe(1);

    const detailResponse = await request(app)
      .get(`/api/v1/admin/master-data/property-types/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.item.name).toBe('Apartment');

    const updateResponse = await request(app)
      .patch(`/api/v1/admin/master-data/property-types/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated type' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.item.description).toBe('Updated type');

    const deleteResponse = await request(app)
      .delete(`/api/v1/admin/master-data/property-types/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.item.isActive).toBe(false);
  });
});
