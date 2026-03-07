-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'staff', 'customer');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
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

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_groupproducttoproduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "cart" (
    "id" SERIAL NOT NULL,
    "totalQuantity" SMALLINT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartitem" (
    "quantity" SMALLINT NOT NULL,
    "productId" INTEGER NOT NULL,
    "cartId" INTEGER NOT NULL,

    CONSTRAINT "cartitem_pkey" PRIMARY KEY ("productId","cartId")
);

-- CreateTable
CREATE TABLE "depotform" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Sup_ID" INTEGER NOT NULL,

    CONSTRAINT "depotform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depotformdetail" (
    "dF_id" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "depotformdetail_pkey" PRIMARY KEY ("dF_id","productId")
);

-- CreateTable
CREATE TABLE "groupproduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "groupproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(100) NOT NULL,
    "altText" VARCHAR(255) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "nation" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typeproduct" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "typeproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Total" DOUBLE PRECISION NOT NULL,
    "AddressRecive" VARCHAR(255) NOT NULL,
    "TypePay" VARCHAR(15) NOT NULL,
    "osId" INTEGER NOT NULL,
    "NameRecive" VARCHAR(255) NOT NULL,
    "PhoneRecive" VARCHAR(15) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderDetail" (
    "oderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "orderDetail_pkey" PRIMARY KEY ("oderId","productId")
);

-- CreateTable
CREATE TABLE "orderstatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,

    CONSTRAINT "orderstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "img" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(100) NOT NULL,
    "altText" VARCHAR(255) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blogId" INTEGER NOT NULL,

    CONSTRAINT "img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "product_typeProductId_fkey" ON "product"("typeProductId");

-- CreateIndex
CREATE INDEX "_groupProductToproduct_B_index" ON "_groupproducttoproduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_groupProductToproduct_AB_unique" ON "_groupproducttoproduct"("A", "B");

-- CreateIndex
CREATE INDEX "cartItem_cartId_fkey" ON "cartitem"("cartId");

-- CreateIndex
CREATE INDEX "depotForm_Sup_ID_fkey" ON "depotform"("Sup_ID");

-- CreateIndex
CREATE INDEX "depotFormDetail_productId_fkey" ON "depotformdetail"("productId");

-- CreateIndex
CREATE INDEX "media_productId_fkey" ON "media"("productId");

-- CreateIndex
CREATE INDEX "order_osId_fkey" ON "order"("osId");

-- CreateIndex
CREATE INDEX "orderDetail_productId_fkey" ON "orderDetail"("productId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_typeProductId_relation" FOREIGN KEY ("typeProductId") REFERENCES "typeproduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartitem" ADD CONSTRAINT "cartitem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartitem" ADD CONSTRAINT "cartitem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depotform" ADD CONSTRAINT "depotform_Sup_ID_fkey" FOREIGN KEY ("Sup_ID") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depotformdetail" ADD CONSTRAINT "depotformdetail_dF_id_fkey" FOREIGN KEY ("dF_id") REFERENCES "depotform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_productId_relation" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_osId_relation" FOREIGN KEY ("osId") REFERENCES "orderstatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderDetail" ADD CONSTRAINT "orderDetail_productId_relation" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderDetail" ADD CONSTRAINT "orderDetail_oderId_fkey" FOREIGN KEY ("oderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "img" ADD CONSTRAINT "img_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
