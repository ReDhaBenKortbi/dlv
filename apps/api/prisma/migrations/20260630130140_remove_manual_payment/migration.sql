/*
  Warnings:

  - The values [MANUAL] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `receiptURL` on the `PaymentRequest` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CHARGILY');
ALTER TABLE "public"."PaymentRequest" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "PaymentRequest" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "PaymentRequest" ALTER COLUMN "paymentMethod" SET DEFAULT 'CHARGILY';
COMMIT;

-- AlterTable
ALTER TABLE "PaymentRequest" DROP COLUMN "receiptURL",
ALTER COLUMN "paymentMethod" SET DEFAULT 'CHARGILY';
