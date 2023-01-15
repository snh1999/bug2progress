/*
  Warnings:

  - You are about to drop the `OrgAdmins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrgModerators` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectDeveloper` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectManager` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('MANAGER', 'DEVELOPER');

-- DropForeignKey
ALTER TABLE "OrgAdmins" DROP CONSTRAINT "OrgAdmins_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgAdmins" DROP CONSTRAINT "OrgAdmins_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrgModerators" DROP CONSTRAINT "OrgModerators_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgModerators" DROP CONSTRAINT "OrgModerators_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectDeveloper" DROP CONSTRAINT "ProjectDeveloper_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectDeveloper" DROP CONSTRAINT "ProjectDeveloper_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectManager" DROP CONSTRAINT "ProjectManager_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectManager" DROP CONSTRAINT "ProjectManager_userId_fkey";

-- AlterTable
ALTER TABLE "OrgMembers" ADD COLUMN     "memberType" "MemberType" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "OrgAdmins";

-- DropTable
DROP TABLE "OrgModerators";

-- DropTable
DROP TABLE "ProjectDeveloper";

-- DropTable
DROP TABLE "ProjectManager";

-- CreateTable
CREATE TABLE "ProjectContributor" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'DEVELOPER',

    CONSTRAINT "ProjectContributor_pkey" PRIMARY KEY ("projectId","userId")
);

-- AddForeignKey
ALTER TABLE "ProjectContributor" ADD CONSTRAINT "ProjectContributor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributor" ADD CONSTRAINT "ProjectContributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
