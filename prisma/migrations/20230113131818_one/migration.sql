/*
  Warnings:

  - You are about to drop the column `customURL` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[URLId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `URLId` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organization_customURL_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "customURL",
ADD COLUMN     "URLId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "projectXFeaturesFeaturesId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_URLId_key" ON "Organization"("URLId");
