-- AlterTable
ALTER TABLE `House` ADD COLUMN `streetAddress` VARCHAR(191) NULL,
    ADD COLUMN `latitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `longitude` DECIMAL(10, 7) NULL;
