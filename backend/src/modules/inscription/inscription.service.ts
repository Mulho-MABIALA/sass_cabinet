import bcrypt from "bcrypt";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import { inscriptionRepository } from "./inscription.repository";
import { AuthTokens, genererTokens } from "../auth/auth.service";
import { InscriptionInput } from "./inscription.schema";
import { BadRequestError } from "../../shared/AppError";

const SALT_ROUNDS = 10;

export const inscriptionService = {
  // Point d'entrée public (self-service) : un nouveau cabinet client crée son propre compte,
  // sans intervention manuelle. Auto-login immédiat (comme /auth/login) pour ne pas faire revenir
  // l'utilisateur sur l'écran de connexion juste après avoir créé son compte.
  async inscrire(input: InscriptionInput): Promise<AuthTokens> {
    const existant = await utilisateursRepository.findByEmail(input.emailAdmin);
    if (existant) {
      throw new BadRequestError("Un compte existe déjà avec cet email");
    }

    const motDePasseHash = await bcrypt.hash(input.motDePasse, SALT_ROUNDS);

    const { utilisateur } = await inscriptionRepository.creerCabinetEtAdmin({
      nomCabinet: input.nomCabinet,
      secteur: input.secteur,
      emailAdmin: input.emailAdmin,
      motDePasseHash,
    });

    return genererTokens(utilisateur);
  },
};
