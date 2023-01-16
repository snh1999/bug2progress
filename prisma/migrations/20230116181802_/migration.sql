/*
  Warnings:

  - You are about to drop the column `customURL` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[urlid]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Project_customURL_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "customURL",
ADD COLUMN     "urlid" TEXT,
ALTER COLUMN "status" SET DEFAULT 'IN_DEVELOPMENT';

-- CreateIndex
CREATE UNIQUE INDEX "Project_urlid_key" ON "Project"("urlid");
