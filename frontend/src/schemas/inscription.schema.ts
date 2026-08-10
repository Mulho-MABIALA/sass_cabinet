import { z } from "zod";

export const inscriptionFormSchema = z.object({
  nomCabinet: z.string().min(1, "Nom du cabinet requis"),
  secteur: z.enum(["avocat", "notaire", "syndic", "courtier", "expert_comptable"]),
  emailAdmin: z.string().email("Email invalide"),
  motDePasse: z.string().min(8, "8 caractères minimum"),
});

export type InscriptionFormValues = z.infer<typeof inscriptionFormSchema>;
