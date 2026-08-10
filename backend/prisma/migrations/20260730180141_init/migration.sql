-- CreateEnum
CREATE TYPE "Secteur" AS ENUM ('avocat', 'notaire', 'syndic', 'courtier');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'collaborateur');

-- CreateEnum
CREATE TYPE "StatutDossier" AS ENUM ('incomplet', 'en_attente_verification', 'complet');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('manquant', 'depose', 'valide', 'refuse');

-- CreateEnum
CREATE TYPE "CanalRelance" AS ENUM ('email');

-- CreateEnum
CREATE TYPE "StatutRelance" AS ENUM ('envoyee', 'echouee');

-- CreateTable
CREATE TABLE "cabinets" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "secteur" "Secteur" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabinets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_dossiers" (
    "id" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "secteur" "Secteur" NOT NULL,
    "description" TEXT,

    CONSTRAINT "type_dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents_requis" (
    "id" TEXT NOT NULL,
    "typeDossierId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "documents_requis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossiers" (
    "id" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "typeDossierId" TEXT NOT NULL,
    "collaborateurId" TEXT NOT NULL,
    "nomClient" TEXT NOT NULL,
    "emailClient" TEXT NOT NULL,
    "statut" "StatutDossier" NOT NULL DEFAULT 'incomplet',
    "tokenPortail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents_deposes" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "documentRequisId" TEXT NOT NULL,
    "nomFichier" TEXT,
    "urlStockage" TEXT,
    "statut" "StatutDocument" NOT NULL DEFAULT 'manquant',
    "dateDepot" TIMESTAMP(3),

    CONSTRAINT "documents_deposes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relances" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canal" "CanalRelance" NOT NULL DEFAULT 'email',
    "statut" "StatutRelance" NOT NULL,

    CONSTRAINT "relances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_cabinetId_idx" ON "utilisateurs"("cabinetId");

-- CreateIndex
CREATE INDEX "type_dossiers_cabinetId_idx" ON "type_dossiers"("cabinetId");

-- CreateIndex
CREATE INDEX "documents_requis_typeDossierId_idx" ON "documents_requis"("typeDossierId");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_tokenPortail_key" ON "dossiers"("tokenPortail");

-- CreateIndex
CREATE INDEX "dossiers_cabinetId_idx" ON "dossiers"("cabinetId");

-- CreateIndex
CREATE INDEX "dossiers_typeDossierId_idx" ON "dossiers"("typeDossierId");

-- CreateIndex
CREATE INDEX "dossiers_collaborateurId_idx" ON "dossiers"("collaborateurId");

-- CreateIndex
CREATE INDEX "documents_deposes_dossierId_idx" ON "documents_deposes"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "documents_deposes_dossierId_documentRequisId_key" ON "documents_deposes"("dossierId", "documentRequisId");

-- CreateIndex
CREATE INDEX "relances_dossierId_idx" ON "relances"("dossierId");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_dossiers" ADD CONSTRAINT "type_dossiers_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_requis" ADD CONSTRAINT "documents_requis_typeDossierId_fkey" FOREIGN KEY ("typeDossierId") REFERENCES "type_dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_typeDossierId_fkey" FOREIGN KEY ("typeDossierId") REFERENCES "type_dossiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_collaborateurId_fkey" FOREIGN KEY ("collaborateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_deposes" ADD CONSTRAINT "documents_deposes_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_deposes" ADD CONSTRAINT "documents_deposes_documentRequisId_fkey" FOREIGN KEY ("documentRequisId") REFERENCES "documents_requis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relances" ADD CONSTRAINT "relances_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
