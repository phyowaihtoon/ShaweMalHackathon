import { MovingRequestStatus, MovingStatusEventType } from '@prisma/client';
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
  isActive: boolean;
  userRoles: Array<{ role: MockRole }>;
}

interface MockVehicleType {
  id: string;
  name: string;
  isActive: boolean;
  capacityLabel?: string;
  maxLoadKg?: number;
}

interface MockMovingRequest {
  id: string;
  requesterUserId: string;
  assignedDriverUserId: string | null;
  vehicleTypeId: string;
  status: MovingRequestStatus;
  pickupAddress: string;
  dropoffAddress: string;
  moveInDate: Date;
  remarks: string | null;
  damageChecklist: string | null;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockMovingRequestPhoto {
  id: string;
  movingRequestId: string;
  photoPath: string;
  sortOrder: number;
  createdAt: Date;
}

interface MockMovingInventoryItem {
  id: string;
  movingRequestId: string;
  category: string;
  itemName: string;
  count: number;
  createdAt: Date;
}

interface MockMovingStatusEvent {
  id: string;
  movingRequestId: string;
  actorUserId: string | null;
  eventType: MovingStatusEventType;
  status: MovingRequestStatus | null;
  notes: string | null;
  createdAt: Date;
}

interface MockMovingEtaEntry {
  id: string;
  movingRequestId: string;
  driverUserId: string;
  stage: string;
  etaAt: Date;
  notes: string | null;
  createdAt: Date;
}

const roles = new Map<string, MockRole>([
  ['normal', { id: 'role-normal', name: 'normal' }],
  ['driver', { id: 'role-driver', name: 'driver' }],
  ['admin', { id: 'role-admin', name: 'admin' }]
]);

const users = new Map<string, MockUser>();
const vehicleTypes = new Map<string, MockVehicleType>();
const movingRequests = new Map<string, MockMovingRequest>();
const movingPhotos: MockMovingRequestPhoto[] = [];
const movingInventoryItems: MockMovingInventoryItem[] = [];
const movingStatusEvents: MockMovingStatusEvent[] = [];
const movingEtaEntries: MockMovingEtaEntry[] = [];
const notifications: Array<{ userId: string; title: string; message: string }> = [];
const driverProfiles: Array<{ userId: string; vehicleTypeId: string }> = [];

const getUserByRole = (name: string) => {
  return Array.from(users.values()).filter((user) => user.userRoles.some((entry) => entry.role.name === name));
};

const cloneUser = (user: MockUser): MockUser => ({
  ...user,
  userRoles: user.userRoles.map((entry) => ({ role: { ...entry.role } }))
});

const hydrateMovingRequest = (movingRequest: MockMovingRequest) => {
  const requester = users.get(movingRequest.requesterUserId);
  const assignedDriver = movingRequest.assignedDriverUserId ? users.get(movingRequest.assignedDriverUserId) : null;
  const vehicleType = vehicleTypes.get(movingRequest.vehicleTypeId);

  return {
    ...movingRequest,
    requester: {
      id: requester?.id ?? 'unknown-requester',
      name: requester?.name ?? 'Unknown Requester',
      phone: requester?.phone ?? '0000000',
      email: requester?.email ?? 'unknown@example.com'
    },
    assignedDriver: assignedDriver
      ? {
          id: assignedDriver.id,
          name: assignedDriver.name,
          phone: assignedDriver.phone,
          email: assignedDriver.email
        }
      : null,
    vehicleType: {
      id: vehicleType?.id ?? 'vehicle-unknown',
      name: vehicleType?.name ?? 'Unknown Vehicle',
      capacityLabel: vehicleType?.capacityLabel ?? null,
      maxLoadKg: vehicleType?.maxLoadKg ?? null
    },
    photos: movingPhotos
      .filter((item) => item.movingRequestId === movingRequest.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    inventoryItems: movingInventoryItems
      .filter((item) => item.movingRequestId === movingRequest.id)
      .sort((a, b) => {
        const byCategory = a.category.localeCompare(b.category);
        if (byCategory !== 0) {
          return byCategory;
        }

        return a.itemName.localeCompare(b.itemName);
      }),
    statusEvents: movingStatusEvents
      .filter((item) => item.movingRequestId === movingRequest.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    etaEntries: movingEtaEntries
      .filter((item) => item.movingRequestId === movingRequest.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  };
};

const projectMovingRequest = (record: MockMovingRequest, select?: Record<string, boolean>) => {
  if (!select) {
    return { ...record };
  }

  const projected: Record<string, unknown> = {};
  Object.entries(select).forEach(([key, enabled]) => {
    if (enabled) {
      projected[key] = (record as unknown as Record<string, unknown>)[key];
    }
  });

  return projected;
};

jest.mock('../../src/prisma/client', () => {
  const prisma: any = {
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const user = users.get(where.id);
        return user ? cloneUser(user) : null;
      }),
      findMany: jest.fn(async ({ where }: { where: any }) => {
        const activeUsers = Array.from(users.values()).filter((user) => user.isActive);

        if (
          where?.verificationStatus === 'VERIFIED' &&
          where?.userRoles?.some?.role?.name === 'driver'
        ) {
          return getUserByRole('driver')
            .filter((user) => user.verificationStatus === 'VERIFIED' && user.isActive)
            .map((user) => ({ id: user.id }));
        }

        return activeUsers;
      })
    },
    vehicleType: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return vehicleTypes.get(where.id) ?? null;
      })
    },
    movingRequest: {
      create: jest.fn(async ({ data }: { data: any }) => {
        const now = new Date();
        const id = `moving-${movingRequests.size + 1}`;

        const created: MockMovingRequest = {
          id,
          requesterUserId: data.requesterUserId,
          assignedDriverUserId: data.assignedDriverUserId ?? null,
          vehicleTypeId: data.vehicleTypeId,
          status: data.status ?? MovingRequestStatus.PENDING,
          pickupAddress: data.pickupAddress,
          dropoffAddress: data.dropoffAddress,
          moveInDate: new Date(data.moveInDate),
          remarks: data.remarks ?? null,
          damageChecklist: data.damageChecklist ?? null,
          acceptedAt: data.acceptedAt ?? null,
          createdAt: now,
          updatedAt: now
        };

        movingRequests.set(id, created);

        for (const [index, photo] of (data.photos?.create ?? []).entries()) {
          movingPhotos.push({
            id: `moving-photo-${movingPhotos.length + 1}`,
            movingRequestId: id,
            photoPath: photo.photoPath,
            sortOrder: photo.sortOrder ?? index + 1,
            createdAt: now
          });
        }

        for (const item of data.inventoryItems?.create ?? []) {
          movingInventoryItems.push({
            id: `moving-item-${movingInventoryItems.length + 1}`,
            movingRequestId: id,
            category: item.category,
            itemName: item.itemName,
            count: item.count,
            createdAt: now
          });
        }

        if (data.statusEvents?.create) {
          movingStatusEvents.push({
            id: `moving-event-${movingStatusEvents.length + 1}`,
            movingRequestId: id,
            actorUserId: data.statusEvents.create.actorUserId ?? null,
            eventType: data.statusEvents.create.eventType,
            status: data.statusEvents.create.status ?? null,
            notes: data.statusEvents.create.notes ?? null,
            createdAt: now
          });
        }

        return hydrateMovingRequest(created);
      }),
      findUnique: jest.fn(async ({ where, include, select }: { where: { id: string }; include?: any; select?: Record<string, boolean> }) => {
        const found = movingRequests.get(where.id);
        if (!found) {
          return null;
        }

        if (include) {
          return hydrateMovingRequest(found);
        }

        return projectMovingRequest(found, select);
      }),
      findMany: jest.fn(async ({ where }: { where: any }) => {
        const items = Array.from(movingRequests.values()).filter((item) => {
          if (where?.status && item.status !== where.status) {
            return false;
          }

          if (where?.assignedDriverUserId === null && item.assignedDriverUserId !== null) {
            return false;
          }

          const rejectedByDriver = where?.statusEvents?.none;
          if (rejectedByDriver) {
            const hasRejection = movingStatusEvents.some(
              (event) =>
                event.movingRequestId === item.id &&
                event.actorUserId === rejectedByDriver.actorUserId &&
                event.eventType === rejectedByDriver.eventType
            );

            if (hasRejection) {
              return false;
            }
          }

          return true;
        });

        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((item) => hydrateMovingRequest(item));
      }),
      updateMany: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const found = movingRequests.get(where.id);
        if (!found) {
          return { count: 0 };
        }

        if (where.status && found.status !== where.status) {
          return { count: 0 };
        }

        if (where.assignedDriverUserId === null && found.assignedDriverUserId !== null) {
          return { count: 0 };
        }

        const updated: MockMovingRequest = {
          ...found,
          status: data.status ?? found.status,
          assignedDriverUserId: data.assignedDriverUserId ?? found.assignedDriverUserId,
          acceptedAt: data.acceptedAt ?? found.acceptedAt,
          updatedAt: new Date()
        };

        movingRequests.set(found.id, updated);
        return { count: 1 };
      }),
      update: jest.fn(async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
        const found = movingRequests.get(where.id);
        if (!found) {
          throw new Error('Moving request not found');
        }

        const updated: MockMovingRequest = {
          ...found,
          status: data.status ?? found.status,
          updatedAt: new Date()
        };

        movingRequests.set(where.id, updated);

        if (include) {
          return hydrateMovingRequest(updated);
        }

        return updated;
      })
    },
    movingStatusEvent: {
      findFirst: jest.fn(async ({ where }: { where: any }) => {
        const found = movingStatusEvents.find((event) => {
          if (where?.movingRequestId && event.movingRequestId !== where.movingRequestId) {
            return false;
          }

          if (where?.actorUserId && event.actorUserId !== where.actorUserId) {
            return false;
          }

          if (where?.eventType && event.eventType !== where.eventType) {
            return false;
          }

          return true;
        });

        return found ? { id: found.id } : null;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const created: MockMovingStatusEvent = {
          id: `moving-event-${movingStatusEvents.length + 1}`,
          movingRequestId: data.movingRequestId,
          actorUserId: data.actorUserId ?? null,
          eventType: data.eventType,
          status: data.status ?? null,
          notes: data.notes ?? null,
          createdAt: new Date()
        };

        movingStatusEvents.push(created);
        return created;
      })
    },
    movingEtaEntry: {
      create: jest.fn(async ({ data }: { data: any }) => {
        const created: MockMovingEtaEntry = {
          id: `moving-eta-${movingEtaEntries.length + 1}`,
          movingRequestId: data.movingRequestId,
          driverUserId: data.driverUserId,
          stage: data.stage,
          etaAt: new Date(data.etaAt),
          notes: data.notes ?? null,
          createdAt: new Date()
        };

        movingEtaEntries.push(created);
        return created;
      })
    },
    driverProfile: {
      upsert: jest.fn(async ({ where, create, update }: { where: { userId: string }; create: any; update: any }) => {
        const existing = driverProfiles.find((item) => item.userId === where.userId);
        const vehicleTypeId = (existing ? update.vehicleTypeId : create.vehicleTypeId) as string;

        if (existing) {
          existing.vehicleTypeId = vehicleTypeId;
        } else {
          driverProfiles.push({ userId: where.userId, vehicleTypeId });
        }

        return {
          id: `driver-profile-${where.userId}`,
          ...create,
          ...update,
          userId: where.userId,
          vehicleType: {
            id: vehicleTypeId,
            name: vehicleTypes.get(vehicleTypeId)?.name ?? 'Unknown'
          }
        };
      })
    },
    notification: {
      create: jest.fn(async ({ data }: { data: { userId: string; title: string; message: string } }) => {
        notifications.push(data);
        return { id: `notification-${notifications.length}` };
      }),
      createMany: jest.fn(async ({ data }: { data: Array<{ userId: string; title: string; message: string }> }) => {
        notifications.push(...data);
        return { count: data.length };
      })
    },
    role: { upsert: jest.fn(), findMany: jest.fn() },
    userRole: { deleteMany: jest.fn(), createMany: jest.fn() },
    refreshSession: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    auditLog: { create: jest.fn() },
    propertyType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    state: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    city: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    contractType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    serviceRegion: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    floorLevel: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    occupation: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    amenity: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    statusCode: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    house: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    booking: { create: jest.fn() },
    wishlist: { upsert: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() },
    agentProfile: { upsert: jest.fn() },
    houseImage: { deleteMany: jest.fn() },
    houseAmenity: { deleteMany: jest.fn() },
    $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>): Promise<unknown> => callback(prisma))
  };

  return { prisma };
});

const requesterToken = signJwt({ sub: 'user-requester', email: 'requester@example.com', roles: ['normal'] }, '1h');
const outsiderToken = signJwt({ sub: 'user-outsider', email: 'outsider@example.com', roles: ['normal'] }, '1h');
const driver1Token = signJwt({ sub: 'driver-1', email: 'driver1@example.com', roles: ['driver'] }, '1h');
const driver2Token = signJwt({ sub: 'driver-2', email: 'driver2@example.com', roles: ['driver'] }, '1h');
const unverifiedDriverToken = signJwt({ sub: 'driver-pending', email: 'driver.pending@example.com', roles: ['driver'] }, '1h');
const adminToken = signJwt({ sub: 'admin-1', email: 'admin@example.com', roles: ['admin'] }, '1h');

const seedData = () => {
  users.clear();
  vehicleTypes.clear();
  movingRequests.clear();
  movingPhotos.length = 0;
  movingInventoryItems.length = 0;
  movingStatusEvents.length = 0;
  movingEtaEntries.length = 0;
  notifications.length = 0;
  driverProfiles.length = 0;

  users.set('user-requester', {
    id: 'user-requester',
    name: 'Requester User',
    email: 'requester@example.com',
    phone: '0911111111',
    verificationStatus: 'VERIFIED',
    isActive: true,
    userRoles: [{ role: roles.get('normal') as MockRole }]
  });

  users.set('user-outsider', {
    id: 'user-outsider',
    name: 'Outsider User',
    email: 'outsider@example.com',
    phone: '0922222222',
    verificationStatus: 'VERIFIED',
    isActive: true,
    userRoles: [{ role: roles.get('normal') as MockRole }]
  });

  users.set('driver-1', {
    id: 'driver-1',
    name: 'Driver One',
    email: 'driver1@example.com',
    phone: '0933333333',
    verificationStatus: 'VERIFIED',
    isActive: true,
    userRoles: [{ role: roles.get('driver') as MockRole }]
  });

  users.set('driver-2', {
    id: 'driver-2',
    name: 'Driver Two',
    email: 'driver2@example.com',
    phone: '0944444444',
    verificationStatus: 'VERIFIED',
    isActive: true,
    userRoles: [{ role: roles.get('driver') as MockRole }]
  });

  users.set('driver-pending', {
    id: 'driver-pending',
    name: 'Pending Driver',
    email: 'driver.pending@example.com',
    phone: '0955555555',
    verificationStatus: 'PENDING',
    isActive: true,
    userRoles: [{ role: roles.get('driver') as MockRole }]
  });

  users.set('admin-1', {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '0966666666',
    verificationStatus: 'VERIFIED',
    isActive: true,
    userRoles: [{ role: roles.get('admin') as MockRole }]
  });

  vehicleTypes.set('vt-truck', {
    id: 'vt-truck',
    name: 'Light Truck',
    isActive: true,
    capacityLabel: '1.5 Ton',
    maxLoadKg: 1500
  });
};

const createMovingPayload = () => ({
  pickupAddress: 'Hledan, Yangon',
  dropoffAddress: 'Tamwe, Yangon',
  moveInDate: '2026-09-01T09:00:00.000Z',
  vehicleTypeId: 'vt-truck',
  remarks: 'Handle fragile items carefully',
  damageChecklist: 'Existing small scratch on wardrobe',
  photos: ['uploads/moving/photo-1.jpg', 'uploads/moving/photo-2.jpg'],
  inventoryItems: [
    { category: 'Bedroom', itemName: 'Wardrobe', count: 1 },
    { category: 'Kitchen', itemName: 'Refrigerator', count: 1 },
    { category: 'Other', itemName: 'Boxes', count: 8 }
  ]
});

describe('Moving and driver workflow integration', () => {
  beforeEach(() => {
    seedData();
  });

  it('creates moving request, notifies drivers, and lists available requests for verified driver', async () => {
    const createResponse = await request(app)
      .post('/api/v1/moving/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(createMovingPayload());

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.movingRequest.status).toBe('PENDING');
    expect(createResponse.body.data.movingRequest.inventoryItems.length).toBe(3);
    expect(notifications.filter((item) => item.title === 'New Moving Request').length).toBe(2);

    const availableResponse = await request(app)
      .get('/api/v1/driver/requests/available')
      .set('Authorization', `Bearer ${driver1Token}`);

    expect(availableResponse.status).toBe(200);
    expect(availableResponse.body.data.items.length).toBe(1);

    const unverifiedResponse = await request(app)
      .get('/api/v1/driver/requests/available')
      .set('Authorization', `Bearer ${unverifiedDriverToken}`);

    expect(unverifiedResponse.status).toBe(403);

    const movingRequestId = createResponse.body.data.movingRequest.id as string;

    const driverDetailView = await request(app)
      .get(`/api/v1/moving/requests/${movingRequestId}`)
      .set('Authorization', `Bearer ${driver1Token}`);

    expect(driverDetailView.status).toBe(200);
    expect(driverDetailView.body.data.movingRequest.id).toBe(movingRequestId);

    const unverifiedDetailView = await request(app)
      .get(`/api/v1/moving/requests/${movingRequestId}`)
      .set('Authorization', `Bearer ${unverifiedDriverToken}`);

    expect(unverifiedDetailView.status).toBe(403);
  });

  it('allows first driver accept and rejects second accept attempt', async () => {
    const createResponse = await request(app)
      .post('/api/v1/moving/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(createMovingPayload());

    const movingRequestId = createResponse.body.data.movingRequest.id as string;

    const firstAccept = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/accept`)
      .set('Authorization', `Bearer ${driver1Token}`)
      .send({});

    expect(firstAccept.status).toBe(200);
    expect(firstAccept.body.data.movingRequest.status).toBe('ACCEPTED');
    expect(firstAccept.body.data.movingRequest.assignedDriver.id).toBe('driver-1');

    const secondAccept = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/accept`)
      .set('Authorization', `Bearer ${driver2Token}`)
      .send({});

    expect(secondAccept.status).toBe(409);
    expect(secondAccept.body.errors.code).toBe('MOVING_REQUEST_ALREADY_ACCEPTED');

    const requesterView = await request(app)
      .get(`/api/v1/moving/requests/${movingRequestId}`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(requesterView.status).toBe(200);
    expect(requesterView.body.data.movingRequest.assignedDriver.id).toBe('driver-1');

    const outsiderView = await request(app)
      .get(`/api/v1/moving/requests/${movingRequestId}`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(outsiderView.status).toBe(403);
  });

  it('supports admin fallback assignment only when pending and unassigned', async () => {
    const createResponse = await request(app)
      .post('/api/v1/moving/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(createMovingPayload());

    const movingRequestId = createResponse.body.data.movingRequest.id as string;

    const assignResponse = await request(app)
      .post(`/api/v1/admin/moving/requests/${movingRequestId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driverUserId: 'driver-2' });

    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.data.movingRequest.status).toBe('ASSIGNED');
    expect(assignResponse.body.data.movingRequest.assignedDriver.id).toBe('driver-2');

    const secondAssign = await request(app)
      .post(`/api/v1/admin/moving/requests/${movingRequestId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driverUserId: 'driver-1' });

    expect(secondAssign.status).toBe(409);
    expect(secondAssign.body.errors.code).toBe('MOVING_REQUEST_NOT_ASSIGNABLE');
  });

  it('enforces ETA/status authorization and allows assigned driver lifecycle updates', async () => {
    const createResponse = await request(app)
      .post('/api/v1/moving/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(createMovingPayload());

    const movingRequestId = createResponse.body.data.movingRequest.id as string;

    await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/accept`)
      .set('Authorization', `Bearer ${driver1Token}`)
      .send({});

    const forbiddenEta = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/eta`)
      .set('Authorization', `Bearer ${driver2Token}`)
      .send({ stage: 'loading', etaAt: '2026-09-01T08:30:00.000Z' });

    expect(forbiddenEta.status).toBe(403);

    const etaResponse = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/eta`)
      .set('Authorization', `Bearer ${driver1Token}`)
      .send({ stage: 'loading', etaAt: '2026-09-01T08:30:00.000Z' });

    expect(etaResponse.status).toBe(200);
    expect(etaResponse.body.data.etaEntry.stage).toBe('loading');

    const forbiddenStatus = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/status`)
      .set('Authorization', `Bearer ${driver2Token}`)
      .send({ status: 'in_progress' });

    expect(forbiddenStatus.status).toBe(403);

    const inProgress = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/status`)
      .set('Authorization', `Bearer ${driver1Token}`)
      .send({ status: 'in_progress' });

    expect(inProgress.status).toBe(200);
    expect(inProgress.body.data.movingRequest.status).toBe('IN_PROGRESS');

    const completed = await request(app)
      .post(`/api/v1/driver/requests/${movingRequestId}/status`)
      .set('Authorization', `Bearer ${driver1Token}`)
      .send({ status: 'completed' });

    expect(completed.status).toBe(200);
    expect(completed.body.data.movingRequest.status).toBe('COMPLETED');

    const completionNotification = notifications.find((item) => item.title === 'Moving Request Completed');
    expect(completionNotification).toBeDefined();
  });

  it('validates moving request payload with non-negative inventory counts and required fields', async () => {
    const invalidResponse = await request(app)
      .post('/api/v1/moving/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        pickupAddress: '',
        dropoffAddress: '',
        moveInDate: 'not-a-date',
        vehicleTypeId: '',
        photos: [],
        inventoryItems: [{ category: 'Bedroom', itemName: 'Bed', count: -1 }]
      });

    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body.success).toBe(false);
  });
});
