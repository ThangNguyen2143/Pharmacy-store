/*
  Warnings:

  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - Added the required column `dataDevice` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_relation";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "sessionToken",
ADD COLUMN     "dataDevice" VARCHAR(255) NOT NULL,
ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_sessionId_relation" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
