import { platformApiRequest } from "./platformClient";
import { CabinetPlateforme, CabinetPlateformeDetail, Plan } from "../types";

interface PlatformLoginResult {
  accessToken: string;
  email: string;
}

interface UpdateCabinetPayload {
  plan?: Plan;
  actif?: boolean;
}

export const platformApi = {
  login(email: string, motDePasse: string): Promise<PlatformLoginResult> {
    return platformApiRequest<PlatformLoginResult>("/platform/login", {
      method: "POST",
      body: { email, motDePasse },
      auth: false,
    });
  },

  listCabinets(): Promise<CabinetPlateforme[]> {
    return platformApiRequest<CabinetPlateforme[]>("/platform/cabinets");
  },

  getCabinet(id: string): Promise<CabinetPlateformeDetail> {
    return platformApiRequest<CabinetPlateformeDetail>(`/platform/cabinets/${id}`);
  },

  updateCabinet(id: string, payload: UpdateCabinetPayload): Promise<CabinetPlateforme> {
    return platformApiRequest<CabinetPlateforme>(`/platform/cabinets/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },
};
