import { apiRequest } from "./client";
import { PortailVue } from "../types";

export const portailApi = {
  getByToken(token: string): Promise<PortailVue> {
    return apiRequest<PortailVue>(`/portail/${token}`, { auth: false });
  },

  upload(token: string, documentRequisId: string, file: File): Promise<PortailVue> {
    const formData = new FormData();
    formData.append("documentRequisId", documentRequisId);
    formData.append("file", file);

    return apiRequest<PortailVue>(`/portail/${token}/upload`, {
      method: "POST",
      body: formData,
      isFormData: true,
      auth: false,
    });
  },
};
