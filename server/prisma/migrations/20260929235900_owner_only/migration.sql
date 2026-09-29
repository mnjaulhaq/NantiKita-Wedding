ALTER TABLE `users`
    ADD COLUMN `role` VARCHAR(255) NOT NULL DEFAULT 'owner';

ALTER TABLE `weddings`
    ADD COLUMN `user_id` BIGINT UNSIGNED NULL;

CREATE INDEX `weddings_user_id_idx` ON `weddings` (`user_id`);

ALTER TABLE `weddings`
    ADD CONSTRAINT `weddings_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
