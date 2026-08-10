import bcrypt from "bcrypt";
import { invitationsRepository } from "./invitations.repository";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import { genererTokens, AuthTokens } from "../auth/auth.service";
import { envoyerEmailInvitation } from "../../shared/mailer";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { BadRequestError, NotFoundError } from "../../shared/AppError";
import { AccepterInvitationInput, InviterInput } from "./invitations.schema";

const SALT_ROUNDS = 10;
const DUREE_VALIDITE_JOURS = 7;

export interface InvitationEnvoyee {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface InvitationVue {
  email: string;
  role: string;
  cabinetNom: string;
}

export const invitationsService = {
  async inviter(cabinetId: string, input: InviterInput): Promise<InvitationEnvoyee> {
    const utilisateurExistant = await utilisateursRepository.findByEmail(input.email);
    if (utilisateurExistant) {
      throw new BadRequestError("Un utilisateur avec cet email existe déjà");
    }

    const invitationExistante = await invitationsRepository.findPendingByCabinetAndEmail(
      cabinetId,
      input.email
    );
    if (invitationExistante) {
      throw new BadRequestError("Une invitation est déjà en attente pour cet email");
    }

    const cabinet = await invitationsRepository.findCabinetNom(cabinetId);
    if (!cabinet) {
      throw new NotFoundError("Cabinet introuvable");
    }

    const expiresAt = new Date(Date.now() + DUREE_VALIDITE_JOURS * 24 * 60 * 60 * 1000);

    const invitation = await invitationsRepository.create({
      cabinetId,
      email: input.email,
      role: input.role,
      expiresAt,
    });

    try {
      await envoyerEmailInvitation({
        to: input.email,
        cabinetNom: cabinet.nom,
        lienInvitation: `${env.FRONTEND_URL}/invitation/${invitation.token}`,
      });
    } catch (error) {
      // L'invitation reste valable même si l'email échoue (ex. SMTP non configuré en dev) : l'admin
      // peut toujours transmettre le lien manuellement. On logge pour ne pas masquer le problème.
      logger.error(`Échec d'envoi de l'email d'invitation à ${input.email}`, error);
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString(),
    };
  },

  async getInvitation(token: string): Promise<InvitationVue> {
    const invitation = await invitationsRepository.findByToken(token);

    if (!invitation || invitation.accepteeLe || invitation.expiresAt < new Date()) {
      throw new NotFoundError("Invitation introuvable ou expirée");
    }

    return {
      email: invitation.email,
      role: invitation.role,
      cabinetNom: invitation.cabinet.nom,
    };
  },

  async accepter(token: string, input: AccepterInvitationInput): Promise<AuthTokens> {
    const invitation = await invitationsRepository.findByToken(token);

    if (!invitation || invitation.accepteeLe || invitation.expiresAt < new Date()) {
      throw new NotFoundError("Invitation introuvable ou expirée");
    }

    const utilisateurExistant = await utilisateursRepository.findByEmail(invitation.email);
    if (utilisateurExistant) {
      throw new BadRequestError("Un compte existe déjà avec cet email");
    }

    const motDePasseHash = await bcrypt.hash(input.motDePasse, SALT_ROUNDS);

    const utilisateur = await utilisateursRepository.create({
      cabinetId: invitation.cabinetId,
      email: invitation.email,
      motDePasseHash,
      role: invitation.role,
    });

    await invitationsRepository.marquerAcceptee(invitation.id);

    return genererTokens(utilisateur);
  },
};
