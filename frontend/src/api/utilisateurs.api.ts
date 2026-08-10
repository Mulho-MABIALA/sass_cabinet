import { apiRequest } from "./client";
import { Role } from "../types";

export interface Utilisateur {
  id: string;
  cabinetId: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface CreateUtilisateurPayload {
  email: string;
  motDePasse: string;
  role: Role;
}

export const utilisateursApi = {
  list(): Promise<Utilisateur[]> {
    return apiRequest<Utilisateur[]>("/utilisateurs");
  },

  create(payload: CreateUtilisateurPayload): Promise<Utilisateur> {
    return apiRequest<Utilisateur>("/utilisateurs", { method: "POST", body: payload });
  },
};
