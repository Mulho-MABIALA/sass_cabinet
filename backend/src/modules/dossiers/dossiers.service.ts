import { StatutDossier } from "@prisma/client";
import { dossiersRepository, DossierAvecRelations, DossierDetail } from "./dossiers.repository";
import { typeDossiersRepository } from "../typeDossiers/typeDossiers.repository";
import { CreateDossierInput } from "./dossiers.schema";
import { NotFoundError, BadRequestError } from "../../shared/AppError";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import { facturationService } from "../facturation/facturation.service";
import { declencherWebhooks } from "../webhooks/webhooks.service";

interface DocumentPourStatut {
  statut: string;
  documentRequis: { obligatoire: boolean };
}

export function calculerStatutDossier(documents: DocumentPourStatut[]): StatutDossier {
  const obligatoires = documents.filter((doc) => doc.documentRequis.obligatoire);

  if (obligatoires.some((doc) => doc.statut === "manquant" || doc.statut === "refuse")) {
    return "incomplet";
  }

  if (obligatoires.some((doc) => doc.statut === "depose")) {
    return "en_attente_verification";
  }

  return "complet";
}

export const dossiersService = {
  list(cabinetId: string, statut?: StatutDossier): Promise<DossierAvecRelations[]> {
    return dossiersRepository.findByCabinet(cabinetId, statut);
  },

  async getById(id: string, cabinetId: string): Promise<DossierDetail> {
    const dossier = await dossiersRepository.findById(id, cabinetId);
    if (!dossier) {
      throw new NotFoundError("Dossier introuvable");
    }
    return dossier;
  },

  async create(
    cabinetId: string,
    defaultCollaborateurId: string,
    input: CreateDossierInput
  ): Promise<DossierDetail> {
    const typeDossier = await typeDossiersRepository.findById(input.typeDossierId, cabinetId);

    if (!typeDossier) {
      throw new BadRequestError("Type de dossier introuvable pour ce cabinet");
    }

    if (typeDossier.documentsRequis.length === 0) {
      throw new BadRequestError("Ce type de dossier ne définit aucun document requis");
    }

    let collaborateurId = defaultCollaborateurId;
    if (input.collaborateurId) {
      const collaborateur = await utilisateursRepository.findById(input.collaborateurId);
      if (!collaborateur || collaborateur.cabinetId !== cabinetId) {
        throw new BadRequestError("Collaborateur introuvable pour ce cabinet");
      }
      collaborateurId = input.collaborateurId;
    }

    return dossiersRepository.create({
      cabinetId,
      typeDossierId: input.typeDossierId,
      collaborateurId,
      nomClient: input.nomClient,
      emailClient: input.emailClient,
      telephoneClient: input.telephoneClient,
      documentsRequisIds: typeDossier.documentsRequis.map((doc) => doc.id),
    });
  },

  async recalculerStatut(dossierId: string): Promise<StatutDossier> {
    const dossier = await prisma.dossier.findUnique({
      where: { id: dossierId },
      include: { documentsDeposes: { include: { documentRequis: true } } },
    });

    if (!dossier) {
      throw new NotFoundError("Dossier introuvable");
    }

    const statut = calculerStatutDossier(dossier.documentsDeposes);
    const devientComplet = statut === "complet" && dossier.statut !== "complet";

    if (devientComplet) {
      const dateSuppressionPrevue = new Date(
        Date.now() + env.RGPD_RETENTION_JOURS * 24 * 60 * 60 * 1000
      );
      await dossiersRepository.cloturer(dossierId, statut, dateSuppressionPrevue);

      // Compteur d'usage (facturation Starter à l'usage) + notification aux intégrations tierces (Zapier/Make)
      await facturationService.enregistrerDossierComplet(dossier.cabinetId);
      await declencherWebhooks(dossier.cabinetId, "dossier.complet", {
        dossierId: dossier.id,
        nomClient: dossier.nomClient,
      });
    } else {
      await dossiersRepository.updateStatut(dossierId, statut);
    }

    return statut;
  },
};
