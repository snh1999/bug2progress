-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketStatus" "TicketStatus" NOT NULL DEFAULT 'BACKLOG';
