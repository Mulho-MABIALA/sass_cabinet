import { Plan, StatutAbonnement } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const facturationRepository = {
  incrementerUsage(cabinetId: string, annee: number, mois: number) {
    return prisma.usageMensuel.upsert({
      where: { cabinetId_annee_mois: { cabinetId, annee, mois } },
      create: { cabinetId, annee, mois, dossiersTraites: 1 },
      update: { dossiersTraites: { increment: 1 } },
    });
  },

  findDerniersMois(cabinetId: string, limite: number) {
    return prisma.usageMensuel.findMany({
      where: { cabinetId },
      orderBy: [{ annee: "desc" }, { mois: "desc" }],
      take: limite,
    });
  },

  findCabinetPlan(cabinetId: string) {
    return prisma.cabinet.findUnique({
      where: { id: cabinetId },
      select: { plan: true },
    });
  },

  findCabinetPourPaiement(cabinetId: string) {
    return prisma.cabinet.findUnique({
      where: { id: cabinetId },
      select: { id: true, nom: true, plan: true, stripeCustomerId: true, statutAbonnement: true },
    });
  },

  findCabinetByStripeCustomerId(stripeCustomerId: string) {
    return prisma.cabinet.findFirst({
      where: { stripeCustomerId },
      select: { id: true },
    });
  },

  updateStripeCustomerId(cabinetId: string, stripeCustomerId: string) {
    return prisma.cabinet.update({
      where: { id: cabinetId },
      data: { stripeCustomerId },
    });
  },

  updateAbonnement(
    cabinetId: string,
    data: { statutAbonnement: StatutAbonnement; stripeSubscriptionId?: string; plan?: Plan }
  ) {
    return prisma.cabinet.update({
      where: { id: cabinetId },
      data,
    });
  },
};
