import { rgpdRepository, DossierAAnonymiser } from "./rgpd.repository";
import { NotFoundError } from "../../shared/AppError";
import { logger } from "../../shared/logger";

async function anonymiserDossier(dossier: DossierAAnonymiser): Promise<void> {
  const cles = dossier.documentsDeposes
    .map((document) => document.urlStockage)
    .filter((url): url is string => Boolean(url));

  await rgpdRepository.supprimerDocumentsS3(cles);
  await rgpdRepository.anonymiser(dossier.id);
}

export const rgpdService = {
  // Droit à l'effacement (art. 17 RGPD) déclenché immédiatement par un collaborateur/admin
  async effacerDossier(dossierId: string, cabinetId: string): Promise<{ statut: string }> {
    const dossier = await rgpdRepository.findDossierAvecDocuments(dossierId, cabinetId);

    if (!dossier) {
      throw new NotFoundError("Dossier introuvable");
    }

    await anonymiserDossier(dossier);
    return { statut: "anonymise" };
  },

  // Purge automatique des dossiers dont la durée de conservation est dépassée
  async executerPurgeAutomatique(): Promise<{ dossiersAnonymises: number }> {
    const dossiers = await rgpdRepository.findDossiersASupprimer();

    for (const dossier of dossiers) {
      await anonymiserDossier(dossier);
    }

    logger.info(`Purge RGPD exécutée : ${dossiers.length} dossier(s) anonymisé(s)`);
    return { dossiersAnonymises: dossiers.length };
  },
};
