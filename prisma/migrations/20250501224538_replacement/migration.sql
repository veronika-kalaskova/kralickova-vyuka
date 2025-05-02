/*
  Warnings:

  - Added the required column `teacherId` to the `Replacement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Replacement" ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
