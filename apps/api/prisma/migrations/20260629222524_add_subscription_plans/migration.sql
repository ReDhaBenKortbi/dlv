/*
  Warnings:

  - You are about to drop the column `isPremium` on the `Book` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'GOLD');

-- CreateEnum
CREATE TYPE "BookTier" AS ENUM ('FREE', 'PRO', 'GOLD');

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "isPremium",
ADD COLUMN     "bookTier" "BookTier" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "PaymentRequest" ADD COLUMN     "plan" "SubscriptionPlan" NOT NULL DEFAULT 'PRO';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';
