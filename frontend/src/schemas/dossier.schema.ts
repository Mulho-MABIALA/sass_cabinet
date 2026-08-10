import { z } from "zod";

export const createDossierFormSchema = z.object({
  typeDossierId: z.string().uuid("Sélectionnez un type de dossier"),
  nomClient: z.string().min(1, "Nom du client requis"),
  emailClient: z.string().email("Email invalide"),
  telephoneClient: z
    .string()
    .trim()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreateDossierFormValues = z.infer<typeof createDossierFormSchema>;
