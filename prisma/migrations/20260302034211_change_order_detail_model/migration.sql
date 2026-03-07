/*
  Warnings:

  - Added the required column `price_sale` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "price_sale" DOUBLE PRECISION NOT NULL;
