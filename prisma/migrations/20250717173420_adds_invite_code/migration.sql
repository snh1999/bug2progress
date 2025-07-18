/*
  Warnings:

  - The required column `inviteCode` was added to the `Project` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "inviteCode" TEXT NOT NULL;
