import bcrypt from "bcrypt";
import { Utilisateur } from "@prisma/client";
import { utilisateursRepository } from "./utilisateurs.repository";
import { CreateUtilisateurInput } from "./utilisateurs.schema";
import { BadRequestError } from "../../shared/AppError";

const SALT_ROUNDS = 10;

export type UtilisateurPublic = Omit<Utilisateur, "motDePasseHash">;

function toPublic(utilisateur: Utilisateur): UtilisateurPublic {
  const { motDePasseHash: _motDePasseHash, ...rest } = utilisateur;
  return rest;
}

export const utilisateursService = {
  async list(cabinetId: string): Promise<UtilisateurPublic[]> {
    const utilisateurs = await utilisateursRepository.findByCabinet(cabinetId);
    return utilisateurs.map(toPublic);
  },

  async create(cabinetId: string, input: CreateUtilisateurInput): Promise<UtilisateurPublic> {
    const existant = await utilisateursRepository.findByEmail(input.email);
    if (existant) {
      throw new BadRequestError("Un utilisateur avec cet email existe déjà");
    }

    const motDePasseHash = await bcrypt.hash(input.motDePasse, SALT_ROUNDS);

    const utilisateur = await utilisateursRepository.create({
      cabinetId,
      email: input.email,
      motDePasseHash,
      role: input.role,
    });

    return toPublic(utilisateur);
  },
};
