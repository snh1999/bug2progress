/*
  Warnings:

  - You are about to drop the column `ticketSeverity` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `TicketRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketPriority" ADD VALUE 'CRITICAL';
ALTER TYPE "TicketPriority" ADD VALUE 'OPTIONAL';

-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_assignedbyId_fkey";

-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_closeId_fkey";

-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_developerId_fkey";

-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_varifierId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ticketSeverity",
ADD COLUMN     "assignedbyId" TEXT,
ADD COLUMN     "varifiedAt" TIMESTAMP(3),
ADD COLUMN     "varifierId" TEXT;

-- DropTable
DROP TABLE "TicketRoles";

-- DropEnum
DROP TYPE "TicketSeverity";

-- DropEnum
DROP TYPE "TicketStatus";

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_varifierId_fkey" FOREIGN KEY ("varifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedbyId_fkey" FOREIGN KEY ("assignedbyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
