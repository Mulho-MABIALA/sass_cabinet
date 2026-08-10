import { StatutDossier } from "@prisma/client";
import { documentsRepository } from "./documents.repository";
import { dossiersService } from "../dossiers/dossiers.service";
import { ocrProvider } from "./ocr/OcrProvider";
import { anomalyDetectionProvider } from "./anomalies/AnomalyDetectionProvider";
import { signatureProvider, ResultatSignature } from "../dossiers/signature/SignatureProvider";
import { NotFoundError, BadRequestError } from "../../shared/AppError";
import { logger } from "../../shared/logger";

interface DocumentActionResult {
  documentId: string;
  dossierId: string;
  statutDossier: StatutDossier;
}

async function changerStatutDocument(
  documentId: string,
  cabinetId: string,
  nouveauStatut: "valide" | "refuse"
): Promise<DocumentActionResult> {
  const document = await documentsRepository.findByIdWithDossier(documentId);

  if (!document || document.dossier.cabinetId !== cabinetId) {
    throw new NotFoundError("Document introuvable");
  }

  if (document.statut === "manquant") {
    throw new BadRequestError("Impossible de traiter un document qui n'a pas été déposé");
  }

  await documentsRepository.updateStatut(documentId, nouveauStatut);

  if (nouveauStatut === "valide" && document.urlStockage && document.nomFichier) {
    await analyserDocumentValide(documentId, document.urlStockage, document.nomFichier);
  }

  const statutDossier = await dossiersService.recalculerStatut(document.dossierId);

  return { documentId, dossierId: document.dossierId, statutDossier };
}

// OCR/IA (extraction de champs) + détection d'anomalies, exécutés au moment de la validation d'un document.
// Ces providers sont des stubs V1/V2 : voir ocr/OcrProvider.ts et anomalies/AnomalyDetectionProvider.ts.
async function analyserDocumentValide(
  documentId: string,
  urlStockage: string,
  nomFichier: string
): Promise<void> {
  try {
    const donneesExtraites = await ocrProvider.extraireChamps({ url: urlStockage, nomFichier });
    await documentsRepository.updateDonneesExtraites(documentId, donneesExtraites);

    const anomalies = await anomalyDetectionProvider.detecter({
      documentDeposeId: documentId,
      nomFichier,
      urlStockage,
    });
    await documentsRepository.creerAnomalies(documentId, anomalies);
  } catch (error) {
    // L'échec de l'analyse OCR/anomalies ne doit jamais bloquer la validation du document par le collaborateur.
    logger.error(`Échec de l'analyse OCR/anomalies pour le document ${documentId}`, error);
  }
}

export const documentsService = {
  valider(documentId: string, cabinetId: string): Promise<DocumentActionResult> {
    return changerStatutDocument(documentId, cabinetId, "valide");
  },

  refuser(documentId: string, cabinetId: string): Promise<DocumentActionResult> {
    return changerStatutDocument(documentId, cabinetId, "refuse");
  },

  async envoyerPourSignature(documentId: string, cabinetId: string): Promise<ResultatSignature> {
    const document = await documentsRepository.findByIdWithDossier(documentId);

    if (!document || document.dossier.cabinetId !== cabinetId) {
      throw new NotFoundError("Document introuvable");
    }

    if (!document.urlStockage || !document.nomFichier) {
      throw new BadRequestError("Ce document n'a pas encore été déposé");
    }

    return signatureProvider.envoyerPourSignature(
      document.dossierId,
      { cleObjet: document.urlStockage, nomFichier: document.nomFichier },
      { nom: document.dossier.nomClient, email: document.dossier.emailClient }
    );
  },
};
