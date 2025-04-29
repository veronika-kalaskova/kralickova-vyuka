/*
  Warnings:

  - Added the required column `fileData` to the `StudyMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudyMaterial" ADD COLUMN     "fileData" BYTEA NOT NULL;
