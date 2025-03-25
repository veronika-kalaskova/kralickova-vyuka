-- CreateTable
CREATE TABLE "Uzivatel" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jmeno" TEXT NOT NULL,
    "prijmeni" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "trida" TEXT,
    "vyzvedavani" BOOLEAN,
    "vytvoren" TIMESTAMP(3),
    "zrusen" TIMESTAMP(3),

    CONSTRAINT "Uzivatel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "nazev" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UzivatelRole" (
    "id" SERIAL NOT NULL,
    "uzivatelId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UzivatelRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skupina" (
    "id" SERIAL NOT NULL,
    "lektorId" INTEGER NOT NULL,
    "nazev" TEXT NOT NULL,

    CONSTRAINT "Skupina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSkupina" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "skupinaId" INTEGER NOT NULL,
    "vytvoreno" TIMESTAMP(3) NOT NULL,
    "zruseno" TIMESTAMP(3),

    CONSTRAINT "StudentSkupina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lekce" (
    "id" SERIAL NOT NULL,
    "kurzId" INTEGER NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "delkaLekce" INTEGER NOT NULL,

    CONSTRAINT "Lekce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dochazka" (
    "id" SERIAL NOT NULL,
    "lekceId" INTEGER NOT NULL,
    "uzivatelId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "typ" TEXT NOT NULL,

    CONSTRAINT "Dochazka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UcebniMaterial" (
    "id" SERIAL NOT NULL,
    "lekceId" INTEGER NOT NULL,
    "nazev" TEXT NOT NULL,
    "cestaKSouboru" TEXT NOT NULL,
    "typSouboru" TEXT NOT NULL,
    "datumNahrani" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UcebniMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Komentar" (
    "id" SERIAL NOT NULL,
    "lekceId" INTEGER NOT NULL,
    "uzivatelId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "vytvorenoDne" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Komentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nahrada" (
    "id" SERIAL NOT NULL,
    "puvodniLekceId" INTEGER NOT NULL,
    "nahradniLekceId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "poznamka" TEXT NOT NULL,

    CONSTRAINT "Nahrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kurz" (
    "id" SERIAL NOT NULL,
    "lektorId" INTEGER NOT NULL,
    "studentId" INTEGER,
    "skupinaId" INTEGER,
    "nazev" TEXT NOT NULL,
    "datumOd" TIMESTAMP(3) NOT NULL,
    "datumDo" TIMESTAMP(3) NOT NULL,
    "popis" TEXT NOT NULL,
    "ucebnice" TEXT NOT NULL,
    "individualni" BOOLEAN NOT NULL,
    "vytvoreno" TIMESTAMP(3) NOT NULL,
    "zruseno" TIMESTAMP(3),

    CONSTRAINT "Kurz_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UzivatelRole" ADD CONSTRAINT "UzivatelRole_uzivatelId_fkey" FOREIGN KEY ("uzivatelId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UzivatelRole" ADD CONSTRAINT "UzivatelRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skupina" ADD CONSTRAINT "Skupina_lektorId_fkey" FOREIGN KEY ("lektorId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkupina" ADD CONSTRAINT "StudentSkupina_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkupina" ADD CONSTRAINT "StudentSkupina_skupinaId_fkey" FOREIGN KEY ("skupinaId") REFERENCES "Skupina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lekce" ADD CONSTRAINT "Lekce_kurzId_fkey" FOREIGN KEY ("kurzId") REFERENCES "Kurz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dochazka" ADD CONSTRAINT "Dochazka_lekceId_fkey" FOREIGN KEY ("lekceId") REFERENCES "Lekce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dochazka" ADD CONSTRAINT "Dochazka_uzivatelId_fkey" FOREIGN KEY ("uzivatelId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UcebniMaterial" ADD CONSTRAINT "UcebniMaterial_lekceId_fkey" FOREIGN KEY ("lekceId") REFERENCES "Lekce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Komentar" ADD CONSTRAINT "Komentar_lekceId_fkey" FOREIGN KEY ("lekceId") REFERENCES "Lekce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Komentar" ADD CONSTRAINT "Komentar_uzivatelId_fkey" FOREIGN KEY ("uzivatelId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nahrada" ADD CONSTRAINT "Nahrada_puvodniLekceId_fkey" FOREIGN KEY ("puvodniLekceId") REFERENCES "Lekce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nahrada" ADD CONSTRAINT "Nahrada_nahradniLekceId_fkey" FOREIGN KEY ("nahradniLekceId") REFERENCES "Lekce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nahrada" ADD CONSTRAINT "Nahrada_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kurz" ADD CONSTRAINT "Kurz_lektorId_fkey" FOREIGN KEY ("lektorId") REFERENCES "Uzivatel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kurz" ADD CONSTRAINT "Kurz_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Uzivatel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kurz" ADD CONSTRAINT "Kurz_skupinaId_fkey" FOREIGN KEY ("skupinaId") REFERENCES "Skupina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
