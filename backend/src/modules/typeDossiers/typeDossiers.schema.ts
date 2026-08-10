import { z } from "zod";

const documentRequisSchema = z.object({
  nom: z.string().min(1),
  description: z.string().optional(),
  obligatoire: z.boolean().default(true),
});

export const createTypeDossierSchema = z.object({
  nom: z.string().min(1),
  secteur: z.enum(["avocat", "notaire", "syndic", "courtier", "expert_comptable"]),
  description: z.string().optional(),
  documentsRequis: z.array(documentRequisSchema).min(1),
});

export type CreateTypeDossierInput = z.infer<typeof createTypeDossierSchema>;

export const typeDossierIdParamSchema = z.object({
  id: z.string().uuid(),
});
