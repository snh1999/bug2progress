/*
  Warnings:

  - You are about to drop the column `closedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TicketRoles` table. All the data in the column will be lost.
  - Added the required column `ticketStatus` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignedToAt` to the `TicketRoles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TicketRoles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'VERIFIED', 'ASSIGNED', 'PENDING_CLOSE', 'CLOSED');

-- DropForeignKey
ALTER TABLE "TicketRoles" DROP CONSTRAINT "TicketRoles_userId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "closedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "ticketStatus" "TicketStatus" NOT NULL;

-- AlterTable
ALTER TABLE "TicketRoles" DROP COLUMN "userId",
ADD COLUMN     "assignedToAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "varifiedAt" TIMESTAMP(3);
