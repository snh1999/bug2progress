/*
  Warnings:

  - You are about to drop the `Admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Developer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Manager` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Moderators` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admins" DROP CONSTRAINT "Admins_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Admins" DROP CONSTRAINT "Admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "Developer" DROP CONSTRAINT "Developer_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Developer" DROP CONSTRAINT "Developer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Manager" DROP CONSTRAINT "Manager_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Manager" DROP CONSTRAINT "Manager_userId_fkey";

-- DropForeignKey
ALTER TABLE "Members" DROP CONSTRAINT "Members_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Members" DROP CONSTRAINT "Members_userId_fkey";

-- DropForeignKey
ALTER TABLE "Moderators" DROP CONSTRAINT "Moderators_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Moderators" DROP CONSTRAINT "Moderators_userId_fkey";

-- DropTable
DROP TABLE "Admins";

-- DropTable
DROP TABLE "Developer";

-- DropTable
DROP TABLE "Manager";

-- DropTable
DROP TABLE "Members";

-- DropTable
DROP TABLE "Moderators";

-- CreateTable
CREATE TABLE "OrgMembers" (
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrgMembers_pkey" PRIMARY KEY ("organizationId","userId")
);

-- CreateTable
CREATE TABLE "OrgAdmins" (
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrgAdmins_pkey" PRIMARY KEY ("organizationId","userId")
);

-- CreateTable
CREATE TABLE "OrgModerators" (
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrgModerators_pkey" PRIMARY KEY ("organizationId","userId")
);

-- CreateTable
CREATE TABLE "ProjectManager" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectManager_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "ProjectDeveloper" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectDeveloper_pkey" PRIMARY KEY ("projectId","userId")
);

-- AddForeignKey
ALTER TABLE "OrgMembers" ADD CONSTRAINT "OrgMembers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgMembers" ADD CONSTRAINT "OrgMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAdmins" ADD CONSTRAINT "OrgAdmins_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAdmins" ADD CONSTRAINT "OrgAdmins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgModerators" ADD CONSTRAINT "OrgModerators_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgModerators" ADD CONSTRAINT "OrgModerators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeveloper" ADD CONSTRAINT "ProjectDeveloper_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeveloper" ADD CONSTRAINT "ProjectDeveloper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
