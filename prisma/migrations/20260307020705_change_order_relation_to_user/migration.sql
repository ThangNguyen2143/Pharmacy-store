-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "UserDataOrder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserDataOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDataOrder_userId_key" ON "UserDataOrder"("userId");

-- AddForeignKey
ALTER TABLE "UserDataOrder" ADD CONSTRAINT "UserData_userId_relation" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "order_userId_relation" FOREIGN KEY ("userId") REFERENCES "UserDataOrder"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
