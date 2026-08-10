import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

// Vérifie la connexion SMTP au démarrage du serveur (non bloquant) pour détecter immédiatement
// une mauvaise config (ex. clé SMTP Brevo invalide) plutôt que d'attendre le premier email envoyé.
export async function verifierConnexionSmtp(): Promise<void> {
  try {
    await transporter.verify();
    logger.info(`SMTP opérationnel (${env.SMTP_HOST})`);
  } catch (error) {
    logger.error(
      `Connexion SMTP impossible (${env.SMTP_HOST}) — les emails (relances, invitations) échoueront tant que ce n'est pas corrigé`,
      error
    );
  }
}

interface RelanceEmailParams {
  to: string;
  nomClient: string;
  documentsManquants: string[];
  lienPortail: string;
}

export async function envoyerEmailRelance(params: RelanceEmailParams): Promise<void> {
  const { to, nomClient, documentsManquants, lienPortail } = params;

  const listeDocuments = documentsManquants.map((doc) => `<li>${doc}</li>`).join("");

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Documents manquants pour votre dossier",
    html: `
      <p>Bonjour ${nomClient},</p>
      <p>Il nous manque encore les documents suivants pour compléter votre dossier :</p>
      <ul>${listeDocuments}</ul>
      <p>Merci de les déposer via le lien suivant :</p>
      <p><a href="${lienPortail}">${lienPortail}</a></p>
    `,
  });
}

interface InvitationEmailParams {
  to: string;
  cabinetNom: string;
  lienInvitation: string;
}

export async function envoyerEmailInvitation(params: InvitationEmailParams): Promise<void> {
  const { to, cabinetNom, lienInvitation } = params;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: `Invitation à rejoindre ${cabinetNom}`,
    html: `
      <p>Bonjour,</p>
      <p>Vous avez été invité(e) à rejoindre le cabinet <strong>${cabinetNom}</strong> sur la plateforme.</p>
      <p>Cliquez sur le lien ci-dessous pour créer votre mot de passe et activer votre compte :</p>
      <p><a href="${lienInvitation}">${lienInvitation}</a></p>
      <p>Ce lien expire dans 7 jours.</p>
    `,
  });
}
