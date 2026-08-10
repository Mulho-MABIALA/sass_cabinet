-- AlterEnum
ALTER TYPE "Secteur" ADD VALUE 'expert_comptable';

-- AlterTable
ALTER TABLE "cabinets" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");
