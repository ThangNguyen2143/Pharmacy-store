/*
  Warnings:

  - The primary key for the `Img` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `altText` on the `Img` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Img` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Img` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Img` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Img` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `howPack` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ingredient` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stored` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `typeProductId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `typeUse` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Depotform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Depotformdetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Groupproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Typeproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_groupproducttoproduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeProduct" AS ENUM ('herb', 'medicine');

-- DropForeignKey
ALTER TABLE "Depotform" DROP CONSTRAINT "Depotform_Sup_ID_fkey";

-- DropForeignKey
ALTER TABLE "Depotformdetail" DROP CONSTRAINT "Depotformdetail_dF_id_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "media_productId_relation";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "product_typeProductId_relation";

-- DropIndex
DROP INDEX "media_productId_fkey";

-- DropIndex
DROP INDEX "product_typeProductId_fkey";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Img" DROP CONSTRAINT "Img_pkey",
DROP COLUMN "altText",
DROP COLUMN "height",
DROP COLUMN "id",
DROP COLUMN "url",
DROP COLUMN "width",
ADD COLUMN     "mediaId" SERIAL NOT NULL,
ADD CONSTRAINT "Img_pkey" PRIMARY KEY ("mediaId");

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "productId",
ALTER COLUMN "url" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "destination",
DROP COLUMN "dosage",
DROP COLUMN "handle",
DROP COLUMN "howPack",
DROP COLUMN "ingredient",
DROP COLUMN "stored",
DROP COLUMN "typeProductId",
DROP COLUMN "typeUse",
ADD COLUMN     "sku" VARCHAR(100) NOT NULL,
ADD COLUMN     "status" VARCHAR(50) NOT NULL,
ADD COLUMN     "type" "TypeProduct" NOT NULL;

-- DropTable
DROP TABLE "Depotform";

-- DropTable
DROP TABLE "Depotformdetail";

-- DropTable
DROP TABLE "Groupproduct";

-- DropTable
DROP TABLE "Supplier";

-- DropTable
DROP TABLE "Typeproduct";

-- DropTable
DROP TABLE "_groupproducttoproduct";

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" SERIAL NOT NULL,
    "batch_Id" INTEGER NOT NULL,
    "qty_on_hand" INTEGER NOT NULL,
    "qty_reserved" INTEGER NOT NULL,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryInventory" (
    "id" SERIAL NOT NULL,
    "batch_Id" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "qty" INTEGER NOT NULL,
    "ref_type" VARCHAR(20) NOT NULL,
    "ref_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoryInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMedia" (
    "productId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("productId","mediaId")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "supplier_name" VARCHAR(100) NOT NULL,
    "nation" VARCHAR(50) NOT NULL,
    "expire_date" TIMESTAMP(3) NOT NULL,
    "import_price" DOUBLE PRECISION NOT NULL,
    "import_date" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventoryLot_batch_Id_fkey" ON "InventoryLot"("batch_Id");

-- CreateIndex
CREATE INDEX "productMedia_mediaId_fkey" ON "ProductMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_relation" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_batch_Id_fkey" FOREIGN KEY ("batch_Id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryInventory" ADD CONSTRAINT "HistoryInventory_batch_Id_fkey" FOREIGN KEY ("batch_Id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "batch_productId_relation" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Img" ADD CONSTRAINT "Img_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
