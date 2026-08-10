import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { StatutDossier, StatutDocument } from "@prisma/client";
import { dossiersRepository } from "../dossiers/dossiers.repository";
import { dossiersService } from "../dossiers/dossiers.service";
import { prisma } from "../../config/prisma";
import { s3Client, S3_BUCKET } from "../../config/storage";
import { NotFoundError, BadRequestError } from "../../shared/AppError";
import { declencherWebhooks } from "../webhooks/webhooks.service";

export interface PortailDocumentVue {
  documentRequisId: string;
  documentDeposeId: string;
  nom: string;
  description: string | null;
  obligatoire: boolean;
  statut: StatutDocument;
  nomFichier: string | null;
}

export interface PortailVue {
  nomClient: string;
  cabinetNom: string;
  typeDossierNom: string;
  statutDossier: StatutDossier;
  documents: PortailDocumentVue[];
}

async function getDossierByTokenOrThrow(token: string) {
  const dossier = await dossiersRepository.findByToken(token);
  if (!dossier) {
    throw new NotFoundError("Lien de portail invalide");
  }
  return dossier;
}

export const portailService = {
  async getByToken(token: string): Promise<PortailVue> {
    const dossier = await getDossierByTokenOrThrow(token);

    return {
      nomClient: dossier.nomClient,
      cabinetNom: dossier.cabinet.nom,
      typeDossierNom: dossier.typeDossier.nom,
      statutDossier: dossier.statut,
      documents: dossier.documentsDeposes.map((doc) => ({
        documentRequisId: doc.documentRequisId,
        documentDeposeId: doc.id,
        nom: doc.documentRequis.nom,
        description: doc.documentRequis.description,
        obligatoire: doc.documentRequis.obligatoire,
        statut: doc.statut,
        nomFichier: doc.nomFichier,
      })),
    };
  },

  async upload(
    token: string,
    documentRequisId: string,
    file: Express.Multer.File
  ): Promise<PortailVue> {
    const dossier = await getDossierByTokenOrThrow(token);

    const documentDepose = dossier.documentsDeposes.find(
      (doc) => doc.documentRequisId === documentRequisId
    );

    if (!documentDepose) {
      throw new BadRequestError("Ce document ne fait pas partie de la checklist du dossier");
    }

    const cleObjet = `dossiers/${dossier.id}/${documentRequisId}/${randomUUID()}-${file.originalname}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: cleObjet,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: "AES256",
      })
    );

    await prisma.documentDepose.update({
      where: { id: documentDepose.id },
      data: {
        nomFichier: file.originalname,
        urlStockage: cleObjet,
        statut: "depose",
        dateDepot: new Date(),
      },
    });

    await dossiersService.recalculerStatut(dossier.id);

    // Notifie les intégrations tierces (Zapier/Make) qu'un document client a été déposé
    await declencherWebhooks(dossier.cabinetId, "document.depose", {
      dossierId: dossier.id,
      documentRequisId,
      nomFichier: file.originalname,
    });

    return portailService.getByToken(token);
  },
};
