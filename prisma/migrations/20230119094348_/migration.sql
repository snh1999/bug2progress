/*
  Warnings:

  - You are about to drop the column `ticketStatus` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ticketStatus";

-- AlterTable
ALTER TABLE "TicketRoles" ADD COLUMN     "ticketStatus" "TicketStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "assignedToAt" DROP NOT NULL;
