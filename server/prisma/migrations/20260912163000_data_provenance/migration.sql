-- 岗位 / 薪资 / 去向补齐可核验出处
ALTER TABLE `jobs` ADD COLUMN `source_name` VARCHAR(128) NULL;

ALTER TABLE `destinations` ADD COLUMN `source` VARCHAR(128) NOT NULL DEFAULT '';
ALTER TABLE `destinations` ADD COLUMN `source_url` VARCHAR(512) NULL;
ALTER TABLE `destinations` ADD COLUMN `is_synthetic` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `salaries` ADD COLUMN `source_url` VARCHAR(512) NULL;
