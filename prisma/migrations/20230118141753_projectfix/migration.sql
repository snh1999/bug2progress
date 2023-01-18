/*
  Warnings:

  - You are about to drop the column `summary` on the `Project` table. All the data in the column will be lost.
  - The primary key for the `TicketRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TicketRoles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_basePostId_fkey";

-- DropIndex
DROP INDEX "TicketRoles_assignedId_key";

-- DropIndex
DROP INDEX "TicketRoles_closeId_key";

-- DropIndex
DROP INDEX "TicketRoles_creatorId_key";

-- DropIndex
DROP INDEX "TicketRoles_developerId_key";

-- DropIndex
DROP INDEX "TicketRoles_ticketId_key";

-- DropIndex
DROP INDEX "TicketRoles_varifierId_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "summary";

-- AlterTable
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "TicketRoles_pkey" PRIMARY KEY ("ticketId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_basePostId_fkey" FOREIGN KEY ("basePostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
