/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isModerator` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_organizationId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
DROP COLUMN "isModerator";

-- CreateTable
CREATE TABLE "OrganizationRoles" (
    "orgId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "OrganizationRoles_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "_admin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_moderator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_admin_AB_unique" ON "_admin"("A", "B");

-- CreateIndex
CREATE INDEX "_admin_B_index" ON "_admin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_moderator_AB_unique" ON "_moderator"("A", "B");

-- CreateIndex
CREATE INDEX "_moderator_B_index" ON "_moderator"("B");

-- AddForeignKey
ALTER TABLE "OrganizationRoles" ADD CONSTRAINT "OrganizationRoles_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRoles" ADD CONSTRAINT "OrganizationRoles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_A_fkey" FOREIGN KEY ("A") REFERENCES "OrganizationRoles"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_moderator" ADD CONSTRAINT "_moderator_A_fkey" FOREIGN KEY ("A") REFERENCES "OrganizationRoles"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_moderator" ADD CONSTRAINT "_moderator_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
