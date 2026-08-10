import { apiRequest } from "./client";
import { Secteur, TypeDossier } from "../types";

interface DocumentRequisPayload {
  nom: string;
  description?: string;
  obligatoire: boolean;
}

interface CreateTypeDossierPayload {
  nom: string;
  secteur: Secteur;
  description?: string;
  documentsRequis: DocumentRequisPayload[];
}

export const typeDossiersApi = {
  list(): Promise<TypeDossier[]> {
    return apiRequest<TypeDossier[]>("/type-dossiers");
  },

  create(payload: CreateTypeDossierPayload): Promise<TypeDossier> {
    return apiRequest<TypeDossier>("/type-dossiers", { method: "POST", body: payload });
  },
};
