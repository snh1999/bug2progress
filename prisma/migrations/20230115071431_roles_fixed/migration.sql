/*
  Warnings:

  - You are about to drop the `OrganizationRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrganizationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TicketRolesToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_developer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_moderator` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[developerId]` on the table `TicketRoles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrganizationRoles" DROP CONSTRAINT "OrganizationRoles_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationRoles" DROP CONSTRAINT "OrganizationRoles_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRoles" DROP CONSTRAINT "ProjectRoles_managerId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRoles" DROP CONSTRAINT "ProjectRoles_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRoles" DROP CONSTRAINT "ProjectRoles_projectId_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_TicketRolesToUser" DROP CONSTRAINT "_TicketRolesToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TicketRolesToUser" DROP CONSTRAINT "_TicketRolesToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_admin" DROP CONSTRAINT "_admin_A_fkey";

-- DropForeignKey
ALTER TABLE "_admin" DROP CONSTRAINT "_admin_B_fkey";

-- DropForeignKey
ALTER TABLE "_developer" DROP CONSTRAINT "_developer_A_fkey";

-- DropForeignKey
ALTER TABLE "_developer" DROP CONSTRAINT "_developer_B_fkey";

-- DropForeignKey
ALTER TABLE "_moderator" DROP CONSTRAINT "_moderator_A_fkey";

-- DropForeignKey
ALTER TABLE "_moderator" DROP CONSTRAINT "_moderator_B_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketRoles" ADD COLUMN     "developerId" TEXT;

-- DropTable
DROP TABLE "OrganizationRoles";

-- DropTable
DROP TABLE "ProjectRoles";

-- DropTable
DROP TABLE "_OrganizationToUser";

-- DropTable
DROP TABLE "_TicketRolesToUser";

-- DropTable
DROP TABLE "_admin";

-- DropTable
DROP TABLE "_developer";

-- DropTable
DROP TABLE "_moderator";

-- CreateTable
CREATE TABLE "Members" (
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Members_pkey" PRIMARY KEY ("organizationId","userId")
);

-- CreateTable
CREATE TABLE "Admins" (
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("organizationId","userId")
);

-- CreateTable
CREATE TABLE "Moderators" (
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Moderators_pkey" PRIMARY KEY ("organizationId","userId")
);

-- CreateTable
CREATE TABLE "Manager" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "Developer" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketRoles_developerId_key" ON "TicketRoles"("developerId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderators" ADD CONSTRAINT "Moderators_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderators" ADD CONSTRAINT "Moderators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
