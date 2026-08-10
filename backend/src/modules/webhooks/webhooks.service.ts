import { WebhookConfig } from "@prisma/client";
import { webhooksRepository } from "./webhooks.repository";
import { CreateWebhookInput, UpdateWebhookInput } from "./webhooks.schema";
import { NotFoundError } from "../../shared/AppError";
import { logger } from "../../shared/logger";

export const webhooksService = {
  list(cabinetId: string): Promise<WebhookConfig[]> {
    return webhooksRepository.findByCabinet(cabinetId);
  },

  create(cabinetId: string, input: CreateWebhookInput): Promise<WebhookConfig> {
    return webhooksRepository.create({
      cabinetId,
      url: input.url,
      evenement: input.evenement,
      actif: input.actif,
    });
  },

  async update(id: string, cabinetId: string, input: UpdateWebhookInput): Promise<WebhookConfig> {
    const existant = await webhooksRepository.findById(id, cabinetId);
    if (!existant) {
      throw new NotFoundError("Webhook introuvable");
    }
    return webhooksRepository.update(id, input);
  },

  async remove(id: string, cabinetId: string): Promise<void> {
    const existant = await webhooksRepository.findById(id, cabinetId);
    if (!existant) {
      throw new NotFoundError("Webhook introuvable");
    }
    await webhooksRepository.delete(id);
  },
};

// Dispatcher appelé par les autres modules (dossiers, portail) lors des évènements métier.
// Best-effort : un échec d'appel HTTP est loggé mais ne doit jamais faire échouer l'action métier d'origine.
export async function declencherWebhooks(
  cabinetId: string,
  evenement: string,
  payload: Record<string, unknown>
): Promise<void> {
  const webhooks = await webhooksRepository.findActifsPourEvenement(cabinetId, evenement);

  await Promise.all(
    webhooks.map(async (webhook) => {
      try {
        await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evenement,
            payload,
            declencheLe: new Date().toISOString(),
          }),
        });
      } catch (error) {
        logger.error(`Échec d'appel du webhook ${webhook.id} (${webhook.url})`, error);
      }
    })
  );
}
