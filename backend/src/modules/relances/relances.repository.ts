import { CanalRelance, Prisma, StatutRelance } from "@prisma/client";
import { prisma } from "../../config/prisma";

export type DossierPourRelance = Prisma.DossierGetPayload<{
  include: {
    documentsDeposes: { include: { documentRequis: true } };
    relances: true;
  };
}>;

export const relancesRepository = {
  findDossiersIncomplets(): Promise<DossierPourRelance[]> {
    return prisma.dossier.findMany({
      where: { statut: { not: "complet" } },
      include: {
        documentsDeposes: { include: { documentRequis: true } },
        relances: { orderBy: { dateEnvoi: "desc" }, take: 1 },
      },
    });
  },

  create(dossierId: string, statut: StatutRelance, canal: CanalRelance = "email"): Promise<void> {
    return prisma.relance
      .create({ data: { dossierId, statut, canal } })
      .then(() => undefined);
  },
};
