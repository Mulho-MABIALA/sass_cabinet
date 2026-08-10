import { Prisma, TypeDossier } from "@prisma/client";
import { prisma } from "../../config/prisma";

export type TypeDossierAvecDocuments = Prisma.TypeDossierGetPayload<{
  include: { documentsRequis: true };
}>;

export const typeDossiersRepository = {
  findByCabinet(cabinetId: string): Promise<TypeDossierAvecDocuments[]> {
    return prisma.typeDossier.findMany({
      where: { cabinetId },
      include: { documentsRequis: true },
      orderBy: { nom: "asc" },
    });
  },

  findById(id: string, cabinetId: string): Promise<TypeDossierAvecDocuments | null> {
    return prisma.typeDossier.findFirst({
      where: { id, cabinetId },
      include: { documentsRequis: true },
    });
  },

  create(
    cabinetId: string,
    data: {
      nom: string;
      secteur: TypeDossier["secteur"];
      description?: string;
      documentsRequis: { nom: string; description?: string; obligatoire: boolean }[];
    }
  ): Promise<TypeDossierAvecDocuments> {
    return prisma.typeDossier.create({
      data: {
        cabinetId,
        nom: data.nom,
        secteur: data.secteur,
        description: data.description,
        documentsRequis: {
          create: data.documentsRequis,
        },
      },
      include: { documentsRequis: true },
    });
  },
};
