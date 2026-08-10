import { dossiersRepository } from "../dossiers/dossiers.repository";
import { relancesRepository, DossierPourRelance } from "./relances.repository";
import { envoyerEmailRelance } from "../../shared/mailer";
import { smsProvider } from "./sms/SmsProvider";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { BadRequestError, NotFoundError } from "../../shared/AppError";

function documentsManquants(dossier: DossierPourRelance): string[] {
  return dossier.documentsDeposes
    .filter((doc) => doc.statut === "manquant" || doc.statut === "refuse")
    .map((doc) => doc.documentRequis.nom);
}

function lienPortail(tokenPortail: string): string {
  return `${env.FRONTEND_URL}/portail/${tokenPortail}`;
}

function messageSms(dossier: DossierPourRelance, manquants: string[]): string {
  const lien = lienPortail(dossier.tokenPortail);
  return `Bonjour ${dossier.nomClient}, il nous manque ${manquants.length} document(s) pour votre dossier. Déposez-les ici : ${lien}`;
}

async function envoyerEtEnregistrer(dossier: DossierPourRelance): Promise<boolean> {
  const manquants = documentsManquants(dossier);
  let succes = false;

  try {
    await envoyerEmailRelance({
      to: dossier.emailClient,
      nomClient: dossier.nomClient,
      documentsManquants: manquants,
      lienPortail: lienPortail(dossier.tokenPortail),
    });
    await relancesRepository.create(dossier.id, "envoyee", "email");
    succes = true;
  } catch (error) {
    logger.error(`Échec d'envoi de relance email pour le dossier ${dossier.id}`, error);
    await relancesRepository.create(dossier.id, "echouee", "email");
  }

  // Envoi SMS complémentaire si un numéro de téléphone client est renseigné (provider stub, voir sms/SmsProvider.ts)
  if (dossier.telephoneClient) {
    try {
      await smsProvider.envoyer(dossier.telephoneClient, messageSms(dossier, manquants));
      await relancesRepository.create(dossier.id, "envoyee", "sms");
      succes = true;
    } catch (error) {
      logger.error(`Échec d'envoi de relance SMS pour le dossier ${dossier.id}`, error);
      await relancesRepository.create(dossier.id, "echouee", "sms");
    }
  }

  return succes;
}

export const relancesService = {
  async relancerManuellement(dossierId: string, cabinetId: string): Promise<{ statut: string }> {
    const dossier = await dossiersRepository.findById(dossierId, cabinetId);

    if (!dossier) {
      throw new NotFoundError("Dossier introuvable");
    }

    if (dossier.statut === "complet") {
      throw new BadRequestError("Ce dossier est déjà complet, aucune relance nécessaire");
    }

    const succes = await envoyerEtEnregistrer(dossier);
    return { statut: succes ? "envoyee" : "echouee" };
  },

  async executerRelancesAutomatiques(): Promise<{ dossiersTraites: number }> {
    const dossiers = await relancesRepository.findDossiersIncomplets();
    const seuilMs = env.RELANCE_DELAI_JOURS * 24 * 60 * 60 * 1000;
    const maintenant = Date.now();

    let dossiersTraites = 0;

    for (const dossier of dossiers) {
      const derniereRelance = dossier.relances[0];
      const dateReference = derniereRelance ? derniereRelance.dateEnvoi : dossier.createdAt;

      if (maintenant - dateReference.getTime() >= seuilMs) {
        await envoyerEtEnregistrer(dossier);
        dossiersTraites += 1;
      }
    }

    logger.info(`Relances automatiques exécutées : ${dossiersTraites} dossier(s) relancé(s)`);
    return { dossiersTraites };
  },
};
