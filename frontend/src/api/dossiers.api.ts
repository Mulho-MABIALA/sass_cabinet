import { apiRequest, downloadFile } from "./client";
import { DossierDetail, DossierListe, StatutDossier } from "../types";

interface CreateDossierPayload {
  typeDossierId: string;
  nomClient: string;
  emailClient: string;
  telephoneClient?: string;
}

interface ExportMetierResult {
  success: boolean;
  details: string;
}

export const dossiersApi = {
  list(statut?: StatutDossier): Promise<DossierListe[]> {
    const query = statut ? `?statut=${statut}` : "";
    return apiRequest<DossierListe[]>(`/dossiers${query}`);
  },

  getById(id: string): Promise<DossierDetail> {
    return apiRequest<DossierDetail>(`/dossiers/${id}`);
  },

  create(payload: CreateDossierPayload): Promise<DossierDetail> {
    return apiRequest<DossierDetail>("/dossiers", { method: "POST", body: payload });
  },

  relancer(id: string): Promise<{ statut: string }> {
    return apiRequest<{ statut: string }>(`/dossiers/${id}/relancer`, { method: "POST" });
  },

  effacerRgpd(id: string): Promise<{ statut: string }> {
    return apiRequest<{ statut: string }>(`/dossiers/${id}/rgpd`, { method: "DELETE" });
  },

  exportCsv(): Promise<void> {
    return downloadFile("/dossiers/export?format=csv", "rapport-synthese.csv");
  },

  // Cegid génère un vrai fichier FEC téléchargeable ; Septeo (stub) renvoie un résultat JSON simulé.
  exportMetierCegid(): Promise<void> {
    return downloadFile("/dossiers/export-metier?systeme=cegid", "export-fec.txt");
  },

  exportMetierSepteo(): Promise<ExportMetierResult> {
    return apiRequest<ExportMetierResult>("/dossiers/export-metier?systeme=septeo");
  },
};
