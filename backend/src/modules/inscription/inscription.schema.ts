import { z } from "zod";

export const inscriptionSchema = z.object({
  nomCabinet: z.string().min(1, "Nom du cabinet requis"),
  secteur: z.enum(["avocat", "notaire", "syndic", "courtier", "expert_comptable"]),
  emailAdmin: z.string().email(),
  motDePasse: z.string().min(8, "8 caractères minimum"),
});

export type InscriptionInput = z.infer<typeof inscriptionSchema>;
