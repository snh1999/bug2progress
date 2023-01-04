-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PROPOSED', 'IN_DEVELOPMENT', 'ACTIVE', 'MAINTAINED', 'NOT_MAINTAINED', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('MAINTAINED', 'ACTIVE', 'DEPRICATED', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('BUG', 'ISSUE', 'ENHANCEMENT', 'FEATURE_REQUEST');

-- CreateEnum
CREATE TYPE "TicketSeverity" AS ENUM ('CRITICAL', 'MAJOR', 'MINOR', 'LOW', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT NOT NULL,
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordResetToken" TEXT,
    "passwordTokenExpiry" TIMESTAMP(3),
    "organizationId" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isModerator" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "country" TEXT,
    "organizationId" TEXT,
    "age" INTEGER,
    "photo" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "postContent" TEXT NOT NULL,
    "attachmentFiles" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT NOT NULL,
    "organizationId" TEXT,
    "refProjectId" TEXT,
    "refFeaturesId" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customURL" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updateLog" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "customURL" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "status" "ProjectStatus" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "basePostId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRoles" (
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "managerId" TEXT,

    CONSTRAINT "ProjectRoles_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "Features" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "necessaryLinks" TEXT[],
    "process" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectXFeatures" (
    "projectId" TEXT NOT NULL,
    "featuresId" TEXT NOT NULL,
    "featureType" "FeatureType" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ProjectXFeatures_pkey" PRIMARY KEY ("projectId","featuresId")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "parentPostId" TEXT NOT NULL,
    "predecessorId" TEXT,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketComment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "parentTicketId" TEXT NOT NULL,
    "predecessorId" TEXT,

    CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketType" "TicketType" NOT NULL,
    "ticketSeverity" "TicketSeverity" NOT NULL,
    "ticketPriority" "TicketPriority" NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectXFeaturesFeaturesId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketRoles" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "varifierId" TEXT,
    "closeId" TEXT,
    "assignedId" TEXT,

    CONSTRAINT "TicketRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_developer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TicketRolesToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_customURL_key" ON "Organization"("customURL");

-- CreateIndex
CREATE UNIQUE INDEX "Project_customURL_key" ON "Project"("customURL");

-- CreateIndex
CREATE UNIQUE INDEX "Project_basePostId_key" ON "Project"("basePostId");

-- CreateIndex
CREATE UNIQUE INDEX "Features_postId_key" ON "Features"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketRoles_ticketId_key" ON "TicketRoles"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketRoles_creatorId_key" ON "TicketRoles"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketRoles_varifierId_key" ON "TicketRoles"("varifierId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketRoles_closeId_key" ON "TicketRoles"("closeId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketRoles_assignedId_key" ON "TicketRoles"("assignedId");

-- CreateIndex
CREATE UNIQUE INDEX "_developer_AB_unique" ON "_developer"("A", "B");

-- CreateIndex
CREATE INDEX "_developer_B_index" ON "_developer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TicketRolesToUser_AB_unique" ON "_TicketRolesToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TicketRolesToUser_B_index" ON "_TicketRolesToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_refProjectId_fkey" FOREIGN KEY ("refProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_refProjectId_refFeaturesId_fkey" FOREIGN KEY ("refProjectId", "refFeaturesId") REFERENCES "ProjectXFeatures"("projectId", "featuresId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_basePostId_fkey" FOREIGN KEY ("basePostId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRoles" ADD CONSTRAINT "ProjectRoles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRoles" ADD CONSTRAINT "ProjectRoles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRoles" ADD CONSTRAINT "ProjectRoles_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Features" ADD CONSTRAINT "Features_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectXFeatures" ADD CONSTRAINT "ProjectXFeatures_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectXFeatures" ADD CONSTRAINT "ProjectXFeatures_featuresId_fkey" FOREIGN KEY ("featuresId") REFERENCES "Features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectXFeatures" ADD CONSTRAINT "ProjectXFeatures_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_parentTicketId_fkey" FOREIGN KEY ("parentTicketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "TicketComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_projectXFeaturesFeaturesId_fkey" FOREIGN KEY ("projectId", "projectXFeaturesFeaturesId") REFERENCES "ProjectXFeatures"("projectId", "featuresId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_varifierId_fkey" FOREIGN KEY ("varifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_closeId_fkey" FOREIGN KEY ("closeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRoles" ADD CONSTRAINT "TicketRoles_assignedId_fkey" FOREIGN KEY ("assignedId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_developer" ADD CONSTRAINT "_developer_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRoles"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_developer" ADD CONSTRAINT "_developer_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketRolesToUser" ADD CONSTRAINT "_TicketRolesToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "TicketRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketRolesToUser" ADD CONSTRAINT "_TicketRolesToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
