/*
  Warnings:

  - You are about to drop the column `nazev` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the `Dochazka` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Komentar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kurz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lekce` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nahrada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skupina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentSkupina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UcebniMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Uzivatel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UzivatelRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dochazka" DROP CONSTRAINT "Dochazka_lekceId_fkey";

-- DropForeignKey
ALTER TABLE "Dochazka" DROP CONSTRAINT "Dochazka_uzivatelId_fkey";

-- DropForeignKey
ALTER TABLE "Komentar" DROP CONSTRAINT "Komentar_lekceId_fkey";

-- DropForeignKey
ALTER TABLE "Komentar" DROP CONSTRAINT "Komentar_uzivatelId_fkey";

-- DropForeignKey
ALTER TABLE "Kurz" DROP CONSTRAINT "Kurz_lektorId_fkey";

-- DropForeignKey
ALTER TABLE "Kurz" DROP CONSTRAINT "Kurz_skupinaId_fkey";

-- DropForeignKey
ALTER TABLE "Kurz" DROP CONSTRAINT "Kurz_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Lekce" DROP CONSTRAINT "Lekce_kurzId_fkey";

-- DropForeignKey
ALTER TABLE "Nahrada" DROP CONSTRAINT "Nahrada_nahradniLekceId_fkey";

-- DropForeignKey
ALTER TABLE "Nahrada" DROP CONSTRAINT "Nahrada_puvodniLekceId_fkey";

-- DropForeignKey
ALTER TABLE "Nahrada" DROP CONSTRAINT "Nahrada_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Skupina" DROP CONSTRAINT "Skupina_lektorId_fkey";

-- DropForeignKey
ALTER TABLE "StudentSkupina" DROP CONSTRAINT "StudentSkupina_skupinaId_fkey";

-- DropForeignKey
ALTER TABLE "StudentSkupina" DROP CONSTRAINT "StudentSkupina_studentId_fkey";

-- DropForeignKey
ALTER TABLE "UcebniMaterial" DROP CONSTRAINT "UcebniMaterial_lekceId_fkey";

-- DropForeignKey
ALTER TABLE "UzivatelRole" DROP CONSTRAINT "UzivatelRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UzivatelRole" DROP CONSTRAINT "UzivatelRole_uzivatelId_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "nazev",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Dochazka";

-- DropTable
DROP TABLE "Komentar";

-- DropTable
DROP TABLE "Kurz";

-- DropTable
DROP TABLE "Lekce";

-- DropTable
DROP TABLE "Nahrada";

-- DropTable
DROP TABLE "Skupina";

-- DropTable
DROP TABLE "StudentSkupina";

-- DropTable
DROP TABLE "UcebniMaterial";

-- DropTable
DROP TABLE "Uzivatel";

-- DropTable
DROP TABLE "UzivatelRole";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "class" TEXT,
    "pickup" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGroup" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyMaterial" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Replacement" (
    "id" SERIAL NOT NULL,
    "originalLessonId" INTEGER NOT NULL,
    "substituteLessonId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Replacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER,
    "studentId" INTEGER,
    "groupId" INTEGER,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "textbook" TEXT,
    "isIndividual" BOOLEAN NOT NULL,
    "isPair" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_originalLessonId_fkey" FOREIGN KEY ("originalLessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_substituteLessonId_fkey" FOREIGN KEY ("substituteLessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
