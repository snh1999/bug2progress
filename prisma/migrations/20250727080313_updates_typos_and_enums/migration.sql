/*
  Warnings:

  - The values [DEPRICATED] on the enum `FeatureType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedbyId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `featuresId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `varifiedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `varifierId` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeatureType_new" AS ENUM ('MAINTAINED', 'ACTIVE', 'DEPRECATED', 'OBSOLETE', 'PROPOSED');
ALTER TABLE "Features" ALTER COLUMN "featureType" DROP DEFAULT;
ALTER TABLE "Features" ALTER COLUMN "featureType" TYPE "FeatureType_new" USING ("featureType"::text::"FeatureType_new");
ALTER TYPE "FeatureType" RENAME TO "FeatureType_old";
ALTER TYPE "FeatureType_new" RENAME TO "FeatureType";
DROP TYPE "FeatureType_old";
ALTER TABLE "Features" ALTER COLUMN "featureType" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
ALTER TYPE "TicketPriority" ADD VALUE 'URGENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketStatus" ADD VALUE 'BLOCKED';
ALTER TYPE "TicketStatus" ADD VALUE 'IN_QA';
ALTER TYPE "TicketStatus" ADD VALUE 'DEPLOYED';
ALTER TYPE "TicketStatus" ADD VALUE 'ARCHIVED';
ALTER TYPE "TicketStatus" ADD VALUE 'CANCELED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketType" ADD VALUE 'SPIKE';
ALTER TYPE "TicketType" ADD VALUE 'STORY';
ALTER TYPE "TicketType" ADD VALUE 'TASK';
ALTER TYPE "TicketType" ADD VALUE 'EPIC';
ALTER TYPE "TicketType" ADD VALUE 'SUPPORT';
ALTER TYPE "TicketType" ADD VALUE 'TEST';

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_assignedbyId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_featuresId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_varifierId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "assignedbyId",
DROP COLUMN "featuresId",
DROP COLUMN "varifiedAt",
DROP COLUMN "varifierId",
ADD COLUMN     "assignedContributorId" TEXT,
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "featureId" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifierId" TEXT,
ALTER COLUMN "ticketType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedContributorId_fkey" FOREIGN KEY ("assignedContributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
