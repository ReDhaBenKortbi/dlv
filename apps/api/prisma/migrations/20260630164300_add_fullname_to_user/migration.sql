-- AlterTable
ALTER TABLE "User" ADD COLUMN "fullName" TEXT NOT NULL DEFAULT '';

-- Remove the default after backfill so new rows require an explicit value
ALTER TABLE "User" ALTER COLUMN "fullName" DROP DEFAULT;
