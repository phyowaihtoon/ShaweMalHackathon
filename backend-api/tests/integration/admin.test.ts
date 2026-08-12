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
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  userRoles: Array<{ role: MockRole }>;
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
const propertyTypes = new Map<string, PropertyTypeRecord>();
const auditEntries: Array<{ action: string; targetId?: string }> = [];

const cloneUser = (user: MockUser): MockUser => ({
  ...user,
  userRoles: user.userRoles.map((entry) => ({ role: { ...entry.role } }))
});

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
            verificationStatus: 'PENDING',
            userRoles: createdRoles
          };

          users.set(created.id, created);
          return cloneUser(created);
        }
      ),
      update: jest.fn(async ({ where, data }: { where: { id: string }; data: { verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' } }) => {
        const found = users.get(where.id);
        if (!found) {
          throw new Error('User not found');
        }

        if (data.verificationStatus) {
          found.verificationStatus = data.verificationStatus;
        }

        users.set(found.id, found);
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
    notification: { create: jest.fn() },
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
    propertyTypes.clear();
    auditEntries.length = 0;

    seedUser({
      id: 'agent-user',
      name: 'Agent User',
      email: 'agent@example.com',
      phone: '0910000001',
      passwordHash: 'x',
      verificationStatus: 'PENDING',
      userRoles: [{ role: { id: 'role-agent', name: 'agent' } }]
    });

    seedUser({
      id: 'driver-user',
      name: 'Driver User',
      email: 'driver@example.com',
      phone: '0910000002',
      passwordHash: 'x',
      verificationStatus: 'PENDING',
      userRoles: [{ role: { id: 'role-driver', name: 'driver' } }]
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

  it('updates agent and driver verification', async () => {
    const agentResponse = await request(app)
      .patch('/api/v1/admin/agents/agent-user/verification')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approve' });

    expect(agentResponse.status).toBe(200);
    expect(agentResponse.body.data.user.verificationStatus).toBe('VERIFIED');

    const driverResponse = await request(app)
      .patch('/api/v1/admin/drivers/driver-user/verification')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'reject' });

    expect(driverResponse.status).toBe(200);
    expect(driverResponse.body.data.user.verificationStatus).toBe('REJECTED');
    expect(auditEntries.length).toBeGreaterThanOrEqual(2);
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
