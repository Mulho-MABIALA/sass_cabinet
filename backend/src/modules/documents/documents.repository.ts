import { Prisma, StatutDocument } from "@prisma/client";
import { prisma } from "../../config/prisma";

export type DocumentDeposeAvecDossier = Prisma.DocumentDeposeGetPayload<{
  include: { dossier: true; documentRequis: true };
}>;

export const documentsRepository = {
  findByIdWithDossier(id: string): Promise<DocumentDeposeAvecDossier | null> {
    return prisma.documentDepose.findUnique({
      where: { id },
      include: { dossier: true, documentRequis: true },
    });
  },

  updateStatut(id: string, statut: StatutDocument): Promise<void> {
    return prisma.documentDepose
      .update({ where: { id }, data: { statut } })
      .then(() => undefined);
  },

  // Accepte n'importe quel objet sérialisable en JSON (ex. ChampsExtraits du provider OCR) : le round-trip
  // JSON garantit la compatibilité avec Prisma.InputJsonValue sans coupler ce repository au type du provider,
  // et évite l'erreur TS "index signature missing" quand on passe une interface nommée sans index signature.
  updateDonneesExtraites(id: string, donneesExtraites: unknown): Promise<void> {
    const valeurJson = JSON.parse(JSON.stringify(donneesExtraites)) as Prisma.InputJsonValue;
    return prisma.documentDepose
      .update({ where: { id }, data: { donneesExtraites: valeurJson } })
      .then(() => undefined);
  },

  creerAnomalies(
    documentDeposeId: string,
    anomalies: Array<{ type: string; description: string }>
  ): Promise<void> {
    if (anomalies.length === 0) return Promise.resolve();
    return prisma.anomalie
      .createMany({
        data: anomalies.map((anomalie) => ({ documentDeposeId, ...anomalie })),
      })
      .then(() => undefined);
  },
};
