-- AlterTable
ALTER TABLE `categories`
  ADD COLUMN `cover_image` VARCHAR(256) NOT NULL DEFAULT '',
  ADD COLUMN `hero_image` VARCHAR(256) NOT NULL DEFAULT '',
  ADD COLUMN `image_alt` VARCHAR(128) NOT NULL DEFAULT '',
  ADD COLUMN `tone` VARCHAR(16) NOT NULL DEFAULT 'sand',
  ADD COLUMN `gallery` JSON NULL;

UPDATE `categories` SET `gallery` = JSON_ARRAY() WHERE `gallery` IS NULL;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `src` VARCHAR(256) NOT NULL,
    `alt` VARCHAR(128) NOT NULL,
    `kind` VARCHAR(16) NOT NULL,

    UNIQUE INDEX `media_assets_src_kind_key`(`src`, `kind`),
    INDEX `media_assets_kind_idx`(`kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
