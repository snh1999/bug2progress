/*
  Warnings:

  - The values [ISSUE,FEATURE_REQUEST] on the enum `TicketType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketType_new" AS ENUM ('BUG', 'TECH_DEBT', 'ENHANCEMENT', 'FEATURE');
ALTER TABLE "Ticket" ALTER COLUMN "ticketType" TYPE "TicketType_new" USING ("ticketType"::text::"TicketType_new");
ALTER TYPE "TicketType" RENAME TO "TicketType_old";
ALTER TYPE "TicketType_new" RENAME TO "TicketType";
DROP TYPE "TicketType_old";
COMMIT;
