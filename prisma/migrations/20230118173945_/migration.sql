/*
  Warnings:

  - Added the required column `description` to the `Features` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Features" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "summary" TEXT NOT NULL;
