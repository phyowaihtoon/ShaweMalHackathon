-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HousePostChannel" AS ENUM ('AGENT', 'ROOMMATE');

-- CreateEnum
CREATE TYPE "HouseAvailabilityStatus" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CancelledByRole" AS ENUM ('USER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "MovingRequestStatus" AS ENUM ('BOOKED', 'ACCEPTED', 'ASSIGNED', 'DRIVER_COMING', 'DRIVER_ARRIVED', 'LOADING', 'ON_THE_WAY', 'UNLOADING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MovingStatusEventType" AS ENUM ('CREATED', 'ACCEPTED', 'REJECTED', 'ASSIGNED', 'ETA_UPDATED', 'STATUS_UPDATED');

-- CreateEnum
CREATE TYPE "RoommateGender" AS ENUM ('MALE', 'FEMALE', 'ANY');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('AGENT', 'DRIVER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profilePicturePath" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "rememberMe" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "postalCodePrefix" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityLabel" TEXT,
    "maxLoadKg" INTEGER,
    "description" TEXT,
    "pointFrom" INTEGER,
    "pointTo" INTEGER,
    "pricePerKm" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "nrc" TEXT NOT NULL,
    "nrcFrontPhotoPath" TEXT NOT NULL,
    "nrcBackPhotoPath" TEXT NOT NULL,
    "drivingLicensePhotoPath" TEXT NOT NULL,
    "profilePhotoPath" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "currentAddress" TEXT NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "vehicleLicensePlateNumber" TEXT NOT NULL,
    "vehiclePhotoPath" TEXT NOT NULL,
    "wheelTaxPhotoPath" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" VARCHAR(500),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingRequest" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "assignedDriverUserId" TEXT,
    "vehicleTypeId" TEXT NOT NULL,
    "pickupFloorLevelId" TEXT,
    "dropoffFloorLevelId" TEXT,
    "status" "MovingRequestStatus" NOT NULL DEFAULT 'BOOKED',
    "pickupAddress" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "pickupLatitude" DECIMAL(10,7),
    "pickupLongitude" DECIMAL(10,7),
    "dropoffLatitude" DECIMAL(10,7),
    "dropoffLongitude" DECIMAL(10,7),
    "distanceKm" DECIMAL(10,2),
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "damageChecklist" TEXT,
    "totalInventoryPoints" INTEGER NOT NULL DEFAULT 0,
    "estimatedPrice" DECIMAL(12,2),
    "pricePerKmUsed" DECIMAL(12,2),
    "pickupFloorSurcharge" DECIMAL(12,2),
    "dropoffFloorSurcharge" DECIMAL(12,2),
    "estimatedEarnings" DECIMAL(12,2),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingRequestPhoto" (
    "id" TEXT NOT NULL,
    "movingRequestId" TEXT NOT NULL,
    "photoPath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovingRequestPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingInventoryItemType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovingInventoryItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingInventoryItem" (
    "id" TEXT NOT NULL,
    "movingRequestId" TEXT NOT NULL,
    "inventoryItemTypeId" TEXT,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "pointsPerItem" INTEGER NOT NULL DEFAULT 0,
    "linePoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovingInventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingStatusEvent" (
    "id" TEXT NOT NULL,
    "movingRequestId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "eventType" "MovingStatusEventType" NOT NULL,
    "status" "MovingRequestStatus",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovingStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingEtaEntry" (
    "id" TEXT NOT NULL,
    "movingRequestId" TEXT NOT NULL,
    "driverUserId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "etaAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovingEtaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloorLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levelNumber" INTEGER,
    "surchargeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloorLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nrc" TEXT NOT NULL,
    "nrcFrontPhotoPath" TEXT NOT NULL,
    "nrcBackPhotoPath" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "viber" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "cityId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "serviceRegionId" TEXT NOT NULL,
    "hasRentingExperience" BOOLEAN NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" VARCHAR(500),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "postChannel" "HousePostChannel" NOT NULL,
    "propertyTypeId" TEXT NOT NULL,
    "monthlyFees" DECIMAL(12,2) NOT NULL,
    "depositAmount" DECIMAL(12,2) NOT NULL,
    "contractTypeId" TEXT NOT NULL,
    "areaSize" TEXT,
    "floorLevelId" TEXT,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "houseRules" TEXT,
    "contactTelegram" TEXT,
    "contactViber" TEXT,
    "contactPhoneNumber" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "streetAddress" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "nearbyPlaces" TEXT,
    "availability" "HouseAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommatePost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "budgetCostSharing" TEXT NOT NULL,
    "gender" "RoommateGender" NOT NULL,
    "occupationId" TEXT NOT NULL,
    "isLgbtqFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isCannabisFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isSmokingFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isNoSmoking" BOOLEAN NOT NULL DEFAULT false,
    "isCatFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isDogFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isAlcoholFriendly" BOOLEAN NOT NULL DEFAULT false,
    "likesNightOut" BOOLEAN NOT NULL DEFAULT false,
    "likesHangoutEveryday" BOOLEAN NOT NULL DEFAULT false,
    "hobbyPlayingGame" BOOLEAN NOT NULL DEFAULT false,
    "hobbyWatchingMovies" BOOLEAN NOT NULL DEFAULT false,
    "hobbySinging" BOOLEAN NOT NULL DEFAULT false,
    "hobbyPlayingFootball" BOOLEAN NOT NULL DEFAULT false,
    "hobbyRunning" BOOLEAN NOT NULL DEFAULT false,
    "hobbyCooking" BOOLEAN NOT NULL DEFAULT false,
    "hobbyReading" BOOLEAN NOT NULL DEFAULT false,
    "hobbyFoodie" BOOLEAN NOT NULL DEFAULT false,
    "hobbyChillWithOthers" BOOLEAN NOT NULL DEFAULT false,
    "hobbyRelaxSilent" BOOLEAN NOT NULL DEFAULT false,
    "hobbyPlayingGym" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommatePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseImage" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseAmenity" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledByUserId" TEXT,
    "cancelledByRole" "CancelledByRole",

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingReview" (
    "id" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "bookingId" TEXT,
    "movingRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatingReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusCode" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE INDEX "Role_isActive_idx" ON "Role"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON "RefreshSession"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_expiresAt_idx" ON "RefreshSession"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshSession_revokedAt_idx" ON "RefreshSession"("revokedAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyType_name_key" ON "PropertyType"("name");

-- CreateIndex
CREATE INDEX "State_isActive_idx" ON "State"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_countryCode_key" ON "State"("name", "countryCode");

-- CreateIndex
CREATE INDEX "City_isActive_idx" ON "City"("isActive");

-- CreateIndex
CREATE INDEX "City_stateId_idx" ON "City"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_stateId_key" ON "City"("name", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractType_name_key" ON "ContractType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_name_key" ON "VehicleType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_userId_key" ON "DriverProfile"("userId");

-- CreateIndex
CREATE INDEX "DriverProfile_vehicleTypeId_idx" ON "DriverProfile"("vehicleTypeId");

-- CreateIndex
CREATE INDEX "DriverProfile_verificationStatus_idx" ON "DriverProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MovingRequest_orderNumber_key" ON "MovingRequest"("orderNumber");

-- CreateIndex
CREATE INDEX "MovingRequest_requesterUserId_createdAt_idx" ON "MovingRequest"("requesterUserId", "createdAt");

-- CreateIndex
CREATE INDEX "MovingRequest_assignedDriverUserId_createdAt_idx" ON "MovingRequest"("assignedDriverUserId", "createdAt");

-- CreateIndex
CREATE INDEX "MovingRequest_status_assignedDriverUserId_createdAt_idx" ON "MovingRequest"("status", "assignedDriverUserId", "createdAt");

-- CreateIndex
CREATE INDEX "MovingRequest_orderNumber_idx" ON "MovingRequest"("orderNumber");

-- CreateIndex
CREATE INDEX "MovingRequest_pickupFloorLevelId_idx" ON "MovingRequest"("pickupFloorLevelId");

-- CreateIndex
CREATE INDEX "MovingRequest_dropoffFloorLevelId_idx" ON "MovingRequest"("dropoffFloorLevelId");

-- CreateIndex
CREATE INDEX "MovingRequestPhoto_movingRequestId_idx" ON "MovingRequestPhoto"("movingRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "MovingInventoryItemType_code_key" ON "MovingInventoryItemType"("code");

-- CreateIndex
CREATE INDEX "MovingInventoryItemType_isActive_sortOrder_idx" ON "MovingInventoryItemType"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "MovingInventoryItemType_category_idx" ON "MovingInventoryItemType"("category");

-- CreateIndex
CREATE INDEX "MovingInventoryItem_movingRequestId_idx" ON "MovingInventoryItem"("movingRequestId");

-- CreateIndex
CREATE INDEX "MovingInventoryItem_category_idx" ON "MovingInventoryItem"("category");

-- CreateIndex
CREATE INDEX "MovingInventoryItem_inventoryItemTypeId_idx" ON "MovingInventoryItem"("inventoryItemTypeId");

-- CreateIndex
CREATE INDEX "MovingStatusEvent_movingRequestId_createdAt_idx" ON "MovingStatusEvent"("movingRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "MovingStatusEvent_actorUserId_idx" ON "MovingStatusEvent"("actorUserId");

-- CreateIndex
CREATE INDEX "MovingStatusEvent_eventType_idx" ON "MovingStatusEvent"("eventType");

-- CreateIndex
CREATE INDEX "MovingEtaEntry_movingRequestId_createdAt_idx" ON "MovingEtaEntry"("movingRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "MovingEtaEntry_driverUserId_idx" ON "MovingEtaEntry"("driverUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRegion_code_key" ON "ServiceRegion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRegion_name_code_key" ON "ServiceRegion"("name", "code");

-- CreateIndex
CREATE UNIQUE INDEX "FloorLevel_name_key" ON "FloorLevel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Occupation_name_key" ON "Occupation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "AgentProfile"("userId");

-- CreateIndex
CREATE INDEX "AgentProfile_cityId_idx" ON "AgentProfile"("cityId");

-- CreateIndex
CREATE INDEX "AgentProfile_stateId_idx" ON "AgentProfile"("stateId");

-- CreateIndex
CREATE INDEX "AgentProfile_serviceRegionId_idx" ON "AgentProfile"("serviceRegionId");

-- CreateIndex
CREATE INDEX "AgentProfile_verificationStatus_idx" ON "AgentProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "House_agentId_idx" ON "House"("agentId");

-- CreateIndex
CREATE INDEX "House_propertyTypeId_idx" ON "House"("propertyTypeId");

-- CreateIndex
CREATE INDEX "House_contractTypeId_idx" ON "House"("contractTypeId");

-- CreateIndex
CREATE INDEX "House_floorLevelId_idx" ON "House"("floorLevelId");

-- CreateIndex
CREATE INDEX "House_cityId_idx" ON "House"("cityId");

-- CreateIndex
CREATE INDEX "House_stateId_idx" ON "House"("stateId");

-- CreateIndex
CREATE INDEX "House_availability_idx" ON "House"("availability");

-- CreateIndex
CREATE INDEX "House_postChannel_idx" ON "House"("postChannel");

-- CreateIndex
CREATE INDEX "RoommatePost_userId_createdAt_idx" ON "RoommatePost"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RoommatePost_houseId_idx" ON "RoommatePost"("houseId");

-- CreateIndex
CREATE INDEX "RoommatePost_occupationId_idx" ON "RoommatePost"("occupationId");

-- CreateIndex
CREATE INDEX "RoommatePost_gender_idx" ON "RoommatePost"("gender");

-- CreateIndex
CREATE INDEX "HouseImage_houseId_idx" ON "HouseImage"("houseId");

-- CreateIndex
CREATE INDEX "HouseAmenity_amenityId_idx" ON "HouseAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseAmenity_houseId_amenityId_key" ON "HouseAmenity"("houseId", "amenityId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_houseId_idx" ON "Booking"("houseId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_cancelledByUserId_idx" ON "Booking"("cancelledByUserId");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_houseId_idx" ON "Wishlist"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_houseId_key" ON "Wishlist"("userId", "houseId");

-- CreateIndex
CREATE UNIQUE INDEX "RatingReview_bookingId_key" ON "RatingReview"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "RatingReview_movingRequestId_key" ON "RatingReview"("movingRequestId");

-- CreateIndex
CREATE INDEX "RatingReview_reviewerUserId_createdAt_idx" ON "RatingReview"("reviewerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "RatingReview_targetType_targetUserId_createdAt_idx" ON "RatingReview"("targetType", "targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "RatingReview_rating_idx" ON "RatingReview"("rating");

-- CreateIndex
CREATE INDEX "StatusCode_isActive_idx" ON "StatusCode"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StatusCode_entityType_code_key" ON "StatusCode"("entityType", "code");

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingRequest" ADD CONSTRAINT "MovingRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingRequest" ADD CONSTRAINT "MovingRequest_assignedDriverUserId_fkey" FOREIGN KEY ("assignedDriverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingRequest" ADD CONSTRAINT "MovingRequest_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingRequest" ADD CONSTRAINT "MovingRequest_pickupFloorLevelId_fkey" FOREIGN KEY ("pickupFloorLevelId") REFERENCES "FloorLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingRequest" ADD CONSTRAINT "MovingRequest_dropoffFloorLevelId_fkey" FOREIGN KEY ("dropoffFloorLevelId") REFERENCES "FloorLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingRequestPhoto" ADD CONSTRAINT "MovingRequestPhoto_movingRequestId_fkey" FOREIGN KEY ("movingRequestId") REFERENCES "MovingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingInventoryItem" ADD CONSTRAINT "MovingInventoryItem_movingRequestId_fkey" FOREIGN KEY ("movingRequestId") REFERENCES "MovingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingInventoryItem" ADD CONSTRAINT "MovingInventoryItem_inventoryItemTypeId_fkey" FOREIGN KEY ("inventoryItemTypeId") REFERENCES "MovingInventoryItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingStatusEvent" ADD CONSTRAINT "MovingStatusEvent_movingRequestId_fkey" FOREIGN KEY ("movingRequestId") REFERENCES "MovingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingStatusEvent" ADD CONSTRAINT "MovingStatusEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingEtaEntry" ADD CONSTRAINT "MovingEtaEntry_movingRequestId_fkey" FOREIGN KEY ("movingRequestId") REFERENCES "MovingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingEtaEntry" ADD CONSTRAINT "MovingEtaEntry_driverUserId_fkey" FOREIGN KEY ("driverUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_serviceRegionId_fkey" FOREIGN KEY ("serviceRegionId") REFERENCES "ServiceRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "ContractType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_floorLevelId_fkey" FOREIGN KEY ("floorLevelId") REFERENCES "FloorLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePost" ADD CONSTRAINT "RoommatePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePost" ADD CONSTRAINT "RoommatePost_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePost" ADD CONSTRAINT "RoommatePost_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseImage" ADD CONSTRAINT "HouseImage_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseAmenity" ADD CONSTRAINT "HouseAmenity_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseAmenity" ADD CONSTRAINT "HouseAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_movingRequestId_fkey" FOREIGN KEY ("movingRequestId") REFERENCES "MovingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
