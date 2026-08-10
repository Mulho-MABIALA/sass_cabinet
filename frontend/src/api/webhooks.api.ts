import { apiRequest } from "./client";
import { EvenementWebhook, WebhookConfig } from "../types";

interface CreateWebhookPayload {
  url: string;
  evenement: EvenementWebhook;
  actif?: boolean;
}

interface UpdateWebhookPayload {
  url?: string;
  evenement?: EvenementWebhook;
  actif?: boolean;
}

export const webhooksApi = {
  list(): Promise<WebhookConfig[]> {
    return apiRequest<WebhookConfig[]>("/webhooks");
  },

  create(payload: CreateWebhookPayload): Promise<WebhookConfig> {
    return apiRequest<WebhookConfig>("/webhooks", { method: "POST", body: payload });
  },

  update(id: string, payload: UpdateWebhookPayload): Promise<WebhookConfig> {
    return apiRequest<WebhookConfig>(`/webhooks/${id}`, { method: "PATCH", body: payload });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/webhooks/${id}`, { method: "DELETE" });
  },
};
