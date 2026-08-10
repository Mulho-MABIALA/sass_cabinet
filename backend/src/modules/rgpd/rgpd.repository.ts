import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { s3Client, S3_BUCKET } from "../../config/storage";
import { logger } from "../../shared/logger";

export type DossierAAnonymiser = Prisma.DossierGetPayload<{
  include: { documentsDeposes: true };
}>;

export const rgpdRepository = {
  findDossiersASupprimer(): Promise<DossierAAnonymiser[]> {
    return prisma.dossier.findMany({
      where: {
        statutAnonymisation: "actif",
        dateSuppressionPrevue: { lte: new Date() },
      },
      include: { documentsDeposes: true },
    });
  },

  findDossierAvecDocuments(id: string, cabinetId: string): Promise<DossierAAnonymiser | null> {
    return prisma.dossier.findFirst({
      where: { id, cabinetId },
      include: { documentsDeposes: true },
    });
  },

  async supprimerDocumentsS3(cles: string[]): Promise<void> {
    await Promise.all(
      cles.map((cle) =>
        s3Client
          .send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: cle }))
          .catch((error) => {
            logger.error(`Échec de suppression S3 pour la clé ${cle}`, error);
          })
      )
    );
  },

  async anonymiser(dossierId: string): Promise<void> {
    await prisma.$transaction([
      prisma.documentDepose.deleteMany({ where: { dossierId } }),
      prisma.dossier.update({
        where: { id: dossierId },
        data: {
          nomClient: "Client anonymisé",
          emailClient: `anonymise-${dossierId}@rgpd.local`,
          telephoneClient: null,
          statutAnonymisation: "anonymise",
          anonymiseLe: new Date(),
        },
      }),
    ]);
  },
};
