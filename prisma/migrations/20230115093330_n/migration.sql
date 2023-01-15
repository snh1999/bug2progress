/*
  Warnings:

  - You are about to drop the column `URLId` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[urlid]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `urlid` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organization_URLId_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "URLId",
ADD COLUMN     "urlid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_urlid_key" ON "Organization"("urlid");
