-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `disciplineMajor` VARCHAR(32) NULL,
    `stage` VARCHAR(32) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `tagline` VARCHAR(128) NOT NULL,
    `overview` TEXT NOT NULL,
    `positions` JSON NOT NULL,
    `employers` JSON NOT NULL,
    `interviews` JSON NOT NULL,
    `openings` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(128) NOT NULL,
    `org` VARCHAR(128) NOT NULL,
    `region` VARCHAR(32) NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `salary` VARCHAR(32) NOT NULL,
    `posted` VARCHAR(32) NOT NULL DEFAULT '今天',
    `responsibilities` JSON NOT NULL,
    `requirements` JSON NOT NULL,
    `benefits` JSON NOT NULL,
    `note` TEXT NULL,
    `category_id` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `jobs_type_idx`(`type`),
    INDEX `jobs_region_idx`(`region`),
    INDEX `jobs_active_idx`(`active`),
    INDEX `jobs_category_id_idx`(`category_id`),
    INDEX `jobs_type_region_idx`(`type`, `region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_items` (
    `itemId` VARCHAR(4) NOT NULL,
    `module` CHAR(1) NOT NULL,
    `dimension` VARCHAR(32) NULL,
    `text_zh` TEXT NOT NULL,
    `scale_type` VARCHAR(16) NOT NULL,
    `options` JSON NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `version` INTEGER NOT NULL DEFAULT 1,

    INDEX `assessment_items_module_idx`(`module`),
    PRIMARY KEY (`itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_weights` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` VARCHAR(4) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `weight` TINYINT NOT NULL,
    `source` VARCHAR(16) NOT NULL DEFAULT 'editorial',

    INDEX `assessment_weights_item_id_idx`(`item_id`),
    INDEX `assessment_weights_category_id_idx`(`category_id`),
    UNIQUE INDEX `assessment_weights_item_id_category_id_key`(`item_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `answers` JSON NOT NULL,
    `result` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `assessment_results_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destinations` (
    `id` VARCHAR(16) NOT NULL,
    `school` VARCHAR(64) NOT NULL,
    `major` VARCHAR(64) NOT NULL,
    `org` VARCHAR(128) NOT NULL,
    `type` VARCHAR(16) NOT NULL,
    `year` VARCHAR(8) NOT NULL,
    `location` VARCHAR(32) NOT NULL,

    INDEX `destinations_type_idx`(`type`),
    INDEX `destinations_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `org` VARCHAR(128) NOT NULL,
    `position` VARCHAR(128) NOT NULL,
    `family` VARCHAR(64) NOT NULL,
    `salary` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `n` INTEGER NOT NULL DEFAULT 1,
    `source` VARCHAR(64) NOT NULL,

    INDEX `salaries_family_idx`(`family`),
    INDEX `salaries_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(32) NOT NULL,
    `from` VARCHAR(128) NOT NULL,
    `to` VARCHAR(128) NOT NULL,
    `date` VARCHAR(16) NOT NULL,
    `quote` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `benchmarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(64) NOT NULL,
    `data` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `benchmarks_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(64) NOT NULL,
    `level` VARCHAR(8) NOT NULL,
    `score_weight` INTEGER NOT NULL,
    `patterns` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `interview_questions` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `risk_rules_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conflict_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field` VARCHAR(8) NOT NULL,
    `condition` VARCHAR(64) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,

    INDEX `conflict_rules_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `values_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value_id` VARCHAR(4) NOT NULL,
    `question` TEXT NOT NULL,

    INDEX `values_questions_value_id_idx`(`value_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_weights` ADD CONSTRAINT `assessment_weights_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `assessment_items`(`itemId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_weights` ADD CONSTRAINT `assessment_weights_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_results` ADD CONSTRAINT `assessment_results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conflict_rules` ADD CONSTRAINT `conflict_rules_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
