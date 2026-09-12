-- 门槛评估答卷：先静默积累，样本够了再切真实百分位
CREATE TABLE `threshold_submissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `client_key` VARCHAR(64) NULL,
    `answers` JSON NOT NULL,
    `result` JSON NOT NULL,
    `edu_score` INTEGER NOT NULL,
    `paper_score` INTEGER NOT NULL,
    `grant_score` INTEGER NOT NULL,
    `overseas_score` INTEGER NOT NULL,
    `age_score` INTEGER NOT NULL,
    `impact_score` INTEGER NOT NULL,
    `award_score` INTEGER NOT NULL,
    `user_score` INTEGER NOT NULL,
    `percentile` INTEGER NOT NULL,
    `percentile_mode` VARCHAR(16) NOT NULL DEFAULT 'illustrative',
    `discipline_major` VARCHAR(32) NOT NULL,
    `phd_year` VARCHAR(8) NOT NULL,
    `age` INTEGER NULL,
    `has_target` BOOLEAN NOT NULL DEFAULT false,
    `target_tier` VARCHAR(64) NULL,
    `include_in_norm` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `threshold_submissions_include_in_norm_idx`(`include_in_norm`),
    INDEX `threshold_submissions_discipline_major_idx`(`discipline_major`),
    INDEX `threshold_submissions_phd_year_idx`(`phd_year`),
    INDEX `threshold_submissions_user_score_idx`(`user_score`),
    INDEX `threshold_submissions_client_key_idx`(`client_key`),
    INDEX `threshold_submissions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `threshold_submissions` ADD CONSTRAINT `threshold_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
