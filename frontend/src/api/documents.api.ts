import { apiRequest } from "./client";
import { ResultatSignature } from "../types";

interface DocumentActionResult {
  documentId: string;
  dossierId: string;
  statutDossier: string;
}

export const documentsApi = {
  valider(id: string): Promise<DocumentActionResult> {
    return apiRequest<DocumentActionResult>(`/documents/${id}/valider`, { method: "PATCH" });
  },

  refuser(id: string): Promise<DocumentActionResult> {
    return apiRequest<DocumentActionResult>(`/documents/${id}/refuser`, { method: "PATCH" });
  },

  envoyerPourSignature(id: string): Promise<ResultatSignature> {
    return apiRequest<ResultatSignature>(`/documents/${id}/signature`, { method: "POST" });
  },
};
