-- AlterTable
ALTER TABLE `destinations` ADD COLUMN `category_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `interviews` ADD COLUMN `category_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `salaries` ADD COLUMN `category_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `destinations_category_id_idx` ON `destinations`(`category_id`);

-- CreateIndex
CREATE INDEX `interviews_category_id_idx` ON `interviews`(`category_id`);

-- CreateIndex
CREATE INDEX `salaries_category_id_idx` ON `salaries`(`category_id`);

-- AddForeignKey
ALTER TABLE `destinations` ADD CONSTRAINT `destinations_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salaries` ADD CONSTRAINT `salaries_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
