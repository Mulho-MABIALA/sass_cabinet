import { apiRequest } from "./client";
import { AuthTokens, Secteur } from "../types";

interface InscriptionPayload {
  nomCabinet: string;
  secteur: Secteur;
  emailAdmin: string;
  motDePasse: string;
}

export const inscriptionApi = {
  inscrire(payload: InscriptionPayload): Promise<AuthTokens> {
    return apiRequest<AuthTokens>("/inscription", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },
};
