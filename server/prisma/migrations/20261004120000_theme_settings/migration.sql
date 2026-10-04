CREATE TABLE `theme_settings` (
    `key` VARCHAR(100) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
