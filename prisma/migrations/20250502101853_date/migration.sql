/*
  Warnings:

  - You are about to drop the column `date` on the `Replacement` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Replacement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Replacement" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "note" DROP NOT NULL;
