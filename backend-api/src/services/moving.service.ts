import { MovingRequestStatus, MovingStatusEventType, Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

interface AuthActor {
  userId: string;
  roles: string[];
}

interface CreateMovingRequestInventoryItemInput {
  category: string;
  itemName: string;
  count: number;
}

interface CreateMovingRequestInput {
  pickupAddress: string;
  dropoffAddress: string;
  moveInDate: Date;
  vehicleTypeId: string;
  remarks?: string;
  damageChecklist?: string;
  photos: string[];
  inventoryItems: CreateMovingRequestInventoryItemInput[];
}

interface RejectMovingRequestInput {
  movingRequestId: string;
  driverUserId: string;
  notes?: string;
}

interface AddMovingEtaInput {
  movingRequestId: string;
  driverUserId: string;
  stage: string;
  etaAt: Date;
  notes?: string;
}

interface UpdateMovingStatusInput {
  movingRequestId: string;
  driverUserId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

interface AssignMovingRequestInput {
  movingRequestId: string;
  driverUserId: string;
  actorUserId: string;
}

const movingRequestArgs = Prisma.validator<Prisma.MovingRequestDefaultArgs>()({
  include: {
    requester: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    },
    assignedDriver: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    },
    vehicleType: {
      select: {
        id: true,
        name: true,
        capacityLabel: true,
        maxLoadKg: true
      }
    },
    photos: {
      select: {
        id: true,
        photoPath: true,
        sortOrder: true,
        createdAt: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    },
    inventoryItems: {
      select: {
        id: true,
        category: true,
        itemName: true,
        count: true,
        createdAt: true
      },
      orderBy: [{ category: 'asc' }, { itemName: 'asc' }]
    },
    statusEvents: {
      select: {
        id: true,
        actorUserId: true,
        eventType: true,
        status: true,
        notes: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    },
    etaEntries: {
      select: {
        id: true,
        driverUserId: true,
        stage: true,
        etaAt: true,
        notes: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }
  }
});

type MovingRequestWithDetails = Prisma.MovingRequestGetPayload<typeof movingRequestArgs>;

const normalizeMovingRequest = (request: MovingRequestWithDetails) => ({
  id: request.id,
  status: request.status,
  pickupAddress: request.pickupAddress,
  dropoffAddress: request.dropoffAddress,
  moveInDate: request.moveInDate,
  remarks: request.remarks,
  damageChecklist: request.damageChecklist,
  estimatedEarnings: request.estimatedEarnings ? Number(request.estimatedEarnings) : null,
  acceptedAt: request.acceptedAt,
  requester: request.requester,
  assignedDriver: request.assignedDriver,
  vehicleType: request.vehicleType,
  photos: request.photos,
  inventoryItems: request.inventoryItems,
  statusEvents: request.statusEvents,
  etaEntries: request.etaEntries,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt
});

const ensureDriverVerified = async (driverUserId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: {
      id: driverUserId
    },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'DRIVER_NOT_FOUND', 'Driver user not found.');
  }

  const roles = user.userRoles.map((item) => item.role.name);
  if (!roles.includes('driver')) {
    throw new ApiError(403, 'DRIVER_ROLE_REQUIRED', 'Driver role is required.');
  }

  if (user.verificationStatus !== 'VERIFIED') {
    throw new ApiError(403, 'DRIVER_NOT_VERIFIED', 'Driver must be verified to perform this action.');
  }
};

const ensureRequestAssignedToDriver = async (movingRequestId: string, driverUserId: string) => {
  const movingRequest = await prisma.movingRequest.findUnique({
    where: {
      id: movingRequestId
    },
    select: {
      id: true,
      status: true,
      assignedDriverUserId: true
    }
  });

  if (!movingRequest) {
    throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
  }

  if (movingRequest.assignedDriverUserId !== driverUserId) {
    throw new ApiError(403, 'MOVING_REQUEST_DRIVER_FORBIDDEN', 'Only the assigned driver can update this moving request.');
  }

  return movingRequest;
};

const notifyVerifiedDriversForNewRequest = async (movingRequestId: string) => {
  const verifiedDrivers = await prisma.user.findMany({
    where: {
      isActive: true,
      verificationStatus: 'VERIFIED',
      userRoles: {
        some: {
          role: {
            name: 'driver'
          }
        }
      }
    },
    select: {
      id: true
    }
  });

  if (verifiedDrivers.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: verifiedDrivers.map((driver) => ({
      userId: driver.id,
      title: 'New Moving Request',
      message: `New moving request ${movingRequestId} is available for acceptance.`
    }))
  });
};

const notifyRequester = async (requesterUserId: string, title: string, message: string) => {
  await prisma.notification.create({
    data: {
      userId: requesterUserId,
      title,
      message
    }
  });
};

const calculateEstimatedEarnings = (
  inventoryItems: CreateMovingRequestInventoryItemInput[],
  vehicleType: { maxLoadKg: number | null; name: string }
): number => {
  const itemCount = inventoryItems.reduce((sum, item) => sum + item.count, 0);
  const baseRate = vehicleType.maxLoadKg ? Math.max(vehicleType.maxLoadKg / 10, 5000) : 8000;
  return Math.round(baseRate + itemCount * 1500);
};

export const createMovingRequest = async (requesterUserId: string, input: CreateMovingRequestInput) => {
  const vehicleType = await prisma.vehicleType.findUnique({
    where: { id: input.vehicleTypeId },
    select: {
      id: true,
      isActive: true,
      name: true,
      maxLoadKg: true
    }
  });

  if (!vehicleType || !vehicleType.isActive) {
    throw new ApiError(400, 'VEHICLE_TYPE_NOT_AVAILABLE', 'Vehicle type is invalid or inactive.');
  }

  const estimatedEarnings = calculateEstimatedEarnings(input.inventoryItems, vehicleType);

  const movingRequest = await prisma.movingRequest.create({
    data: {
      requesterUserId,
      vehicleTypeId: input.vehicleTypeId,
      pickupAddress: input.pickupAddress,
      dropoffAddress: input.dropoffAddress,
      moveInDate: input.moveInDate,
      remarks: input.remarks,
      damageChecklist: input.damageChecklist,
      estimatedEarnings: new Prisma.Decimal(estimatedEarnings),
      photos: {
        create: input.photos.map((photoPath, index) => ({
          photoPath,
          sortOrder: index + 1
        }))
      },
      inventoryItems: {
        create: input.inventoryItems.map((item) => ({
          category: item.category,
          itemName: item.itemName,
          count: item.count
        }))
      },
      statusEvents: {
        create: {
          actorUserId: requesterUserId,
          eventType: MovingStatusEventType.CREATED,
          status: MovingRequestStatus.PENDING,
          notes: 'Moving request created by requester.'
        }
      }
    },
    include: movingRequestArgs.include
  });

  await notifyVerifiedDriversForNewRequest(movingRequest.id);

  return normalizeMovingRequest(movingRequest);
};

export const getMovingRequestById = async (movingRequestId: string, actor: AuthActor) => {
  const movingRequest = await prisma.movingRequest.findUnique({
    where: {
      id: movingRequestId
    },
    include: movingRequestArgs.include
  });

  if (!movingRequest) {
    throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
  }

  const isOwner = movingRequest.requesterUserId === actor.userId;
  const isAssignedDriver = movingRequest.assignedDriverUserId === actor.userId;
  const isAdmin = actor.roles.includes('admin');

  if (isOwner || isAssignedDriver || isAdmin) {
    return normalizeMovingRequest(movingRequest);
  }

  // Verified drivers can open available pending jobs (same pool as listAvailable).
  const isAvailableForDrivers =
    movingRequest.status === MovingRequestStatus.PENDING && movingRequest.assignedDriverUserId === null;

  if (actor.roles.includes('driver') && isAvailableForDrivers) {
    await ensureDriverVerified(actor.userId);

    const rejectedByDriver = await prisma.movingStatusEvent.findFirst({
      where: {
        movingRequestId,
        actorUserId: actor.userId,
        eventType: MovingStatusEventType.REJECTED
      },
      select: { id: true }
    });

    if (!rejectedByDriver) {
      return normalizeMovingRequest(movingRequest);
    }
  }

  throw new ApiError(403, 'MOVING_REQUEST_FORBIDDEN', 'You are not allowed to view this moving request.');
};

export const listAvailableMovingRequestsForDriver = async (driverUserId: string) => {
  await ensureDriverVerified(driverUserId);

  const requests = await prisma.movingRequest.findMany({
    where: {
      status: MovingRequestStatus.PENDING,
      assignedDriverUserId: null,
      statusEvents: {
        none: {
          actorUserId: driverUserId,
          eventType: MovingStatusEventType.REJECTED
        }
      }
    },
    include: movingRequestArgs.include,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return requests.map(normalizeMovingRequest);
};

export const acceptMovingRequest = async (movingRequestId: string, driverUserId: string) => {
  await ensureDriverVerified(driverUserId);

  const movingRequest = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.movingRequest.updateMany({
      where: {
        id: movingRequestId,
        status: MovingRequestStatus.PENDING,
        assignedDriverUserId: null
      },
      data: {
        status: MovingRequestStatus.ACCEPTED,
        assignedDriverUserId: driverUserId,
        acceptedAt: new Date()
      }
    });

    if (updateResult.count === 0) {
      const existing = await tx.movingRequest.findUnique({
        where: {
          id: movingRequestId
        },
        select: {
          id: true,
          status: true,
          assignedDriverUserId: true
        }
      });

      if (!existing) {
        throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
      }

      throw new ApiError(
        409,
        'MOVING_REQUEST_ALREADY_ACCEPTED',
        'Moving request has already been accepted or assigned by another driver.'
      );
    }

    await tx.movingStatusEvent.create({
      data: {
        movingRequestId,
        actorUserId: driverUserId,
        eventType: MovingStatusEventType.ACCEPTED,
        status: MovingRequestStatus.ACCEPTED,
        notes: 'Moving request accepted by driver.'
      }
    });

    const updated = await tx.movingRequest.findUnique({
      where: {
        id: movingRequestId
      },
      include: movingRequestArgs.include
    });

    if (!updated) {
      throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
    }

    return updated;
  });

  await notifyRequester(
    movingRequest.requesterUserId,
    'Moving Request Accepted',
    `Your moving request ${movingRequest.id} has been accepted by a driver.`
  );

  return normalizeMovingRequest(movingRequest);
};

export const rejectMovingRequest = async (input: RejectMovingRequestInput) => {
  await ensureDriverVerified(input.driverUserId);

  const movingRequest = await prisma.movingRequest.findUnique({
    where: {
      id: input.movingRequestId
    },
    select: {
      id: true
    }
  });

  if (!movingRequest) {
    throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
  }

  await prisma.movingStatusEvent.create({
    data: {
      movingRequestId: input.movingRequestId,
      actorUserId: input.driverUserId,
      eventType: MovingStatusEventType.REJECTED,
      status: null,
      notes: input.notes
    }
  });
};

export const addMovingEta = async (input: AddMovingEtaInput) => {
  await ensureDriverVerified(input.driverUserId);
  await ensureRequestAssignedToDriver(input.movingRequestId, input.driverUserId);

  const etaEntry = await prisma.$transaction(async (tx) => {
    const created = await tx.movingEtaEntry.create({
      data: {
        movingRequestId: input.movingRequestId,
        driverUserId: input.driverUserId,
        stage: input.stage,
        etaAt: input.etaAt,
        notes: input.notes
      }
    });

    await tx.movingStatusEvent.create({
      data: {
        movingRequestId: input.movingRequestId,
        actorUserId: input.driverUserId,
        eventType: MovingStatusEventType.ETA_UPDATED,
        status: null,
        notes: `ETA updated for stage: ${input.stage}`
      }
    });

    return created;
  });

  return etaEntry;
};

const assertStatusTransition = (
  currentStatus: MovingRequestStatus,
  nextStatus: UpdateMovingStatusInput['status']
): void => {
  if (
    currentStatus === MovingRequestStatus.COMPLETED ||
    currentStatus === MovingRequestStatus.CANCELLED
  ) {
    throw new ApiError(409, 'MOVING_REQUEST_FINALIZED', 'Moving request is already finalized.');
  }

  if (
    nextStatus === MovingRequestStatus.IN_PROGRESS &&
    currentStatus !== MovingRequestStatus.ACCEPTED &&
    currentStatus !== MovingRequestStatus.ASSIGNED
  ) {
    throw new ApiError(409, 'MOVING_STATUS_INVALID_TRANSITION', 'Moving request can enter in progress only after acceptance or assignment.');
  }

  if (
    nextStatus === MovingRequestStatus.COMPLETED &&
    currentStatus !== MovingRequestStatus.IN_PROGRESS
  ) {
    throw new ApiError(409, 'MOVING_STATUS_INVALID_TRANSITION', 'Moving request can be completed only from in progress status.');
  }
};

export const updateMovingStatus = async (input: UpdateMovingStatusInput) => {
  await ensureDriverVerified(input.driverUserId);

  const current = await ensureRequestAssignedToDriver(input.movingRequestId, input.driverUserId);
  assertStatusTransition(current.status, input.status);

  const updated = await prisma.$transaction(async (tx) => {
    const movingRequest = await tx.movingRequest.update({
      where: {
        id: input.movingRequestId
      },
      data: {
        status: input.status
      },
      include: movingRequestArgs.include
    });

    await tx.movingStatusEvent.create({
      data: {
        movingRequestId: input.movingRequestId,
        actorUserId: input.driverUserId,
        eventType: MovingStatusEventType.STATUS_UPDATED,
        status: input.status,
        notes: input.notes
      }
    });

    return movingRequest;
  });

  if (input.status === MovingRequestStatus.COMPLETED) {
    await notifyRequester(
      updated.requesterUserId,
      'Moving Request Completed',
      `Your moving request ${updated.id} has been marked as completed.`
    );
  }

  return normalizeMovingRequest(updated);
};

export const assignMovingRequestByAdmin = async (input: AssignMovingRequestInput) => {
  await ensureDriverVerified(input.driverUserId);

  const movingRequest = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.movingRequest.updateMany({
      where: {
        id: input.movingRequestId,
        status: MovingRequestStatus.PENDING,
        assignedDriverUserId: null
      },
      data: {
        status: MovingRequestStatus.ASSIGNED,
        assignedDriverUserId: input.driverUserId
      }
    });

    if (updateResult.count === 0) {
      const existing = await tx.movingRequest.findUnique({
        where: {
          id: input.movingRequestId
        },
        select: {
          id: true
        }
      });

      if (!existing) {
        throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
      }

      throw new ApiError(
        409,
        'MOVING_REQUEST_NOT_ASSIGNABLE',
        'Admin assignment is allowed only when request is pending and unassigned.'
      );
    }

    await tx.movingStatusEvent.create({
      data: {
        movingRequestId: input.movingRequestId,
        actorUserId: input.actorUserId,
        eventType: MovingStatusEventType.ASSIGNED,
        status: MovingRequestStatus.ASSIGNED,
        notes: `Assigned by admin to driver ${input.driverUserId}.`
      }
    });

    const updated = await tx.movingRequest.findUnique({
      where: {
        id: input.movingRequestId
      },
      include: movingRequestArgs.include
    });

    if (!updated) {
      throw new ApiError(404, 'MOVING_REQUEST_NOT_FOUND', 'Moving request not found.');
    }

    return updated;
  });

  await Promise.all([
    notifyRequester(
      movingRequest.requesterUserId,
      'Moving Request Assigned',
      `Your moving request ${movingRequest.id} was assigned by admin.`
    ),
    prisma.notification.create({
      data: {
        userId: input.driverUserId,
        title: 'Moving Request Assigned',
        message: `You were assigned to moving request ${movingRequest.id}.`
      }
    })
  ]);

  return normalizeMovingRequest(movingRequest);
};
