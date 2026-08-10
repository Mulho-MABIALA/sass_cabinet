import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/jwt";
import { ForbiddenError, UnauthorizedError } from "../../shared/AppError";
import { LoginInput, RefreshInput } from "./auth.schema";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: Role;
    cabinetId: string;
  };
}

interface UtilisateurPourTokens {
  id: string;
  email: string;
  role: Role;
  cabinetId: string;
}

// Partagé avec inscription.service.ts (auto-login après création d'un cabinet) : évite de dupliquer
// la génération de tokens entre les deux points d'entrée.
export function genererTokens(utilisateur: UtilisateurPourTokens): AuthTokens {
  const accessToken = generateAccessToken({
    userId: utilisateur.id,
    cabinetId: utilisateur.cabinetId,
    role: utilisateur.role,
  });
  const refreshToken = generateRefreshToken({ userId: utilisateur.id });

  return {
    accessToken,
    refreshToken,
    user: {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      cabinetId: utilisateur.cabinetId,
    },
  };
}

export const authService = {
  async login(input: LoginInput): Promise<AuthTokens> {
    const utilisateur = await utilisateursRepository.findByEmailAvecCabinet(input.email);

    if (!utilisateur) {
      throw new UnauthorizedError("Identifiants invalides");
    }

    const motDePasseValide = await bcrypt.compare(input.motDePasse, utilisateur.motDePasseHash);

    if (!motDePasseValide) {
      throw new UnauthorizedError("Identifiants invalides");
    }

    // Cabinet suspendu par la console plateforme (super-admin) : accès bloqué dès la connexion.
    if (!utilisateur.cabinet.actif) {
      throw new ForbiddenError("Ce cabinet a été suspendu. Contactez le support.");
    }

    return genererTokens(utilisateur);
  },

  async refresh(input: RefreshInput): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch {
      throw new UnauthorizedError("Refresh token invalide ou expiré");
    }

    const utilisateur = await utilisateursRepository.findByIdAvecCabinet(payload.userId);

    if (!utilisateur) {
      throw new UnauthorizedError("Utilisateur introuvable");
    }

    // Même vérification qu'au login : si le cabinet est suspendu après coup, la session meurt au
    // plus tard au prochain rafraîchissement (dans la limite de durée de vie de l'access token).
    if (!utilisateur.cabinet.actif) {
      throw new ForbiddenError("Ce cabinet a été suspendu. Contactez le support.");
    }

    return genererTokens(utilisateur);
  },
};
