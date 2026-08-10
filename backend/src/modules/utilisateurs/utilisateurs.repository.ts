import { Prisma, Role, Utilisateur } from "@prisma/client";
import { prisma } from "../../config/prisma";

export interface CreateUtilisateurData {
  cabinetId: string;
  email: string;
  motDePasseHash: string;
  role: Role;
}

const avecCabinetActif = {
  cabinet: { select: { actif: true } },
} satisfies Prisma.UtilisateurInclude;

export type UtilisateurAvecCabinet = Prisma.UtilisateurGetPayload<{
  include: typeof avecCabinetActif;
}>;

export const utilisateursRepository = {
  findByEmail(email: string): Promise<Utilisateur | null> {
    return prisma.utilisateur.findUnique({ where: { email } });
  },

  findById(id: string): Promise<Utilisateur | null> {
    return prisma.utilisateur.findUnique({ where: { id } });
  },

  // Utilisées uniquement par l'auth cabinet (login/refresh) pour vérifier que le cabinet
  // n'est pas suspendu par la console plateforme (Cabinet.actif) avant d'émettre des tokens.
  findByEmailAvecCabinet(email: string): Promise<UtilisateurAvecCabinet | null> {
    return prisma.utilisateur.findUnique({ where: { email }, include: avecCabinetActif });
  },

  findByIdAvecCabinet(id: string): Promise<UtilisateurAvecCabinet | null> {
    return prisma.utilisateur.findUnique({ where: { id }, include: avecCabinetActif });
  },

  findByCabinet(cabinetId: string): Promise<Utilisateur[]> {
    return prisma.utilisateur.findMany({
      where: { cabinetId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: CreateUtilisateurData): Promise<Utilisateur> {
    return prisma.utilisateur.create({ data });
  },
};
