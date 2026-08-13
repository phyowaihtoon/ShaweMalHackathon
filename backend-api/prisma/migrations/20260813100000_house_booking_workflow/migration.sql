-- AlterTable
ALTER TABLE `Booking` MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `cancelledByRole` ENUM('USER', 'AGENT', 'ADMIN') NULL,
    ADD COLUMN `cancelledByUserId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Booking_cancelledByUserId_idx` ON `Booking`(`cancelledByUserId`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_cancelledByUserId_fkey` FOREIGN KEY (`cancelledByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
