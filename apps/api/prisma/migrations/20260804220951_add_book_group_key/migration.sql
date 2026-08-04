-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "groupKey" TEXT;

-- CreateIndex
CREATE INDEX "Book_groupKey_idx" ON "Book"("groupKey");
