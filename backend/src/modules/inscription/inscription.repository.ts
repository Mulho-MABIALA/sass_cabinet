import { Secteur } from "@prisma/client";
import { prisma } from "../../config/prisma";

export interface CreerCabinetEtAdminData {
  nomCabinet: string;
  secteur: Secteur;
  emailAdmin: string;
  motDePasseHash: string;
}

export const inscriptionRepository = {
  // Transaction : un cabinet ne doit jamais exister sans son premier compte admin, et inversement.
  creerCabinetEtAdmin(data: CreerCabinetEtAdminData) {
    return prisma.$transaction(async (tx) => {
      const cabinet = await tx.cabinet.create({
        data: { nom: data.nomCabinet, secteur: data.secteur },
      });

      const utilisateur = await tx.utilisateur.create({
        data: {
          cabinetId: cabinet.id,
          email: data.emailAdmin,
          motDePasseHash: data.motDePasseHash,
          role: "admin",
        },
      });

      return { cabinet, utilisateur };
    });
  },
};
