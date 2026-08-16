-- Link ratings to a confirmed booking (agent) or completed moving request (driver).
-- Widen comment to match the API 1000-character limit.

ALTER TABLE `RatingReview` MODIFY `comment` VARCHAR(1000) NULL;

ALTER TABLE `RatingReview` ADD COLUMN `bookingId` VARCHAR(191) NULL,
    ADD COLUMN `movingRequestId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `RatingReview_bookingId_key` ON `RatingReview`(`bookingId`);

CREATE UNIQUE INDEX `RatingReview_movingRequestId_key` ON `RatingReview`(`movingRequestId`);

ALTER TABLE `RatingReview` ADD CONSTRAINT `RatingReview_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `RatingReview` ADD CONSTRAINT `RatingReview_movingRequestId_fkey` FOREIGN KEY (`movingRequestId`) REFERENCES `MovingRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
