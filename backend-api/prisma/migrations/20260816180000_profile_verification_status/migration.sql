-- Move verification status from User onto AgentProfile and DriverProfile.

ALTER TABLE `AgentProfile` ADD COLUMN `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `rejectionReason` VARCHAR(500) NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL;

CREATE INDEX `AgentProfile_verificationStatus_idx` ON `AgentProfile`(`verificationStatus`);

UPDATE `AgentProfile` `ap`
INNER JOIN `User` `u` ON `u`.`id` = `ap`.`userId`
SET `ap`.`verificationStatus` = `u`.`verificationStatus`;

ALTER TABLE `DriverProfile` ADD COLUMN `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `rejectionReason` VARCHAR(500) NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL;

CREATE INDEX `DriverProfile_verificationStatus_idx` ON `DriverProfile`(`verificationStatus`);

UPDATE `DriverProfile` `dp`
INNER JOIN `User` `u` ON `u`.`id` = `dp`.`userId`
SET `dp`.`verificationStatus` = `u`.`verificationStatus`;

DROP INDEX `User_verificationStatus_idx` ON `User`;

ALTER TABLE `User` DROP COLUMN `verificationStatus`;
