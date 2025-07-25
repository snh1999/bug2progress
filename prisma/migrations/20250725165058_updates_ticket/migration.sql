/*
  Warnings:

  - Added the required column `position` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "position" INTEGER NOT NULL;
