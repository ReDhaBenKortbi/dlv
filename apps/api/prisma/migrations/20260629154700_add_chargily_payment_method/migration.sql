-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MANUAL', 'CHARGILY');

-- AlterTable
ALTER TABLE "PaymentRequest"
  ADD COLUMN "chargilyCheckoutId" TEXT,
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MANUAL',
  ALTER COLUMN "receiptURL" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_chargilyCheckoutId_key" ON "PaymentRequest"("chargilyCheckoutId");
