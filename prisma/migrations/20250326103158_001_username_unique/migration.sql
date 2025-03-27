/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Uzivatel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Uzivatel_username_key" ON "Uzivatel"("username");
