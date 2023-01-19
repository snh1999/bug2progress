-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "ticketSeverity" DROP NOT NULL,
ALTER COLUMN "ticketPriority" DROP NOT NULL,
ALTER COLUMN "ticketStatus" DROP NOT NULL;
