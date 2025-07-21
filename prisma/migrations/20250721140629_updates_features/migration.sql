/*
  Warnings:

  - You are about to drop the column `postId` on the `Features` table. All the data in the column will be lost.
  - You are about to drop the column `refFeaturesId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `projectXFeaturesFeaturesId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `ProjectXFeatures` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Features` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Features` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Features" DROP CONSTRAINT "Features_postId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_refProjectId_refFeaturesId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectXFeatures" DROP CONSTRAINT "ProjectXFeatures_featuresId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectXFeatures" DROP CONSTRAINT "ProjectXFeatures_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectXFeatures" DROP CONSTRAINT "ProjectXFeatures_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_projectId_projectXFeaturesFeaturesId_fkey";

-- DropIndex
DROP INDEX "Features_postId_key";

-- AlterTable
ALTER TABLE "Features" DROP COLUMN "postId",
ADD COLUMN     "featureType" "FeatureType" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "refFeaturesId";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "projectXFeaturesFeaturesId",
ADD COLUMN     "featuresId" TEXT;

-- DropTable
DROP TABLE "ProjectXFeatures";

-- AddForeignKey
ALTER TABLE "Features" ADD CONSTRAINT "Features_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Features" ADD CONSTRAINT "Features_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_featuresId_fkey" FOREIGN KEY ("featuresId") REFERENCES "Features"("id") ON DELETE SET NULL ON UPDATE CASCADE;
