/*
  Warnings:

  - You are about to drop the column `creatorId` on the `TicketRoles` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_creatorId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketRoles" DROP COLUMN "creatorId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
