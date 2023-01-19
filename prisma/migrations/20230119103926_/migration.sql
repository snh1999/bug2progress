/*
  Warnings:

  - You are about to drop the column `assignedId` on the `TicketRoles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_assignedId_fkey";

-- AlterTable
ALTER TABLE "TicketRoles" DROP COLUMN "assignedId",
ADD COLUMN     "assignedbyId" TEXT;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_assignedbyId_fkey" FOREIGN KEY ("assignedbyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
