-- DropForeignKey
ALTER TABLE "Features" DROP CONSTRAINT "Features_postId_fkey";

-- AddForeignKey
ALTER TABLE "Features" ADD CONSTRAINT "Features_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
