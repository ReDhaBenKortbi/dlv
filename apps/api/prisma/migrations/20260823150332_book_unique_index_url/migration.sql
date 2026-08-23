-- DropIndex
DROP INDEX "Book_title_author_key";

-- CreateIndex
CREATE UNIQUE INDEX "Book_indexURL_key" ON "Book"("indexURL");

