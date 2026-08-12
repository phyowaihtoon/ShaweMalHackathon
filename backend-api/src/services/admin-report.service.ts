import { HouseAvailabilityStatus, ReviewTargetType, VerificationStatus } from '@prisma/client';

import { prisma } from '../prisma/client';

const buildVerificationSummary = async (roleName: 'agent' | 'driver') => {
  const rows = await prisma.user.groupBy({
    by: ['verificationStatus'],
    where: {
      userRoles: {
        some: {
          role: {
            name: roleName
          }
        }
      }
    },
    _count: {
      _all: true
    }
  });

  const counts: Record<VerificationStatus, number> = {
    PENDING: 0,
    VERIFIED: 0,
    REJECTED: 0
  };

  for (const row of rows) {
    counts[row.verificationStatus] = row._count._all;
  }

  return {
    pending: counts.PENDING,
    verified: counts.VERIFIED,
    rejected: counts.REJECTED,
    total: counts.PENDING + counts.VERIFIED + counts.REJECTED
  };
};

const buildTopPerformers = async (targetType: ReviewTargetType, take: number) => {
  const grouped = await prisma.ratingReview.groupBy({
    by: ['targetUserId'],
    where: {
      targetType
    },
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    },
    orderBy: [{ _avg: { rating: 'desc' } }, { _count: { rating: 'desc' } }],
    take
  });

  const userIds = grouped.map((row) => row.targetUserId);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  const byId = new Map(users.map((item) => [item.id, item]));

  return grouped.map((row) => ({
    userId: row.targetUserId,
    name: byId.get(row.targetUserId)?.name ?? 'Unknown',
    averageRating: row._avg.rating ?? 0,
    ratingCount: row._count.rating
  }));
};

export interface AdminReportOptions {
  from?: Date;
  to?: Date;
}

const buildDateRangeFilter = (options: AdminReportOptions) => {
  if (!options.from && !options.to) {
    return undefined;
  }

  return {
    gte: options.from,
    lte: options.to
  };
};

export const getAdminOverviewReport = async (options: AdminReportOptions = {}) => {
  const createdAtFilter = buildDateRangeFilter(options);
  const userWhere = createdAtFilter ? { createdAt: createdAtFilter } : undefined;
  const bookingWhere = createdAtFilter ? { createdAt: createdAtFilter } : undefined;
  const movingWhere = createdAtFilter ? { createdAt: createdAtFilter } : undefined;
  const houseWhere = createdAtFilter ? { createdAt: createdAtFilter } : undefined;

  const [
    roleRows,
    agentVerificationSummary,
    driverVerificationSummary,
    housingByCityRows,
    cityRows,
    housingByTypeRows,
    propertyTypeRows,
    housingByAvailabilityRows,
    bookingStatusRows,
    movingStatusRows,
    topAgents,
    topDrivers
  ] = await Promise.all([
    prisma.role.findMany({
      select: {
        name: true,
        userRoles: userWhere
          ? {
              where: {
                user: userWhere
              },
              select: {
                id: true
              }
            }
          : {
              select: {
                id: true
              }
            }
      }
    }),
    buildVerificationSummary('agent'),
    buildVerificationSummary('driver'),
    prisma.house.groupBy({
      by: ['cityId'],
      where: houseWhere,
      _count: {
        _all: true
      }
    }),
    prisma.city.findMany({
      select: {
        id: true,
        name: true
      }
    }),
    prisma.house.groupBy({
      by: ['propertyTypeId'],
      where: houseWhere,
      _count: {
        _all: true
      }
    }),
    prisma.propertyType.findMany({
      select: {
        id: true,
        name: true
      }
    }),
    prisma.house.groupBy({
      by: ['availability'],
      where: houseWhere,
      _count: {
        _all: true
      }
    }),
    prisma.booking.groupBy({
      by: ['status'],
      where: bookingWhere,
      _count: {
        _all: true
      }
    }),
    prisma.movingRequest.groupBy({
      by: ['status'],
      where: movingWhere,
      _count: {
        _all: true
      }
    }),
    buildTopPerformers('AGENT', 5),
    buildTopPerformers('DRIVER', 5)
  ]);

  const cityById = new Map(cityRows.map((item) => [item.id, item.name]));
  const propertyTypeById = new Map(propertyTypeRows.map((item) => [item.id, item.name]));

  const byAvailability: Record<HouseAvailabilityStatus, number> = {
    AVAILABLE: 0,
    NOT_AVAILABLE: 0
  };

  for (const row of housingByAvailabilityRows) {
    byAvailability[row.availability] = row._count._all;
  }

  const totalMovingRequests = movingStatusRows.reduce((sum, row) => sum + row._count._all, 0);
  const completedMovingRequests = movingStatusRows.find((row) => row.status === 'COMPLETED')?._count._all ?? 0;

  return {
    period: {
      from: options.from?.toISOString() ?? null,
      to: options.to?.toISOString() ?? null
    },
    userRegistrationsByRole: roleRows.map((row) => ({
      role: row.name,
      count: row.userRoles.length
    })),
    verification: {
      agents: agentVerificationSummary,
      drivers: driverVerificationSummary
    },
    housing: {
      byCity: housingByCityRows.map((row) => ({
        cityId: row.cityId,
        city: cityById.get(row.cityId) ?? 'Unknown',
        count: row._count._all
      })),
      byType: housingByTypeRows.map((row) => ({
        propertyTypeId: row.propertyTypeId,
        propertyType: propertyTypeById.get(row.propertyTypeId) ?? 'Unknown',
        count: row._count._all
      })),
      byAvailability: {
        available: byAvailability.AVAILABLE,
        notAvailable: byAvailability.NOT_AVAILABLE
      }
    },
    bookingStatusSummary: bookingStatusRows.map((row) => ({
      status: row.status,
      count: row._count._all
    })),
    movingRequestSummary: {
      byStatus: movingStatusRows.map((row) => ({
        status: row.status,
        count: row._count._all
      })),
      completed: completedMovingRequests,
      total: totalMovingRequests
    },
    topPerformers: {
      agents: topAgents,
      drivers: topDrivers
    }
  };
};
