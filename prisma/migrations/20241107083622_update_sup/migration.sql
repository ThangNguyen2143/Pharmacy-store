/*
  Warnings:

  - You are about to drop the `suppiler` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `depotform` DROP FOREIGN KEY `depotform_Sup_ID_fkey`;

-- DropTable
DROP TABLE `suppiler`;

-- CreateTable
CREATE TABLE `supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `nation` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `depotform` ADD CONSTRAINT `depotform_Sup_ID_fkey` FOREIGN KEY (`Sup_ID`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
