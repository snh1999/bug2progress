-- DropForeignKey
ALTER TABLE "OrgAdmins" DROP CONSTRAINT "OrgAdmins_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgMembers" DROP CONSTRAINT "OrgMembers_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgModerators" DROP CONSTRAINT "OrgModerators_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectXFeatures" DROP CONSTRAINT "ProjectXFeatures_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_projectId_fkey";

-- AddForeignKey
ALTER TABLE "OrgMembers" ADD CONSTRAINT "OrgMembers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAdmins" ADD CONSTRAINT "OrgAdmins_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgModerators" ADD CONSTRAINT "OrgModerators_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectXFeatures" ADD CONSTRAINT "ProjectXFeatures_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
