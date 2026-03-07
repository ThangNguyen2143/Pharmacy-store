/*
  Warnings:

  - You are about to drop the `blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cartitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `depotform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `depotformdetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groupproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `img` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderstatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `typeproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `dataDevice` on the `Session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_relation";

-- DropForeignKey
ALTER TABLE "cartitem" DROP CONSTRAINT "cartitem_cartId_fkey";

-- DropForeignKey
ALTER TABLE "cartitem" DROP CONSTRAINT "cartitem_productId_fkey";

-- DropForeignKey
ALTER TABLE "depotform" DROP CONSTRAINT "depotform_Sup_ID_fkey";

-- DropForeignKey
ALTER TABLE "depotformdetail" DROP CONSTRAINT "depotformdetail_dF_id_fkey";

-- DropForeignKey
ALTER TABLE "img" DROP CONSTRAINT "img_blogId_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_productId_relation";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_osId_relation";

-- DropForeignKey
ALTER TABLE "orderDetail" DROP CONSTRAINT "orderDetail_oderId_fkey";

-- DropForeignKey
ALTER TABLE "orderDetail" DROP CONSTRAINT "orderDetail_productId_relation";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_typeProductId_relation";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "dataDevice",
ADD COLUMN     "dataDevice" JSONB NOT NULL;

-- DropTable
DROP TABLE "blog";

-- DropTable
DROP TABLE "cart";

-- DropTable
DROP TABLE "cartitem";

-- DropTable
DROP TABLE "depotform";

-- DropTable
DROP TABLE "depotformdetail";

-- DropTable
DROP TABLE "groupproduct";

-- DropTable
DROP TABLE "img";

-- DropTable
DROP TABLE "media";

-- DropTable
DROP TABLE "order";

-- DropTable
DROP TABLE "orderDetail";

-- DropTable
DROP TABLE "orderstatus";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "supplier";

-- DropTable
DROP TABLE "typeproduct";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(15) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "handle" TEXT NOT NULL,
    "stored" INTEGER NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "howPack" TEXT NOT NULL,
    "ingredient" VARCHAR(255) NOT NULL,
    "typeUse" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "typeProductId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "totalQuantity" SMALLINT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cartitem" (
    "quantity" SMALLINT NOT NULL,
    "productId" INTEGER NOT NULL,
    "cartId" INTEGER NOT NULL,

    CONSTRAINT "Cartitem_pkey" PRIMARY KEY ("productId","cartId")
);

-- CreateTable
CREATE TABLE "Depotform" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Sup_ID" INTEGER NOT NULL,

    CONSTRAINT "Depotform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depotformdetail" (
    "dF_id" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Depotformdetail_pkey" PRIMARY KEY ("dF_id","productId")
);

-- CreateTable
CREATE TABLE "Groupproduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Groupproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(100) NOT NULL,
    "altText" VARCHAR(255) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "nation" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Typeproduct" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Typeproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Total" DOUBLE PRECISION NOT NULL,
    "AddressRecive" VARCHAR(255) NOT NULL,
    "TypePay" VARCHAR(15) NOT NULL,
    "osId" INTEGER NOT NULL,
    "NameRecive" VARCHAR(255) NOT NULL,
    "PhoneRecive" VARCHAR(15) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "oderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("oderId","productId")
);

-- CreateTable
CREATE TABLE "Orderstatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,

    CONSTRAINT "Orderstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Img" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(100) NOT NULL,
    "altText" VARCHAR(255) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blogId" INTEGER NOT NULL,

    CONSTRAINT "Img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "product_typeProductId_fkey" ON "Product"("typeProductId");

-- CreateIndex
CREATE INDEX "cartItem_cartId_fkey" ON "Cartitem"("cartId");

-- CreateIndex
CREATE INDEX "depotForm_Sup_ID_fkey" ON "Depotform"("Sup_ID");

-- CreateIndex
CREATE INDEX "depotFormDetail_productId_fkey" ON "Depotformdetail"("productId");

-- CreateIndex
CREATE INDEX "media_productId_fkey" ON "Media"("productId");

-- CreateIndex
CREATE INDEX "order_osId_fkey" ON "Order"("osId");

-- CreateIndex
CREATE INDEX "orderDetail_productId_fkey" ON "OrderDetail"("productId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_relation" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "product_typeProductId_relation" FOREIGN KEY ("typeProductId") REFERENCES "Typeproduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartitem" ADD CONSTRAINT "Cartitem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartitem" ADD CONSTRAINT "Cartitem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depotform" ADD CONSTRAINT "Depotform_Sup_ID_fkey" FOREIGN KEY ("Sup_ID") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depotformdetail" ADD CONSTRAINT "Depotformdetail_dF_id_fkey" FOREIGN KEY ("dF_id") REFERENCES "Depotform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "media_productId_relation" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "order_osId_relation" FOREIGN KEY ("osId") REFERENCES "Orderstatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "orderDetail_productId_relation" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_oderId_fkey" FOREIGN KEY ("oderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Img" ADD CONSTRAINT "Img_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
