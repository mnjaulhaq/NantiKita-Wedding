CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `users_username_unique` (`username`),
    UNIQUE INDEX `users_email_unique` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `otps` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `otp_code` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP(0) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    PRIMARY KEY (`id`),
    INDEX `otps_username_index` (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `weddings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `nama_pria` VARCHAR(255) NOT NULL,
    `nama_wanita` VARCHAR(255) NOT NULL,
    `tanggal_acara` DATE NOT NULL,
    `lokasi_acara` TEXT NOT NULL,
    `tema` VARCHAR(255) NOT NULL,
    `paket` ENUM('basic', 'premium') NOT NULL DEFAULT 'basic',
    `musik_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `weddings_slug_unique` (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rsvps` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `wedding_id` BIGINT UNSIGNED NOT NULL,
    `nama_tamu` VARCHAR(255) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `jumlah_hadir` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('hadir', 'tidak_hadir') NOT NULL,
    `ucapan` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    PRIMARY KEY (`id`),
    INDEX `rsvps_wedding_id_foreign` (`wedding_id`),
    CONSTRAINT `rsvps_wedding_id_foreign`
        FOREIGN KEY (`wedding_id`) REFERENCES `weddings` (`id`)
        ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
