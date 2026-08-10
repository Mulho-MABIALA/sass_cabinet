import { Plan, PlatformAdmin } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const platformRepository = {
  findAdminByEmail(email: string): Promise<PlatformAdmin | null> {
    return prisma.platformAdmin.findUnique({ where: { email } });
  },

  findAllCabinets(anneeCourante: number, moisCourant: number) {
    return prisma.cabinet.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { utilisateurs: true, dossiers: true } },
        usagesMensuels: { where: { annee: anneeCourante, mois: moisCourant } },
      },
    });
  },

  findCabinetById(id: string, anneeCourante: number, moisCourant: number) {
    return prisma.cabinet.findUnique({
      where: { id },
      include: {
        _count: { select: { utilisateurs: true, dossiers: true } },
        usagesMensuels: { where: { annee: anneeCourante, mois: moisCourant } },
        utilisateurs: { select: { id: true, email: true, role: true, createdAt: true } },
      },
    });
  },

  updateCabinet(id: string, data: { plan?: Plan; actif?: boolean }) {
    return prisma.cabinet.update({ where: { id }, data });
  },
};
