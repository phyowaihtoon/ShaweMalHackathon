import { prisma } from '../prisma/client';
import { ApiError } from '../utils/api-error';

export interface DriverProfileInput {
  name: string;
  companyName?: string;
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
}

const ensureDriverRole = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
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
    throw new ApiError(401, 'AUTH_USER_NOT_FOUND', 'Authenticated user not found.');
  }

  const roleNames = user.userRoles.map((item) => item.role.name);
  if (!roleNames.includes('driver')) {
    throw new ApiError(403, 'DRIVER_ROLE_REQUIRED', 'Driver role is required.');
  }
};

const ensureVehicleTypeActive = async (vehicleTypeId: string): Promise<void> => {
  const vehicleType = await prisma.vehicleType.findUnique({
    where: {
      id: vehicleTypeId
    },
    select: {
      id: true,
      isActive: true
    }
  });

  if (!vehicleType || !vehicleType.isActive) {
    throw new ApiError(400, 'VEHICLE_TYPE_NOT_AVAILABLE', 'Vehicle type is invalid or inactive.');
  }
};

export const upsertDriverProfile = async (userId: string, input: DriverProfileInput) => {
  await ensureDriverRole(userId);
  await ensureVehicleTypeActive(input.vehicleTypeId);

  return prisma.driverProfile.upsert({
    where: {
      userId
    },
    update: {
      ...input
    },
    create: {
      userId,
      ...input
    },
    include: {
      vehicleType: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};
