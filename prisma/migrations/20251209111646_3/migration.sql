/*
  Warnings:

  - You are about to drop the column `basedOn` on the `PricingProfile` table. All the data in the column will be lost.
  - Added the required column `basedOnId` to the `PricingProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basedOnTitle` to the `PricingProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PricingProfile" DROP COLUMN "basedOn",
ADD COLUMN     "basedOnId" TEXT NOT NULL,
ADD COLUMN     "basedOnTitle" TEXT NOT NULL;
