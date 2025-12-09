/*
  Warnings:

  - Added the required column `latestPrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "latestPrice" DOUBLE PRECISION NOT NULL;
