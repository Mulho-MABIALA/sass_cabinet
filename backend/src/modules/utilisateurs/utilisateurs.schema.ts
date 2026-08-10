import { z } from "zod";

export const createUtilisateurSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(8),
  role: z.enum(["admin", "collaborateur"]),
});

export type CreateUtilisateurInput = z.infer<typeof createUtilisateurSchema>;
