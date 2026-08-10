-- CreateTable
CREATE TABLE "invitations_utilisateurs" (
    "id" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accepteeLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_utilisateurs_token_key" ON "invitations_utilisateurs"("token");

-- CreateIndex
CREATE INDEX "invitations_utilisateurs_cabinetId_idx" ON "invitations_utilisateurs"("cabinetId");

-- AddForeignKey
ALTER TABLE "invitations_utilisateurs" ADD CONSTRAINT "invitations_utilisateurs_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
