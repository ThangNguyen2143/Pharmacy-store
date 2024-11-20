/*
  Warnings:

  - Added the required column `checkoutUrl` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Media_productId_key` ON `media`;

-- AlterTable
ALTER TABLE `cart` ADD COLUMN `checkoutUrl` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `media` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_osId_fkey` FOREIGN KEY (`osId`) REFERENCES `orderstatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
