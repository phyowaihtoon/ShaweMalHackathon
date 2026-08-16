-- Expand moving request statuses: PENDING -> BOOKED, IN_PROGRESS -> operational steps.

ALTER TABLE `MovingRequest`
    MODIFY `status` ENUM(
        'PENDING',
        'BOOKED',
        'ACCEPTED',
        'ASSIGNED',
        'IN_PROGRESS',
        'DRIVER_COMING',
        'DRIVER_ARRIVED',
        'LOADING',
        'ON_THE_WAY',
        'UNLOADING',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING';

ALTER TABLE `MovingStatusEvent`
    MODIFY `status` ENUM(
        'PENDING',
        'BOOKED',
        'ACCEPTED',
        'ASSIGNED',
        'IN_PROGRESS',
        'DRIVER_COMING',
        'DRIVER_ARRIVED',
        'LOADING',
        'ON_THE_WAY',
        'UNLOADING',
        'COMPLETED',
        'CANCELLED'
    ) NULL;

UPDATE `MovingRequest` SET `status` = 'BOOKED' WHERE `status` = 'PENDING';
UPDATE `MovingRequest` SET `status` = 'DRIVER_COMING' WHERE `status` = 'IN_PROGRESS';
UPDATE `MovingStatusEvent` SET `status` = 'BOOKED' WHERE `status` = 'PENDING';
UPDATE `MovingStatusEvent` SET `status` = 'DRIVER_COMING' WHERE `status` = 'IN_PROGRESS';

ALTER TABLE `MovingRequest`
    MODIFY `status` ENUM(
        'BOOKED',
        'ACCEPTED',
        'ASSIGNED',
        'DRIVER_COMING',
        'DRIVER_ARRIVED',
        'LOADING',
        'ON_THE_WAY',
        'UNLOADING',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'BOOKED';

ALTER TABLE `MovingStatusEvent`
    MODIFY `status` ENUM(
        'BOOKED',
        'ACCEPTED',
        'ASSIGNED',
        'DRIVER_COMING',
        'DRIVER_ARRIVED',
        'LOADING',
        'ON_THE_WAY',
        'UNLOADING',
        'COMPLETED',
        'CANCELLED'
    ) NULL;
