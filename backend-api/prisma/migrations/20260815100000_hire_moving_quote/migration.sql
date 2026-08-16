-- AlterTable
ALTER TABLE `VehicleType`
    ADD COLUMN `pointFrom` INTEGER NULL,
    ADD COLUMN `pointTo` INTEGER NULL,
    ADD COLUMN `pricePerKm` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `FloorLevel`
    ADD COLUMN `surchargeAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `MovingInventoryItemType` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MovingInventoryItemType_code_key`(`code`),
    INDEX `MovingInventoryItemType_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    INDEX `MovingInventoryItemType_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `MovingInventoryItem`
    ADD COLUMN `inventoryItemTypeId` VARCHAR(191) NULL,
    ADD COLUMN `pointsPerItem` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `linePoints` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `MovingRequest`
    ADD COLUMN `orderNumber` VARCHAR(191) NULL,
    ADD COLUMN `pickupFloorLevelId` VARCHAR(191) NULL,
    ADD COLUMN `dropoffFloorLevelId` VARCHAR(191) NULL,
    ADD COLUMN `pickupLatitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `pickupLongitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `dropoffLatitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `dropoffLongitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `distanceKm` DECIMAL(10, 2) NULL,
    ADD COLUMN `totalInventoryPoints` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `estimatedPrice` DECIMAL(12, 2) NULL,
    ADD COLUMN `pricePerKmUsed` DECIMAL(12, 2) NULL,
    ADD COLUMN `pickupFloorSurcharge` DECIMAL(12, 2) NULL,
    ADD COLUMN `dropoffFloorSurcharge` DECIMAL(12, 2) NULL;

UPDATE `MovingRequest`
SET `orderNumber` = CONCAT('MOV-LEGACY-', `id`)
WHERE `orderNumber` IS NULL;

ALTER TABLE `MovingRequest`
    MODIFY `orderNumber` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `MovingRequest_orderNumber_key` ON `MovingRequest`(`orderNumber`);
CREATE INDEX `MovingRequest_orderNumber_idx` ON `MovingRequest`(`orderNumber`);
CREATE INDEX `MovingRequest_pickupFloorLevelId_idx` ON `MovingRequest`(`pickupFloorLevelId`);
CREATE INDEX `MovingRequest_dropoffFloorLevelId_idx` ON `MovingRequest`(`dropoffFloorLevelId`);

-- AddForeignKey
ALTER TABLE `MovingRequest` ADD CONSTRAINT `MovingRequest_pickupFloorLevelId_fkey` FOREIGN KEY (`pickupFloorLevelId`) REFERENCES `FloorLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `MovingRequest` ADD CONSTRAINT `MovingRequest_dropoffFloorLevelId_fkey` FOREIGN KEY (`dropoffFloorLevelId`) REFERENCES `FloorLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX `MovingInventoryItem_inventoryItemTypeId_idx` ON `MovingInventoryItem`(`inventoryItemTypeId`);
ALTER TABLE `MovingInventoryItem` ADD CONSTRAINT `MovingInventoryItem_inventoryItemTypeId_fkey` FOREIGN KEY (`inventoryItemTypeId`) REFERENCES `MovingInventoryItemType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
