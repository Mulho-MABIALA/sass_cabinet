import { Prisma, StatutDossier } from "@prisma/client";
import { prisma } from "../../config/prisma";

export type DossierAvecRelations = Prisma.DossierGetPayload<{
  include: {
    typeDossier: true;
    collaborateur: { select: { id: true; email: true } };
    documentsDeposes: { include: { documentRequis: true; anomalies: true } };
  };
}>;

export type DossierDetail = Prisma.DossierGetPayload<{
  include: {
    typeDossier: { include: { documentsRequis: true } };
    collaborateur: { select: { id: true; email: true } };
    documentsDeposes: { include: { documentRequis: true; anomalies: true } };
    relances: true;
    cabinet: { select: { nom: true } };
  };
}>;

const listInclude = {
  typeDossier: true,
  collaborateur: { select: { id: true, email: true } },
  documentsDeposes: { include: { documentRequis: true, anomalies: true } },
} satisfies Prisma.DossierInclude;

const detailInclude = {
  typeDossier: { include: { documentsRequis: true } },
  collaborateur: { select: { id: true, email: true } },
  documentsDeposes: { include: { documentRequis: true, anomalies: true } },
  relances: true,
  cabinet: { select: { nom: true } },
} satisfies Prisma.DossierInclude;

export const dossiersRepository = {
  findByCabinet(cabinetId: string, statut?: StatutDossier): Promise<DossierAvecRelations[]> {
    return prisma.dossier.findMany({
      where: { cabinetId, ...(statut ? { statut } : {}) },
      include: listInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string, cabinetId: string): Promise<DossierDetail | null> {
    return prisma.dossier.findFirst({
      where: { id, cabinetId },
      include: detailInclude,
    });
  },

  findByToken(tokenPortail: string): Promise<DossierDetail | null> {
    return prisma.dossier.findUnique({
      where: { tokenPortail },
      include: detailInclude,
    });
  },

  create(data: {
    cabinetId: string;
    typeDossierId: string;
    collaborateurId: string;
    nomClient: string;
    emailClient: string;
    telephoneClient?: string;
    documentsRequisIds: string[];
  }): Promise<DossierDetail> {
    return prisma.dossier.create({
      data: {
        cabinetId: data.cabinetId,
        typeDossierId: data.typeDossierId,
        collaborateurId: data.collaborateurId,
        nomClient: data.nomClient,
        emailClient: data.emailClient,
        telephoneClient: data.telephoneClient,
        documentsDeposes: {
          create: data.documentsRequisIds.map((documentRequisId) => ({
            documentRequisId,
          })),
        },
      },
      include: detailInclude,
    });
  },

  updateStatut(id: string, statut: StatutDossier): Promise<void> {
    return prisma.dossier
      .update({ where: { id }, data: { statut } })
      .then(() => undefined);
  },

  // Passage au statut "complet" : planifie la date de suppression RGPD (rétention limitée des données)
  cloturer(id: string, statut: StatutDossier, dateSuppressionPrevue: Date): Promise<void> {
    return prisma.dossier
      .update({ where: { id }, data: { statut, dateSuppressionPrevue } })
      .then(() => undefined);
  },
};
