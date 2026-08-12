import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run prisma seed.');
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

const seedRoles = async (): Promise<void> => {
  const roles = [
    { name: 'normal', description: 'Registered user with standard portal access.' },
    { name: 'agent', description: 'Housing agent who can publish listings after verification.' },
    { name: 'driver', description: 'Moving service driver who can accept jobs after verification.' },
    { name: 'admin', description: 'Administrator with access to the admin portal.' }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        code: role.name,
        description: role.description,
        isActive: true
      },
      create: {
        name: role.name,
        code: role.name,
        description: role.description,
        isActive: true
      }
    });
  }
};

const seedStatusCodes = async (): Promise<void> => {
  const records = [
    { entityType: 'Agent', code: 'PENDING', label: 'Pending', color: '#f59e0b' },
    { entityType: 'Agent', code: 'VERIFIED', label: 'Verified', color: '#10b981' },
    { entityType: 'Agent', code: 'REJECTED', label: 'Rejected', color: '#ef4444' },
    { entityType: 'Driver', code: 'PENDING', label: 'Pending', color: '#f59e0b' },
    { entityType: 'Driver', code: 'VERIFIED', label: 'Verified', color: '#10b981' },
    { entityType: 'Driver', code: 'REJECTED', label: 'Rejected', color: '#ef4444' },
    { entityType: 'MovingRequest', code: 'PENDING', label: 'Pending', color: '#f59e0b' },
    { entityType: 'MovingRequest', code: 'ACCEPTED', label: 'Accepted', color: '#3b82f6' },
    { entityType: 'MovingRequest', code: 'ASSIGNED', label: 'Assigned', color: '#8b5cf6' },
    { entityType: 'MovingRequest', code: 'IN_PROGRESS', label: 'In Progress', color: '#06b6d4' },
    { entityType: 'MovingRequest', code: 'COMPLETED', label: 'Completed', color: '#10b981' },
    { entityType: 'MovingRequest', code: 'CANCELLED', label: 'Cancelled', color: '#ef4444' }
  ];

  for (const record of records) {
    await prisma.statusCode.upsert({
      where: {
        entityType_code: {
          entityType: record.entityType,
          code: record.code
        }
      },
      update: {
        label: record.label,
        color: record.color,
        isActive: true
      },
      create: {
        entityType: record.entityType,
        code: record.code,
        label: record.label,
        color: record.color,
        isActive: true
      }
    });
  }
};

const YANGON_COUNTRY_CODE = 'MM';
const YANGON_STATE_NAME = 'Yangon';

const YANGON_TOWNSHIPS = [
  'Ahlon Township',
  'Bahan Township',
  'Botataung Township',
  'Dagon Seikkan Township',
  'Dagon Township',
  'Dala Township',
  'Dawbon Township',
  'East Dagon Township',
  'Hlaing Township',
  'Hlaingthaya East Township',
  'Hlaingthaya Township',
  'Insein Township',
  'Kamayut Township',
  'Kyauktada Township',
  'Kyimyindaing Township',
  'Lanmadaw Township',
  'Latha Township',
  'Mayangon Township',
  'Mingala Taungnyunt Township',
  'Mingaladon Township',
  'North Dagon Township',
  'North Okkalapa Township',
  'Pabedan Township',
  'Pazundaung Township',
  'Sanchaung Township',
  'Seikkan Township',
  'Seikkyi Kanaungto Township',
  'Shwepyitha Township',
  'South Dagon Township',
  'South Okkalapa Township',
  'Tamwe Township',
  'Thaketa Township',
  'Thingangyun Township',
  'Yankin Township'
] as const;

const seedYangonLocations = async (): Promise<void> => {
  const yangonState = await prisma.state.upsert({
    where: {
      name_countryCode: {
        name: YANGON_STATE_NAME,
        countryCode: YANGON_COUNTRY_CODE
      }
    },
    update: {
      isActive: true
    },
    create: {
      name: YANGON_STATE_NAME,
      countryCode: YANGON_COUNTRY_CODE,
      isActive: true
    }
  });

  for (const township of YANGON_TOWNSHIPS) {
    await prisma.city.upsert({
      where: {
        name_stateId: {
          name: township,
          stateId: yangonState.id
        }
      },
      update: {
        countryCode: YANGON_COUNTRY_CODE,
        isActive: true
      },
      create: {
        name: township,
        stateId: yangonState.id,
        countryCode: YANGON_COUNTRY_CODE,
        isActive: true
      }
    });
  }

  console.log(`Yangon locations seeded: 1 state, ${YANGON_TOWNSHIPS.length} townships`);
};

const seedPropertyTypes = async (): Promise<void> => {
  const propertyTypes = [
    'Apartment',
    'Condominium (Condo)',
    'Bungalow',
    'Detached House',
    'Semi-Detached House',
    'Townhouse',
    'Villa',
    'Duplex',
    'Terrace House',
    'Studio Apartment'
  ];

  for (const name of propertyTypes) {
    await prisma.propertyType.upsert({
      where: { name },
      update: {
        isActive: true
      },
      create: {
        name,
        isActive: true
      }
    });
  }

  console.log(`Property types seeded: ${propertyTypes.length}`);
};

const seedVehicleTypes = async (): Promise<void> => {
  const vehicleTypes = [
    { name: 'Motorcycle', size: 'Very Small', capacityLabel: '1–2 boxes', maxLoadKg: 100 },
    { name: 'Motorbike with Trailer', size: 'Small', capacityLabel: '3–5 boxes', maxLoadKg: 200 },
    { name: 'Tuk-Tuk / Three-Wheeler', size: 'Small', capacityLabel: '5–8 boxes', maxLoadKg: 300 },
    { name: 'Mini Pickup', size: 'Small', capacityLabel: '8–12 boxes', maxLoadKg: 500 },
    { name: 'Pickup Truck', size: 'Small', capacityLabel: '10–15 boxes', maxLoadKg: 750 },
    { name: 'Small Van', size: 'Small', capacityLabel: '15–25 boxes', maxLoadKg: 1000 },
    { name: 'Mini Truck', size: 'Medium', capacityLabel: '20–35 boxes', maxLoadKg: 1500 },
    { name: 'Light Truck', size: 'Medium', capacityLabel: '30–50 boxes', maxLoadKg: 2000 },
    { name: 'Box Truck', size: 'Medium', capacityLabel: '40–60 boxes', maxLoadKg: 2500 },
    { name: '10-ft Truck', size: 'Medium', capacityLabel: '50–70 boxes', maxLoadKg: 3000 },
    { name: '12-ft Truck', size: 'Large', capacityLabel: '60–90 boxes', maxLoadKg: 4000 },
    { name: '14-ft Truck', size: 'Large', capacityLabel: '70–100 boxes', maxLoadKg: 5000 },
    { name: '16-ft Truck', size: 'Large', capacityLabel: '80–120 boxes', maxLoadKg: 6000 },
    { name: '18-ft Truck', size: 'Large', capacityLabel: '100–140 boxes', maxLoadKg: 7000 },
    { name: '20-ft Truck', size: 'Extra Large', capacityLabel: '120–180 boxes', maxLoadKg: 8000 },
    { name: '22-ft Truck', size: 'Extra Large', capacityLabel: '140–200 boxes', maxLoadKg: 10000 },
    { name: '24-ft Truck', size: 'Extra Large', capacityLabel: '160–220 boxes', maxLoadKg: 12000 },
    { name: '26-ft Truck', size: 'Extra Large', capacityLabel: '180–250 boxes', maxLoadKg: 14000 },
    { name: '30-ft Truck', size: 'Heavy Duty', capacityLabel: '220–300 boxes', maxLoadKg: 18000 },
    { name: 'Container Truck', size: 'Heavy Duty', capacityLabel: '250–350+ boxes', maxLoadKg: 20000 }
  ];

  for (const vehicleType of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { name: vehicleType.name },
      update: {
        capacityLabel: vehicleType.capacityLabel,
        maxLoadKg: vehicleType.maxLoadKg,
        description: vehicleType.size,
        isActive: true
      },
      create: {
        name: vehicleType.name,
        capacityLabel: vehicleType.capacityLabel,
        maxLoadKg: vehicleType.maxLoadKg,
        description: vehicleType.size,
        isActive: true
      }
    });
  }

  console.log(`Vehicle types seeded: ${vehicleTypes.length}`);
};

/** §8.3 / MD-009 Amenities & Facilities */
const AMENITIES = [
  { name: 'AIR CONDITIONER', category: 'Utility' },
  { name: 'PARKING', category: 'Building' },
  { name: 'FURNISHED', category: 'General' },
  { name: 'WATER HEATER', category: 'Utility' },
  { name: 'FAN', category: 'General' },
  { name: 'TELEVISION', category: 'General' },
  { name: 'REFRIGERATOR', category: 'General' },
  { name: 'SOFA', category: 'General' },
  { name: 'DESK', category: 'General' },
  { name: 'KITCHEN STOVE', category: 'General' },
  { name: 'WIFI', category: 'Utility' },
  { name: 'PETS', category: 'General' },
  { name: 'SMOKING', category: 'General' },
  { name: 'LIFT', category: 'Building' },
  { name: 'POOL', category: 'Building' },
  { name: 'FITNESS', category: 'Building' },
  { name: 'SECURITY GUARD', category: 'Building' },
  { name: 'KEYCARD', category: 'Building' },
  { name: 'FINGERPRINT', category: 'Building' },
  { name: 'CCTV', category: 'Building' },
  { name: 'LAUNDRY', category: 'General' },
  { name: 'EV CHARGER', category: 'Utility' }
] as const;

const seedAmenities = async (): Promise<void> => {
  for (const amenity of AMENITIES) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {
        category: amenity.category,
        isActive: true
      },
      create: {
        name: amenity.name,
        category: amenity.category,
        isActive: true
      }
    });
  }

  console.log(`Amenities seeded: ${AMENITIES.length}`);
};

/** MD-007 Floor Level (Ground Floor through 20th Floor) */
const FLOOR_LEVELS = [
  { levelNumber: 0, name: 'Ground Floor' },
  { levelNumber: 1, name: '1st Floor' },
  { levelNumber: 2, name: '2nd Floor' },
  { levelNumber: 3, name: '3rd Floor' },
  { levelNumber: 4, name: '4th Floor' },
  { levelNumber: 5, name: '5th Floor' },
  { levelNumber: 6, name: '6th Floor' },
  { levelNumber: 7, name: '7th Floor' },
  { levelNumber: 8, name: '8th Floor' },
  { levelNumber: 9, name: '9th Floor' },
  { levelNumber: 10, name: '10th Floor' },
  { levelNumber: 11, name: '11th Floor' },
  { levelNumber: 12, name: '12th Floor' },
  { levelNumber: 13, name: '13th Floor' },
  { levelNumber: 14, name: '14th Floor' },
  { levelNumber: 15, name: '15th Floor' },
  { levelNumber: 16, name: '16th Floor' },
  { levelNumber: 17, name: '17th Floor' },
  { levelNumber: 18, name: '18th Floor' },
  { levelNumber: 19, name: '19th Floor' },
  { levelNumber: 20, name: '20th Floor' }
] as const;

const seedFloorLevels = async (): Promise<void> => {
  for (const floor of FLOOR_LEVELS) {
    await prisma.floorLevel.upsert({
      where: { name: floor.name },
      update: {
        levelNumber: floor.levelNumber,
        isActive: true
      },
      create: {
        name: floor.name,
        levelNumber: floor.levelNumber,
        isActive: true
      }
    });
  }

  console.log(`Floor levels seeded: ${FLOOR_LEVELS.length}`);
};

const seedAdminUser = async (): Promise<void> => {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@shwemal.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
  const name = process.env.SEED_ADMIN_NAME ?? 'ShweMal Admin';
  const phone = process.env.SEED_ADMIN_PHONE ?? '09000000001';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  if (!Number.isInteger(saltRounds) || saltRounds <= 0) {
    throw new Error('BCRYPT_SALT_ROUNDS must be a positive integer.');
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  });

  if (!adminRole) {
    throw new Error('Admin role not found. seedRoles must run before seedAdminUser.');
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: true
    }
  });

  if (existingUser) {
    const hasAdminRole = existingUser.userRoles.some((entry) => entry.roleId === adminRole.id);

    if (!hasAdminRole) {
      await prisma.userRole.create({
        data: {
          userId: existingUser.id,
          roleId: adminRole.id
        }
      });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        phone,
        passwordHash,
        verificationStatus: 'VERIFIED',
        isActive: true
      }
    });

    console.log(`Admin user updated: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      verificationStatus: 'VERIFIED',
      isActive: true,
      userRoles: {
        create: {
          roleId: adminRole.id
        }
      }
    }
  });

  console.log(`Admin user created: ${email}`);
};

const main = async (): Promise<void> => {
  await seedRoles();
  await seedStatusCodes();
  await seedYangonLocations();
  await seedPropertyTypes();
  await seedVehicleTypes();
  await seedAmenities();
  await seedFloorLevels();
  await seedAdminUser();
};

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
