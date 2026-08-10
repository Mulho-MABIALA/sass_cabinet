-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('essai', 'actif', 'impaye', 'annule');

-- AlterTable
ALTER TABLE "cabinets" ADD COLUMN     "statutAbonnement" "StatutAbonnement" NOT NULL DEFAULT 'essai',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;
