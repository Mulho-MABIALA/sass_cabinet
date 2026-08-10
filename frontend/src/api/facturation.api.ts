import { apiRequest } from "./client";
import { Plan, UsageResume } from "../types";

interface SessionPaiement {
  url: string;
}

export const facturationApi = {
  getUsage(): Promise<UsageResume> {
    return apiRequest<UsageResume>("/facturation/usage");
  },

  creerCheckout(plan: Plan): Promise<SessionPaiement> {
    return apiRequest<SessionPaiement>("/facturation/checkout", {
      method: "POST",
      body: { plan },
    });
  },

  creerPortail(): Promise<SessionPaiement> {
    return apiRequest<SessionPaiement>("/facturation/portail", { method: "POST" });
  },
};
