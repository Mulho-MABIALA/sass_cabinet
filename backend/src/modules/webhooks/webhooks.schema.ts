import { z } from "zod";

// Évènements déclenchables (Zapier/Make) : dossier passé "complet", document déposé par un client
export const evenementWebhookSchema = z.enum(["dossier.complet", "document.depose"]);

export const createWebhookSchema = z.object({
  url: z.string().url(),
  evenement: evenementWebhookSchema,
  actif: z.boolean().default(true),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  evenement: evenementWebhookSchema.optional(),
  actif: z.boolean().optional(),
});

export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;

export const webhookIdParamSchema = z.object({
  id: z.string().uuid(),
});
