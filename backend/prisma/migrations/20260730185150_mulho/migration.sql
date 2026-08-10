-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('starter', 'cabinet', 'premium');

-- CreateEnum
CREATE TYPE "StatutAnonymisation" AS ENUM ('actif', 'anonymise');

-- AlterEnum
ALTER TYPE "CanalRelance" ADD VALUE 'sms';

-- AlterTable
ALTER TABLE "cabinets" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'starter';

-- AlterTable
ALTER TABLE "documents_deposes" ADD COLUMN     "donneesExtraites" JSONB;

-- AlterTable
ALTER TABLE "dossiers" ADD COLUMN     "anonymiseLe" TIMESTAMP(3),
ADD COLUMN     "dateSuppressionPrevue" TIMESTAMP(3),
ADD COLUMN     "statutAnonymisation" "StatutAnonymisation" NOT NULL DEFAULT 'actif',
ADD COLUMN     "telephoneClient" TEXT;

-- CreateTable
CREATE TABLE "usages_mensuels" (
    "id" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "mois" INTEGER NOT NULL,
    "dossiersTraites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usages_mensuels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_configs" (
    "id" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "evenement" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anomalies" (
    "id" TEXT NOT NULL,
    "documentDeposeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usages_mensuels_cabinetId_idx" ON "usages_mensuels"("cabinetId");

-- CreateIndex
CREATE UNIQUE INDEX "usages_mensuels_cabinetId_annee_mois_key" ON "usages_mensuels"("cabinetId", "annee", "mois");

-- CreateIndex
CREATE INDEX "webhook_configs_cabinetId_idx" ON "webhook_configs"("cabinetId");

-- CreateIndex
CREATE INDEX "anomalies_documentDeposeId_idx" ON "anomalies"("documentDeposeId");

-- CreateIndex
CREATE INDEX "dossiers_dateSuppressionPrevue_idx" ON "dossiers"("dateSuppressionPrevue");

-- AddForeignKey
ALTER TABLE "usages_mensuels" ADD CONSTRAINT "usages_mensuels_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_configs" ADD CONSTRAINT "webhook_configs_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_documentDeposeId_fkey" FOREIGN KEY ("documentDeposeId") REFERENCES "documents_deposes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
